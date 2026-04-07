<div align="center">

# SWEO — AI-Powered Customer Support Platform

**An open-source, multi-tenant SaaS platform for AI-driven customer support**

Built with Next.js 16 · Appwrite · OpenAI · Pinecone · Tailwind CSS · shadcn/ui

---

[Getting Started](#getting-started) · [Architecture](#architecture) · [Features](#features) · [Tech Stack](#tech-stack) · [Deployment](#deployment)

</div>

---

## Overview

SWEO is a full-stack AI customer support platform that combines a **RAG-powered AI agent** with a **modern admin dashboard**. It follows a "Flywheel" approach — continuously improving through the cycle of **Analyze → Train → Test → Deploy**.

```
   ┌──────────┐
   │ ANALYZE  │ ← AI-powered insights, gap detection
   └────┬─────┘
        │
   ┌────▼─────┐
   │  TRAIN   │ ← Knowledge, Procedures, Policies, Connectors
   └────┬─────┘
        │
   ┌────▼─────┐
   │   TEST   │ ← Simulated conversations before launch
   └────┬─────┘
        │
   ┌────▼─────┐
   │  DEPLOY  │ ← Web Chat, Email, WhatsApp, SMS
   └──────────┘
```

### What's Included

- **Admin Dashboard** — Inbox, conversations, knowledge management, analytics, settings
- **AI Orchestrator** — RAG pipeline with policy engine, confidence scoring, and citations
- **Chat Widget** — Embeddable vanilla JS widget (6.8kb) with SSE streaming
- **Multi-Channel** — Web chat, email, WhatsApp, SMS via channel adapters
- **Knowledge Ingestion** — Upload PDF/DOCX/URL, auto-chunk & embed into Pinecone
- **Procedure Engine** — Multi-step workflow executor with branching & dry-run
- **Analytics Engine** — Resolution rates, content gap detection, AI-generated suggestions
- **Help Center / Docs** — Public-facing documentation portal with search

---

## Features

### 🤖 AI & RAG Pipeline

- OpenAI GPT-4o with Retrieval-Augmented Generation
- Vector search via Pinecone with tenant namespace isolation
- Confidence-based routing (threshold 0.7) with automatic escalation
- Pre/post policy engine (PII filtering, topic blocking, tone control)
- Semantic caching via Upstash Redis for repeated queries
- Streaming responses via SSE

### 📬 Inbox & Conversations

- Unified inbox with real-time message threading
- Conversation status tracking (active, resolved, escalated)
- Agent handover endpoint for human takeover
- Multi-channel support (web, email, WhatsApp, SMS)

### 📚 Knowledge Management

- Drag & drop file upload (PDF, DOCX, HTML)
- URL crawling with Cheerio
- Manual text sources with direct embedding
- Version management with rollback
- Export/import of knowledge bases
- Background processing via Inngest

### 🔧 Procedures (Workflows)

- Multi-step procedure builder with triggers (keyword, intent, manual)
- Step types: message, API call, data lookup, conditional, approval
- State machine execution with branching
- Dry-run mode for simulation testing

### 📊 Analytics & Insights

- Resolution rate tracking over time
- Confidence distribution analysis
- Content gap detection with AI-generated article suggestions
- Cron-based automated gap analysis

### ⚙️ Settings & Administration

- Tenant configuration (plan, channels, LLM model)
- API key rotation
- Team management with RBAC via Appwrite Teams
- Channel settings (email, WhatsApp, SMS configuration)
- Office hours, macros, tags, webhooks
- Billing & subscription management

### 🔒 Security & Infrastructure

- Multi-tenant data isolation (document-level `tenantId` filtering)
- AES-256-GCM encryption for connector credentials
- Per-tenant + per-IP rate limiting via Upstash
- Audit logging (append-only event trail)
- Input sanitization (DOMPurify + sanitize-html)
- Twilio signature verification for webhooks
- Sentry error tracking (client + server)

### 💬 Embeddable Chat Widget

- Standalone vanilla JS widget (~6.8kb)
- SSE streaming support
- Configurable via `data-*` attributes
- Cross-origin embedding (script tag)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5.7 |
| **UI** | shadcn/ui, Tailwind CSS v4, Radix UI, Recharts |
| **Auth** | Appwrite SSR + session cookies |
| **Database** | Appwrite Database (10 multi-tenant collections) |
| **Storage** | Appwrite Storage (file uploads) |
| **Vector DB** | Pinecone (tenant-namespaced) |
| **LLM** | OpenAI GPT-4o + text-embedding-3-large |
| **Cache** | Upstash Redis (rate limiting + semantic cache) |
| **Background Jobs** | Inngest (chunking, embeddings, gap detection) |
| **Channels** | Twilio (WhatsApp, SMS), SMTP (email) |
| **Error Tracking** | Sentry |
| **Deployment** | Vercel |

---

## Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── auth/                     # Sign-in / Sign-up
│   ├── dashboard/                # Admin dashboard
│   │   ├── inbox/                # Unified inbox
│   │   ├── conversations/        # Conversation threads
│   │   ├── knowledge/            # Knowledge source management
│   │   ├── procedures/           # Workflow builder
│   │   ├── connectors/           # Data connector config
│   │   ├── analytics/            # Performance insights
│   │   ├── ai-insights/          # AI-generated insights
│   │   ├── contacts/             # Contact management
│   │   ├── reports/              # Reporting dashboard
│   │   ├── policies/             # Policy editor
│   │   ├── testing/              # Simulation runner
│   │   ├── settings/             # 20+ settings pages
│   │   └── onboarding/           # Onboarding wizard
│   ├── api/
│   │   ├── chat/                 # Chat message + SSE streaming
│   │   ├── chatbot/              # Public chatbot API
│   │   ├── embeddings/           # Background embedding
│   │   ├── simulate/             # Test simulation
│   │   ├── webhooks/             # Email, WhatsApp, SMS
│   │   ├── analytics/            # Analytics API
│   │   ├── cron/                 # Scheduled gap detection
│   │   ├── health/               # Health check
│   │   └── tenant/               # Tenant settings + API keys
│   ├── docs/                     # Public documentation
│   ├── portal/                   # Customer portal (subdomain)
│   └── about/                    # Landing / marketing pages
│
├── features/                     # Feature modules
│   ├── auth/                     # Auth actions (login, signup, teams)
│   ├── inbox/                    # Inbox components
│   ├── conversation/             # Conversation actions + schemas
│   ├── knowledge/                # Upload, versioning, export/import
│   ├── procedures/               # Procedure CRUD + UI
│   ├── connectors/               # Connector CRUD (encrypted)
│   ├── policies/                 # Policy CRUD + audit
│   ├── testing/                  # Scenario CRUD + simulation
│   ├── analytics/                # Content suggestions CRUD
│   ├── settings/                 # Settings hub + pages
│   ├── chatbot/                  # Public chatbot components
│   └── overview/                 # Dashboard analytics
│
├── lib/                          # Core modules
│   ├── ai/                       # Orchestrator, RAG, LLM, policy engine
│   ├── appwrite/                 # Client, server, tenant helpers
│   ├── channels/                 # Email, WhatsApp, SMS adapters
│   ├── analytics/                # Analytics engine + gap detector
│   ├── cache/                    # Redis + semantic cache
│   ├── encryption/               # AES-256-GCM
│   ├── rate-limit/               # Per-tenant rate limiting
│   ├── audit/                    # Audit logger
│   ├── inngest/                  # Background job definitions
│   ├── sanitize/                 # Input sanitization
│   └── security/                 # Security utilities
│
├── components/                   # Shared UI components
│   ├── ui/                       # 50+ shadcn/ui components
│   ├── layout/                   # Sidebar, header, icon rail
│   └── themes/                   # Multi-theme system
│
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript definitions
└── styles/                       # Global CSS + themes
```

---

## Database Schema

**Database:** `support-ai-prod` (Appwrite)

| Collection | Purpose |
|---|---|
| `tenants` | Organizations with plan, config, API key |
| `knowledge_sources` | Uploaded files, URLs, manual text |
| `conversations` | Chat sessions with channel + status |
| `messages` | Individual messages with confidence + citations |
| `policies` | Input/output filtering rules |
| `procedures` | Multi-step automated workflows |
| `data_connectors` | Third-party integrations (encrypted auth) |
| `test_scenarios` | Simulation test cases |
| `content_suggestions` | AI-generated knowledge gap suggestions |
| `audit_events` | Immutable audit trail |

Setup is automated via `scripts/setup-appwrite-db.mjs` (idempotent).

---

## Getting Started

### Prerequisites

- **Node.js** 20+ or **Bun** (recommended)
- **Appwrite** instance (Cloud or self-hosted)
- **Pinecone** account (vector database)
- **OpenAI** API key

### Installation

```bash
# Clone the repository
git clone https://github.com/optitech-admin/chat.git
cd chat

# Install dependencies
bun install

# Copy environment variables
cp env.example.txt .env.local

# Set up Appwrite database (creates all collections + indexes)
bun run db:setup

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local` from `env.example.txt`:

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=<project-id>
NEXT_PUBLIC_APPWRITE_DATABASE=support-ai-prod
NEXT_PUBLIC_APPWRITE_BUCKET=<bucket-id>
APPWRITE_API_KEY=<server-api-key>

# AI / LLM
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=<pinecone-key>
PINECONE_INDEX=<index-name>

# Cache & Rate Limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Background Jobs
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Channels (optional)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=...
TWILIO_SMS_NUMBER=...

# Security
ENCRYPTION_KEY=<64-hex-chars>

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DISABLED=true
```

---

## Scripts

```bash
bun run dev              # Development server
bun run build            # Production build
bun run start            # Start production server
bun run db:setup         # Create Appwrite collections + indexes
bun run build:widget     # Build embeddable chat widget
bun run test             # Run unit tests (Vitest)
bun run test:watch       # Watch mode
bun run test:coverage    # Coverage report
bun run test:e2e         # Run E2E tests (Playwright)
bun run test:e2e:ui      # Playwright UI mode
bun run lint             # ESLint
bun run lint:fix         # Auto-fix lint + format
bun run format           # Prettier format
```

---

## Chat Widget Integration

Embed the AI chat widget on any website:

```html
<script
  src="https://your-domain.com/widget/chat-widget.js"
  data-tenant-id="your-tenant-id"
  data-api-key="your-api-key"
  data-api-url="https://your-domain.com"
  defer>
</script>
```

Build the widget:

```bash
bun run build:widget
```

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat/message` | POST | Send message (API key auth) |
| `/api/chat/stream` | POST | SSE streaming response |
| `/api/chatbot/message` | POST | Public chatbot endpoint |
| `/api/embeddings` | POST | Trigger background embedding |
| `/api/simulate` | POST | Run test simulation |
| `/api/health` | GET | System health check |
| `/api/tenant/settings` | GET/PUT | Tenant configuration |
| `/api/tenant/api-key` | POST | Rotate API key |
| `/api/knowledge/export` | GET | Export knowledge base |
| `/api/knowledge/import` | POST | Import knowledge base |
| `/api/conversations/handover` | POST | Agent handover |
| `/api/webhooks/email` | POST | Email ingestion |
| `/api/webhooks/whatsapp` | POST | Twilio WhatsApp webhook |
| `/api/webhooks/sms` | POST | Twilio SMS webhook |
| `/api/cron/detect-gaps` | GET | Content gap detection |
| `/api/analytics/*` | GET | Analytics queries |

---

## Deployment

### Vercel (Recommended)

1. Connect the repository to Vercel
2. Add all environment variables from `.env.local`
3. Deploy

### Required Services

| Service | Purpose | Free Tier |
|---|---|---|
| [Appwrite Cloud](https://cloud.appwrite.io) | Auth, Database, Storage | Yes |
| [Pinecone](https://www.pinecone.io) | Vector search | Yes (1 index) |
| [OpenAI](https://platform.openai.com) | LLM + Embeddings | Pay-as-you-go |
| [Upstash](https://upstash.com) | Redis (cache + rate limit) | Yes |
| [Inngest](https://www.inngest.com) | Background jobs | Yes |
| [Vercel](https://vercel.com) | Hosting | Yes |
| [Sentry](https://sentry.io) | Error tracking | Yes |
| [Twilio](https://www.twilio.com) | WhatsApp + SMS (optional) | Trial |

---

## Project Status

| Phase | Status | Description |
|---|---|---|
| Auth & Multi-tenancy | ✅ Complete | Appwrite SSR, tenant isolation, teams, RBAC |
| Database Schema | ✅ Complete | 10 collections with indexes + auto-setup script |
| Knowledge Ingestion | ✅ Complete | PDF/DOCX/URL, chunking, versioning, export/import |
| AI Orchestrator | ✅ Complete | RAG pipeline, policy engine, procedures, caching |
| Multi-Channel | ✅ Complete | Web chat, email, WhatsApp, SMS adapters |
| Analytics Engine | ✅ Complete | Metrics, gap detection, content suggestions |
| Chat Widget | ✅ Complete | Embeddable vanilla JS with SSE streaming |
| Dashboard UI | 🔄 In Progress | Inbox, settings, onboarding done; more pages coming |
| E2E Tests | 🔄 In Progress | Playwright specs written |
| Documentation | 🔄 In Progress | API docs, deployment guide |

---

## License

[MIT](LICENSE)








