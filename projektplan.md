# Projektplan: Support AI Agent

> **Projekt:** AI-driven kundsupport-agent med admin-dashboard  
> **Startdatum:** 2026-02-15  
> **Uppdaterad:** 2026-02-28  
> **Baserat på:** Next.js 16 + Shadcn dashboard-template  
> **Status:** MVP nästan klar (Backend 100%, Frontend 100%, E2E ~85%, Docs ~90%)

---

## 1. Sammanfattning

Målet är att bygga en **multi-tenant SaaS-plattform** för AI-driven kundsupport. Plattformen ska bestå av:

1. **Admin Dashboard** – hantering av konversationer, kunskapskällor, policyer och analytics
2. **AI Orchestrator** – RAG-pipeline (Retrieval-Augmented Generation) med policy-kontroller
3. **Chat Widget** – embeddbar widget för slutkunder (web + e-post)
4. **Knowledge Ingestion** – uppladdning och indexering av PDF/DOCX/URL-innehåll

Projektet utgår från det befintliga **next-shadcn-dashboard-starter**-templatet och ersätter Clerk-autentisering med **Appwrite**.

---

## 2. Teknisk stack

| Komponent | Lösning | Noteringar |
|---|---|---|
| Frontend / Admin UI | Next.js 16 + Shadcn/ui + Tailwind v4 | Befintligt template |
| Backend API | Next.js App Router + Server Actions | API routes i `/app/api/` |
| Autentisering | Appwrite (SSR + session cookies) | Ersätter Clerk |
| Databas | Appwrite Database Collections | Multi-tenant med `tenantId`-filter |
| Vektorsökning | Pinecone (alternativ: Qdrant / Weaviate) | Extern tjänst – Appwrite saknar native vector search |
| Fillagring | Appwrite Storage | PDF/DOCX-uploads vid knowledge ingestion |
| Realtid | Appwrite Realtime | WebSocket för live-chat och dashboard-notiser |
| LLM | OpenAI GPT-4 / Azure OpenAI | Via `openai` SDK |
| Embeddings | OpenAI `text-embedding-3-large` | För vektorsökning |

---

## 3. Projektfaser och milstolpar

### Fas 0 – Förberedelse (vecka 1) ✅

- [x] Sätta upp Appwrite-instans (Cloud eller self-hosted)
- [x] Konfigurera environment-variabler (`env.example.txt` uppdaterad med alla nycklar)
- [x] Ta bort Clerk-beroenden med cleanup-script (`node __CLEANUP__/scripts/cleanup.js clerk`)
- [x] Verifiera att template bygger utan Clerk

**Milstolpe:** ✅ Rent projekt utan Clerk, redo för Appwrite-integration.

### Fas 1 – Autentisering & Multi-tenancy (vecka 2–3) ⚠️ ~95%

- [x] Installera `appwrite` och `node-appwrite` SDK:er
- [x] Implementera Appwrite client (`src/lib/appwrite/client.ts`)
- [x] Implementera server-side client med admin/session (`src/lib/appwrite/server.ts`)
- [x] Bygga login/signup server actions (`src/features/auth/actions/`)
- [x] ~~Skapa middleware för route-skydd~~ → Ersatt av `src/proxy.ts` med auth + subdomain-routing
- [x] Skapa `tenants`-collection i Appwrite med tenant-modell
- [x] Implementera `useTenant()` hook för klient-sidan
- [x] Implementera tenant-scoped dokument-helpers (`getTenantDocuments`, `createTenantDocument`)
- [x] _Bonus:_ Team management med RBAC + audit logging (`src/features/auth/actions/team-management.ts`)
- [x] _Bonus:_ Appwrite Teams-integration (`src/lib/appwrite/teams.ts`)

**Milstolpe:** ✅ Auth och tenant-isolering fungerar med proxy-baserat route-skydd.

### Fas 2 – Databasschema (vecka 3–4) ✅

Skapa collections i Appwrite Console (databas: `support-ai-prod`):

- [x] `tenants` – namn, plan, config, apiKey, userId
- [x] `knowledge_sources` – tenantId, type, url, fileId, status, version, metadata
- [x] `conversations` – tenantId, channel, status, userId, metadata, resolvedAt
- [x] `messages` – conversationId, role, content, confidence, citations, metadata
- [x] `policies` – tenantId, name, type, mode, config, enabled, priority
- [x] `audit_events` – tenantId, eventType, userId, payload, createdAt
- [x] `procedures` – tenantId, name, trigger, steps, enabled _(Fin.ai-tillägg)_
- [x] `data_connectors` – tenantId, provider, auth, config _(Fin.ai-tillägg)_
- [x] `test_scenarios` – tenantId, name, messages, expectedOutcome _(Fin.ai-tillägg)_
- [x] `content_suggestions` – tenantId, topic, frequency, suggestedContent _(Fin.ai-tillägg)_
- [x] Sätta upp index för alla collections
- [x] Konfigurera permissions (document-level tenant isolation)
- [x] Automatiserat setup-script (`scripts/setup-appwrite-db.mjs` – 280 rader)
- [x] Komplett TypeScript-typer (`src/types/appwrite.ts` – 214 rader)

**Milstolpe:** ✅ Komplett databasschema med multi-tenant-isolering + setup-automatisering.

### Fas 3 – Knowledge Ingestion (vecka 4–5) ✅

- [x] Bygga `source-uploader.tsx` komponent (drag & drop, PDF/DOCX/URL)
- [x] Implementera filuppladdning till Appwrite Storage
- [x] Skapa API-route för bakgrunds-embedding (`/api/embeddings/route.ts`)
- [x] Integrera text-extraktion (pdf-parse, mammoth, cheerio)
- [x] Implementera chunking-logik (recursive text splitter med overlap)
- [x] Koppla ihop med Pinecone – upsert med tenant namespace
- [x] Bygga `source-list.tsx` med status-visning (processing/ready/failed)
- [x] Stödja URL-ingestion (scraping + chunking)
- [x] _Bonus:_ Manuell textkälla med direkt embedding (`manual-source.ts`)
- [x] _Bonus:_ Versionshantering med rollback (`version-management.ts`)
- [x] _Bonus:_ Export/import av kunskapsbaser (`export-import.ts`)
- [x] _Bonus:_ Inngest bakgrundsjobb för chunking (`src/lib/inngest/functions.ts`)

**Milstolpe:** ✅ Komplett knowledge ingestion med versioning och export/import.

### Fas 4 – AI Orchestrator & RAG-pipeline (vecka 5–7) ✅

- [x] Implementera `vectorSearch()` – embedding av query + Pinecone-sök
- [x] Bygga LLM-client (`src/lib/ai/llm.ts`) med streaming-stöd
- [x] Implementera orchestrator-flöde:
  1. Pre-policy check
  2. RAG retrieval
  3. Konfidens-kontroll (threshold 0.7)
  4. LLM-generering med kontext
  5. Post-policy check
  6. Spara meddelande och citations
- [x] Skapa policy-engine (`validatePolicy`) med stöd för:
  - Topic filter
  - PII filter
  - Tone/längd-kontroller
- [x] Bygga `sendMessageAction()` server action
- [x] _Bonus:_ Procedure executor med state machine + dry-run (`procedure-executor.ts` – 655 rader)
- [x] _Bonus:_ Simulation engine för testning (`simulation-engine.ts`)
- [x] _Bonus:_ Semantisk cache med Redis hash (`semantic-cache.ts`)
- [x] _Bonus:_ Streaming SSE endpoint (`/api/chat/stream/route.ts`)

**Milstolpe:** ✅ End-to-end AI-svar med RAG, policy-kontroller, procedures och caching.

### Fas 5 – Dashboard-vyer (vecka 7–9) ✅ 100%

Alla dashboard-sidor implementerade med fullständiga UI-komponenter:

- [x] **Inbox** – 5-panel layout (sidebar, lista, tråd, detalj, AI copilot) _(153+ rader)_
- [x] **Knowledge** – sources-hantering med uploader, versionshistorik, content editor _(1516 rader)_
- [x] **Content** – content management _(1058 rader)_
- [x] **Policies** – policy-editor med CRUD, on/off toggle, typ/mode-val _(282 rader)_
- [x] **Analytics** – metrics-kort, breakdown-grafer, tab-navigation _(319 rader)_
- [x] **AI Insights** – content gap detection, AI suggestions med approve/dismiss _(1055 rader)_
- [x] **Procedures** – procedure list + visuell stegbyggare med branch/trigger _(286+719 rader)_
- [x] **Connectors** – connector-hantering med provider-val, auth-konfiguration _(303 rader)_
- [x] **Testing** – simulations-runner med scenario CRUD och resultatvy _(309 rader)_
- [x] **Settings** – hub + sidebar + 28 individuella settings-sidor inkl. 8 channel settings _(33 filer)_
- [x] **Reports** – 10 rapporttyper + dynamisk `[slug]` route _(558 rader)_
- [x] **Contacts** – Intercom-stil kontakthantering med tabell, filter, detail panel _(1600 rader)_
- [x] **Billing** – fakturering med adress, betalmetoder, fakturahistorik _(873 rader)_
- [x] **Guidance** – AI tone/length/style-konfiguration med kategorier _(950 rader)_
- [x] **AI Automation** – kanal + settings med tabs _(679 rader)_
- [x] **Workspace** – 5 sub-sidor (general, brands, multilingual, security, teammates)
- [x] **Onboarding** – wizard med steg-navigation
- [x] Uppdaterad navigation i `nav-config.ts` med 17 nav items + Flywheel-sektioner

**Milstolpe:** ✅ Komplett admin-dashboard med alla vyer.

### Fas 6 – Chat Widget & Realtime (vecka 9–11) ✅ 100%

- [x] Bygga API-endpoint för chat (`/api/chat/message/route.ts` – API-key auth)
- [x] Bygga streaming SSE endpoint (`/api/chat/stream/route.ts`)
- [x] Bygga embeddbar chat-widget (standalone vanilla JS, 6.8kb, SSE streaming)
- [x] Implementera Appwrite Realtime-prenumeration för nya meddelanden (`useRealtime` hook)
- [x] Implementera webhook för e-post-ingestion (`/api/webhooks/email/route.ts`)
- [x] _Bonus:_ WhatsApp-kanal via Twilio (`/api/webhooks/whatsapp/route.ts` + adapter)
- [x] _Bonus:_ SMS-kanal via Twilio (`/api/webhooks/sms/route.ts` + adapter)
- [x] _Bonus:_ Channel adapter-arkitektur (`base-adapter.ts`, `email-adapter.ts`, etc.)
- [x] _Bonus:_ Twilio signaturverifiering (`twilio-verify.ts`)
- [x] _Bonus:_ Agent handover endpoint (`/api/conversations/handover/route.ts`)
- [x] Widget: loading states, typing indicator, felhantering, CSAT survey
- [x] Widget: cross-origin embedding via script-tag med `data-*` attribut

**Milstolpe:** ✅ Komplett widget + alla kanaler + Realtime.

### Fas 7 – Kvalitet & Lansering (vecka 11–13) ⚠️ ~85%

- [x] End-to-end tester (Playwright) – 10 spec-filer, 100+ testfall
- [ ] Komponent-tester (Vitest + React Testing Library)
- [ ] Säkerhetsgranskning (OWASP top 10, tenant-isolering)
- [x] Performance-optimering (semantisk cache, rate limiting, Redis)
- [x] Sentry-konfiguration för error tracking (server + klient + global error boundary)
- [x] Dokumentation – API reference (`docs/api-reference.md`), deployment guide (`docs/deployment-guide.md`), 40 artiklar i docs-systemet
- [ ] Deploy till Vercel + Appwrite Cloud
- [x] Proxy middleware med auth-skydd och subdomain-routing (`src/proxy.ts`)

**Milstolpe:** ⚠️ MVP nästan klar. **Kvar: komponent-tester, säkerhetsgranskning, deploy.**

---

## 3b. Fin.ai Flywheel – Utökade funktioner (implementerade i backend)

Utöver den ursprungliga planen har Fin.ai:s "Flywheel"-koncept implementerats fullständigt:

### Train ✅ Backend + UI klar
- [x] Procedures CRUD (`src/features/procedures/actions/procedure-crud.ts`)
- [x] Procedure executor med state machine + dry-run (`src/lib/ai/procedure-executor.ts`)
- [x] Data Connectors CRUD med krypterade credentials (`src/features/connectors/actions/connector-crud.ts`)
- [x] Krypteringsmodul AES-256-GCM (`src/lib/encryption/index.ts`)
- [x] UI: Procedure-editor med visuell stegbyggare (286+719 rader)
- [x] UI: Connector-konfigurering med provider-val och test (303 rader)
- [x] UI: Guidance page med tone/length/style (950 rader)
- [x] UI: Policies page med CRUD och toggles (282 rader)
- [x] UI: Content page med editor och versioner (1058 rader)

### Test ✅ Backend + UI klar
- [x] Test Scenarios CRUD (`src/features/testing/actions/scenario-crud.ts`)
- [x] Simulation engine (`src/lib/ai/simulation-engine.ts`)
- [x] Simulate API-endpoint (`src/app/api/simulate/route.ts`)
- [x] UI: Simulation runner med scenario-hantering och resultatvy (309 rader)

### Deploy ✅ Backend + UI + Widget klar
- [x] Web Chat API (message + streaming)
- [x] Email-kanal (adapter + webhook)
- [x] WhatsApp-kanal (adapter + webhook + Twilio-verifiering)
- [x] SMS-kanal (adapter + webhook)
- [x] Embeddbar widget-komponent (standalone vanilla JS, 6.8kb)
- [x] Appwrite Realtime (useRealtime hook, live meddelanden)
- [x] Voice, Instagram, Messenger, Slack webhooks
- [x] AI Automation settings page (679 rader)
- [x] 8 channel settings pages

### Analyze ✅ Backend + UI klar
- [x] Analytics engine med metrics-aggregering (`src/lib/analytics/analytics-engine.ts`)
- [x] Content gap detector med AI-förslag (`src/lib/analytics/gap-detector.ts`)
- [x] Content Suggestions CRUD (`src/features/analytics/actions/suggestion-crud.ts`)
- [x] Cron-jobb för gap detection (`src/app/api/cron/detect-gaps/route.ts`)
- [x] UI: Analytics dashboard med metrics, breakdown, topics (319 rader)
- [x] UI: AI Insights med content suggestions, approve/dismiss (1055 rader)

### Infrastruktur ✅
- [x] Rate limiting per tenant + IP (`src/lib/rate-limit/`)
- [x] Redis-cache via Upstash (`src/lib/cache/`)
- [x] Semantisk cache (`src/lib/cache/semantic-cache.ts`)
- [x] Audit logging (`src/lib/audit/logger.ts`)
- [x] HTML-sanering (`src/lib/sanitize/index.ts`)
- [x] Inngest bakgrundsjobb (`src/lib/inngest/`)
- [x] Health-check endpoint (`src/app/api/health/route.ts`)
- [x] API-nyckelrotation (`src/app/api/tenant/api-key/route.ts`)
- [x] Tenant settings API (`src/app/api/tenant/settings/route.ts`)

---

## 4. Projektstruktur (aktuell)

```
src/
├── app/
│   ├── auth/
│   │   ├── sign-in/                     # Login-sida
│   │   └── sign-up/                     # Registrering
│   ├── dashboard/
│   │   ├── layout.tsx                   # Sidebar + header
│   │   ├── overview/                    # ✅ Dashboard overview (parallel routes)
│   │   ├── inbox/                       # ✅ 5-panel inbox
│   │   ├── knowledge/                   # ✅ Knowledge sources + versioning
│   │   ├── content/                     # ✅ Content management
│   │   ├── conversations/               # ✅ Redirect → inbox
│   │   ├── policies/                    # ✅ Policy CRUD
│   │   ├── analytics/                   # ✅ Metrics dashboard
│   │   ├── ai-insights/                 # ✅ AI suggestions + gaps
│   │   ├── procedures/                  # ✅ List + builder
│   │   ├── connectors/                  # ✅ Connector management
│   │   ├── testing/                     # ✅ Simulation runner
│   │   ├── guidance/                    # ✅ Tone/style config
│   │   ├── reports/                     # ✅ 10 rapporttyper
│   │   ├── contacts/                    # ✅ Kontakthantering
│   │   ├── billing/                     # ✅ Fakturering
│   │   ├── ai/                          # ✅ AI Automation
│   │   ├── settings/                    # ✅ 30 settings-sidor
│   │   ├── workspace/                   # ✅ 5 workspace-sidor
│   │   └── onboarding/                  # ✅ Wizard
│   └── api/
│       ├── chat/
│       │   ├── message/route.ts         # ✅ Chat endpoint (API-key auth)
│       │   └── stream/route.ts          # ✅ SSE streaming
│       ├── embeddings/route.ts          # ✅ Background embedding
│       ├── simulate/route.ts            # ✅ Test simulation
│       ├── conversations/
│       │   └── handover/route.ts        # ✅ Agent handover
│       ├── tenant/
│       │   ├── api-key/route.ts         # ✅ API-nyckelrotation
│       │   └── settings/route.ts        # ✅ Tenant config
│       ├── knowledge/
│       │   ├── export/route.ts          # ✅ Knowledge export
│       │   └── import/route.ts          # ✅ Knowledge import
│       ├── analytics/                   # Analytics API
│       ├── cron/
│       │   └── detect-gaps/route.ts     # ✅ Gap detection cron
│       ├── health/route.ts              # ✅ System health check
│       ├── inngest/route.ts             # ✅ Inngest webhook
│       └── webhooks/
│           ├── email/route.ts           # ✅ Email ingestion
│           ├── whatsapp/route.ts        # ✅ Twilio WhatsApp
│           └── sms/route.ts             # ✅ Twilio SMS
│
├── features/
│   ├── auth/actions/                    # ✅ Login, logout, signup, tenant, teams
│   ├── conversation/
│   │   ├── actions/send-message.ts      # ✅ Send message action
│   │   ├── schemas/                     # ✅ Zod schemas
│   │   └── components/                  # ✅ conversation-list, message-thread, csat
│   ├── inbox/components/                # ✅ 5-panel inbox (sidebar, list, thread, detail, client)
│   ├── knowledge/
│   │   ├── actions/                     # ✅ upload, ingest-url, manual, versions, export
│   │   ├── components/                  # ✅ source-uploader, source-list, page-client, content
│   │   └── schemas/                     # ✅ Zod schemas
│   ├── policies/
│   │   ├── actions/policy-crud.ts       # ✅ CRUD + audit
│   │   └── components/                  # ✅ policies-page-client
│   ├── procedures/
│   │   ├── actions/procedure-crud.ts    # ✅ CRUD
│   │   └── components/                  # ✅ list + builder
│   ├── connectors/
│   │   ├── actions/connector-crud.ts    # ✅ CRUD + encryption
│   │   └── components/                  # ✅ connectors-page-client
│   ├── testing/
│   │   ├── actions/scenario-crud.ts     # ✅ CRUD + simulation
│   │   └── components/                  # ✅ testing-page-client
│   ├── analytics/
│   │   ├── actions/suggestion-crud.ts   # ✅ Content suggestions
│   │   └── components/                  # ✅ analytics + ai-insights pages
│   ├── reports/components/              # ✅ 13 filer, 10 rapporttyper
│   ├── contacts/components/             # ✅ contacts-page-client (1600 rader)
│   ├── billing/components/              # ✅ billing-client (873 rader)
│   ├── guidance/components/             # ✅ guidance-page (950 rader)
│   ├── ai-automation/components/        # ✅ ai-automation-page-client
│   ├── workspace/components/            # ✅ 6 workspace-sidor
│   ├── settings/components/             # ✅ 33 filer, hub + 28 settings
│   ├── docs/components/                 # ✅ header, hero, footer, sidebar
│   ├── chatbot/                         # ✅ Chat widget komponenter
│   └── overview/                        # ✅ Charts, skeletons, submenu
│
├── lib/
│   ├── appwrite/
│   │   ├── client.ts                    # ✅ Browser client
│   │   ├── server.ts                    # ✅ Server client (admin + session)
│   │   ├── collections.ts              # ✅ Collection ID:er
│   │   ├── constants.ts                # ✅ Env-baserade konstanter
│   │   ├── teams.ts                    # ✅ Team management
│   │   └── tenant-helpers.ts           # ✅ Tenant-scoped CRUD
│   ├── ai/
│   │   ├── orchestrator.ts              # ✅ RAG + policy pipeline (722 rader)
│   │   ├── retrieval.ts                 # ✅ Pinecone vector search
│   │   ├── llm.ts                       # ✅ OpenAI client + streaming
│   │   ├── policy-engine.ts             # ✅ Pre/post policy validation
│   │   ├── procedure-executor.ts        # ✅ Multi-step procedures (655 rader)
│   │   ├── simulation-engine.ts         # ✅ Test simulations
│   │   ├── extraction.ts               # ✅ PDF/DOCX/URL extraction
│   │   └── chunking.ts                 # ✅ Recursive text splitter
│   ├── channels/
│   │   ├── base-adapter.ts             # ✅ Abstract channel adapter
│   │   ├── email-adapter.ts            # ✅ Email channel
│   │   ├── whatsapp-adapter.ts         # ✅ WhatsApp channel
│   │   ├── sms-adapter.ts             # ✅ SMS channel
│   │   └── twilio-verify.ts           # ✅ Twilio signature verification
│   ├── analytics/
│   │   ├── analytics-engine.ts         # ✅ Metrics aggregering
│   │   └── gap-detector.ts            # ✅ Content gap AI
│   ├── audit/logger.ts                 # ✅ Append-only audit log
│   ├── cache/
│   │   ├── redis.ts                    # ✅ Upstash Redis
│   │   └── semantic-cache.ts           # ✅ Query hash cache
│   ├── encryption/index.ts             # ✅ AES-256-GCM
│   ├── inngest/
│   │   ├── client.ts                   # ✅ Inngest client
│   │   └── functions.ts               # ✅ Background jobs
│   ├── rate-limit/
│   │   ├── index.ts                    # ✅ Per-tenant rate limiting
│   │   └── middleware.ts              # ✅ Rate limit wrapper
│   └── sanitize/index.ts              # ✅ DOMPurify sanering
│
├── hooks/
│   └── use-tenant.ts                    # ✅ Client-side tenant context
│
├── types/
│   └── appwrite.ts                     # ✅ Alla entitetstyper (214 rader)
│
├── proxy.ts                            # ✅ Auth-skydd + subdomain-routing
└── middleware.ts                        # ❌ BORTTAGEN – ersatt av proxy.ts
```

---

## 5. Appwrite – Databasschema ✅

**Databas:** `support-ai-prod`  
**Setup-script:** `scripts/setup-appwrite-db.mjs` (idempotent, skapar alla collections + index)

### 5.1 Collections

| Collection | Nyckelattribut | Index |
|---|---|---|
| `tenants` | name, plan, config (JSON), apiKey, userId | `apiKey_unique` |
| `knowledge_sources` | tenantId, type, url, fileId, status, version, metadata | `tenantId_idx` |
| `conversations` | tenantId, channel, status, userId, metadata, resolvedAt | `tenantId_status_idx`, `tenantId_createdAt_idx` |
| `messages` | conversationId, role, content, confidence, citations, metadata | `conversationId_idx` |
| `policies` | tenantId, name, type, mode, config, enabled, priority | `tenantId_enabled_idx` |
| `audit_events` | tenantId, eventType, userId, payload, createdAt | `tenantId_eventType_createdAt_idx` |
| `procedures` | tenantId, name, description, trigger, steps, enabled, version | `tenantId_idx` |
| `data_connectors` | tenantId, provider, name, auth (krypterad), config, enabled | `tenantId_idx` |
| `test_scenarios` | tenantId, name, messages, expectedOutcome | `tenantId_idx` |
| `content_suggestions` | tenantId, topic, frequency, exampleQueries, suggestedContent, status | `tenantId_status_idx` |

### 5.2 Permissions (multi-tenant isolation)

```
Read/Write: Document-level – where tenantId = user.tenantId
Admin:      Server-side via API key
```

---

## 6. Environment-variabler

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

# Cache / Rate Limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Background Jobs
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Channels (valfritt)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=...
TWILIO_SMS_NUMBER=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Security
ENCRYPTION_KEY=<64-hex-chars>

# Sentry (valfritt)
NEXT_PUBLIC_SENTRY_DSN=https://...@ingest.sentry.io/...
NEXT_PUBLIC_SENTRY_DISABLED=true

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## 7. Risker och mitigeringar

| Risk | Sannolikhet | Konsekvens | Mitigation |
|---|---|---|---|
| Appwrite saknar vector search | Hög | Medel | Extern tjänst (Pinecone) med tenant namespace |
| LLM-hallucinationer | Medel | Hög | Konfidens-threshold + citations + policy-engine |
| Multi-tenant data-läcka | Låg | Kritisk | Tenant-scoped queries + server-side validering + audit log |
| Performance vid stora kunskapsbaser | Medel | Medel | Chunk-optimering, caching, lazy loading |
| Appwrite rate limits | Låg | Medel | Caching-lager, batch-operationer |

---

## 8. Definitioner

| Term | Beskrivning |
|---|---|
| **Tenant** | En kundorganisation med egen data-isolering |
| **RAG** | Retrieval-Augmented Generation – hämta relevant kontext innan LLM-generering |
| **Knowledge Source** | Uppladdad fil, URL eller manuell text som indexeras för sökning |
| **Policy** | Regel som filtrerar/validerar input eller output (t.ex. PII-filter, tone) |
| **Orchestrator** | Backend-logik som koordinerar RAG-pipeline, policyer och LLM |
| **Confidence** | Poäng (0–1) som indikerar hur relevant den hämtade kontexten är |

---

## Appendix A – Nyckelkod (implementationsstatus)

| Modul | Fil | Status | Rader |
|---|---|---|---|
| Appwrite Client | `src/lib/appwrite/client.ts` | ✅ | 21 |
| Appwrite Server | `src/lib/appwrite/server.ts` | ✅ | 48 |
| Auth Actions | `src/features/auth/actions/login.ts` | ✅ | – |
| Team Management | `src/features/auth/actions/team-management.ts` | ✅ | 268 |
| Middleware | `src/middleware.ts` | ❌ Borttagen | – |
| Tenant Helpers | `src/lib/appwrite/tenant-helpers.ts` | ✅ | 129 |
| Tenant Hook | `src/hooks/use-tenant.ts` | ✅ | – |
| Vector Search | `src/lib/ai/retrieval.ts` | ✅ | 157 |
| LLM Client | `src/lib/ai/llm.ts` | ✅ | 233 |
| Orchestrator | `src/lib/ai/orchestrator.ts` | ✅ | 722 |
| Policy Engine | `src/lib/ai/policy-engine.ts` | ✅ | 340 |
| Procedure Executor | `src/lib/ai/procedure-executor.ts` | ✅ | 655 |
| Simulation Engine | `src/lib/ai/simulation-engine.ts` | ✅ | 252 |
| Text Extraction | `src/lib/ai/extraction.ts` | ✅ | 85 |
| Chunking | `src/lib/ai/chunking.ts` | ✅ | 81 |
| Email Adapter | `src/lib/channels/email-adapter.ts` | ✅ | 251 |
| WhatsApp Adapter | `src/lib/channels/whatsapp-adapter.ts` | ✅ | 211 |
| SMS Adapter | `src/lib/channels/sms-adapter.ts` | ✅ | 189 |
| Analytics Engine | `src/lib/analytics/analytics-engine.ts` | ✅ | 318 |
| Gap Detector | `src/lib/analytics/gap-detector.ts` | ✅ | 282 |
| Rate Limiter | `src/lib/rate-limit/index.ts` | ✅ | 188 |
| Semantic Cache | `src/lib/cache/semantic-cache.ts` | ✅ | 144 |
| Encryption | `src/lib/encryption/index.ts` | ✅ | 147 |
| Audit Logger | `src/lib/audit/logger.ts` | ✅ | 102 |
| Sanitizer | `src/lib/sanitize/index.ts` | ✅ | 107 |
| Knowledge Upload | `src/features/knowledge/actions/upload-file.ts` | ✅ | 151 |
| Knowledge Version | `src/features/knowledge/actions/version-management.ts` | ✅ | 312 |
| Knowledge Export | `src/features/knowledge/actions/export-import.ts` | ✅ | 337 |
| Source Uploader UI | `src/features/knowledge/components/source-uploader.tsx` | ✅ | 214 |
| Source List UI | `src/features/knowledge/components/source-list.tsx` | ✅ | 272 |
| Procedures CRUD | `src/features/procedures/actions/procedure-crud.ts` | ✅ | 268 |
| Connectors CRUD | `src/features/connectors/actions/connector-crud.ts` | ✅ | 377 |
| Policies CRUD | `src/features/policies/actions/policy-crud.ts` | ✅ | 264 |
| Testing CRUD | `src/features/testing/actions/scenario-crud.ts` | ✅ | 302 |
| Suggestions CRUD | `src/features/analytics/actions/suggestion-crud.ts` | ✅ | 167 |
| DB Setup Script | `scripts/setup-appwrite-db.mjs` | ✅ | 280 |
| Inngest Functions | `src/lib/inngest/functions.ts` | ✅ | 223 |
| Health Check | `src/app/api/health/route.ts` | ✅ | 189 |

---

## Appendix B – Nästa steg (prioritetsordning)

Baserat på nuvarande status (2026-02-28) – nästan allt klart:

### ✅ Avklarade (Prio 1–4)
1. ~~**Återskapa route-skydd**~~ ✅ – `src/proxy.ts` med auth + subdomain-routing
2. ~~**Uppdatera `nav-config.ts`**~~ ✅ – 17 nav items med Flywheel-sektioner
3. ~~**Dashboard UI**~~ ✅ – alla 20+ sidor implementerade
4. ~~**Fin.ai UI**~~ ✅ – procedures, connectors, testing, guidance, ai-insights
5. ~~**Widget**~~ ✅ – standalone vanilla JS (6.8kb)
6. ~~**Appwrite Realtime**~~ ✅ – `useRealtime` hook
7. ~~**E2E tester**~~ ✅ – 10 Playwright spec-filer, 100+ testfall
8. ~~**Dokumentation**~~ ✅ – API reference, deployment guide, 40 docs-artiklar

### 🔲 Kvar för produktionsrelease
1. **Komponent-tester** – Vitest + React Testing Library för kritiska UI-komponenter
2. **Säkerhetsgranskning** – OWASP top 10, tenant-isolering audit
3. **Deploy till Vercel + Appwrite Cloud** – produktionsmiljö
4. **Performance-testning** – lasttest, lighthouse audit