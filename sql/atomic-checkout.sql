-- Atomic, authenticated buyer checkout for LocalBites.
-- Apply in Supabase SQL Editor after the base schema and cart policies.
-- Existing orders are preserved; checkout_token remains NULL for historical rows.

alter table public.orders
  add column if not exists checkout_token uuid;

create unique index if not exists orders_buyer_checkout_token_uidx
  on public.orders (buyer_id, checkout_token)
  where checkout_token is not null;

create or replace function public.place_buyer_order(
  p_contact_name text,
  p_phone text,
  p_business_name text,
  p_delivery_address text,
  p_delivery_method text,
  p_payment_method text,
  p_checkout_token uuid
)
returns table(order_id uuid, total numeric, replayed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_buyer_id uuid := auth.uid();
  v_cart_id uuid;
  v_order_id uuid;
  v_total numeric(10,2);
  v_existing_order_id uuid;
  v_existing_total numeric(10,2);
  v_item_count integer;
  v_updated_count integer;
begin
  if v_buyer_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = v_buyer_id and role::text = 'buyer'
  ) then
    raise exception 'Only buyer accounts can place orders.' using errcode = '42501';
  end if;

  if p_checkout_token is null then
    raise exception 'A checkout token is required.' using errcode = '22023';
  end if;

  -- Serialize retries with the same buyer/token before checking idempotency.
  perform pg_advisory_xact_lock(
    hashtextextended(v_buyer_id::text || ':' || p_checkout_token::text, 0)
  );

  select id, orders.total
    into v_existing_order_id, v_existing_total
  from public.orders
  where buyer_id = v_buyer_id
    and checkout_token = p_checkout_token;

  if v_existing_order_id is not null then
    return query select v_existing_order_id, v_existing_total, true;
    return;
  end if;

  if nullif(btrim(p_contact_name), '') is null
     or nullif(btrim(p_phone), '') is null
     or nullif(btrim(p_business_name), '') is null
     or nullif(btrim(p_delivery_address), '') is null then
    raise exception 'Complete all required checkout fields.' using errcode = '22023';
  end if;

  if p_delivery_method not in ('route_dispatch', 'farm_pickup') then
    raise exception 'Unsupported delivery method.' using errcode = '22023';
  end if;

  if p_payment_method not in ('cash_on_delivery', 'gcash') then
    raise exception 'Unsupported payment method.' using errcode = '22023';
  end if;

  select id into v_cart_id
  from public.carts
  where buyer_id = v_buyer_id
  for update;

  if v_cart_id is null then
    raise exception 'No buyer cart was found.' using errcode = 'P0002';
  end if;

  select count(*) into v_item_count
  from public.cart_items
  where cart_id = v_cart_id;

  if v_item_count = 0 then
    raise exception 'Your cart is empty.' using errcode = '22023';
  end if;

  -- Lock every product in a stable order to prevent overselling and deadlocks.
  perform products.id
  from public.products as products
  join public.cart_items as items on items.product_id = products.id
  where items.cart_id = v_cart_id
  order by products.id
  for update of products;

  if exists (
    select 1
    from public.cart_items as items
    left join public.products as products on products.id = items.product_id
    left join public.farms as farms on farms.id = products.farm_id
    where items.cart_id = v_cart_id
      and (
        products.id is null
        or products.is_active is not true
        or items.quantity <= 0
        or products.available_quantity < items.quantity
        or products.price < 0
        or farms.seller_id is null
      )
  ) then
    raise exception 'One or more cart items are unavailable or exceed current stock.' using errcode = 'P0001';
  end if;

  select round(sum(products.price * items.quantity), 2)::numeric(10,2)
    into v_total
  from public.cart_items as items
  join public.products as products on products.id = items.product_id
  where items.cart_id = v_cart_id;

  if v_total is null or v_total < 0 then
    raise exception 'Unable to calculate the order total.' using errcode = '22023';
  end if;

  insert into public.orders (
    buyer_id, contact_name, phone, business_name, delivery_address,
    delivery_method, payment_method, subtotal, total, checkout_token
  ) values (
    v_buyer_id, btrim(p_contact_name), btrim(p_phone), btrim(p_business_name),
    btrim(p_delivery_address), p_delivery_method, p_payment_method,
    v_total, v_total, p_checkout_token
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id, product_id, seller_id, product_name, unit, quantity, unit_price
  )
  select
    v_order_id, products.id, farms.seller_id, products.name, products.unit,
    items.quantity, products.price
  from public.cart_items as items
  join public.products as products on products.id = items.product_id
  join public.farms as farms on farms.id = products.farm_id
  where items.cart_id = v_cart_id;

  if not found then
    raise exception 'No order items were created.' using errcode = 'P0001';
  end if;

  update public.products as products
  set available_quantity = products.available_quantity - items.quantity,
      updated_at = now()
  from public.cart_items as items
  where items.cart_id = v_cart_id
    and products.id = items.product_id
    and products.available_quantity >= items.quantity;

  get diagnostics v_updated_count = row_count;
  if v_updated_count <> v_item_count then
    raise exception 'Inventory changed during checkout. Please review your cart.' using errcode = '40001';
  end if;

  delete from public.cart_items where cart_id = v_cart_id;

  return query select v_order_id, v_total, false;
end;
$$;

revoke all on function public.place_buyer_order(text, text, text, text, text, text, uuid) from public;
grant execute on function public.place_buyer_order(text, text, text, text, text, text, uuid) to authenticated;

comment on function public.place_buyer_order(text, text, text, text, text, text, uuid)
is 'Atomically validates an authenticated buyer cart, creates its order and items, deducts stock, and clears the cart with idempotent retries.';
