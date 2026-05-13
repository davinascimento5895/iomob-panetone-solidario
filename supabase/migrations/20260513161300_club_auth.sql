
-- Add 'club' to app_role enum
-- Note: Using DO block to safely add enum value if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'club') THEN
        ALTER TYPE public.app_role ADD VALUE 'club';
    END IF;
END
$$;

-- Create clubs table
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,         -- bcrypt hash
  initial_password TEXT,               -- The temporary password for admin reference
  temp_password_used BOOLEAN DEFAULT FALSE, -- false = still using temp password
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on clubs
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Admins can manage clubs
DROP POLICY IF EXISTS "Admins can manage clubs" ON public.clubs;
CREATE POLICY "Admins can manage clubs" ON public.clubs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can search clubs (only ID and Name)
DROP POLICY IF EXISTS "Public can search clubs" ON public.clubs;
CREATE POLICY "Public can search clubs" ON public.clubs
  FOR SELECT TO public
  USING (true);

-- Add club_id to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES public.clubs(id);

-- Make user_id optional in orders (for club orders)
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS for orders to support club role
DROP POLICY IF EXISTS "Users, clubs and moderators/admins can read orders" ON public.orders;
CREATE POLICY "Users, clubs and moderators/admins can read orders" ON public.orders
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'role' = 'club' AND (auth.jwt() ->> 'club_id')::uuid = club_id)
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );

DROP POLICY IF EXISTS "Users and clubs can insert own orders" ON public.orders;
CREATE POLICY "Users and clubs can insert own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'role' = 'club' AND (auth.jwt() ->> 'club_id')::uuid = club_id)
  );

-- Update create_order function to handle club_id
CREATE OR REPLACE FUNCTION public.create_order(
  p_items jsonb,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_charity_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_coupon_code text DEFAULT NULL,
  p_club_id uuid DEFAULT NULL -- New parameter
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_pickup_code text;
  v_item jsonb;
  v_product record;
  v_total numeric := 0;
  v_discount numeric := 0;
  v_coupon_id uuid := NULL;
  v_coupon record;
  v_user_id uuid;
  v_role text;
BEGIN
  v_user_id := auth.uid();
  v_role := auth.jwt() ->> 'role';

  IF v_user_id IS NULL AND (v_role IS NULL OR v_role != 'club') THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Validate coupon if provided
  IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
    SELECT * INTO v_coupon FROM public.coupons
    WHERE code = upper(p_coupon_code) AND active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (max_uses IS NULL OR used_count < max_uses);
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Cupom inválido ou expirado';
    END IF;
    v_coupon_id := v_coupon.id;
  END IF;

  -- Validate stock for each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM public.products
    WHERE id = (v_item->>'product_id')::uuid AND available = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produto % não encontrado ou indisponível', v_item->>'product_name';
    END IF;

    IF v_product.stock < (v_item->>'quantity')::int THEN
      RAISE EXCEPTION 'Estoque insuficiente para %: disponível %, solicitado %', 
        v_product.name, v_product.stock, (v_item->>'quantity')::int;
    END IF;

    v_total := v_total + (v_product.price * (v_item->>'quantity')::int);
  END LOOP;

  -- Calculate discount
  IF v_coupon_id IS NOT NULL THEN
    IF v_coupon.discount_type = 'percentage' THEN
      v_discount := v_total * (v_coupon.discount_value / 100);
    ELSE
      v_discount := LEAST(v_coupon.discount_value, v_total);
    END IF;

    IF v_coupon.min_order_value IS NOT NULL AND v_total < v_coupon.min_order_value THEN
      RAISE EXCEPTION 'Valor mínimo do pedido para este cupom é R$ %', v_coupon.min_order_value;
    END IF;
  END IF;

  -- Create order
  v_pickup_code := upper(substr(md5(random()::text), 1, 6));
  
  INSERT INTO public.orders (user_id, club_id, customer_name, customer_email, customer_phone, charity_id, notes, total, discount, coupon_id, pickup_code)
  VALUES (v_user_id, p_club_id, p_customer_name, p_customer_email, p_customer_phone, p_charity_id, p_notes, v_total - v_discount, v_discount, v_coupon_id, v_pickup_code)
  RETURNING id INTO v_order_id;

  -- Create order items + decrement stock + log movements
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric
    );

    UPDATE public.products
    SET stock = stock - (v_item->>'quantity')::int
    WHERE id = (v_item->>'product_id')::uuid;

    INSERT INTO public.stock_movements (product_id, quantity, type, reason)
    VALUES (
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::int,
      'saida',
      'Pedido ' || v_pickup_code
    );
  END LOOP;

  -- Increment coupon usage
  IF v_coupon_id IS NOT NULL THEN
    UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon_id;
  END IF;

  RETURN jsonb_build_object('order_id', v_order_id, 'pickup_code', v_pickup_code, 'total', v_total - v_discount, 'discount', v_discount);
END;
$$;
