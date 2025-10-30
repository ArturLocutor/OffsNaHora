-- Script para adicionar os 13 novos serviços solicitados
-- Executar após garantir que as colunas is_best_seller e is_recommended existem

INSERT INTO public.services (title, description, color, order_position, is_best_seller, is_recommended) VALUES
('Estratégias de tráfego pago', 'Desenvolvimento e implementação de campanhas de tráfego pago para maximizar conversões e ROI', '#FF6B6B', 1, true, false),
('Produção de conteúdo para redes sociais', 'Criação de conteúdo visual e textual estratégico para engajamento nas redes sociais', '#4ECDC4', 2, true, true),
('Gestão de Social Media', 'Gerenciamento completo de redes sociais com estratégias de crescimento e engajamento', '#45B7D1', 3, false, true),
('Criação de promoções e campanhas personalizadas', 'Desenvolvimento de campanhas promocionais sob medida para seu negócio', '#96CEB4', 4, false, false),
('Produções de mídia para rádio, TV e plataformas digitais', 'Criação de conteúdo audiovisual profissional para diversos meios de comunicação', '#FFEAA7', 5, true, false),
('Identidade visual para marcas, produtos e empresas', 'Desenvolvimento completo de identidade visual e branding corporativo', '#DDA0DD', 6, false, true),
('Criação de rádios indoor e corporativas', 'Desenvolvimento de soluções de áudio personalizadas para ambientes corporativos', '#98D8C8', 7, false, false),
('Sons personalizados para lojas e comércios', 'Criação de trilhas sonoras e áudios ambientais para estabelecimentos comerciais', '#F7DC6F', 8, false, false),
('Parcerias estratégicas para ampliação de público e alcance', 'Desenvolvimento de parcerias comerciais para expansão de mercado', '#BB8FCE', 9, false, false),
('Produção, gravação, edição e divulgação de artistas e influencers', 'Serviços completos de produção musical e audiovisual para artistas', '#85C1E9', 10, true, true),
('Desenvolvimento de textos criativos e direcionados para redes sociais', 'Criação de copywriting estratégico para redes sociais e marketing digital', '#F8C471', 11, false, false),
('Apoio na busca de novas parcerias, mercados e regiões', 'Consultoria para expansão de negócios e desenvolvimento de novos mercados', '#82E0AA', 12, false, false),
('Entendimento real do seu público-alvo e das suas necessidades', 'Análise comportamental e pesquisa de mercado para compreensão do público', '#F1948A', 13, false, true);

-- Comentário sobre a inserção
-- Este script adiciona 13 novos serviços com:
-- - Títulos conforme solicitado
-- - Descrições detalhadas para cada serviço
-- - Cores variadas e atrativas
-- - Posições sequenciais (1-13)
-- - Tags estratégicas: alguns marcados como "mais vendidos" e "recomendados"