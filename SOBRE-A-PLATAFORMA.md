# Plataforma Capivari Festival — Visão geral

## O que é
Portal web do **Capivari Festival**: um site público de divulgação cultural + uma **comunidade/fórum** de usuários + um **painel administrativo** completo para gerir todo o evento e seu conteúdo. Frontend em React + TypeScript (Vite); backend próprio em Node/Express com PostgreSQL e upload de mídia via Cloudinary.

---

## Área pública (visitante)
Páginas abertas, sem login:

- **Home** — página inicial do festival.
- **Eventos** — lista e detalhe de cada evento (`/eventos`, `/eventos/:id`).
- **Artistas** — lista e perfil de cada artista da line-up (`/artistas`).
- **Projetos** — projetos culturais, lista e detalhe (`/projetos`).
- **Produtos** — vitrine de produtos (`/produtos`).
- **Galeria** — álbuns de fotos com visualização infinita (`/galeria`, `/galeria/:albumId`).
- **Sobre / Contato** — institucional + formulário de contato.
- **Privacidade / Termos / Acessibilidade** — páginas legais.
- **Telões (Display Player)** — `/display/:screenCode`, tela dedicada para exibição em telões/painéis no local do evento.

## Comunidade (fórum social)
- **Tópicos** por categoria, com criação, respostas e curtidas (`/comunidade`).
- **Perfil público** de cada usuário (`/usuarios/:userId`): avatar, capa, bio, "membro desde", e estatísticas — **Tópicos, Respostas, Seguidores, Seguindo** e **Interações totais**.
- **Seguir/deixar de seguir** outros membros.
- **Notificações** (sino) para o próprio usuário.

## Painel do usuário comum (`/painel`)
Dashboard de **Perfil** onde o membro gerencia seus próprios dados:
- Foto de perfil (avatar) e **capa**.
- Nome, e-mail e **bio** (até 500 caracteres).
- **Troca de senha** (senha atual + nova).
- Link para ver o próprio perfil público.

---

## Painel administrativo (`/admin`) — só admins
Layout com sidebar; cada item é um módulo de gestão:

| Módulo | Função |
|---|---|
| **Visão Geral** | Dashboard com KPIs: nº de eventos/projetos, eventos futuros e publicados, **eficiência operacional** (% de tarefas concluídas) e bloco **financeiro** (receita, despesas, saldo, valores pendentes). |
| **Eventos** | CRUD de eventos (datas, status publicado/rascunho, etc.). |
| **Financeiro** | Lançamentos de entrada/saída, status de pagamento (pago/pendente), controle de receita e despesa. |
| **Galeria** | Gestão de álbuns e fotos. |
| **NLista** | Listas (ex.: convidados/credenciamento). |
| **Operacional** | Tarefas e checklist da operação do evento. |
| **Produtos** | CRUD de produtos da vitrine. |
| **Artistas** | CRUD da line-up de artistas. |
| **Projetos** | CRUD de projetos culturais. |
| **Moderação** | Fila de moderação da comunidade, com **badge** de itens pendentes (atualiza a cada 30s). |
| **RSS** | Configuração de feeds RSS. |
| **Contato** | Mensagens recebidas pelo formulário. |
| **Telões** | Configuração das telas/displays exibidas no evento. |
| **Configurações** | Ajustes gerais da plataforma. |

---

## Backend (API)
Rotas dedicadas para: `auth`, `users`, `community`, `notifications`, `events`, `artists`, `projects`, `products`, `gallery`, `financial`, `nlista`, `tasks`, `contact`, `displays`, `settings`. Inclui autenticação JWT (usuário e admin), rate limiting, upload de mídia (Cloudinary) e migrações de banco.
