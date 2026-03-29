
-- =============================================
-- 1. ADD user_id TO orders FIRST
-- =============================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- =============================================
-- 2. FIX RLS POLICIES
-- =============================================

-- PRODUCTS
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- COUPONS
DROP POLICY IF EXISTS "Authenticated users can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- COMBOS
DROP POLICY IF EXISTS "Authenticated users can manage combos" ON public.combos;
CREATE POLICY "Admins can manage combos" ON public.combos
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- COMBO_ITEMS
DROP POLICY IF EXISTS "Authenticated users can manage combo items" ON public.combo_items;
CREATE POLICY "Admins can manage combo items" ON public.combo_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CHARITIES
DROP POLICY IF EXISTS "Authenticated users can manage charities" ON public.charities;
CREATE POLICY "Admins can manage charities" ON public.charities
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- STOCK_MOVEMENTS
DROP POLICY IF EXISTS "Authenticated users can manage stock movements" ON public.stock_movements;
CREATE POLICY "Admins can manage stock movements" ON public.stock_movements
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ORDERS
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Orders are publicly readable" ON public.orders;

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and moderators/admins can read orders" ON public.orders
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ORDER_ITEMS
DROP POLICY IF EXISTS "Authenticated users can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Order items are publicly readable" ON public.order_items;

CREATE POLICY "Users can insert order items" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users and moderators/admins can read order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id 
      AND (
        orders.user_id = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'moderator')
      )
    )
  );

CREATE POLICY "Admins can update order items" ON public.order_items
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete order items" ON public.order_items
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 3. PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 4. SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.settings (key, value) VALUES
  ('campaign_name', 'Panetone Solidário 2025'),
  ('whatsapp', '(41) 98790-3434'),
  ('email', 'iomob@iomob.com')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 5. TRANSACTIONAL CHECKOUT FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.create_order(
  p_items jsonb,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_charity_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_coupon_code text DEFAULT NULL
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
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
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
  
  INSERT INTO public.orders (user_id, customer_name, customer_email, customer_phone, charity_id, notes, total, discount, coupon_id, pickup_code)
  VALUES (v_user_id, p_customer_name, p_customer_email, p_customer_phone, p_charity_id, p_notes, v_total - v_discount, v_discount, v_coupon_id, v_pickup_code)
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

-- =============================================
-- 6. CANCEL ORDER FUNCTION (restores stock)
-- =============================================
CREATE OR REPLACE FUNCTION public.cancel_order(
  p_order_id uuid,
  p_reason text DEFAULT 'Cancelado pelo admin'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_item record;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem cancelar pedidos';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedido não encontrado'; END IF;
  IF v_order.status = 'cancelado' THEN RAISE EXCEPTION 'Pedido já está cancelado'; END IF;

  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id
  LOOP
    IF v_item.product_id IS NOT NULL THEN
      UPDATE public.products SET stock = stock + v_item.quantity WHERE id = v_item.product_id;
      
      INSERT INTO public.stock_movements (product_id, quantity, type, reason)
      VALUES (v_item.product_id, v_item.quantity, 'entrada', 'Cancelamento pedido: ' || p_reason);
    END IF;
  END LOOP;

  UPDATE public.orders SET status = 'cancelado', notes = COALESCE(notes || ' | ', '') || 'Cancelado: ' || p_reason, updated_at = now()
  WHERE id = p_order_id;
END;
$$;
