-- Script para criar as tabelas necessárias no Supabase


-- Tabela de configurações do site
CREATE TABLE IF NOT EXISTS public.site_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de textos do site
CREATE TABLE IF NOT EXISTS public.site_texts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section VARCHAR(100) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quote TEXT NOT NULL,
    order_position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_clients_order_position ON public.clients(order_position);
CREATE INDEX IF NOT EXISTS idx_site_config_key ON public.site_config(config_key);
CREATE INDEX IF NOT EXISTS idx_site_texts_section ON public.site_texts(section);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_texts_updated_at BEFORE UPDATE ON public.site_texts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


INSERT INTO public.site_config (config_key, config_value, description) VALUES
('site_title', 'Artur Sutto - Locutor Profissional', 'Título do site'),
('contact_email', 'contato@artursutto.com', 'Email de contato'),
('whatsapp_number', '+5511999999999', 'Número do WhatsApp')
ON CONFLICT (config_key) DO NOTHING;

INSERT INTO public.site_texts (section, content, description) VALUES
('hero_title', 'Artur Sutto', 'Título principal da página'),
('hero_subtitle', 'Locutor Profissional', 'Subtítulo da página'),
('about_content', 'Locutor profissional com experiência em rádio e publicidade.', 'Texto sobre o locutor')
ON CONFLICT (section) DO NOTHING;

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Permitir leitura pública de configurações" ON public.site_config FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para usuários autenticados" ON public.site_config FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura pública de textos" ON public.site_texts FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para usuários autenticados" ON public.site_texts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura pública de clientes" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para usuários autenticados" ON public.clients FOR ALL USING (auth.role() = 'authenticated');