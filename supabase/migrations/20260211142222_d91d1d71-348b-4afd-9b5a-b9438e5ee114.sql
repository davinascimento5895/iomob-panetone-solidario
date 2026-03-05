
-- Add pickup_code column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pickup_code TEXT;

-- Generate pickup codes for existing orders that don't have one
UPDATE public.orders 
SET pickup_code = upper(substr(md5(random()::text), 1, 6))
WHERE pickup_code IS NULL;

-- Make pickup_code NOT NULL with a default
ALTER TABLE public.orders ALTER COLUMN pickup_code SET DEFAULT upper(substr(md5(random()::text), 1, 6));

-- Update existing statuses to new flow
UPDATE public.orders SET status = 'pronto' WHERE status = 'em_transito';
UPDATE public.orders SET status = 'retirado' WHERE status = 'entregue';
