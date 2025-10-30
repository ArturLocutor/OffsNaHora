# Offs na Hora – Portfólio do Locutor Artur Sutto

Um site profissional, rápido e completo para apresentar seu trabalho de locução, com gerenciamento simples de áudios e conteúdos.

## Índice

- Visão Geral
- Funcionalidades do Site
- Player de Áudio
- Formulário de Orçamento (WhatsApp)
- Painel Administrativo
- Gestão de Áudios
- Gestão de Serviços
- Conteúdos, Configurações, Depoimentos e Estatísticas
- Como Adicionar Áudios
- Estrutura do Projeto
- Execução (Dev e Produção)
- Variáveis de Ambiente
- SEO e PWA
- Segurança
- Tecnologias
- Suporte

## Visão Geral

- 100% estático no modo padrão, sem necessidade de backend.
- Admin opcional com rotas sensíveis protegidas e bloqueadas no SEO.
- Conteúdos dinâmicos carregados localmente e/ou via Supabase (opcional).
- Design moderno, responsivo e otimizado para performance.

## Funcionalidades do Site

- Header com navegação para seções: Portfólio, Sobre, Serviços e Contato.
- Portfólio com reprodutores de áudio e destaques.
- Seção “Sobre” com texto editável.
- Lista de serviços com destaques “Mais Vendido” e “Recomendado”.
- Depoimentos de clientes.
- Estatísticas com números e cores.
- Formulário de contato que envia mensagem direta no WhatsApp.

## Player de Áudio

- Play/Pause e reinício automático ao finalizar.
- Barra de progresso clicável (busca pela posição).
- Controle de volume e Mute.
- Suporte a fonte local (`public/audios`) e, quando configurado, URL do Supabase.
- Registro de métricas de reprodução (para análise futura).
- Estados de erro com feedback visual e fallback quando não há áudio.

## Formulário de Orçamento (WhatsApp)

- Campos: Nome, Email, Serviço, Duração, Descrição.
- Integração com a lista de serviços (carregada dinamicamente).
- Integração com seleção de locutor (quando disponível no contexto).
- Envia mensagem formatada diretamente para `+55 17 98192-5660` via `wa.me`.
- Valida dados obrigatórios, dá feedback de envio e limpa formulário.

## Painel Administrativo

- Acesso em `/admin` (bloqueado para indexação por SEO).
- Aba “Áudios”: gerenciamento e organização de portfólio.
- Aba “Serviços”: criação, edição, exclusão e ordenação.
- Indicadores rápidos: quantidade de áudios e status do sistema.
- Botões de “Voltar ao Site” e Logout.

Observação: Em produção, recomenda-se autenticação server-side (JWT/Supabase/OAuth). O projeto já inclui cabeçalhos de segurança e proteção por token em rotas mutáveis do servidor integrado.

## Gestão de Áudios

- Carregamento automático dos arquivos em `public/audios`.
- Agrupamento por locutor com estatísticas rápidas por pasta.
- Busca por título/descrição e filtro por locutor.
- Player de pré-visualização dentro do Admin.
- Tutorial integrado explicando a organização por pastas.

Remoção e adição no modo estático:
- Para adicionar: coloque o arquivo `.mp3`/`.wav`/`.m4a` nas pastas de locutor em `public/audios`.
- Para remover: exclua o arquivo correspondente.

Servidor integrado (opcional):
- Há uma rota protegida para upload (`POST /api/upload-audio`) que usa o header `x-admin-token`.
- Configure `ADMIN_TOKEN` e utilize ferramentas ou scripts para enviar arquivos com autenticação.

## Gestão de Serviços

- Criação e edição de serviços com título.
- Marcação de “Mais Vendido” e “Recomendado”.
- Ordenação por drag-and-drop com persistência.
- Exclusão de serviços.
- Integração com Supabase (necessário para CRUD):
  - Variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env.local`.
  - Tabela `services` (tipos já definidos em `src/integrations/supabase/types.ts`).
  - Script opcional para tags: `supabase/sql/add-service-tags.sql`.

Sem Supabase configurado:
- O Admin exibirá um aviso. No site público, os serviços padrão são carregados de `src/data/siteData.ts`.

## Conteúdos, Configurações, Depoimentos e Estatísticas

Modo local (sem Supabase):
- Editáveis via `src/data/siteData.ts`.
- Textos (hero, sobre, títulos de seção, CTA).
- Configurações: email, número do WhatsApp, Instagram, link do Google Drive, imagem de perfil.
- Depoimentos: nome, citação e ordem.
- Estatísticas: título, valor, sufixo (ex: “+ de”), descrição e cor.

Quando integrado ao Supabase:
- Há componentes para edição via Admin (ex.: `TextManagement.tsx`, `SiteManagement.tsx`).
- As abas e edições dependem das variáveis e tabelas configuradas.

## Como Adicionar Áudios

- Organização recomendada:
  - `public/audios/Locutor Principal/arquivo.mp3`
  - `public/audios/João Silva/arquivo.mp3`
- Os nomes de pastas viram “locutores” e são usados para o agrupamento, filtros e estatísticas.
- O sistema reconhece `.mp3`, `.wav`, `.m4a`.

## Estrutura do Projeto

```
public/
  audios/
  favicon.ico
  robots.txt
  sitemap.xml
  manifest.webmanifest
src/
  components/
  pages/
  hooks/
  utils/
  data/
  integrations/
```

## Execução

Desenvolvimento:

```
npm install
npm run dev
# http://localhost:8080
```

Produção:

```
npm run build
npm run preview
```

## Variáveis de Ambiente

- `VITE_ENABLE_ADMIN`: habilita/desabilita o Admin/Login no build público (`true/false`).
- `ADMIN_TOKEN`: token de administrador para rotas protegidas no servidor integrado.
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`: habilitam CRUD de serviços e textos via Supabase.

## SEO e PWA

- Meta tags otimizadas em `index.html` (`title`, `description`, `keywords`, `robots`, `canonical`).
- Open Graph e Twitter Cards com imagem, título e descrição.
- JSON-LD: `ProfessionalService` e `WebSite` para rich results.
- `robots.txt` atualizado (bloqueia `/admin` e `/login`) e `sitemap.xml` criado.
- PWA básico: `manifest.webmanifest`, `theme-color` e `apple-touch-icon`.
- Melhoria de acessibilidade: `format-detection=telephone=no`.

## Segurança

- Cabeçalhos de segurança em `vercel.json` (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP).
- Rotas mutáveis protegidas no servidor integrado via `x-admin-token`.
- Páginas internas (`/admin`, `/login`) com `noindex` e bloqueadas em `robots.txt`.
- Recomendação de autenticação server-side para produção.

## Tecnologias

- React 18, TypeScript, Vite.
- Tailwind CSS, Shadcn UI, Lucide React.
- Sonner (notificações).
- Supabase (opcional, para gestão via banco).

## Suporte

- Email: `artursutto@gmail.com`
- WhatsApp: `+55 17 98192-5660`
- Instagram: `@artursutto`