
-- Add tracking columns for admin accountability
ALTER TABLE public.orders
  ADD COLUMN paid_by uuid REFERENCES auth.users(id) DEFAULT NULL,
  ADD COLUMN paid_at timestamp with time zone DEFAULT NULL,
  ADD COLUMN delivered_by uuid REFERENCES auth.users(id) DEFAULT NULL,
  ADD COLUMN delivered_at timestamp with time zone DEFAULT NULL;
