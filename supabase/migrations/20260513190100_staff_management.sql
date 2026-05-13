
-- Staff Management Policies
-- This migration adds staff-specific access to products, orders, etc.

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'staff') THEN
        
        -- Policies for staff
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can read products') THEN
            CREATE POLICY "Staff can read products" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'staff'));
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can read coupons') THEN
            CREATE POLICY "Staff can read coupons" ON public.coupons FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'staff'));
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can read charities') THEN
            CREATE POLICY "Staff can read charities" ON public.charities FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'staff'));
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can read orders') THEN
            CREATE POLICY "Staff can read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'staff'));
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can read order items') THEN
            CREATE POLICY "Staff can read order items" ON public.order_items FOR SELECT TO authenticated USING (
                EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND public.has_role(auth.uid(), 'staff'))
            );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can read stock movements') THEN
            CREATE POLICY "Staff can read stock movements" ON public.stock_movements FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'staff'));
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can update order status') THEN
            CREATE POLICY "Staff can update order status" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'staff')) WITH CHECK (public.has_role(auth.uid(), 'staff'));
        END IF;

    END IF;
END $$;
