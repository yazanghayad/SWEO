# SWEO AI – Deployment Guide

> Step-by-step guide to deploying SWEO AI to production.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [1. Appwrite Setup](#1-appwrite-setup)
- [2. External Services](#2-external-services)
- [3. Environment Variables](#3-environment-variables)
- [4. Deploy to Vercel](#4-deploy-to-vercel)
- [5. Database Initialization](#5-database-initialization)
- [6. Chat Widget Installation](#6-chat-widget-installation)
- [7. Channel Configuration](#7-channel-configuration)
- [8. Knowledge Base Ingestion](#8-knowledge-base-ingestion)
- [9. Cron Jobs](#9-cron-jobs)
- [10. Post-Deploy Verification](#10-post-deploy-verification)
- [11. Custom Domain & Subdomain Routing](#11-custom-domain--subdomain-routing)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js 20+** or **Bun 1.x** (Bun preferred)
- **Git** with access to the repository
- Accounts for:
  - [Vercel](https://vercel.com) (hosting)
  - [Appwrite Cloud](https://cloud.appwrite.io) (database, auth, storage)
  - [OpenAI](https://platform.openai.com) or [NVIDIA NIM](https://build.nvidia.com) (LLM + embeddings)
  - [Upstash](https://upstash.com) (Redis — caching & rate limiting)
- Optional: [Twilio](https://twilio.com) (SMS/WhatsApp/Voice), [Inngest](https://inngest.com) (background jobs), [Mailgun](https://mailgun.com) (email), [Sentry](https://sentry.io) (error tracking)

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Vercel     │────▶│  Appwrite Cloud  │     │   OpenAI     │
│  (Next.js)   │     │  (DB / Auth /    │     │  (LLM +      │
│              │     │   Storage)       │     │  Embeddings) │
└──────┬───────┘     └──────────────────┘     └──────────────┘
       │
       ├─────▶ Upstash Redis (Cache + Rate Limit)
       ├─────▶ Inngest (Background Jobs)
       ├─────▶ Twilio (SMS / WhatsApp / Voice)
       ├─────▶ Mailgun (Email sending)
       └─────▶ Sentry (Error tracking)
```

---

## 1. Appwrite Setup

### 1.1 Create Project

1. Sign in to [Appwrite Cloud](https://cloud.appwrite.io)
2. Create a new project
3. Note your **Project ID** and **API Endpoint** (e.g., `https://fra.cloud.appwrite.io/v1`)

### 1.2 Create API Key

1. Go to **Project Settings → API Keys**
2. Create a key with these scopes:
   - `databases.read`, `databases.write`
   - `collections.read`, `collections.write`
   - `documents.read`, `documents.write`
   - `files.read`, `files.write`
   - `buckets.read`, `buckets.write`
   - `users.read`, `users.write`
   - `teams.read`, `teams.write`
3. Save the key as `APPWRITE_API_KEY`

### 1.3 Create Storage Bucket

1. Go to **Storage → Create Bucket**
2. Name: `knowledge-files`
3. Max file size: 50 MB
4. Allowed extensions: `pdf, docx, doc, txt, html, csv, json, md`
5. Note the **Bucket ID** as `NEXT_PUBLIC_APPWRITE_BUCKET`

### 1.4 Configure Authentication

1. Go to **Auth → Settings**
2. Enable **Email/Password** authentication
3. (Optional) Enable **Google OAuth** under Auth → OAuth2 Providers
4. Set redirect URLs in OAuth settings:
   - Success: `https://your-domain.com/api/auth/google/callback`
   - Failure: `https://your-domain.com/auth/sign-in`

---

## 2. External Services

### 2.1 OpenAI (Required)

1. Create an API key at [platform.openai.com](https://platform.openai.com/api-keys)
2. Ensure access to `gpt-4o` and `text-embedding-3-large` models
3. Set billing limits as appropriate

**Alternative: NVIDIA NIM**

If using NVIDIA instead of OpenAI:
1. Get an API key from [build.nvidia.com](https://build.nvidia.com)
2. Set `NVIDIA_API_KEY`, `NVIDIA_API_URL`, and optionally `NVIDIA_MODEL`

### 2.2 Upstash Redis (Required)

1. Create a database at [upstash.com](https://console.upstash.com)
2. Choose a region close to your Vercel deployment
3. Copy `REST URL` and `REST Token`

### 2.3 Inngest (Recommended)

1. Sign up at [inngest.com](https://www.inngest.com)
2. Create an app
3. Copy `Event Key` and `Signing Key`
4. Set your Inngest app URL to `https://your-domain.com/api/inngest`

### 2.4 Twilio (Optional — for SMS/WhatsApp/Voice)

1. Create account at [twilio.com](https://www.twilio.com)
2. Get a phone number with SMS + Voice capability
3. For WhatsApp: apply for WhatsApp Business API or use the Twilio Sandbox
4. Configure webhook URLs in Twilio console:
   - WhatsApp: `https://your-domain.com/api/webhooks/whatsapp?key=TENANT_API_KEY`
   - SMS: `https://your-domain.com/api/webhooks/sms?key=TENANT_API_KEY`
   - Voice: `https://your-domain.com/api/webhooks/voice?key=TENANT_API_KEY`

### 2.5 Sentry (Optional — error tracking)

1. Create project at [sentry.io](https://sentry.io) (select Next.js)
2. Note DSN, Org slug, Project name, and Auth Token

---

## 3. Environment Variables

Copy `env.example.txt` to `.env.local` for development, or set these in Vercel Dashboard for production:

### Required

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE=support-ai-prod
NEXT_PUBLIC_APPWRITE_BUCKET=your-bucket-id
APPWRITE_API_KEY=your-server-api-key

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
ROOT_DOMAIN=your-domain.com
NEXT_PUBLIC_ROOT_DOMAIN=your-domain.com

# AI
OPENAI_API_KEY=sk-...

# Cache & Rate Limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Security
ENCRYPTION_KEY=<64-hex-chars>
CRON_SECRET=<64-hex-chars>
```

Generate secure keys:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Optional

```env
# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_WHATSAPP_NUMBER=+1...

# Email
EMAIL_PROVIDER=mailgun
EMAIL_FROM_ADDRESS=support@your-domain.com
EMAIL_API_KEY=...

# Sentry
NEXT_PUBLIC_SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_ORG=...
NEXT_PUBLIC_SENTRY_PROJECT=...
SENTRY_AUTH_TOKEN=...
```

---

## 4. Deploy to Vercel

### 4.1 Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the repository from GitHub
3. Framework: **Next.js** (auto-detected)
4. Build command: `bun run build` (or `npm run build`)
5. Output directory: `.next` (default)

### 4.2 Add Environment Variables

In **Vercel → Project → Settings → Environment Variables**, add all variables from section 3.

> **Tip:** Use Vercel's environment variable groups to separate Production, Preview, and Development values.

### 4.3 Deploy

```bash
# Or trigger via git push to main
git push origin main
```

Vercel will automatically build and deploy. First deployment takes ~2 minutes.

### 4.4 Verify Deployment

```bash
curl https://your-domain.com/api/health
```

Expected:
```json
{
  "status": "healthy",
  "services": { "appwrite": "ok", "redis": "ok", "openai": "ok" }
}
```

---

## 5. Database Initialization

Run the database setup script to create all collections and indexes:

```bash
# Locally (ensure .env.local is configured)
node scripts/setup-appwrite-db.mjs
```

This creates 10 collections:
- `tenants`, `knowledge_sources`, `conversations`, `messages`
- `policies`, `audit_events`, `procedures`, `data_connectors`
- `test_scenarios`, `content_suggestions`

The script is **idempotent** — safe to run multiple times.

---

## 6. Chat Widget Installation

Add the widget to any website:

```html
<script
  src="https://your-domain.com/api/widget/chat-widget.js"
  data-api-key="your-tenant-api-key"
  data-api-url="https://your-domain.com"
  data-title="Support"
  data-subtitle="How can we help?"
  data-primary-color="#6366f1"
  defer
></script>
```

The widget is a standalone 6.8 KB vanilla JS file with:
- SSE streaming responses
- Conversation persistence (localStorage)
- CSAT survey on resolution
- Mobile-responsive design
- Configurable colors and position

See [API Reference → Widget](api-reference.md#widget) for all configuration attributes.

---

## 7. Channel Configuration

Configure channels in **Dashboard → Settings → Channels** or via the API.

### Email

1. Set up a forwarding rule from your support inbox to:
   ```
   https://your-domain.com/api/webhooks/email?key=YOUR_TENANT_API_KEY
   ```
2. Configure outbound email in Dashboard → Settings → Channels → Email

### WhatsApp

1. In Twilio Console, set your WhatsApp sandbox/number webhook to:
   ```
   https://your-domain.com/api/webhooks/whatsapp?key=YOUR_TENANT_API_KEY
   ```
2. Enable WhatsApp in Dashboard → Settings → Channels → WhatsApp

### SMS

1. Set your Twilio phone number webhook to:
   ```
   https://your-domain.com/api/webhooks/sms?key=YOUR_TENANT_API_KEY
   ```
2. Enable SMS in Dashboard → Settings → Channels → SMS

### Instagram / Facebook Messenger

1. Create a Meta App at [developers.facebook.com](https://developers.facebook.com)
2. Add Messenger product and configure webhook:
   - Callback URL: `https://your-domain.com/api/webhooks/instagram`
   - Verify token: value of `META_VERIFY_TOKEN`
3. Subscribe to `messages` events

### Slack

1. Create a Slack App at [api.slack.com/apps](https://api.slack.com/apps)
2. Enable Event Subscriptions:
   - Request URL: `https://your-domain.com/api/webhooks/slack?key=YOUR_TENANT_API_KEY`
3. Subscribe to `message.channels`, `message.im` events
4. Install to workspace and copy Bot Token + Signing Secret

---

## 8. Knowledge Base Ingestion

### Via Dashboard

1. Go to **Dashboard → Knowledge**
2. Click **Add Source**
3. Upload files (PDF, DOCX, HTML, TXT) or enter a URL to crawl

### Via Script (Bulk)

```bash
node scripts/ingest-chatbot-knowledge.mjs
```

### Via API (Programmatic)

Use the knowledge import endpoint:
```bash
curl -X POST https://your-domain.com/api/knowledge/import \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d @knowledge-export.json
```

---

## 9. Cron Jobs

### Content Gap Detection

Schedule a daily cron to detect knowledge gaps:

**Vercel Cron (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/cron/detect-gaps",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Or use an external cron service:
```bash
curl -X POST https://your-domain.com/api/cron/detect-gaps \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Inngest Background Jobs

If using Inngest, ensure the event handler is registered:
```
POST https://your-domain.com/api/inngest
```

Inngest automatically handles retries, scheduling, and observability.

---

## 10. Post-Deploy Verification

Run through this checklist after deployment:

### Health & APIs
- [ ] `GET /api/health` returns `healthy`
- [ ] `GET /api/widget/chat-widget.js` returns JavaScript
- [ ] Auth flow works (sign-up → sign-in → dashboard)

### Dashboard
- [ ] All pages load without errors
- [ ] Navigation shows all menu items
- [ ] Settings page is accessible

### Chat Widget
- [ ] Widget loads on external page
- [ ] Messages are sent and streamed back
- [ ] CSAT survey appears after resolution
- [ ] Escalation triggers when confidence is low

### Knowledge Base
- [ ] Files upload successfully
- [ ] URL crawling works
- [ ] Search returns relevant results

### Channels (if configured)
- [ ] Email webhook receives messages
- [ ] WhatsApp messages are processed
- [ ] SMS inbound/outbound works

---

## 11. Custom Domain & Subdomain Routing

### Custom Domain on Vercel

1. Go to **Vercel → Project → Settings → Domains**
2. Add your domain (e.g., `app.your-domain.com`)
3. Follow DNS instructions (CNAME or A record)

### Subdomain Routing

SWEO supports tenant subdomains (e.g., `acme.sweo.se`).

1. Add a wildcard domain in Vercel: `*.your-domain.com`
2. Set `ROOT_DOMAIN` in environment variables
3. The proxy middleware automatically routes subdomains to the correct tenant

DNS:
```
*.your-domain.com   CNAME   cname.vercel-dns.com
```

---

## Troubleshooting

### Build Fails

**Tailwind CSS errors:**
- Ensure using Tailwind v4 syntax (`@import 'tailwindcss'`)
- Verify `postcss.config.js` uses `@tailwindcss/postcss`

**TypeScript errors:**
```bash
bun run lint:strict
```

### Services Unavailable

Check `/api/health` to identify which service is down:
```json
{
  "status": "degraded",
  "services": {
    "appwrite": "ok",
    "redis": "error",
    "openai": "ok"
  }
}
```

### Widget Not Loading

1. Check browser console for CORS errors
2. Verify `data-api-key` is correct
3. Verify `data-api-url` matches your deployment URL
4. Check that `/api/widget/chat-widget.js` returns 200

### Chat Not Responding

1. Verify `OPENAI_API_KEY` is set and valid
2. Check that knowledge base has been ingested (sources exist)
3. Review Vercel function logs for errors
4. Check rate limits via `/api/health`

### Auth Issues

1. Verify Appwrite credentials are correct
2. Check `NEXT_PUBLIC_APPWRITE_ENDPOINT` is accessible from the browser
3. For OAuth, ensure redirect URLs match exactly

### Database Errors

Re-run the setup script:
```bash
node scripts/setup-appwrite-db.mjs
```

Check Appwrite Console → Database for collection status.

---

## Updating

To deploy updates:

```bash
git pull origin main
# Vercel auto-deploys on push to main

# If database schema changed:
node scripts/setup-appwrite-db.mjs
```

For zero-downtime deployments, Vercel handles rolling updates automatically.
