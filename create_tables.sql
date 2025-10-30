-- Script para criar as tabelas necessárias no Supabase

-- Tabela de áudios com suporte ao Google Drive
CREATE TABLE IF NOT EXISTS public.audios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    drive_id VARCHAR(255), -- ID do arquivo no Google Drive
    drive_url TEXT, -- URL completa do Google Drive
    file_path VARCHAR(500), -- Caminho do arquivo no storage (para uploads locais)
    file_url TEXT, -- URL pública do arquivo
    order_position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Tabela para sessões do Google Drive
CREATE TABLE IF NOT EXISTS public.google_drive_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_name VARCHAR(255) NOT NULL,
    drive_folder_url TEXT NOT NULL,
    drive_folder_id VARCHAR(255) NOT NULL,
    cached_files JSONB, -- Lista de arquivos em cache
    last_sync TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_audios_order_position ON public.audios(order_position);
CREATE INDEX IF NOT EXISTS idx_audios_drive_id ON public.audios(drive_id);
CREATE INDEX IF NOT EXISTS idx_clients_order_position ON public.clients(order_position);
CREATE INDEX IF NOT EXISTS idx_google_drive_sessions_active ON public.google_drive_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_google_drive_sessions_folder_id ON public.google_drive_sessions(drive_folder_id);
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

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_audios_updated_at BEFORE UPDATE ON public.audios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_texts_updated_at BEFORE UPDATE ON public.site_texts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_google_drive_sessions_updated_at BEFORE UPDATE ON public.google_drive_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de teste
INSERT INTO public.audios (title, description, drive_id, drive_url, order_position) VALUES
('Teste Google Drive Audio', 'Áudio de teste via Google Drive', '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view', 1)
ON CONFLICT DO NOTHING;

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

-- Habilitar RLS (Row Level Security) se necessário
ALTER TABLE public.audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_drive_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir leitura pública, escrita apenas para usuários autenticados)
CREATE POLICY "Permitir leitura pública de áudios" ON public.audios FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para usuários autenticados" ON public.audios FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura pública de configurações" ON public.site_config FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para usuários autenticados" ON public.site_config FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura pública de textos" ON public.site_texts FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para usuários autenticados" ON public.site_texts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura pública de clientes" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para usuários autenticados" ON public.clients FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura pública de sessões Google Drive" ON public.google_drive_sessions FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para usuários autenticados" ON public.google_drive_sessions FOR ALL USING (auth.role() = 'authenticated');