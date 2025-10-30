-- Adicionar colunas de tags para serviços
-- Executar este script para adicionar as novas funcionalidades de tags

-- Adicionar coluna para marcar como "mais vendido"
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS is_best_seller boolean DEFAULT false;

-- Adicionar coluna para marcar como "recomendado"
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS is_recommended boolean DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN public.services.is_best_seller IS 'Indica se o serviço é um dos mais vendidos';
COMMENT ON COLUMN public.services.is_recommended IS 'Indica se o serviço é recomendado';