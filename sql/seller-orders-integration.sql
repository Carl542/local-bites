  -- Seller Incoming Orders integration and per-seller status isolation.
  -- Non-destructive: preserves all orders, order items, totals, and stock values.

  alter table public.order_items
    add column if not exists seller_status public.order_status not null default 'pending';

  create index if not exists order_items_seller_order_idx
    on public.order_items (seller_id, order_id);

  drop policy if exists "sellers view their order items" on public.order_items;
  create policy "sellers view their order items"
  on public.order_items
  for select to authenticated
  using (seller_id = auth.uid());

  create or replace function public.seller_can_access_order(order_uuid uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path = public, pg_temp
  as $$
    select exists (
      select 1
      from public.order_items
      where order_id = order_uuid
        and seller_id = auth.uid()
    );
  $$;

  revoke all on function public.seller_can_access_order(uuid) from public;
  grant execute on function public.seller_can_access_order(uuid) to authenticated;

  drop policy if exists "sellers view orders containing their products" on public.orders;
  create policy "sellers view orders containing their products"
  on public.orders
  for select to authenticated
  using (public.seller_can_access_order(id));

  -- Prevent direct seller updates to the shared order status. Sellers use the
  -- scoped RPC below so one farm cannot overwrite another farm's item status.
  drop policy if exists "sellers update orders containing their products" on public.orders;

  create or replace function public.update_seller_order_status(
    p_order_id uuid,
    p_status public.order_status
  )
  returns public.order_status
  language plpgsql
  security definer
  set search_path = public, pg_temp
  as $$
  declare
    v_seller_id uuid := auth.uid();
    v_updated integer;
    v_order_status public.order_status;
  begin
    if v_seller_id is null then
      raise exception 'Authentication is required.' using errcode = '42501';
    end if;

    if not exists (
      select 1 from public.profiles
      where id = v_seller_id and role::text = 'seller'
    ) then
      raise exception 'Only seller accounts can update seller order status.' using errcode = '42501';
    end if;

    if p_status not in ('confirmed', 'preparing', 'dispatched', 'delivered', 'cancelled') then
      raise exception 'Unsupported seller order status.' using errcode = '22023';
    end if;

    update public.order_items
    set seller_status = p_status
    where order_id = p_order_id
      and seller_id = v_seller_id;

    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'Order not found or it does not contain products from this seller.' using errcode = '42501';
    end if;

    select case
      when bool_and(seller_status = 'cancelled') then 'cancelled'::public.order_status
      when bool_and(seller_status = 'delivered') then 'delivered'::public.order_status
      when bool_or(seller_status = 'dispatched') then 'dispatched'::public.order_status
      when bool_or(seller_status = 'preparing') then 'preparing'::public.order_status
      when bool_or(seller_status = 'confirmed') then 'confirmed'::public.order_status
      else 'pending'::public.order_status
    end
    into v_order_status
    from public.order_items
    where order_id = p_order_id;

    update public.orders
    set status = v_order_status,  
        updated_at = now()
    where id = p_order_id;

    return p_status;
  end;
  $$;

  revoke all on function public.update_seller_order_status(uuid, public.order_status) from public;
  grant execute on function public.update_seller_order_status(uuid, public.order_status) to authenticated;

  comment on function public.update_seller_order_status(uuid, public.order_status)
  is 'Updates only the authenticated seller''s items and derives the shared buyer-visible order status.';
