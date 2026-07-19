# InsightForge AI

> **Enterprise-grade AI Business Intelligence Platform**
>
> Upload data → AI analyses it → Get interactive dashboards, insights, KPI recommendations, and natural-language chat with your data.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Local Development Setup](#local-development-setup)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Running Services](#running-services)
9. [Docker Deployment](#docker-deployment)
10. [Production Deployment](#production-deployment)
11. [API Reference](#api-reference)
12. [Security Notes](#security-notes)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX (TLS Termination)                 │
│              Port 443 → routes to services below                │
└──────────────┬───────────────┬────────────────┬─────────────────┘
               │               │                │
        ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
        │  Next.js    │ │  NestJS     │ │  FastAPI    │
        │  Frontend   │ │  Backend    │ │  AI Engine  │
        │  :3000      │ │  :3001      │ │  :8000      │
        └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
               │               │                │
               │        ┌──────▼──────┐         │
               │        │  PostgreSQL  │         │
               │        │  + Redis    │         │
               │        │  (sessions) │         │
               └────────┴─────────────┴─────────┘
```

### Data Flow

1. User uploads a file via the **Frontend** → stored in **Backend** file system
2. **Backend** triggers the **AI Engine** to process the file
3. **AI Engine** (Python/Pandas) parses the data, computes statistics, and calls OpenAI/watsonx
4. Results (schema, insights, KPIs) are stored in **PostgreSQL**
5. Frontend fetches results and renders **Apache ECharts** dashboards
6. Users can chat with their data via the **AI Chat** interface

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | Next.js 15, React 19, TypeScript  |
| UI           | Tailwind CSS v3, shadcn/ui        |
| Charts       | Apache ECharts 5                  |
| State        | Zustand                           |
| Backend API  | NestJS 10, TypeScript             |
| Auth         | JWT (access + refresh tokens), Argon2id |
| ORM          | Prisma 6                          |
| Database     | PostgreSQL 15                     |
| Cache        | Redis 7                           |
| AI Engine    | Python 3.11, FastAPI, Pandas      |
| AI Providers | OpenAI GPT-4o, IBM watsonx        |
| Container    | Docker + Docker Compose           |
| Proxy        | Nginx (TLS 1.3)                   |

---

## Project Structure

```
insightforge-ai/
├── frontend/                    # Next.js App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/          # Login / Register pages
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/     # Protected dashboard pages
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── page.tsx         # Overview
│   │   │   │   │   ├── upload/          # File upload
│   │   │   │   │   ├── datasets/        # Dataset list
│   │   │   │   │   ├── dashboards/      # Dashboard gallery
│   │   │   │   │   ├── insights/        # AI insights
│   │   │   │   │   ├── chat/            # AI chat
│   │   │   │   │   ├── reports/         # Reports
│   │   │   │   │   ├── profile/         # User profile
│   │   │   │   │   └── settings/        # Settings
│   │   │   │   └── layout.tsx           # Protected layout
│   │   │   ├── layout.tsx               # Root layout
│   │   │   ├── page.tsx                 # Landing page
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── navbar.tsx
│   │   │   ├── providers/
│   │   │   │   ├── theme-provider.tsx
│   │   │   │   └── auth-guard.tsx
│   │   │   └── ui/                      # shadcn/ui components
│   │   ├── hooks/
│   │   │   └── use-toast.ts
│   │   ├── lib/
│   │   │   ├── api-client.ts            # Axios + refresh interceptor
│   │   │   └── utils.ts
│   │   └── store/
│   │       └── auth-store.ts            # Zustand auth store
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                     # NestJS API
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── prisma/              # Global Prisma service
│   │   ├── auth/                # JWT auth (login, register, refresh)
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   └── strategies/
│   │   ├── users/               # User management
│   │   ├── datasets/            # File upload + dataset CRUD
│   │   ├── dashboards/          # Dashboard + widget management
│   │   ├── insights/            # AI insight storage
│   │   ├── reports/             # Report generation
│   │   ├── chat/                # Chat sessions + messages
│   │   └── health/              # Health check endpoint
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile
│   ├── nest-cli.json
│   └── package.json
│
├── ai-engine/                   # Python FastAPI AI Engine
│   ├── main.py                  # FastAPI app
│   ├── config.py                # Pydantic settings
│   ├── routers/
│   │   ├── analysis.py          # File analysis endpoint
│   │   ├── insights.py          # AI insight generation
│   │   ├── chat.py              # Conversational AI
│   │   └── kpi.py               # KPI recommendations
│   ├── services/
│   │   ├── data_processor.py    # Pandas processing
│   │   └── ai_service.py        # OpenAI / watsonx client
│   ├── Dockerfile
│   └── requirements.txt
│
├── nginx/
│   └── nginx.conf               # TLS + reverse proxy config
│
├── docker-compose.yml
├── .env.example
└── package.json                 # Monorepo scripts
```

---

## Prerequisites

| Tool        | Minimum Version |
|-------------|-----------------|
| Node.js     | 20.x LTS        |
| npm         | 10.x            |
| Python      | 3.11+           |
| PostgreSQL  | 15.x            |
| Docker      | 24.x            |
| Docker Compose | 2.x          |

---

## Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/insightforge-ai.git
cd insightforge-ai

# Install frontend & backend node modules
npm install

# Install Python deps
cd ai-engine
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Configure environment variables

```bash
# Root .env (used by Docker Compose)
cp .env.example .env

# Frontend
cp frontend/.env.local.example frontend/.env.local

# Backend
cp backend/.env.example backend/.env

# AI Engine
cp ai-engine/.env.example ai-engine/.env
```

Edit each `.env` file and replace all `change_me_*` and `replace_with_*` values with strong secrets.

**Generate secure secrets:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Python
python -c "import secrets; print(secrets.token_hex(64))"
```

### 3. Start PostgreSQL and Redis (via Docker)

```bash
docker compose up postgres redis -d
```

---

## Database Setup

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Apply migrations (creates tables)
npm run db:migrate

# Optional: open Prisma Studio GUI
npm run db:studio
```

---

## Running Services

Open three terminals:

**Terminal 1 — NestJS Backend**
```bash
cd backend
npm run start:dev
# Listening on http://localhost:3001
# Swagger UI: http://localhost:3001/docs
```

**Terminal 2 — FastAPI AI Engine**
```bash
cd ai-engine
source .venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
# Docs: http://localhost:8000/docs
```

**Terminal 3 — Next.js Frontend**
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

---

## Docker Deployment

### Development

```bash
# Copy and populate root .env
cp .env.example .env
# Edit .env with your values

# Build and start all services
docker compose up --build -d

# Check service status
docker compose ps

# View logs
docker compose logs -f backend
```

### Stopping

```bash
docker compose down

# Remove volumes (WARNING: deletes database data)
docker compose down -v
```

---

## Production Deployment

### SSL Certificates

Place your certificates in `nginx/ssl/`:

```
nginx/ssl/cert.pem
nginx/ssl/key.pem
```

Using Let's Encrypt (Certbot):
```bash
certbot certonly --standalone -d yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

### Environment

1. Set `FRONTEND_URL=https://yourdomain.com` in `.env`
2. Set `NEXT_PUBLIC_API_URL=https://yourdomain.com/api` in `.env`
3. Set `NEXT_PUBLIC_AI_URL=https://yourdomain.com/ai` in `.env`
4. Generate all secret values with cryptographically secure random bytes (64+ chars)
5. Set your AI provider API keys

### Build and run

```bash
# Build all images
docker compose build

# Run in detached mode
docker compose up -d

# Run database migrations
docker compose exec backend npm run db:migrate

# Check health
curl https://yourdomain.com/api/health
```

### Database Backups

```bash
# Backup
docker compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%F).sql

# Restore
cat backup_2024-01-01.sql | docker compose exec -T postgres psql -U $POSTGRES_USER $POSTGRES_DB
```

---

## API Reference

| Service | Base URL | Auth |
|---------|----------|------|
| Backend API | `http://localhost:3001` | Bearer JWT |
| Swagger UI | `http://localhost:3001/docs` | None |
| AI Engine | `http://localhost:8000` | Internal |
| AI Docs | `http://localhost:8000/docs` | None |

### Key Endpoints

#### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, get tokens |
| POST | `/auth/refresh` | Rotate tokens |
| POST | `/auth/logout` | Invalidate session |

#### Datasets
| Method | Path | Description |
|--------|------|-------------|
| POST | `/datasets/upload` | Upload file (multipart) |
| GET | `/datasets` | List your datasets |
| GET | `/datasets/:id` | Get dataset details |
| DELETE | `/datasets/:id` | Delete dataset |

#### AI Engine
| Method | Path | Description |
|--------|------|-------------|
| POST | `/analysis/analyse` | Analyse uploaded file |
| POST | `/insights/generate` | Generate AI insights |
| POST | `/chat/ask` | Chat with dataset |
| POST | `/kpi/recommend` | Get KPI recommendations |

---

## Security Notes

- All passwords hashed with **Argon2id** (memory-hard, side-channel resistant)
- JWT access tokens expire in **15 minutes**; refresh tokens in **7 days**
- Refresh tokens are stored hashed in PostgreSQL and rotated on use
- All services bind to **127.0.0.1** — only Nginx exposes public ports
- Nginx enforces **TLS 1.2/1.3** with strong cipher suites
- Rate limiting: 5 req/min on auth endpoints, 30 req/min on API
- File uploads validated by MIME type and size (max 100 MB)
- Input validation via class-validator on all DTOs
- Security headers: HSTS, X-Frame-Options, CSP, X-Content-Type-Options
- All secrets loaded from environment variables — never hardcoded
- Container images sourced from Red Hat registry; all containers run as non-root UID 1001

---

*InsightForge AI — Built with Next.js · NestJS · Python FastAPI · PostgreSQL · Apache ECharts*
