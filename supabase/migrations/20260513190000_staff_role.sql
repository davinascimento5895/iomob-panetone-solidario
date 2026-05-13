-- Staff Role and Traceability Setup

-- 1. Create staff_invitations table
CREATE TABLE IF NOT EXISTS public.staff_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL UNIQUE,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    used_at TIMESTAMPTZ,
    used_by UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'revoked'))
);

-- 2. Enable RLS
ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;

-- 3. Policies for staff_invitations
CREATE POLICY "Admins can manage invitations" ON public.staff_invitations
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read pending invitations by token" ON public.staff_invitations
    FOR SELECT TO anon, authenticated
    USING (status = 'pending');

-- 4. Create order_history table
CREATE TABLE IF NOT EXISTS public.order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    old_status TEXT,
    new_status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable RLS on order_history
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- 3. Set default status of orders to 'pronto'
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pronto';

-- 4. Re-create order status enum if needed (handled in separate migration)

-- 5. Policies for order_history
CREATE POLICY "Admins can manage order history" ON public.order_history
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'staff') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can read order history') THEN
            CREATE POLICY "Staff can read order history" ON public.order_history
                FOR SELECT TO authenticated
                USING (public.has_role(auth.uid(), 'staff'));
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can insert order history') THEN
            CREATE POLICY "Staff can insert order history" ON public.order_history
                FOR INSERT TO authenticated
                WITH CHECK (public.has_role(auth.uid(), 'staff'));
        END IF;
    END IF;
END $$;
