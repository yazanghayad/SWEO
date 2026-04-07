# SWEO

SWEO is a customer support and AI-powered communication platform built for businesses that need centralized conversation management, knowledge bases, and intelligent automation.

## Overview

The platform provides a unified dashboard for managing customer interactions across multiple channels, including live chat, email, and third-party integrations. It features an AI engine capable of handling customer inquiries, analyzing conversation topics, and generating insights from support data.

## Tech Stack

- **Framework:** Next.js 16 with React 19
- **Styling:** Tailwind CSS 4, Radix UI, shadcn/ui components
- **Database:** MongoDB, Appwrite
- **AI:** OpenAI API integration
- **Payments:** Stripe
- **Communication:** Twilio
- **Rate Limiting:** Upstash Redis
- **Error Tracking:** Sentry
- **Deployment:** Vercel

## Features

- Multi-channel inbox (live chat, email, messaging)
- AI-powered customer support agent
- Knowledge base management
- Contact and case management
- Conversation analytics and AI insights
- Outbound messaging campaigns
- Billing and subscription management via Stripe
- Embeddable chat widget (separate SDK package)
- Role-based access control with workspace management
- Kanban board for task tracking
- Document generation (PDF, DOCX)
- QR code generation for quick access

## Project Structure

```
src/
  app/
    (landing)/     Landing pages
    dashboard/     Main application
      ai/          AI configuration
      analytics/   Usage and performance analytics
      inbox/       Unified message inbox
      contacts/    Customer management
      knowledge/   Knowledge base editor
      outbound/    Campaign management
      billing/     Subscription and payments
      settings/    Workspace configuration
    api/           API routes
    auth/          Authentication flows
    docs/          Documentation pages
    portal/        Customer-facing portal
  components/      Shared UI components
  config/          Application configuration
  lib/             Utilities and helpers
  types/           TypeScript type definitions
packages/
  widget-sdk/      Embeddable chat widget SDK
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- Appwrite project
- API keys for OpenAI, Stripe, Twilio (as needed)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Testing

```bash
npm test              # Unit tests (Vitest)
npm run test:e2e      # End-to-end tests (Playwright)
```

## Environment Variables

Copy `env.example.txt` to `.env.local` and fill in the required values for database connections, API keys, and service credentials.

## License

All rights reserved.
