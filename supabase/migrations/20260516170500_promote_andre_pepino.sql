
-- Promote andre.pepino@gmail.com to admin
-- This assumes the user has already created their account (as stated by the user)

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Try to find user in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'andre.pepino@gmail.com';

    IF v_user_id IS NOT NULL THEN
        -- Ensure they are in the profiles table (redundant if already there, but safe)
        -- INSERT INTO public.profiles (id, full_name, email)
        -- VALUES (v_user_id, 'Andre Pepino', 'andre.pepino@gmail.com')
        -- ON CONFLICT (id) DO NOTHING;

        -- Insert into user_roles
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'User andre.pepino@gmail.com promoted to admin successfully.';
    ELSE
        RAISE NOTICE 'User andre.pepino@gmail.com not found in auth.users.';
    END IF;
END $$;
