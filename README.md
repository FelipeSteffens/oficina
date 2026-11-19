# AutoTrack Pro

Plataforma web multi-tenant para gestão de oficinas mecânicas: ordens de serviço, orçamentos, agendamentos, estoque, garagem digital do cliente e **histórico portátil do veículo**.

O projeto é dividido em três partes:

| Pasta | Descrição |
| --- | --- |
| `database/` | Schema MySQL completo (16 tabelas, índices, triggers de imutabilidade e dados de demonstração) |
| `backend/` | API REST em Node.js + Express + MySQL (`mysql2/promise`, transações, JWT, RBAC) |
| `frontend/` | SPA React (Vite) + Tailwind CSS + React Router + Recharts + jsPDF |

> **Escopo da v1:** não há pagamentos online nem chat em tempo real. A confirmação de agendamentos pode gerar um link de WhatsApp.

---

## Funcionalidades

### Área pública
- Landing page responsiva com apresentação, benefícios e chamadas para ação.
- Cadastro de clientes e de oficinas com criação automática de usuário e sessão.
- Página de contato com persistência no banco (`contatos_site`).
- Login com credenciais rápidas de demonstração.

### Cliente
- Dashboard com KPIs da garagem.
- Garagem digital: cadastrar veículos, autorizar/revogar vínculos com oficinas.
- Detalhe do veículo com KM, autorizações e histórico.
- Orçamentos: aprovar ou recusar propostas enviadas pela oficina.
- Agendamentos: solicitar horários e acompanhar status.
- Histórico digital: linha do tempo **pertencente ao veículo**, com PDF.
- Perfil e edição de dados cadastrais.

### Oficina (admin_oficina e funcionario)
- Dashboard com faturamento, OS em andamento, orçamentos pendentes, estoque baixo e agenda.
- Ordens de serviço: abrir, editar, adicionar peças, finalizar, cancelar e exportar PDF.
- Orçamentos: criar com serviços/peças, enviar ao cliente e converter aprovados em OS.
- Agenda: confirmar, concluir e cancelar agendamentos.
- Veículos atendidos (somente com vínculo autorizado) e histórico do veículo.
- Estoque: peças, entradas, movimentações e alertas de reposição.
- Relatórios com gráficos (Recharts) e exportação de PDFs.
- Equipe (somente `admin_oficina`): cadastrar funcionário com e-mail/senha; o acesso é criado automaticamente com perfil `funcionario`.
- Dados da empresa (somente `admin_oficina`).

### Admin geral
- Visão consolidada de oficinas, usuários, OS, faturamento e auditoria.
- Cadastro/edição de oficinas e ativação/desativação; o cadastro solicita e-mail/senha e cria o login `admin_oficina` da nova unidade.
- Gestão de perfis e status de usuários.

---

## Regras de negócio importantes

- **Isolamento multi-tenant:** toda consulta é filtrada por `oficina_id` (quando aplicável). Usuários `cliente` só acessam seus próprios veículos, orçamentos, agendamentos e OS.
- **RBAC:** `cliente`, `funcionario`, `admin_oficina`, `admin_geral`. Rotas e menus são protegidos no front e no back.
- **Fechamento de OS (transação única):** ao finalizar uma ordem de serviço, em **uma única transação SQL**, o sistema:
  1. grava o registro imutável em `historico_veiculos`;
  2. baixa cada peça usada de `estoque_pecas`;
  3. registra cada baixa em `estoque_movimentacoes`;
  4. atualiza a quilometragem do veículo;
  5. atualiza o status/valor da OS;
  6. grava a auditoria em `logs_auditoria`.
- **Imutabilidade:** triggers no MySQL bloqueiam `UPDATE`/`DELETE` em `historico_veiculos` e `logs_auditoria`.
- **Garagem digital:** um veículo só fica visível para uma oficina depois que o proprietário autoriza o vínculo em `veiculo_oficinas`.

---

## Pré-requisitos

- Node.js **18+** e npm
- MySQL **8+** (ou MariaDB compatível)
- Navegador moderno (Chrome, Edge, Firefox)

---

## Instalação

### 1. Banco de dados

Crie o banco e importe o schema (o próprio arquivo já contém `CREATE DATABASE` e os seeds):

```bash
mysql -u root -p < database/schema.sql
```

No Windows (PowerShell):

```powershell
Get-Content database\schema.sql | mysql -u root -p
```

> O schema cria o banco `autotrack_pro`, as 16 tabelas, os triggers e os usuários de demonstração. Se precisar recriar tudo, o script começa com `DROP DATABASE IF EXISTS` — **cuidado em ambiente com dados reais**.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edite .env com suas credenciais do MySQL e um JWT_SECRET seguro
npm run dev
```

API disponível em `http://localhost:3001/api`. Health check: `GET http://localhost:3001/health`.

Variáveis principais de `backend/.env`:

| Variável | Exemplo | Descrição |
| --- | --- | --- |
| `PORT` | `3001` | Porta da API |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | Conexão MySQL |
| `DB_USER` / `DB_PASSWORD` | `root` / `senai` | Credenciais do banco |
| `DB_NAME` | `autotrack_pro` | Nome do banco |
| `JWT_SECRET` | (chave longa) | Segredo dos tokens |
| `JWT_EXPIRES_IN` | `7d` | Validade do token |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem liberada no CORS |

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Aplicação em `http://localhost:5173`. O Vite faz proxy de `/api` para `http://localhost:3001`.

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

---

## Acessos rápidos (seeds)

Todos os usuários são criados com senha criptografada via bcrypt. A tela de login também oferece botões de preenchimento automático.

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Admin Geral | `admin@autotrackpro.com` | `Admin@123` |
| Admin Oficina 1 | `oficina1@autotrackpro.com` | `Oficina@123` |
| Admin Oficina 2 | `oficina2@autotrackpro.com` | `Oficina@123` |
| Funcionário 1 | `func1@autotrackpro.com` | `Func@123` |
| Funcionário 2 | `func2@autotrackpro.com` | `Func@123` |
| Cliente 1 | `cliente1@autotrackpro.com` | `Cliente@123` |
| Cliente 2 | `cliente2@autotrackpro.com` | `Cliente@123` |

---

## Estrutura de diretórios

```text
oficina/
├── database/
│   └── schema.sql                     # DDL + triggers + seeds
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js                     # Express app (CORS, JSON, rotas, erros)
│       ├── server.js                 # Bootstrap do servidor
│       ├── config/
│       │   ├── db.js                  # Pool mysql2/promise + withTransaction()
│       │   └── env.js                 # Variáveis de ambiente
│       ├── routes/                    # 14 routers montados em /api
│       ├── middlewares/               # auth, RBAC, validação, error handler
│       ├── controllers/               # Camada HTTP (req/res)
│       ├── services/                  # Regras de negócio + transações
│       ├── repositories/              # Acesso SQL (prepared statements)
│       └── utils/                     # AppError, response, password, formatters, WhatsApp
├── frontend/
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx                   # Providers + BrowserRouter
│       ├── App.jsx                    # Árvore de rotas pública/privada
│       ├── index.css                  # Tailwind + tokens visuais
│       ├── services/                  # Clientes Axios por domínio
│       ├── contexts/                  # AuthContext, ToastContext
│       ├── hooks/                     # useFetch, useApi, useAuth
│       ├── components/
│       │   ├── ui/                    # Button, Card, Table, Modal, Badge, Tabs...
│       │   ├── layout/                # Navbar, Sidebar, layouts, ProtectedRoute
│       │   ├── oficina/               # Formulários de OS, orçamento, peça, agenda
│       │   ├── veiculos/              # Card, formulário, vínculos, timeline
│       │   ├── charts/                # Gráficos Recharts
│       │   └── admin/                 # Formulário de oficina
│       ├── pages/
│       │   ├── public/                # Landing, Login, Cadastro, Contato
│       │   └── private/
│       │       ├── cliente/           # 7 páginas
│       │       ├── oficina/           # 9 páginas
│       │       └── admin/             # 3 páginas
│       └── utils/                     # constants, formatters, pdfGenerator
└── README.md
```

---

## API (visão geral)

Todas as rotas começam com `/api` e usam o envelope:

```json
{ "success": true, "message": "Operação concluída.", "data": { } }
```

Autenticação: `Authorization: Bearer <token>`.

Principais grupos:

- `/api/auth` — login, cadastro de cliente/oficina, perfil (`/me`)
- `/api/clientes` — perfil do cliente
- `/api/oficinas` — oficinas (gestão global)
- `/api/funcionarios` — equipe da oficina
- `/api/veiculos` — garagem, vínculos, veículos autorizados
- `/api/agendamentos` — agenda
- `/api/orcamentos` — propostas, aprovação e conversão em OS
- `/api/os` — ordens de serviço (inclui `POST /:id/finalizar`)
- `/api/estoque` — peças, entradas e movimentações
- `/api/historico` — histórico imutável por veículo
- `/api/dashboard` — KPIs de cliente, oficina e global
- `/api/usuarios` — administração de usuários
- `/api/contato` — formulário de contato

---

## Identidade visual

- **Navy:** `#0B192C`, `#112240`
- **Azul:** `#1E56A0`, `#2563EB`
- **Neutros:** `#F8FAFC`, `#E2E8F0`, `#64748B`
- **Fontes:** Plus Jakarta Sans (títulos) e Inter (texto)

---

## Validações realizadas

- Backend: `node --check` em **67 arquivos** — 0 falhas; importação de `src/app.js` OK.
- Frontend: `npm run build` (Vite) — build de produção concluído com sucesso.
- Não foi possível validar a execução contra um MySQL local neste ambiente; importe `database/schema.sql` e siga o passo 2 para testar a API.
