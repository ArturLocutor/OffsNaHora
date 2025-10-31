# Offs Na Hora — Locução Profissional

Site oficial com portfólio de áudios, serviços de locução e painel administrativo para gestão local de conteúdos. Construído com React + Vite, TailwindCSS e componentes UI.

## Visão Geral
- Frontend em `React` com `Vite` e `TailwindCSS`.
- Servidor integrado opcional (`Express + Helmet + Rate-Limit`) para API de áudios e estáticos.
- Painel admin protegido por rota (uso apenas em desenvolvimento/demonstração).
- SEO básico configurado e headers de segurança prontos para produção (via `vercel.json`).

## Páginas e Rotas
- `/` — Página principal (Home): portfólio, serviços, contato, players.
- `/login` — Login administrativo (somente dev/demonstração).
- `/admin` — Painel administrativo (somente dev/demonstração).
- `/dev` — Painel de debug principal admin (somente dev/demonstração).
- `*` — Página 404 customizada.

Proteções de rota:
- `ProtectedRoute` protege `/admin`.
- `MainAdminRoute` protege `/dev` (apenas usuário principal).
- `VITE_ENABLE_ADMIN` controla se rotas admin/dev/login ficam visíveis (produção recomenda `false`).

Robôs/Indexação:
- `useNoIndex` em páginas sensíveis (`Login`, `Admin`).
- `public/robots.txt` bloqueia `/admin` e `/login`.

## Como Rodar
1) Instalar dependências
```bash
npm install
# ou
pnpm install
```

2) Iniciar o servidor integrado (recomendado em dev)
```bash
node server-integrated.cjs
# Frontend/Preview: http://localhost:8080/
# API: http://localhost:8080/api
```

Alternativas de desenvolvimento
```bash
npm run dev              # Vite dev (frontend)
npm run dev -- --port 3001
npm run dev:integrado    # Atalho para servidor integrado
```

## Painel Administrativo (dev/demonstração)
- Controle via `VITE_ENABLE_ADMIN`:
  - `true` (padrão): rotas admin/dev/login habilitadas.
  - `false`: rotas admin/dev/login ficam inacessíveis e redirecionam para `/`.
- Login local básico (definido em `src/contexts/AuthContext.tsx`) apenas para demonstração.
- Sessão persiste em `localStorage`.

Importante: Para produção real, migre o login para backend (JWT/token) e use HTTPS.

## Servidor Integrado (API de Áudios)
O servidor integrado expõe endpoints para gerenciar áudios locais (pasta `public/audios/`).

Endpoints principais:
- `GET /api/audio-files` — Lista arquivos disponíveis.
- `POST /api/upload-audio` — Upload de áudio (protegido por `x-admin-token`).
- `DELETE /api/audio-files/:filename` — Remove áudio (protegido por `x-admin-token`).
- `GET /audios/:filename` — Serve o arquivo de áudio.

Proteção com token admin:
- Defina `ADMIN_TOKEN` no ambiente do servidor.
- Envie o header `x-admin-token: <seu_token>` nas rotas protegidas.

Exemplo de upload via cURL:
```bash
curl -X POST http://localhost:8080/api/upload-audio \
  -H "x-admin-token: MEU_TOKEN_SEGURO" \
  -F "audio=@/caminho/para/arquivo.mp3"
```

## Gestão de Áudios no Frontend
- `src/utils/publicAudioManager.ts` gerencia a descoberta de áudios em `public/audios` e fallback via `audios.json`.
- `src/components/PublicAudioPlayer.tsx` reproduz arquivos locais com UI simplificada.
- `src/components/admin/AudioManagement.tsx` lista, filtra, e reproduz áudios locais (sem upload UI por padrão).

## Configuração de Produção (Vercel)
- `vercel.json` inclui headers de segurança:
  - `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
  - `Content-Security-Policy` estrita (ajuste domínios de `connect-src` conforme APIs externas necessárias).
- Rewrites mapeiam estáticos e SPA para `index.html`.

## SEO e Metadados
- `index.html` inclui metatags de descrição, Open Graph e Twitter.
- `public/sitemap.xml` e `public/robots.txt` prontos.

## Performance
- Code-splitting aplicado para `Admin`, `Dev`, `Login`, `NotFound` (`React.lazy`/`Suspense`).
- Imagem de perfil em `Index.tsx` com `loading="lazy"` (quando rota for utilizada).
- Recomendado: converter fundos (`src/assets/studio-background.jpg`, `src/assets/sound-waves.jpg`) para `WebP` otimizados em produção.

## Variáveis de Ambiente
- `VITE_ENABLE_ADMIN` — controla visibilidade de rotas admin/dev/login (use `false` em produção se não houver backend).
- `ADMIN_TOKEN` — token para proteger rotas de upload/delete no servidor integrado.
- (Opcional) Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — apenas se integrar com banco real.

## Build e Deploy
```bash
npm run build
# Saída em ./dist
```
Hospede os arquivos de `dist/`. Se usar servidor estático, garanta reescritas de SPA e sirva `/audios/`.

## Segurança — Recomendações
- Não use o login frontend puro em produção.
- Use HTTPS, tokens/JWT e sanitize inputs.
- Mantenha `ADMIN_TOKEN` apenas no servidor.
- Confirme CSP na plataforma de deploy.

## Problemas Comuns
- `Browserslist` desatualizado: execute `npx update-browserslist-db@latest`.
- Erros de porta em dev: feche servidores duplicados antes de iniciar outro.

## Contato
- WhatsApp: `https://wa.me/5517981925660`

---
Projeto destinado a desenvolvimento/demonstração. Para produção, migre autenticação para backend e aperfeiçoe a segurança conforme guia em `SECURITY_GUIDE.md`.