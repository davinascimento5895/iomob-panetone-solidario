
-- Create charities table
CREATE TABLE public.charities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Charities are publicly readable"
ON public.charities FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage charities"
ON public.charities FOR ALL USING (true) WITH CHECK (true);

-- Add charity_id to orders
ALTER TABLE public.orders ADD COLUMN charity_id UUID REFERENCES public.charities(id);

-- Seed 5 charities
INSERT INTO public.charities (name, description) VALUES
  ('APAE', 'Associação de Pais e Amigos dos Excepcionais — promove inclusão e desenvolvimento de pessoas com deficiência intelectual.'),
  ('Casa Hope', 'Oferece hospedagem e suporte a crianças em tratamento contra o câncer e doenças graves.'),
  ('AACD', 'Associação de Assistência à Criança Deficiente — referência em reabilitação física no Brasil.'),
  ('Médicos Sem Fronteiras', 'Organização internacional que leva ajuda médica de emergência a populações em situação de risco.'),
  ('Instituto Ayrton Senna', 'Trabalha pela educação pública de qualidade para crianças e jovens em todo o Brasil.');
