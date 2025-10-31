-- Criar tabela user_profiles para gerenciar perfis de usuários
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    permissions TEXT[] DEFAULT '{}',
    is_main_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios perfis
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários atualizem apenas seus próprios perfis
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que admins vejam todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (role = 'admin' OR is_main_admin = TRUE)
        )
    );

-- Política para permitir que admins gerenciem todos os perfis
CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (role = 'admin' OR is_main_admin = TRUE)
        )
    );

-- Inserir usuário admin principal (Vinicius)
INSERT INTO public.user_profiles (
    email, 
    username, 
    role, 
    permissions, 
    is_main_admin
) VALUES (
    'vinicius@admin.com',
    'Vinicius',
    'admin',
    ARRAY['all'],
    TRUE
) ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    is_main_admin = EXCLUDED.is_main_admin;

-- Comentários para documentação
COMMENT ON TABLE public.user_profiles IS 'Tabela para gerenciar perfis e permissões de usuários';
COMMENT ON COLUMN public.user_profiles.user_id IS 'Referência ao usuário na tabela auth.users';
COMMENT ON COLUMN public.user_profiles.role IS 'Papel do usuário (admin, user, etc.)';
COMMENT ON COLUMN public.user_profiles.permissions IS 'Array de permissões específicas';
COMMENT ON COLUMN public.user_profiles.is_main_admin IS 'Indica se é o administrador principal';