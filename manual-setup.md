# Configuração Manual do Banco de Dados Supabase

## 1. Acesse o Painel do Supabase
- URL: https://supabase.com/dashboard
- Projeto: byeolalksmsutxrohvqa

## 2. Vá para SQL Editor
- No menu lateral, clique em "SQL Editor"
- Clique em "New query"

## 3. Execute o SQL Completo
Cole e execute o seguinte SQL:

```sql
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

-- Inserir dados de teste
INSERT INTO public.site_config (config_key, config_value, description) VALUES
('site_title', 'Artur Sutto - Locutor Profissional', 'Título do site'),
('contact_email', 'contato@artursutto.com', 'Email de contato'),
('whatsapp_number', '+5511999999999', 'Número do WhatsApp')
ON CONFLICT (config_key) DO NOTHING;

INSERT INTO public.site_texts (section, content, description) VALUES
('hero_subtitle', 'Locutor Profissional', 'Subtítulo da página'),
('about_content', 'Locutor profissional com experiência em rádio e publicidade.', 'Texto sobre o locutor')
ON CONFLICT (section) DO NOTHING;

-- Inserir áudios de exemplo
INSERT INTO public.audios (title, description, file_path, file_url, order_position) VALUES
('Áudio 1', 'Descrição do audio1.mp3', '/audios/audio1.mp3', '/audios/audio1.mp3', 1),
('Áudio 2', 'Descrição do audio2.mp3', '/audios/audio2.mp3', '/audios/audio2.mp3', 2),
('Áudio 3', 'Descrição do audio3.mp3', '/audios/audio3.mp3', '/audios/audio3.mp3', 3),
('Áudio 4', 'Descrição do audio4.mp3', '/audios/audio4.mp3', '/audios/audio4.mp3', 4),
('Áudio 5', 'Descrição do audio5.mp3', '/audios/audio5.mp3', '/audios/audio5.mp3', 5),
('Áudio 6', 'Descrição do audio6.mp3', '/audios/audio6.mp3', '/audios/audio6.mp3', 6),
('Áudio 7', 'Descrição do audio7.mp3', '/audios/audio7.mp3', '/audios/audio7.mp3', 7),
('Áudio 8', 'Descrição do audio8.mp3', '/audios/audio8.mp3', '/audios/audio8.mp3', 8),
('Áudio 9', 'Descrição do audio9.mp3', '/audios/audio9.mp3', '/audios/audio9.mp3', 9),
('Áudio 10', 'Descrição do audio10.mp3', '/audios/audio10.mp3', '/audios/audio10.mp3', 10)
ON CONFLICT DO NOTHING;
```

## 4. Verificar Criação das Tabelas
Após executar o SQL, verifique se as tabelas foram criadas:
- Vá para "Table Editor" no menu lateral
- Você deve ver as tabelas: audios, site_config, site_texts, clients, google_drive_sessions

## 5. Próximos Passos
Após criar as tabelas manualmente, execute:
```bash
node test-database-connection.cjs
```

Para testar a conexão e verificar se tudo está funcionando.