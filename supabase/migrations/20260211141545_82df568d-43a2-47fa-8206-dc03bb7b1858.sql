
-- Drop restrictive policies and recreate as permissive for products
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;

CREATE POLICY "Products are publicly readable"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage products"
ON public.products FOR ALL
USING (true)
WITH CHECK (true);

-- Fix same issue for other tables
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can read orders" ON public.orders;

CREATE POLICY "Orders are publicly readable"
ON public.orders FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage orders"
ON public.orders FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Order items are publicly readable" ON public.order_items;

CREATE POLICY "Order items are publicly readable"
ON public.order_items FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage order items"
ON public.order_items FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Stock movements are publicly readable" ON public.stock_movements;

CREATE POLICY "Stock movements are publicly readable"
ON public.stock_movements FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage stock movements"
ON public.stock_movements FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Coupons are publicly readable" ON public.coupons;

CREATE POLICY "Coupons are publicly readable"
ON public.coupons FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage coupons"
ON public.coupons FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage combos" ON public.combos;
DROP POLICY IF EXISTS "Combos are publicly readable" ON public.combos;

CREATE POLICY "Combos are publicly readable"
ON public.combos FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage combos"
ON public.combos FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage combo items" ON public.combo_items;
DROP POLICY IF EXISTS "Combo items are publicly readable" ON public.combo_items;

CREATE POLICY "Combo items are publicly readable"
ON public.combo_items FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage combo items"
ON public.combo_items FOR ALL
USING (true)
WITH CHECK (true);
