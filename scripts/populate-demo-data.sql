
-- SCRIPT PARA POPULAR DADOS DE DEMONSTRAÇÃO
-- Este script cria pedidos fictícios nos últimos 30 dias para testar o Dashboard.

-- 1. Garante que exista pelo menos uma instituição ativa
INSERT INTO public.charities (name, description, active)
SELECT 'Instituição de Teste', 'Uma instituição para fins de demonstração', true
WHERE NOT EXISTS (SELECT 1 FROM public.charities LIMIT 1);

-- 2. Limpa dados antigos de teste (OPCIONAL - DESCOMENTE SE QUISER RESETAR)
-- DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE customer_name LIKE 'DEMO %');
-- DELETE FROM public.orders WHERE customer_name LIKE 'DEMO %';

-- 3. Inserção de Pedidos Diversos
DO $$
DECLARE
    charity_id uuid;
    product_id uuid;
    product_name text;
    product_price numeric;
    club_id uuid;
    order_id uuid;
    i integer;
    rand_days integer;
    rand_status text;
    statuses text[] := ARRAY['pendente', 'pronto', 'retirado', 'cancelado'];
BEGIN
    -- Busca IDs necessários
    SELECT id INTO charity_id FROM public.charities LIMIT 1;
    SELECT id, name, price INTO product_id, product_name, product_price FROM public.products LIMIT 1;
    SELECT id INTO club_id FROM public.clubs LIMIT 1;

    IF product_id IS NULL THEN
        RAISE NOTICE 'Nenhum produto encontrado. Crie um produto antes de rodar este script.';
        RETURN;
    END IF;

    -- Cria 25 pedidos aleatórios nos últimos 30 dias
    FOR i IN 1..25 LOOP
        rand_days := floor(random() * 30);
        rand_status := statuses[floor(random() * 4) + 1];
        
        INSERT INTO public.orders (
            customer_name, 
            pickup_code, 
            status, 
            total, 
            charity_id, 
            club_id,
            created_at
        ) VALUES (
            'DEMO Cliente ' || i,
            UPPER(substring(md5(random()::text), 1, 6)),
            rand_status,
            product_price * (floor(random() * 3) + 1), -- 1 a 3 unidades
            charity_id,
            club_id,
            now() - (rand_days || ' days')::interval
        ) RETURNING id INTO order_id;

        -- Adiciona item ao pedido
        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            quantity,
            unit_price
        ) VALUES (
            order_id,
            product_id,
            product_name,
            floor(random() * 3) + 1,
            product_price
        );
    END LOOP;

    RAISE NOTICE '25 pedidos de demonstração criados com sucesso.';
END $$;
