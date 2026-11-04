-- LocalBites delivery-method-specific fulfillment workflow.
-- Non-destructive: no existing order or order-item rows are deleted or
-- rewritten. Existing/legacy enum values remain valid.

alter type public.order_status add value if not exists 'accepted';
alter type public.order_status add value if not exists 'ready_for_pickup';
alter type public.order_status add value if not exists 'completed';
alter type public.order_status add value if not exists 'rejected';

alter table public.order_items
  add column if not exists seller_status public.order_status;

-- Existing rows intentionally remain untouched when this column is introduced.
-- New checkout rows receive pending automatically.
alter table public.order_items
  alter column seller_status set default 'pending';

-- A rejection marks the exact lines whose checkout reservation was returned.
-- Existing rows remain NULL and are not treated as already restored.
alter table public.order_items
  add column if not exists stock_restored_at timestamptz;

-- Created by atomic-checkout.sql. Keeping this idempotent makes the dependency
-- explicit without changing any historical token or order value.
alter table public.orders
  add column if not exists checkout_token uuid;

create index if not exists order_items_seller_order_idx
  on public.order_items (seller_id, order_id);

drop policy if exists "sellers view their order items" on public.order_items;
create policy "sellers view their order items"
on public.order_items for select to authenticated
using (seller_id = auth.uid());

create or replace function public.seller_can_access_order(order_uuid uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.order_items
    where order_id = order_uuid and seller_id = auth.uid()
  );
$$;

revoke all on function public.seller_can_access_order(uuid) from public;
grant execute on function public.seller_can_access_order(uuid) to authenticated;

drop policy if exists "sellers view orders containing their products" on public.orders;
create policy "sellers view orders containing their products"
on public.orders for select to authenticated
using (public.seller_can_access_order(id));

-- Status changes must go through the guarded RPC below.
drop policy if exists "sellers update orders containing their products" on public.orders;

-- Replace the earlier enum-argument overload so PostgREST exposes one clear RPC.
drop function if exists public.update_seller_order_status(uuid, public.order_status);

create or replace function public.update_seller_order_status(
  p_order_id uuid,
  p_status text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_seller_id uuid := auth.uid();
  v_delivery_method text;
  v_parent_status text;
  v_checkout_token uuid;
  v_current_status text;
  v_distinct_statuses integer;
  v_shared_status text;
  v_item_count integer;
  v_product_count integer;
  v_updated_product_count integer;
begin
  if v_seller_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = v_seller_id and role::text = 'seller'
  ) then
    raise exception 'Only seller accounts can update fulfillment status.' using errcode = '42501';
  end if;

  -- Every seller updating the same order takes this lock first. It serializes
  -- seller-item changes and the final parent-status aggregation.
  select delivery_method, status::text, checkout_token
  into v_delivery_method, v_parent_status, v_checkout_token
  from public.orders
  where id = p_order_id
  for update;

  if v_delivery_method is null then
    raise exception 'Order was not found.' using errcode = 'P0002';
  end if;

  -- Lock this seller's lines separately and in a stable order. PostgreSQL does
  -- not permit FOR UPDATE on the aggregate query below.
  perform id
  from public.order_items
  where order_id = p_order_id and seller_id = v_seller_id
  order by id
  for update;

  select min(coalesce(oi.seller_status::text, v_parent_status)),
         count(distinct coalesce(oi.seller_status::text, v_parent_status)),
         count(*)
  into v_current_status, v_distinct_statuses, v_item_count
  from public.order_items oi
  where oi.order_id = p_order_id
    and oi.seller_id = v_seller_id;

  if v_current_status is null then
    raise exception 'Order not found or it does not contain products from this seller.' using errcode = '42501';
  end if;

  if v_distinct_statuses <> 1 then
    raise exception 'Seller order lines have inconsistent statuses. Contact support before continuing.' using errcode = '55000';
  end if;

  if v_delivery_method = 'farm_pickup' then
    if not (
      (v_current_status = 'pending' and p_status in ('accepted', 'rejected')) or
      (v_current_status = 'accepted' and p_status in ('ready_for_pickup', 'rejected')) or
      (v_current_status = 'ready_for_pickup' and p_status = 'completed')
    ) then
      raise exception 'Invalid Farm Pickup transition: % to %.', v_current_status, p_status using errcode = '22023';
    end if;
  elsif v_delivery_method = 'route_dispatch' then
    if not (
      (v_current_status = 'pending' and p_status in ('accepted', 'rejected')) or
      (v_current_status = 'accepted' and p_status in ('dispatched', 'rejected')) or
      (v_current_status = 'dispatched' and p_status = 'delivered')
    ) then
      raise exception 'Invalid Route Dispatch transition: % to %.', v_current_status, p_status using errcode = '22023';
    end if;
  else
    raise exception 'Unsupported delivery method: %.', v_delivery_method using errcode = '22023';
  end if;

  if p_status = 'rejected' then
    -- checkout_token is proof that this order was created by the atomic
    -- checkout RPC that deducted inventory. Historical/manual orders with no
    -- such proof are never credited automatically.
    if v_checkout_token is null then
      raise exception 'Inventory deduction cannot be verified for this historical order; rejection requires manual review.' using errcode = '55000';
    end if;

    if exists (
      select 1 from public.order_items
      where order_id = p_order_id
        and seller_id = v_seller_id
        and stock_restored_at is not null
    ) then
      raise exception 'Stock for this seller order was already restored.' using errcode = '55000';
    end if;

    -- Deleted products have product_id = NULL (ON DELETE SET NULL). Abort the
    -- whole transaction instead of silently losing a stock restoration.
    if exists (
      select 1
      from public.order_items oi
      left join public.products p on p.id = oi.product_id
      where oi.order_id = p_order_id
        and oi.seller_id = v_seller_id
        and p.id is null
    ) then
      raise exception 'One or more ordered products no longer exist; stock was not changed.' using errcode = '55000';
    end if;

    -- Match checkout's stable product-lock ordering to avoid product deadlocks.
    perform p.id
    from public.products p
    join public.order_items oi on oi.product_id = p.id
    where oi.order_id = p_order_id
      and oi.seller_id = v_seller_id
    order by p.id
    for update of p;

    select count(distinct product_id)
    into v_product_count
    from public.order_items
    where order_id = p_order_id
      and seller_id = v_seller_id;

    update public.products as products
    set available_quantity = products.available_quantity + restored.quantity,
        updated_at = now()
    from (
      select product_id, sum(quantity) as quantity
      from public.order_items
      where order_id = p_order_id
        and seller_id = v_seller_id
        and product_id is not null
      group by product_id
    ) as restored
    where products.id = restored.product_id;

    get diagnostics v_updated_product_count = row_count;
    if v_updated_product_count <> v_product_count then
      raise exception 'Not every product could be restored; stock and status were rolled back.' using errcode = '40001';
    end if;
  end if;

  update public.order_items
  set seller_status = p_status::public.order_status,
      stock_restored_at = case when p_status = 'rejected' then now() else stock_restored_at end
  where order_id = p_order_id
    and seller_id = v_seller_id;

  -- Keep the buyer-visible parent status in Supabase while retaining the
  -- per-seller status on every line for mixed-farm orders.
  if v_delivery_method = 'farm_pickup' then
    select case
      when bool_and(coalesce(seller_status::text, 'pending') = 'rejected') then 'rejected'
      when bool_or(coalesce(seller_status::text, 'pending') = 'pending') then 'pending'
      when bool_or(coalesce(seller_status::text, 'pending') = 'accepted') then 'accepted'
      when bool_or(coalesce(seller_status::text, 'pending') = 'ready_for_pickup') then 'ready_for_pickup'
      when bool_or(coalesce(seller_status::text, 'pending') = 'completed') then 'completed'
      else 'pending'
    end
    into v_shared_status
    from public.order_items
    where order_id = p_order_id;
  else
    select case
      when bool_and(coalesce(seller_status::text, 'pending') = 'rejected') then 'rejected'
      when bool_or(coalesce(seller_status::text, 'pending') = 'pending') then 'pending'
      when bool_or(coalesce(seller_status::text, 'pending') = 'accepted') then 'accepted'
      when bool_or(coalesce(seller_status::text, 'pending') = 'dispatched') then 'dispatched'
      when bool_or(coalesce(seller_status::text, 'pending') = 'delivered') then 'delivered'
      else 'pending'
    end
    into v_shared_status
    from public.order_items
    where order_id = p_order_id;
  end if;

  update public.orders
  set status = v_shared_status::public.order_status,
      updated_at = now()
  where id = p_order_id;

  return p_status;
end;
$$;

revoke all on function public.update_seller_order_status(uuid, text) from public;
grant execute on function public.update_seller_order_status(uuid, text) to authenticated;

comment on function public.update_seller_order_status(uuid, text)
is 'Enforces seller ownership and delivery-specific transitions; safely restores stock once on rejection.';
