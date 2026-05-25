# Capivari Festival — Documentação Técnica

Portal oficial do Capivari Festival: site público + dashboard administrativa fullstack para gestão de eventos, financeiro, galeria, credenciamento, conteúdo e telões.

---

## 1. Visão geral

**Tipo:** SPA (Single Page Application) + API REST + realtime via SSE
**Domínio:** Festival de música/cultura em Pouso Alegre, Minas Gerais (4ª edição — 2026)
**Edição atual:** 13 e 14 de junho de 2026

O projeto cobre dois grandes blocos:

- **Site público** — exibe eventos, artistas, projetos, produtos, galeria, conteúdo institucional e canal de contato
- **Dashboard administrativa** — CMS customizado completo com 13 módulos para gestão operacional do festival

---

## 2. Stack técnica

### Frontend (`/`)
| Categoria | Tecnologia |
|---|---|
| Framework | React 19.2 + React DOM 19.2 |
| Linguagem | TypeScript ~6.0 (`verbatimModuleSyntax`) |
| Build / Dev server | Vite 8.0 |
| Roteamento | React Router DOM 7.15 |
| Estilo | CSS Modules (`.module.css`) — sem framework CSS |
| Ícones | Lucide React 1.16 (público) + React Icons 5.6 (admin sidebar) |
| HTTP | Axios 1.16 (com interceptor de JWT) |
| Notificações | React Toastify 11.1 |
| 3D pontual | Three.js 0.184 |
| Fonte | Google Fonts (Inter + Playfair Display) via `<link>` no `index.html` |
| Lint | ESLint 10 + typescript-eslint 8.59 |

### Backend (`/backend`)
| Categoria | Tecnologia |
|---|---|
| Runtime | Node.js (CommonJS) |
| Framework HTTP | Express 5.2 |
| Database | PostgreSQL via `pg` 8.21 (SQL raw parametrizado, sem ORM) |
| Auth | bcryptjs 3 + jsonwebtoken 9 (HS256) |
| CORS | `cors` 2.8 (whitelist via env CSV) |
| Upload | Multer 2.1 — disk storage local, whitelist MIME, 25MB max |
| Env | dotenv 17 |
| Realtime | SSE (Server-Sent Events) nativo do Express |
| Dev | nodemon 3.1 |
| Rate limit | in-memory próprio (sem Redis) |

### Banco de dados
PostgreSQL com schema gerenciado em [`backend/src/db/migrations.js`](backend/src/db/migrations.js) (CREATE TABLE IF NOT EXISTS direto). Tabelas:
`users`, `events`, `projects`, `products`, `artists`, `artist_photos`, `albums`, `gallery`, `financial_entries`, `operational_tasks`, `list_types`, `list_registrations`, `contact_messages`, `site_settings`, `displays`.

---

## 3. Estrutura do projeto

```
capivari2/
├── index.html                    # entrada Vite (link fonts global)
├── vite.config.ts
├── eslint.config.js
├── tsconfig.json
├── package.json
├── src/
│   ├── main.tsx                  # bootstrap React
│   ├── App.tsx                   # rotas (público + admin)
│   ├── index.css                 # estilos globais
│   ├── assets/                   # logos, imagens estáticas
│   ├── components/
│   │   ├── layout/               # PublicNavbar, PublicLayout, Sidebar, Header
│   │   └── ui/                   # Button, Modal, Table, Badge, CustomSelect, StatusBadge
│   ├── context/
│   │   ├── auth-context.ts       # createContext puro (não exporta componente)
│   │   └── AuthContext.tsx       # AuthProvider
│   ├── hooks/                    # useAuth, useToast, useDisplayLive
│   ├── services/                 # *.service.ts — chamadas axios à API
│   ├── types/                    # *.types.ts — interfaces TS
│   ├── utils/                    # formatters, validators, security (safeUrl)
│   └── pages/
│       ├── home/                 # landing principal
│       ├── events/               # listagem e detalhe público de eventos
│       ├── projects/             # projetos culturais
│       ├── products/             # loja
│       ├── artists/              # artistas (lista + detalhe)
│       ├── gallery/              # galeria + álbuns infinity
│       ├── sobre/                # institucional
│       ├── contato/              # formulário público
│       ├── display/              # player /display/:screenCode (telões)
│       ├── public/               # Login + formulário público de eventos
│       ├── acessibilidade,
│       ├── privacidade,
│       ├── termos/               # páginas legais
│       └── admin/                # dashboard
│           ├── AdminDashboard.tsx
│           ├── AdminOverview.tsx
│           ├── events/, financial/, gallery/, nlista/, operational/,
│           ├── products/, artists/, projects/, rss/, contact/,
│           ├── displays/, settings/
└── backend/
    ├── server.js                 # bootstrap Express
    ├── package.json
    ├── .env                      # secrets (NÃO commitar)
    ├── .env.example              # template
    ├── uploads/                  # arquivos servidos em /uploads
    └── src/
        ├── app.js                # Express app + CORS + security headers
        ├── config/env.js         # validação de env (força + placeholders)
        ├── db/
        │   ├── index.js          # pool pg
        │   └── migrations.js     # schema (idempotente)
        ├── middleware/
        │   ├── authenticate.js   # JWT HS256 + role check
        │   ├── rateLimit.js      # in-memory com cleanup periódico
        │   └── upload.js         # multer + whitelist
        └── routes/               # auth, events, projects, financial, tasks,
                                  # gallery, products, artists, settings,
                                  # nlista, contact, displays
```

---

## 4. Site público

### Páginas

| Rota | Página | Função |
|---|---|---|
| `/` | Home | Landing com hero (vídeo configurável), próximos eventos, projetos em destaque, vitrine de produtos, newsletter |
| `/eventos` | EventsList | Listagem paginada com tabs (próximos / todos) |
| `/eventos/:id` | EventDetail | Detalhe com data, local, preço, descrição, CTA inscrição |
| `/projetos` | Projects | Grid de projetos culturais com modal de detalhe + embed YouTube/Vimeo |
| `/projetos/:id` | Projects (id) | Atalho deep-link |
| `/produtos` | ProductsList | Loja com filtros (categoria/estoque), modais de detalhe e pedido via WhatsApp |
| `/artistas` | Artists | Grid de artistas com biografia e foto |
| `/artistas/:id` | ArtistDetail | Perfil completo: biografia, fotos, estilo musical, presskit |
| `/galeria` | Gallery | Lista de álbuns |
| `/galeria/:albumId` | GalleryInfinity | Visualização infinita de fotos do álbum |
| `/sobre` | Sobre | Institucional (4ª edição, info do festival, idealizadores de Santa Rita do Sapucaí) |
| `/contato` | Contato | Formulário público (nome, email, telefone, assunto, mensagem) → backend |
| `/display/:screenCode` | DisplayPlayer | Player fullscreen YouTube com autoplay/loop/SSE update — para telões |
| `/login` | Login | Acesso à dashboard admin |
| `/privacidade`, `/termos`, `/acessibilidade` | Legais | Páginas estáticas |

### Componentes-chave do layout público

- **`<PublicNavbar />`** — barra fixa 64px com brand esquerda, links centralizados, área admin direita. Font Inter forçada via `!important`. Menu hamburger em ≤1024px.
- **`<PublicLayout />`** — wrapper navbar + main com `paddingTop: 64px` + footer institucional
- **Footer global** — 3 colunas (brand, navegação, sobre) + sociais. Centralizado em mobile ≤560px

---

## 5. Dashboard administrativa

Acessível em `/admin` após login JWT. Layout: sidebar fixa esquerda + conteúdo direita.

### Módulos

| Path | Módulo | Função |
|---|---|---|
| `/admin/overview` | Visão Geral | KPIs: próximos eventos, eventos publicados, taxa de conclusão de tarefas, receita, despesa, saldo, pendentes |
| `/admin/events` | Eventos | CRUD com upload de capa, status (draft/published/completed), datas, preço, tags |
| `/admin/financial` | Financeiro | Entradas/saídas, categorias, status pagamento, comentários por item, adição rápida de saldo |
| `/admin/gallery` | Galeria | Álbuns vinculados a eventos + upload em massa (até 100 imagens) |
| `/admin/nlista` | NLista | Credenciamento: cadastros com CPF/RG, telefone, tipo de lista, estacionamento, status pagamento + impressão |
| `/admin/operational` | Operacional | Tarefas com responsável, prazo, prioridade, vinculação a evento |
| `/admin/products` | Produtos | Catálogo da loja: imagem, preço, estoque, status, número WhatsApp |
| `/admin/artists` | Artistas | Perfis: nome, projeto, estilo, anos de carreira, biografia, fotos extras (max 4), presskit |
| `/admin/projects` | Projetos | Conteúdo: capa, vídeo (upload ou URL YouTube/Vimeo), categoria, status |
| `/admin/rss` | RSS | Esboço (não implementado de fato — placeholder) |
| `/admin/contact` | Contato | Inbox de mensagens do formulário público; marca como lida, deleta, WhatsApp direto pro número do remetente |
| `/admin/displays` | Telões | CRUD de telas: nome, screen_code único, URL YouTube, autoplay/loop/fullscreen; status online em tempo real (SSE); link/QR para a TV |
| `/admin/settings` | Configurações | Key-value (ex: vídeo do hero da home configurável por upload ou URL) |

### Padrão dos módulos admin

Todo módulo CRUD segue o mesmo esqueleto:

```
src/pages/admin/<modulo>/
  ├── <Modulo>Manager.tsx       # listagem + busca + abre modais
  ├── <Modulo>Form.tsx          # formulário criar/editar (quando complexo)
  └── <Modulo>Manager.module.css

src/services/<modulo>.service.ts # axios calls
src/types/<modulo>.types.ts      # interfaces

backend/src/routes/<modulo>.js   # CRUD routes com authenticate
backend/src/db/migrations.js     # tabela
```

Componentes reutilizados: `<Button>`, `<Modal>`, `<Table>`/`<TableRow>`/`<TableCell>`, `<Badge>`, `<StatusBadge>`, `<CustomSelect>` (substitui select nativo branco).

---

## 6. API REST

Base URL: `http://localhost:3002/api` (configurável via `VITE_API_URL`)

### Públicas (sem auth)
- `POST /auth/login` — login admin (rate-limited)
- `POST /contact` — submit formulário (validado: e-mail regex, tamanhos)
- `GET /events?page=&limit=&upcoming=1` — listagem paginada
- `GET /events/id/:id` — detalhe (filtra status != draft)
- `GET /events/:slug` — busca por slug derivado do title
- `GET /products?limit=` — listagem (status='published')
- `GET /products/id/:id` — detalhe (filtra status='published')
- `GET /projects?page=&limit=&search=` — listagem
- `GET /artists` — listagem (status='published')
- `GET /gallery`, `GET /gallery/albums`, `GET /gallery/album/:id`
- `GET /settings/:key` — leitura de configuração
- `GET /displays/by-code/:screenCode` — info do telão
- `GET /displays/stream/:screenCode` — SSE stream para realtime

### Admin (autenticadas via JWT Bearer)
- `GET /auth/me`
- `GET|POST|PUT|DELETE /admin/financial`, `/admin/tasks`
- `GET|POST|PUT|DELETE /events/admin/*`, `/products/admin/*`, `/projects/admin/*`, `/artists/admin/*`
- `POST|DELETE /gallery/admin/*` (incluindo `/admin/bulk` para upload em massa)
- `PUT /settings/admin/:key`
- `GET|POST|PUT|DELETE /admin/list-types`, `/admin/list-registrations` (NLista)
- `GET|PATCH|DELETE /contact/admin`
- `GET|POST|PUT|DELETE /displays/admin`

### Static
- `GET /uploads/*` — arquivos enviados (com `X-Content-Type-Options: nosniff` + CSP restritivo)

---

## 7. Segurança implementada

Resultado de audit completo em 10 áreas:

| # | Área | Implementação |
|---|---|---|
| 1 | **SQL Injection** | Queries 100% parametrizadas via `pg`. Whitelist de colunas no único endpoint com SQL dinâmico ([tasks.js](backend/src/routes/tasks.js)) |
| 2 | **Auth** | JWT HS256 (algoritmo explícito), role check (`admin`), middleware em todas rotas admin |
| 3 | **Brute-force** | Rate limit 5 tentativas/10min/IP + ban 10min; timing-safe (bcrypt dummy quando user não existe); reset on success; cleanup periódico |
| 4 | **CORS** | Whitelist via env CSV (`FRONTEND_ORIGIN=https://a.com,https://b.com`) |
| 5 | **Input validation** | JSON body limit 100KB (era 10MB); `POST /contact` validado com regex e tamanhos máximos por campo |
| 6 | **JWT secret** | Validação no boot: mín. 32 chars, rejeita placeholders conhecidos; expiração 2h (configurável); `ADMIN_PASSWORD` mín. 12 chars |
| 7 | **Data exposure** | Endpoints públicos filtram `status` (não vazam drafts); `/auth/me` não retorna hash de senha |
| 8 | **XSS** | Zero `dangerouslySetInnerHTML`; helper `safeUrl()` em URLs do banco (bloqueia `javascript:`, `data:`); todos `target="_blank"` com `rel="noopener noreferrer"` |
| 9 | **File upload** | Whitelist MIME + extensão (apenas imagens + mp4/mov/webm); 25MB max; nomes via `crypto.randomBytes(16)`; SVG bloqueado; CSP no `/uploads` |
| 10 | **Secrets/env** | `.env` no `.gitignore`; `.env.example` documentado; headers de segurança globais (X-Frame-Options, Referrer-Policy, HSTS, CORP, etc); `x-powered-by` removido |

---

## 8. Realtime (SSE)

Módulo **Telões** usa Server-Sent Events nativos para push do admin → telas conectadas.

```
Admin altera vídeo
       ↓
PUT /displays/admin/:id
       ↓
broadcast(screenCode, 'update', { youtube_url, loop, ... })
       ↓
res.write('event: update\ndata: {...}\n\n') em cada subscriber
       ↓
EventSource no <DisplayPlayer /> recebe
       ↓
setDisplay(prev => { ...prev, ...next })
       ↓
iframe re-renderiza com nova URL
```

Reconexão automática via `useDisplayLive` (hook em [src/hooks/useDisplayLive.ts](src/hooks/useDisplayLive.ts)).
Heartbeat 25s atualiza `displays.last_seen` para refletir status "online" no admin.

---

## 9. Como rodar (desenvolvimento)

### Pré-requisitos
- Node.js 18+
- PostgreSQL 13+ rodando local
- Banco `capivaridb` criado

### Backend
```powershell
cd backend
cp .env.example .env
# Editar .env preenchendo: JWT_SECRET (32+ chars), ADMIN_PASSWORD (12+ chars), DB_PASSWORD
node server.js
# (ou npm run dev para nodemon)
```

Gerar JWT_SECRET seguro:
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Server sobe em `http://localhost:3002`. Na primeira execução, cria todas as tabelas e o admin inicial.

### Frontend
```powershell
npm install
npm run dev
```

Sobe em `http://localhost:5173`.

### Login
- E-mail: o configurado em `ADMIN_EMAIL` (default `admin@capivari.local`)
- Senha: o `ADMIN_PASSWORD` do `.env`

---

## 10. Como rodar (produção)

### Build
```powershell
npm run build          # gera /dist
```

### Deploy frontend
Servir `/dist` em qualquer host estático (Vercel, Netlify, Cloudflare Pages, nginx).

### Deploy backend
- VPS com Node + PostgreSQL OU
- Render/Railway/Fly.io (auto-deploy do `/backend`)

### Variáveis de produção
```
JWT_SECRET=<48 bytes hex>
JWT_EXPIRES_IN=2h
ADMIN_PASSWORD=<senha forte 12+ chars>
DB_PASSWORD=<senha forte>
FRONTEND_ORIGIN=https://capivari.com.br,https://www.capivari.com.br
TRUST_PROXY=true
```

### HTTPS
Obrigatório em produção (HSTS é setado automaticamente quando request é HTTPS). Configurar via nginx/Cloudflare/Caddy.

---

## 11. Padrões de código

- **Sem comentários supérfluos** — código auto-explicativo, comentário só pra "por quê" não óbvio
- **Sem `any` em TypeScript** — use tipos concretos ou `unknown`
- **CSS Modules** para escopo automático (sem global leak)
- **`!important` em alguns componentes-chave** (ex: `PublicNavbar`) para resistir a cascata externa
- **ESLint** sempre limpo (0 errors, 0 warnings)
- **Build de produção** sempre passando
- **Imports type-only** quando `verbatimModuleSyntax` exige: `import { type FC }`
- **Optional catch binding** (`catch {}`) quando `err` não é usado
- **Service layer** isola `axios` — componentes nunca chamam axios direto
- **Validação dupla** (frontend + backend) em todos os formulários sensíveis
- **Confirmação destrutiva** (`confirm()`) antes de deletes
- **Toast** para todo feedback (success/error)

---

## 12. Limitações conhecidas

- **Sem testes automatizados** (Jest, Vitest, Playwright)
- **Sem CI/CD configurado**
- **Rate limit em memória** — não escala para múltiplas instâncias (precisaria Redis)
- **Sem refresh token** — usuário precisa relogar a cada 2h
- **Sem revogação server-side de JWT** — token roubado vale até expirar
- **Sem cache** (Redis/CDN) nas respostas de API
- **Bundle frontend ~1MB** (sem code-splitting por rota)
- **`/uploads` em disco local** — não escala horizontalmente; ideal mover para S3/R2 quando crescer
- **Sem PWA / Service Worker** — sem cache offline
- **RSS module** é placeholder (não implementado)

---

## 13. Roadmap sugerido

### Curto prazo
- QR Code nos telões (admin gera QR pra TV escanear)
- Code-splitting por rota (reduz bundle inicial)
- Migration de Multer disk → S3-compatible (Cloudflare R2)

### Médio prazo
- Agente Python ("Capivari Display Agent") para gerenciar PCs dos telões remotamente
- Refresh token + revogação de JWT (Redis)
- PWA com cache offline para telões resistirem a queda de internet
- Testes E2E nos fluxos críticos (login, criar evento, telão recebe update)

### Longo prazo
- Múltiplos festivais / multi-tenant
- Schedule de vídeos por horário (programação automática de telões)
- Analytics: tempo de exibição, taxa de cliques em produtos, etc

---

## 14. Contatos do projeto

Projeto criado e mantido por **Caique Villela** (@designmacpixel).
Festival idealizado por equipe de **Santa Rita do Sapucaí, Minas Gerais**.
Local do evento: **Pouso Alegre, MG**.

---

**Última atualização:** 2026-05-24
**Versão do documento:** 1.0
