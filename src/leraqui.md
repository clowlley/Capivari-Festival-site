Você criou este projeto inteiro.

Contexto atual do projeto:

Stack:
- React
- Vite
- TypeScript
- Backend próprio separado
- Dashboard administrativa já pronta
- Segurança já implementada
- ESLint limpo
- Build produção passando
- Arquitetura modular existente

O projeto NÃO é um site simples.

É uma plataforma fullstack / CMS administrativo customizado com módulos:

- Visão Geral
- Eventos
- Financeiro
- Galeria
- NLista
- Operacional
- Produtos
- Artistas
- Projetos
- RSS
- Contato
- Configurações

Você já criou toda arquitetura, padrões, tipagens, services, auth, segurança e organização do código.

OBJETIVO:

Adicionar um novo módulo chamado:

TELÕES

O comportamento desejado é parecido com YouTube Cast / Digital Signage / Display System.

IMPORTANTÍSSIMO:

NÃO reescrever arquitetura.

NÃO refatorar código existente sem necessidade.

NÃO alterar types globais.

NÃO modificar services compartilhados se não for obrigatório.

NÃO quebrar build.

NÃO quebrar ESLint.

Seguir EXATAMENTE os padrões existentes do projeto.

IMPLEMENTAÇÃO EM ETAPAS.

Primeiro ANALISAR.

Depois IMPLEMENTAR incrementalmente.

----------------------------------------------------
FASE 1 — ANÁLISE
----------------------------------------------------

Antes de codar:

1. Analise toda arquitetura atual.

2. Descubra:
- onde encaixar o módulo TELÕES
- padrões já usados
- services existentes
- hooks existentes
- auth existente
- rotas existentes
- backend patterns existentes

3. Liste TODOS os arquivos que serão:
- criados
- modificados

4. Explique rapidamente o plano técnico antes de implementar.

NÃO implementar ainda nesta fase.

----------------------------------------------------
FASE 2 — MÓDULO ADMIN TELÕES
----------------------------------------------------

Adicionar novo item no menu admin:

TELÕES

Seguindo o mesmo padrão visual dos módulos existentes.

Criar estrutura equivalente ao padrão atual do projeto.

Exemplo esperado:

pages/admin/displays/

ou equivalente ao padrão real encontrado.

Criar CRUD completo.

Campos:

- Nome da tela
- Screen Code único
- URL Youtube
- Loop (boolean)
- Autoplay (boolean)
- Fullscreen (boolean)
- Status online
- Created At
- Updated At

Tela admin deve permitir:

- criar tela
- editar tela
- excluir tela
- listar telas
- visualizar status

Usar validações existentes do projeto.

Usar tipagem TypeScript correta.

Usar services existentes.

Usar padrões visuais existentes.

----------------------------------------------------
FASE 3 — PLAYER DISPLAY
----------------------------------------------------

Criar rota pública:

/display/:screenCode

Exemplos:

/display/mainstage
/display/lounge
/display/bar

Função:

abrir em:

- Smart TV
- navegador
- notebook HDMI
- Android TV
- telões

Comportamento:

- carregar config da tela
- localizar screenCode
- carregar Youtube automaticamente
- autoplay
- loop infinito
- fullscreen mode
- loading state
- error fallback
- offline fallback

IMPORTANTE:

Implementar embed corretamente.

Loop Youtube precisa funcionar corretamente.

Respeitar políticas de autoplay.

Design minimalista focado em telão.

----------------------------------------------------
FASE 4 — REALTIME / LIVE UPDATE
----------------------------------------------------

Integrar com infraestrutura realtime já existente.

Se Socket.IO já existir:

reutilizar.

Se não existir:

implementar seguindo arquitetura atual.

Objetivo:

Quando admin alterar:

- vídeo
- autoplay
- loop
- config

A tela correspondente deve atualizar INSTANTANEAMENTE.

Sem refresh.

Sem reload manual.

Fluxo esperado:

Admin
↓
Salvar configuração
↓
backend
↓
evento realtime
↓
display recebe
↓
troca instantânea

----------------------------------------------------
FASE 5 — STATUS ONLINE
----------------------------------------------------

Implementar heartbeat/status.

Quando display abrir:

registrar conexão.

Mostrar no admin:

ONLINE
OFFLINE

Atualizar automaticamente.

----------------------------------------------------
FASE 6 — SEGURANÇA
----------------------------------------------------

Respeitar TODA segurança existente.

Validar:

- inputs
- URLs Youtube
- screenCode uniqueness
- sanitização
- backend validation
- auth admin
- rate limiting existentes
- middleware existentes

Não introduzir brechas.

Manter hardening atual.

----------------------------------------------------
FASE 7 — QUALIDADE FINAL
----------------------------------------------------

Ao finalizar:

1. Rodar lint.
2. Rodar build.
3. Corrigir erros encontrados.
4. Corrigir TS warnings.
5. Corrigir imports.
6. Verificar tipagens.
7. Verificar regressões.

ENTREGAR:

- resumo da implementação
- arquivos criados
- arquivos modificados
- resultado lint
- resultado build
- possíveis melhorias futuras

Implementar de forma incremental, segura e compatível com a arquitetura já existente.