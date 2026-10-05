# CRM Imobiliária

Projeto Integrador II - UNIVESP. API REST e aplicação web para gestão de leads, imóveis, visitas e histórico de atendimentos de uma imobiliária de pequeno porte.

## Stack

| Camada    | Tecnologias |
| --------- | ----------- |
| Monorepo  | pnpm workspaces |
| Backend   | Bun + Elysia + Drizzle ORM + PostgreSQL + Zod (validação via TypeBox) |
| Frontend  | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| Docs API  | Swagger UI em `/swagger` |

## Estrutura

```
crm-imobiliaria/
├── apps/
│   ├── api/                  # API Elysia + Bun
│   │   ├── src/
│   │   │   ├── index.ts      # entry point, CORS e Swagger
│   │   │   ├── routes/       # auth, users, leads, imoveis, visitas, interacoes, dashboard
│   │   │   ├── db/           # schema, conexão, migrate e seed
│   │   └── drizzle/          # migrations geradas
│   └── web/                  # Next.js App Router
│       └── src/
│           ├── app/          # dashboard, leads, imoveis, visitas
│           ├── components/   # componentes compartilhados
│           └── lib/api.ts    # cliente tipado da API
├── packages/
│   └── schemas/              # tipos compartilhados entre API e web
├── docker-compose.yml        # PostgreSQL + pgAdmin (opcional)
└── package.json              # scripts do monorepo
```

## Pré-requisitos

- [Bun](https://bun.sh) 1.1+
- [pnpm](https://pnpm.io) 9+
- PostgreSQL 14+ (local ou via Docker)

## 1. Banco de dados

Com Docker (recomendado):

```bash
docker compose up -d
```

Sem Docker, criando o banco manualmente no PostgreSQL local:

```bash
createdb -U postgres crm_imobiliaria
```

O acesso padrão configurado é `postgres:postgres` na porta `5432`. Ajuste se necessário em `apps/api/.env`.

## 2. Instalação das dependências

Na raiz do monorepo:

```bash
pnpm install
```

## 3. Configuração do ambiente

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

`apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_imobiliaria
PORT=3000
JWT_SECRET=super-secret-key-change-in-production
NODE_ENV=development
```

> Em desenvolvimento, troque `JWT_SECRET` por um valor arbitrário. Em produção, use um segredo forte e mantenha-o fora do versionamento.

## 4. Migrations e seed

```bash
pnpm db:migrate   # aplica as migrations em apps/api/drizzle
pnpm db:seed      # popula o banco com dados fictícios
pnpm db:generate  # gera migration após alterar o schema
pnpm db:studio    # abre o Drizzle Studio para inspecionar os dados
```

O seed cria 2 usuários, 10 leads, 5 imóveis, 3 visitas e 3 interações.

## 5. Executando

```bash
pnpm dev
```

- API: <http://localhost:3000>
- Swagger UI: <http://localhost:3000/swagger>
- Frontend: <http://localhost:3001>

Para subir separadamente:

```bash
pnpm dev:api
pnpm dev:web
```

## Credenciais do seed

| Email                        | Senha         | Role     |
| ---------------------------- | ------------- | -------- |
| admin@crmimobiliaria.com     | `admin123`    | admin    |
| joao@crmimobiliaria.com     | `corretor123` | corretor |

## Endpoints principais

| Método | Rota                  | Descrição |
| ------ | --------------------- | --------- |
| POST   | `/auth/login`         | Autentica e retorna token JWT |
| POST   | `/auth/logout`        | Encerra a sessão |
| GET    | `/auth/me`            | Dados do usuário autenticado |
| GET    | `/users`              | Lista usuários |
| POST   | `/users`              | Cria usuário |
| GET    | `/leads`              | Lista leads (filtros: `etapa`, `corretorId`, `busca`) |
| POST   | `/leads`              | Cria lead |
| GET    | `/imoveis`            | Lista imóveis (filtros: `tipo`, `finalidade`, `status`, `valorMin`, `valorMax`, `busca`) |
| POST   | `/imoveis`            | Cria imóvel |
| GET    | `/visitas`            | Lista visitas (filtros: `leadId`, `imovelId`, `status`) |
| POST   | `/visitas`            | Agenda visita |
| GET    | `/interacoes`         | Histórico de interações (filtro: `leadId`) |
| POST   | `/interacoes`         | Registra interação |
| GET    | `/dashboard`          | Indicadores e agregações |

Todas as rotas respondem no formato `{ success, data }` ou `{ success, message }`, com status HTTP apropriados (400 para entrada inválida, 401 para credenciais inválidas, 404 para registro inexistente, 409 para e-mail duplicado).

## Verificação de tipos

```bash
pnpm typecheck
```

## Scripts

| Script            | Descrição |
| ----------------- | --------- |
| `pnpm dev`        | Sobe API e frontend juntos |
| `pnpm build`      | Build de produção das duas apps |
| `pnpm db:generate`| Gera migration a partir do schema |
| `pnpm db:migrate` | Aplica migrations |
| `pnpm db:seed`    | Popula o banco |
| `pnpm db:studio`  | Drizzle Studio |
| `pnpm typecheck`  | Verificação de tipos em todos os pacotes |