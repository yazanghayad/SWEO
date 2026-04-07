# SWEO AI – API Reference

> Complete reference for all SWEO AI REST API endpoints.  
> Base URL: `https://your-domain.com` (or `http://localhost:3000` in development)

---

## Table of Contents

- [Authentication](#authentication)
- [Chat API](#chat-api)
- [Conversations API](#conversations-api)
- [Knowledge API](#knowledge-api)
- [Analytics API](#analytics-api)
- [Tenant Management API](#tenant-management-api)
- [Webhooks](#webhooks)
- [Widget](#widget)
- [Internal/Cron Endpoints](#internalcron-endpoints)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)

---

## Authentication

The API uses two authentication mechanisms depending on the endpoint:

### 1. Tenant API Key (Public-facing endpoints)

Used by the chat widget and external integrations.

```
Authorization: Bearer <tenant-api-key>
```

Obtain your API key from **Dashboard → Workspace → General** or via the `POST /api/tenant/api-key` endpoint.

### 2. Session Cookie (Dashboard endpoints)

Used by the dashboard UI. Authenticated via Appwrite session cookies set at sign-in.

### 3. Webhook Signatures

Channel webhooks (email, WhatsApp, SMS, etc.) use HMAC or provider-specific signature verification.

---

## Chat API

### Send Message

```
POST /api/chat/message
```

Send a message and receive a complete AI response.

**Authentication:** Bearer token (tenant API key)

**Request Body:**
```json
{
  "message": "How do I reset my password?",
  "conversationId": "optional-existing-id",
  "userId": "optional-user-identifier",
  "channel": "web"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | string | Yes | The user's message |
| `conversationId` | string | No | Existing conversation ID (omit for new) |
| `userId` | string | No | External user identifier |
| `channel` | string | No | `web` (default), `email` |

**Response (200):**
```json
{
  "content": "To reset your password, go to Settings > Security...",
  "conversationId": "conv_abc123",
  "confidence": 0.92,
  "citations": [
    {
      "title": "Password Reset Guide",
      "sourceId": "src_xyz",
      "score": 0.95
    }
  ]
}
```

---

### Stream Message (SSE)

```
POST /api/chat/stream
```

Stream AI response tokens via Server-Sent Events.

**Authentication:** Bearer token (tenant API key)

**Request Body:** Same as `/api/chat/message`

**Response:** `text/event-stream`

**Event types:**

| Event | Data | Description |
|---|---|---|
| `delta` | `{ type: "delta", content: "..." }` | Incremental content chunk |
| `done` | `{ type: "done", conversationId, confidence, citations }` | Completion event |
| `escalated` | `{ type: "escalated", conversationId, message, confidence }` | Low confidence → human handoff |
| `blocked` | `{ type: "blocked", reason: "..." }` | Blocked by policy |
| `error` | `{ type: "error", message: "..." }` | Processing error |

**Example SSE stream:**
```
data: {"type":"delta","content":"To reset"}
data: {"type":"delta","content":" your password,"}
data: {"type":"delta","content":" go to Settings..."}
data: {"type":"done","conversationId":"conv_abc","confidence":0.92,"citations":[]}
```

---

### Fetch Messages

```
GET /api/chat/messages?conversationId=xxx&after=2026-01-01T00:00:00Z
```

Retrieve messages for a conversation (used by widget for polling).

**Authentication:** Bearer token (tenant API key)

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `conversationId` | string | Yes | Conversation to fetch |
| `after` | ISO 8601 | No | Only messages after this timestamp |

**Response (200):**
```json
{
  "messages": [
    {
      "id": "msg_123",
      "role": "user",
      "content": "Hello",
      "createdAt": "2026-02-28T12:00:00Z",
      "confidence": null
    },
    {
      "id": "msg_124",
      "role": "assistant",
      "content": "Hi! How can I help?",
      "createdAt": "2026-02-28T12:00:01Z",
      "confidence": 0.95
    }
  ]
}
```

---

### SWEO Public Chatbot

```
POST /api/chatbot
```

Public chatbot endpoint (for SWEO's own website). No authentication required, IP-rate-limited.

**Request Body:**
```json
{
  "message": "What features does SWEO offer?",
  "department": "sales",
  "conversationId": "optional-id"
}
```

**Response:** `text/event-stream` (SSE) — same event format as `/api/chat/stream`

---

### AI Copilot (Agent Assistant)

```
POST /api/copilot
```

AI assistant for dashboard agents to draft replies.

**Authentication:** Session cookie

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Customer is asking about refund policy" }
  ],
  "conversationContext": {
    "channel": "email",
    "status": "escalated",
    "messages": []
  }
}
```

**Response:** `text/event-stream` (SSE) — suggested response for the agent

---

## Conversations API

### Submit CSAT Rating

```
POST /api/conversations/csat
```

Submit customer satisfaction feedback.

**Authentication:** None (validated by conversation existence)

**Request Body:**
```json
{
  "conversationId": "conv_abc123",
  "score": 4,
  "feedback": "Very helpful, thanks!"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `conversationId` | string | Yes | Conversation ID |
| `score` | number | Yes | 1–5 star rating |
| `feedback` | string | No | Optional text feedback |

**Response (200):**
```json
{ "success": true }
```

---

### Agent Handover

```
POST /api/conversations/handover
```

Transfer a conversation from AI to a human agent, or mark it resolved.

**Authentication:** Session cookie

**Request Body (initiate):**
```json
{
  "conversationId": "conv_abc123",
  "agentId": "agent_user_id",
  "note": "Customer needs help with billing"
}
```

**Request Body (resolve):**
```json
{
  "conversationId": "conv_abc123",
  "resolution": "Issue resolved via phone call"
}
```

**Response (200):**
```json
{ "success": true, "conversationId": "conv_abc123" }
```

---

## Knowledge API

### Export Knowledge Base

```
GET /api/knowledge/export
```

Download the entire knowledge base as a JSON manifest.

**Authentication:** Session cookie

**Response:** JSON file download containing all sources, metadata, and content.

---

### Import Knowledge Base

```
POST /api/knowledge/import
```

Import a knowledge base from a JSON manifest (same format as export).

**Authentication:** Session cookie

**Request Body:** `application/json` — knowledge manifest

**Response (200):**
```json
{
  "imported": 15,
  "skipped": 2,
  "errors": []
}
```

---

## Analytics API

### Get Analytics

```
GET /api/analytics?tenantId=xxx&days=30
```

Retrieve aggregated performance metrics.

**Authentication:** Session cookie

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `tenantId` | string | Yes | Tenant ID |
| `days` | number | No | Lookback period (1–365, default: 30) |

**Response (200):**
```json
{
  "resolutionRate": 78.5,
  "avgConfidence": 0.87,
  "totalResolved": 1250,
  "escalations": 340,
  "timeseries": [
    { "date": "2026-02-01", "resolved": 45, "escalated": 12 }
  ],
  "topics": [
    { "topic": "Password Reset", "count": 89 }
  ],
  "gaps": [
    { "topic": "Billing disputes", "frequency": 23 }
  ]
}
```

---

## Tenant Management API

### Regenerate API Key

```
POST /api/tenant/api-key
```

Rotate your tenant API key. The old key enters a 24-hour grace period.

**Authentication:** Session cookie

**Response (200):**
```json
{
  "apiKey": "sweo_live_abc123...",
  "previousApiKey": "sweo_live_old...",
  "previousApiKeyExpiresAt": "2026-03-01T12:00:00Z"
}
```

---

### Get Tenant Settings

```
GET /api/tenant/settings
```

**Authentication:** Session cookie

**Response (200):**
```json
{
  "channels": {
    "web": { "enabled": true },
    "email": { "enabled": true, "forwardAddress": "support@example.com" },
    "whatsapp": { "enabled": false }
  },
  "model": "gpt-4o",
  "confidenceThreshold": 0.7,
  "maxHistoryMessages": 10,
  "customSystemPrompt": "",
  "webhookUrl": "",
  "cacheTtlSeconds": 3600,
  "subdomain": "mycompany"
}
```

---

### Update Tenant Settings

```
PATCH /api/tenant/settings
```

**Authentication:** Session cookie

**Request Body:** Partial settings object (any subset of fields):
```json
{
  "confidenceThreshold": 0.8,
  "channels": {
    "whatsapp": { "enabled": true, "phoneNumber": "+1234567890" }
  }
}
```

**Response (200):** Updated settings object

---

### Check Subdomain Availability

```
GET /api/tenant/subdomain-check?subdomain=mycompany
```

**Authentication:** Session cookie

**Response (200):**
```json
{ "available": true }
```

---

## Webhooks

All webhook endpoints validate request signatures from the respective providers.

### Email Webhook

```
POST /api/webhooks/email
```

Inbound email webhook (SendGrid, CloudMailin, or similar).

**Authentication:** HMAC-SHA256 signature (`x-webhook-signature` header) + tenant API key (`x-tenant-api-key` header)

**Body:** JSON or multipart — `{ from, subject, text, inReplyTo?, messageId? }`

---

### WhatsApp Webhook

```
POST /api/webhooks/whatsapp
```

Twilio WhatsApp inbound messages.

**Authentication:** Twilio signature (`x-twilio-signature`) + tenant API key

**Body:** Twilio URL-encoded payload or JSON with `From`, `Body` fields

**Response:** `text/xml` — TwiML `<Response></Response>`

---

### SMS Webhook

```
POST /api/webhooks/sms
```

Twilio SMS inbound messages.

**Authentication:** Twilio signature + tenant API key

**Body:** Same format as WhatsApp

---

### Voice Webhook

```
POST /api/webhooks/voice
```

Twilio Voice inbound calls.

**Authentication:** Twilio signature + tenant API key

---

### Instagram Webhook

```
GET /api/webhooks/instagram  — Verification challenge
POST /api/webhooks/instagram — Inbound messages
```

**GET Auth:** Verify token (`hub.verify_token` query param)  
**POST Auth:** Meta signature (`x-hub-signature-256` header) + tenant API key

---

### Facebook Messenger Webhook

```
GET /api/webhooks/messenger  — Verification challenge
POST /api/webhooks/messenger — Inbound messages
```

**Auth:** Same as Instagram webhook

---

### Slack Webhook

```
POST /api/webhooks/slack
```

Slack Events API.

**Auth:** Slack signature (`x-slack-signature`, `x-slack-request-timestamp`) + tenant API key

Handles `url_verification` challenge and `event_callback` for `message` events.

---

## Widget

### Chat Widget Script

```
GET /api/widget/chat-widget.js
```

Embeddable JavaScript widget. Add to any website:

```html
<script
  src="https://your-domain.com/api/widget/chat-widget.js"
  data-api-key="your-tenant-api-key"
  data-api-url="https://your-domain.com"
  data-title="Support"
  data-subtitle="Ask us anything"
  data-primary-color="#6366f1"
  data-position="br"
  defer
></script>
```

**Attributes:**

| Attribute | Required | Description |
|---|---|---|
| `data-api-key` | Yes | Tenant API key |
| `data-api-url` | Yes | SWEO API base URL |
| `data-title` | No | Widget header title |
| `data-subtitle` | No | Widget header subtitle |
| `data-primary-color` | No | Brand color (hex) |
| `data-position` | No | `br` (bottom-right, default) or `bl` (bottom-left) |

**Response:** `application/javascript` with `Access-Control-Allow-Origin: *`, cached 1 hour.

---

## Internal/Cron Endpoints

### Background Embeddings

```
POST /api/embeddings
```

Triggers text extraction, chunking, and vector embedding for a knowledge source.

**Authentication:** `CRON_SECRET` Bearer token

**Body:**
```json
{
  "sourceId": "src_abc",
  "tenantId": "tenant_123",
  "type": "file",
  "fileId": "file_xyz",
  "fileName": "guide.pdf"
}
```

---

### Content Gap Detection

```
POST /api/cron/detect-gaps
```

Scheduled job to detect knowledge gaps from escalated conversations.

**Authentication:** `CRON_SECRET` Bearer token

---

### Inngest Webhook

```
POST /api/inngest
```

Inngest async job queue handler. Configured via `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`.

---

### Health Check

```
GET /api/health
```

**Authentication:** None

**Response (200/503):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-28T12:00:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "appwrite": "ok",
    "redis": "ok",
    "openai": "ok"
  }
}
```

---

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

**Common HTTP status codes:**

| Code | Description |
|---|---|
| 400 | Bad Request — invalid or missing parameters |
| 401 | Unauthorized — missing or invalid auth |
| 403 | Forbidden — valid auth but insufficient permissions |
| 404 | Not Found — resource doesn't exist |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable — downstream service failure |

---

## Rate Limits

| Endpoint Type | Limit | Window |
|---|---|---|
| Chat API (per tenant) | 60 requests | 1 minute |
| Chat API (per IP) | 20 requests | 1 minute |
| Public chatbot | 10 requests | 1 minute (per IP) |
| Dashboard API | 120 requests | 1 minute |
| Contact form | 5 requests | 1 minute (per IP) |
| Webhooks | 300 requests | 1 minute (per tenant) |

Rate-limited responses return `429` with a `Retry-After` header.
