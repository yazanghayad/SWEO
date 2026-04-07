#!/usr/bin/env node
// ── Generate rich docs content via NVIDIA API (Mistral Large 3 675B) ──
// Usage: node scripts/generate-docs.mjs
//
// Reads the docs skeleton, sends each article to the AI to get
// comprehensive Swedish documentation, then writes docs-data.json.
// The static docs-config.ts imports that JSON and is never overwritten.

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Load .env.local
config({ path: resolve(ROOT, '.env.local') });

const API_URL = process.env.NVIDIA_API_URL;
const API_KEY  = process.env.NVIDIA_API_KEY;
const MODEL    = process.env.NVIDIA_MODEL;

if (!API_URL || !API_KEY || !MODEL) {
  console.error('❌ Missing NVIDIA_API_URL, NVIDIA_API_KEY or NVIDIA_MODEL in .env.local');
  process.exit(1);
}

// ── Docs skeleton ─────────────────────────────────────────────────────

const categories = [
  {
    slug: 'getting-started',
    title: 'Kom igång',
    icon: 'arrowRight',
    description: 'Skapa konto, konfigurera workspace och anslut din första kanal.',
    articles: [
      {
        slug: 'introduction',
        title: 'Introduktion till SWEO AI',
        description: 'En överblick av plattformen och hur du snabbt kommer igång.',
        sections: [
          { id: 'overview',       title: 'Översikt' },
          { id: 'flywheel',       title: 'Flywheel-modellen' },
          { id: 'core-concepts',  title: 'Grundläggande koncept' },
          { id: 'quick-start',    title: 'Snabbstart' },
          { id: 'architecture',   title: 'Teknisk arkitektur' },
          { id: 'next-steps',     title: 'Nästa steg' }
        ]
      },
      {
        slug: 'account-setup',
        title: 'Skapa ditt konto & workspace',
        description: 'Steg-för-steg guide för att registrera dig, bjuda in team och konfigurera workspace.',
        sections: [
          { id: 'create-account',    title: 'Skapa konto' },
          { id: 'create-workspace',  title: 'Skapa ett workspace' },
          { id: 'invite-team',       title: 'Bjud in teammedlemmar' },
          { id: 'roles-permissions', title: 'Roller & behörigheter' },
          { id: 'basic-settings',    title: 'Grundinställningar' },
          { id: 'first-channel',     title: 'Anslut din första kanal' }
        ]
      },
      {
        slug: 'first-ai-agent',
        title: 'Din första AI-agent på 10 minuter',
        description: 'Hands-on guide för att snabbt få igång en fungerande AI-agent.',
        sections: [
          { id: 'prerequisites',    title: 'Förutsättningar' },
          { id: 'add-knowledge',    title: 'Steg 1: Lägg till kunskap' },
          { id: 'set-policies',     title: 'Steg 2: Ställ in policies' },
          { id: 'test-agent',       title: 'Steg 3: Testa agenten' },
          { id: 'deploy-widget',    title: 'Steg 4: Publicera widget' },
          { id: 'monitor-results',  title: 'Steg 5: Övervaka resultat' }
        ]
      },
      {
        slug: 'migration-guide',
        title: 'Migrera från annan plattform',
        description: 'Flytta din befintliga kundsupport till SWEO AI från Zendesk, SWEO eller Freshdesk.',
        sections: [
          { id: 'migration-overview',  title: 'Migreringsöversikt' },
          { id: 'from-zendesk',        title: 'Migrera från Zendesk' },
          { id: 'from-sweo',       title: 'Migrera från SWEO' },
          { id: 'from-freshdesk',      title: 'Migrera från Freshdesk' },
          { id: 'data-mapping',        title: 'Datamappning & import' },
          { id: 'go-live-checklist',   title: 'Go-live checklista' }
        ]
      }
    ]
  },
  {
    slug: 'knowledge',
    title: 'Knowledge Base',
    icon: 'knowledge',
    description: 'Kunskapskällor, policies och regler för din AI-agent.',
    articles: [
      {
        slug: 'knowledge-sources',
        title: 'Hantera kunskapskällor',
        description: 'Ladda upp dokument, crawla URL:er och hantera AI-agentens kunskapsinnehåll.',
        sections: [
          { id: 'source-types',        title: 'Typer av kunskapskällor' },
          { id: 'url-crawling',        title: 'URL-crawling i detalj' },
          { id: 'file-upload',         title: 'Filuppladdning' },
          { id: 'manual-content',      title: 'Manuellt innehåll' },
          { id: 'versioning',          title: 'Versionshantering' },
          { id: 'chunking-embeddings', title: 'Chunking & Embeddings' },
          { id: 'sync-status',         title: 'Synkstatus' },
          { id: 'best-practices',      title: 'Tips & best practices' }
        ]
      },
      {
        slug: 'policies',
        title: 'Policies & Regler',
        description: 'Ställ in regler som styr hur AI-agenten beter sig och svarar.',
        sections: [
          { id: 'what-is-policy',  title: 'Vad är en policy?' },
          { id: 'create-policy',   title: 'Skapa en policy' },
          { id: 'policy-examples', title: 'Exempelpolicies' },
          { id: 'priority',        title: 'Policyprioritet & konflikter' },
          { id: 'test-policies',   title: 'Testa policies' },
          { id: 'gdpr-compliance', title: 'GDPR & compliance-policies' }
        ]
      },
      {
        slug: 'content-optimization',
        title: 'Optimera kunskapsinnehåll',
        description: 'Förbättra AI-agentens svarsträffsäkerhet genom att strukturera och optimera kunskapskällor.',
        sections: [
          { id: 'content-quality',     title: 'Innehållskvalitet' },
          { id: 'writing-for-ai',      title: 'Skriv för AI-sökning' },
          { id: 'faq-structure',       title: 'FAQ-strukturering' },
          { id: 'tagging-categories',  title: 'Taggning & kategorier' },
          { id: 'multilingual',        title: 'Flerspråkigt innehåll' },
          { id: 'audit-review',        title: 'Granska & underhåll' }
        ]
      },
      {
        slug: 'snippets-templates',
        title: 'Snippets & Mallar',
        description: 'Skapa återanvändbara svarsmallar och snippets för agenter och AI.',
        sections: [
          { id: 'what-are-snippets',   title: 'Vad är snippets?' },
          { id: 'create-snippet',      title: 'Skapa en snippet' },
          { id: 'dynamic-variables',   title: 'Dynamiska variabler' },
          { id: 'snippet-categories',  title: 'Organisera snippets' },
          { id: 'ai-usage',            title: 'Hur AI använder snippets' },
          { id: 'import-export',       title: 'Importera & exportera' }
        ]
      }
    ]
  },
  {
    slug: 'ai-automation',
    title: 'AI & Automation',
    icon: 'sparkles',
    description: 'Konfigurera AI-agenten, bygg procedurer och testa innan lansering.',
    articles: [
      {
        slug: 'procedures',
        title: 'Procedures – Automatiska workflows',
        description: 'Bygg multi-step procedurer som AI:n utför automatiskt.',
        sections: [
          { id: 'what-is-procedure',    title: 'Vad är en Procedure?' },
          { id: 'step-types',           title: 'Steg-typer' },
          { id: 'triggers',             title: 'Triggers & villkor' },
          { id: 'variables',            title: 'Variabler & kontext' },
          { id: 'example-return',       title: 'Exempel: Returhantering' },
          { id: 'example-order-status', title: 'Exempel: Orderstatus-check' },
          { id: 'create-procedure',     title: 'Skapa en procedure steg-för-steg' },
          { id: 'debugging',            title: 'Felsökning & loggning' }
        ]
      },
      {
        slug: 'ai-settings',
        title: 'AI-agentens inställningar',
        description: 'Konfigurera tonalitet, confidence-trösklar, eskalering och modellval.',
        sections: [
          { id: 'tone',            title: 'Tonalitet & personlighet' },
          { id: 'confidence',      title: 'Confidence-tröskel' },
          { id: 'escalation',      title: 'Eskaleringsregler' },
          { id: 'language',        title: 'Språkhantering' },
          { id: 'model-selection', title: 'Modellval & prestanda' },
          { id: 'response-format', title: 'Svarsformattering' },
          { id: 'fallback',        title: 'Fallback-beteende' }
        ]
      },
      {
        slug: 'testing',
        title: 'Testa din AI-agent',
        description: 'Kör simulerade konversationer för att verifiera AI:n innan lansering.',
        sections: [
          { id: 'simulation-runner', title: 'Simulation Runner' },
          { id: 'create-scenario',   title: 'Skapa testscenarier' },
          { id: 'batch-testing',     title: 'Batch-testning' },
          { id: 'result-analysis',   title: 'Resultatanalys' },
          { id: 'regression-testing',title: 'Regressionstester' },
          { id: 'testing-tips',      title: 'Best practices' }
        ]
      },
      {
        slug: 'ai-copilot',
        title: 'AI Copilot för agenter',
        description: 'Hur mänskliga agenter kan använda AI Copilot för att svara snabbare och bättre.',
        sections: [
          { id: 'copilot-overview',    title: 'Vad är AI Copilot?' },
          { id: 'suggested-replies',   title: 'Föreslagna svar' },
          { id: 'summarize',           title: 'Sammanfatta konversationer' },
          { id: 'tone-rewrite',        title: 'Omformulera tonalitet' },
          { id: 'knowledge-lookup',    title: 'Kunskapssökning i realtid' },
          { id: 'copilot-settings',    title: 'Inställningar & anpassning' }
        ]
      },
      {
        slug: 'handoff-escalation',
        title: 'Handoff & Eskalering',
        description: 'Konfigurera när och hur AI:n lämnar över till mänskliga agenter.',
        sections: [
          { id: 'escalation-triggers', title: 'Eskaleringstriggers' },
          { id: 'routing-rules',       title: 'Routingregler' },
          { id: 'team-assignment',     title: 'Teamtilldelning' },
          { id: 'sla-management',      title: 'SLA-hantering' },
          { id: 'warm-handoff',        title: 'Varm handoff med kontext' },
          { id: 'after-hours',         title: 'Utanför arbetstid' }
        ]
      },
      {
        slug: 'prompt-engineering',
        title: 'Prompt Engineering för support',
        description: 'Avancerade tekniker för att finslipa AI-agentens beteende med prompts.',
        sections: [
          { id: 'system-prompt',       title: 'System-prompt design' },
          { id: 'few-shot-examples',   title: 'Few-shot-exempel' },
          { id: 'guardrails',          title: 'Guardrails & begränsningar' },
          { id: 'persona-design',      title: 'Persona-design' },
          { id: 'edge-cases',          title: 'Hantera edge cases' },
          { id: 'prompt-versioning',   title: 'Versionera prompts' }
        ]
      }
    ]
  },
  {
    slug: 'channels',
    title: 'Kanaler & Deploy',
    icon: 'settings',
    description: 'Chat-widget, e-post, WhatsApp, SMS och telefoni.',
    articles: [
      {
        slug: 'web-messenger',
        title: 'Web Messenger (Chat Widget)',
        description: 'Installera och anpassa din chattwidget på din webbplats.',
        sections: [
          { id: 'installation',       title: 'Installation' },
          { id: 'customize',          title: 'Anpassa utseende' },
          { id: 'behavior',           title: 'Beteendeinställningar' },
          { id: 'proactive-messages', title: 'Proaktiva meddelanden' },
          { id: 'features',           title: 'Funktioner' },
          { id: 'troubleshooting',    title: 'Felsökning' }
        ]
      },
      {
        slug: 'email-channel',
        title: 'E-post',
        description: 'Koppla din support-email och låt AI:n svara automatiskt.',
        sections: [
          { id: 'connect-email',    title: 'Koppla din support-e-post' },
          { id: 'how-it-works',     title: 'Hur det fungerar' },
          { id: 'auto-reply',       title: 'Auto-reply inställningar' },
          { id: 'email-templates',  title: 'E-postmallar' },
          { id: 'dkim-spf',         title: 'DKIM, SPF & leveransbarhet' },
          { id: 'troubleshooting',  title: 'Felsökning' }
        ]
      },
      {
        slug: 'messaging-channels',
        title: 'WhatsApp, SMS & Telefoni',
        description: 'Aktivera WhatsApp Business, SMS och röstkanal via Twilio.',
        sections: [
          { id: 'whatsapp',           title: 'WhatsApp Business' },
          { id: 'whatsapp-templates', title: 'WhatsApp-meddelanden & mallar' },
          { id: 'sms',                title: 'SMS-kanal' },
          { id: 'voice',              title: 'Telefoni (Voice)' },
          { id: 'shared-settings',    title: 'Gemensamma inställningar' },
          { id: 'channel-routing',    title: 'Kanaldirigering' }
        ]
      },
      {
        slug: 'social-media',
        title: 'Sociala medier',
        description: 'Koppla Instagram DM, Facebook Messenger och andra sociala kanaler.',
        sections: [
          { id: 'instagram-dm',        title: 'Instagram DM' },
          { id: 'facebook-messenger',  title: 'Facebook Messenger' },
          { id: 'slack-communities',   title: 'Slack Communities' },
          { id: 'meta-setup',          title: 'Meta Business Suite-setup' },
          { id: 'social-routing',      title: 'Kanaldirigering för sociala medier' },
          { id: 'social-best-practices', title: 'Best practices' }
        ]
      },
      {
        slug: 'widget-customization',
        title: 'Avancerad widget-anpassning',
        description: 'CSS-themes, JavaScript API och avancerade konfigurationer för chattwidgeten.',
        sections: [
          { id: 'css-theming',      title: 'CSS-theming' },
          { id: 'js-api',           title: 'JavaScript API' },
          { id: 'events',           title: 'Events & callbacks' },
          { id: 'user-identity',    title: 'Identifiera användare' },
          { id: 'custom-data',      title: 'Skicka custom metadata' },
          { id: 'spa-integration',  title: 'SPA-integration (React, Vue, Angular)' }
        ]
      }
    ]
  },
  {
    slug: 'integrations',
    title: 'Integrationer & CRM',
    icon: 'connectors',
    description: 'Shopify, Stripe, Salesforce och andra datakällor.',
    articles: [
      {
        slug: 'data-connectors',
        title: 'Koppla Data Connectors',
        description: 'Anslut tredjeparter så AI:n kan hämta och agera på kunddata.',
        sections: [
          { id: 'available-connectors', title: 'Tillgängliga connectors' },
          { id: 'connect-steps',        title: 'Koppla en connector' },
          { id: 'shopify-deep',         title: 'Shopify-integration i detalj' },
          { id: 'stripe-deep',          title: 'Stripe-integration i detalj' },
          { id: 'custom-api',           title: 'Custom API Connector' },
          { id: 'webhooks',             title: 'Webhooks' },
          { id: 'security',             title: 'Säkerhet & kryptografi' }
        ]
      },
      {
        slug: 'crm-integration',
        title: 'CRM-integration',
        description: 'Synka kontakter, ärenden och historik med ditt CRM-system.',
        sections: [
          { id: 'why-crm',           title: 'Varför CRM-integration?' },
          { id: 'connect-salesforce', title: 'Koppla Salesforce' },
          { id: 'connect-hubspot',   title: 'Koppla HubSpot' },
          { id: 'field-mapping',     title: 'Fältmappning' },
          { id: 'sync-settings',     title: 'Synkinställningar' },
          { id: 'crm-in-inbox',      title: 'CRM-data i Inbox' }
        ]
      },
      {
        slug: 'webhooks-api',
        title: 'Webhooks & REST API',
        description: 'Bygg egna integrationer med SWEO AI:s webhook- och API-system.',
        sections: [
          { id: 'api-overview',       title: 'API-översikt' },
          { id: 'authentication',     title: 'Autentisering & API-nycklar' },
          { id: 'webhook-events',     title: 'Webhook-events' },
          { id: 'webhook-setup',      title: 'Konfigurera webhooks' },
          { id: 'api-endpoints',      title: 'Viktiga API-endpoints' },
          { id: 'rate-limits',        title: 'Rate limits & best practices' },
          { id: 'api-examples',       title: 'Kodexempel' }
        ]
      },
      {
        slug: 'ecommerce',
        title: 'E-handelsintegrationer',
        description: 'Optimera AI-support för e-handelsflöden: orderstatus, returer, betalningar.',
        sections: [
          { id: 'ecommerce-overview',  title: 'Översikt e-handel' },
          { id: 'order-tracking',      title: 'Orderstatus & spårning' },
          { id: 'returns-refunds',     title: 'Returer & återbetalningar' },
          { id: 'product-recommendations', title: 'Produktrekommendationer' },
          { id: 'cart-abandonment',    title: 'Övergivna varukorgar' },
          { id: 'payment-issues',      title: 'Betalningsproblem' }
        ]
      }
    ]
  },
  {
    slug: 'inbox',
    title: 'Inbox & Konversationer',
    icon: 'conversations',
    description: 'Hantera ärenden, tilldela agenter och följ upp konversationer.',
    articles: [
      {
        slug: 'inbox-workflow',
        title: 'Arbeta i Inbox',
        description: 'Hantera ärenden, tilldela agenter och använd AI Copilot.',
        sections: [
          { id: 'inbox-layout',  title: 'Inbox-vy & layout' },
          { id: 'status-flow',   title: 'Ärendestatus & flöde' },
          { id: 'filters-views', title: 'Filter & vyer' },
          { id: 'assign',        title: 'Tilldela ärenden' },
          { id: 'copilot',       title: 'AI Copilot för agenter' },
          { id: 'macros',        title: 'Macros & snabbsvar' },
          { id: 'shortcuts',     title: 'Tangentbordsgenvägar' },
          { id: 'bulk-actions',  title: 'Masshantering' }
        ]
      },
      {
        slug: 'contacts-management',
        title: 'Kontakthantering',
        description: 'Hantera kundprofiler, taggar, segment och konversationshistorik.',
        sections: [
          { id: 'contact-profiles',   title: 'Kundprofiler' },
          { id: 'tags-segments',      title: 'Taggar & segment' },
          { id: 'conversation-history', title: 'Konversationshistorik' },
          { id: 'custom-attributes',  title: 'Egna attribut' },
          { id: 'import-contacts',    title: 'Importera kontakter' },
          { id: 'gdpr-data',          title: 'GDPR & datahantering' }
        ]
      },
      {
        slug: 'csat-feedback',
        title: 'CSAT & Kundfeedback',
        description: 'Samla in och analysera kundnöjdhet efter konversationer.',
        sections: [
          { id: 'csat-overview',      title: 'Vad är CSAT?' },
          { id: 'enable-surveys',     title: 'Aktivera nöjdhetsenkäter' },
          { id: 'survey-customization', title: 'Anpassa enkäten' },
          { id: 'csat-analytics',     title: 'Analysera CSAT-data' },
          { id: 'negative-feedback',  title: 'Hantera negativ feedback' },
          { id: 'nps-integration',    title: 'NPS-integration' }
        ]
      }
    ]
  },
  {
    slug: 'analytics',
    title: 'Analytics & Rapporter',
    icon: 'analytics',
    description: 'Resolution rate, responstid, content gaps och rapporter.',
    articles: [
      {
        slug: 'analytics-dashboard',
        title: 'Dashboard & KPI:er',
        description: 'Förstå AI-agentens prestanda med realtidsdata och grafer.',
        sections: [
          { id: 'kpis',         title: 'KPI:er & nyckeltal' },
          { id: 'charts',       title: 'Grafer & visualiseringar' },
          { id: 'content-gaps', title: 'Content Gaps & AI-förslag' },
          { id: 'filter-data',  title: 'Filtrera & segmentera data' },
          { id: 'benchmarks',   title: 'Benchmarks & mål' },
          { id: 'alerts',       title: 'Notifieringar & tröskelvärden' }
        ]
      },
      {
        slug: 'reports',
        title: 'Rapporter & Export',
        description: 'Generera rapporter och exportera data för vidare analys.',
        sections: [
          { id: 'report-types',     title: 'Tillgängliga rapporter' },
          { id: 'custom-reports',   title: 'Bygg egna rapporter' },
          { id: 'schedule-reports', title: 'Schemalägg rapporter' },
          { id: 'export-formats',   title: 'Exportformat' },
          { id: 'api-access',       title: 'API-åtkomst till data' }
        ]
      },
      {
        slug: 'ai-insights',
        title: 'AI-insikter & Flywheel',
        description: 'Automatiska förbättringsförslag och content gap-analys.',
        sections: [
          { id: 'flywheel-loop',      title: 'Flywheel-loopen i praktiken' },
          { id: 'content-gaps',       title: 'Content Gap-detektion' },
          { id: 'auto-suggestions',   title: 'AI-genererade artikelförslag' },
          { id: 'approve-workflow',   title: 'Granska & godkänn förslag' },
          { id: 'trend-analysis',     title: 'Trendanalys' },
          { id: 'continuous-improvement', title: 'Kontinuerlig förbättring' }
        ]
      }
    ]
  },
  {
    slug: 'team-management',
    title: 'Team & Administration',
    icon: 'users',
    description: 'Hantera team, roller, arbetstider och organisationsinställningar.',
    articles: [
      {
        slug: 'team-setup',
        title: 'Team & Roller',
        description: 'Konfigurera team, roller och behörigheter för din organisation.',
        sections: [
          { id: 'team-structure',    title: 'Teamstruktur' },
          { id: 'roles-overview',    title: 'Roller & behörigheter' },
          { id: 'custom-roles',      title: 'Skapa egna roller' },
          { id: 'agent-skills',      title: 'Agentskills & specialiseringar' },
          { id: 'availability',      title: 'Tillgänglighet & arbetstider' },
          { id: 'performance',       title: 'Agentprestation' }
        ]
      },
      {
        slug: 'workspace-settings',
        title: 'Workspace-inställningar',
        description: 'Globala inställningar för branding, språk, notifieringar och säkerhet.',
        sections: [
          { id: 'branding',           title: 'Branding & logotyp' },
          { id: 'language-settings',  title: 'Språkinställningar' },
          { id: 'notifications',      title: 'Notifieringar' },
          { id: 'security-settings',  title: 'Säkerhetsinställningar' },
          { id: 'billing-plans',      title: 'Fakturering & planer' },
          { id: 'audit-log',          title: 'Aktivitetslogg' }
        ]
      },
      {
        slug: 'automation-rules',
        title: 'Automatiseringsregler',
        description: 'Skapa regler som automatiserar tilldelning, taggning och notifieringar.',
        sections: [
          { id: 'rules-overview',     title: 'Vad är automatiseringsregler?' },
          { id: 'trigger-conditions', title: 'Trigger & villkor' },
          { id: 'actions',            title: 'Tillgängliga åtgärder' },
          { id: 'rule-examples',      title: 'Exempelregler' },
          { id: 'rule-priority',      title: 'Regelprioritet' },
          { id: 'troubleshooting',    title: 'Felsökning' }
        ]
      }
    ]
  },
  {
    slug: 'security-compliance',
    title: 'Säkerhet & Compliance',
    icon: 'shield',
    description: 'GDPR, dataskydd, SSO, kryptering och säkerhetskonfiguration.',
    articles: [
      {
        slug: 'data-security',
        title: 'Datasäkerhet & Kryptering',
        description: 'Hur SWEO AI skyddar kunddata med kryptering, isolering och säkerhetsåtgärder.',
        sections: [
          { id: 'encryption',         title: 'Kryptering i vila & transit' },
          { id: 'tenant-isolation',   title: 'Multi-tenant isolering' },
          { id: 'data-residency',     title: 'Datalagring & residency' },
          { id: 'access-control',     title: 'Åtkomstkontroll' },
          { id: 'sso-saml',           title: 'SSO & SAML' },
          { id: 'ip-whitelisting',    title: 'IP-whitelisting' }
        ]
      },
      {
        slug: 'gdpr-compliance',
        title: 'GDPR & Compliance',
        description: 'Efterlev GDPR med rätt konfiguration, dataraderingsrutiner och DPA.',
        sections: [
          { id: 'gdpr-overview',       title: 'GDPR-översikt' },
          { id: 'data-processing',     title: 'Databehandlingsavtal (DPA)' },
          { id: 'data-deletion',       title: 'Radera kunddata' },
          { id: 'consent-management',  title: 'Samtyckehantering' },
          { id: 'data-export',         title: 'Exportera kunddata' },
          { id: 'compliance-checklist', title: 'Compliance-checklista' }
        ]
      },
      {
        slug: 'ai-safety',
        title: 'AI-säkerhet & Guardrails',
        description: 'Skydda mot hallucinations, prompt injection och olämpliga svar.',
        sections: [
          { id: 'hallucination-prevention', title: 'Förhindra hallucinations' },
          { id: 'prompt-injection',    title: 'Skydd mot prompt injection' },
          { id: 'content-filtering',   title: 'Innehållsfiltrering' },
          { id: 'pii-detection',       title: 'PII-detektion' },
          { id: 'response-validation', title: 'Svarsvalidering' },
          { id: 'incident-response',   title: 'Incidenthantering' }
        ]
      }
    ]
  },
  {
    slug: 'advanced',
    title: 'Avancerat',
    icon: 'code',
    description: 'API-referens, custom integrationer, bulk-operationer och felsökning.',
    articles: [
      {
        slug: 'bulk-operations',
        title: 'Bulk-operationer',
        description: 'Massimportera innehåll, kontakter och konfigurationer.',
        sections: [
          { id: 'bulk-import',        title: 'Massimport av innehåll' },
          { id: 'csv-format',         title: 'CSV-format & krav' },
          { id: 'bulk-contacts',      title: 'Massimport kontakter' },
          { id: 'bulk-update',        title: 'Massuppdatera poster' },
          { id: 'scheduling-imports', title: 'Schemalägg importer' },
          { id: 'error-handling',     title: 'Felhantering vid import' }
        ]
      },
      {
        slug: 'troubleshooting',
        title: 'Felsökning',
        description: 'Vanliga problem och lösningar för SWEO AI-plattformen.',
        sections: [
          { id: 'common-issues',      title: 'Vanliga problem' },
          { id: 'ai-not-answering',   title: 'AI svarar inte korrekt' },
          { id: 'channel-issues',     title: 'Kanalproblem' },
          { id: 'integration-errors', title: 'Integrationsfel' },
          { id: 'performance',        title: 'Prestandaproblem' },
          { id: 'contact-support',    title: 'Kontakta support' }
        ]
      }
    ]
  }
];

// ── AI call ───────────────────────────────────────────────────────────

async function callAI(systemPrompt, userPrompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userPrompt }
          ],
          temperature: 0.4,
          max_tokens: 8192
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    } catch (err) {
      console.error(`  ⚠ Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(2000 * attempt);
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── System prompt ─────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Du är en teknisk skribent för SWEO AI – en AI-driven kundsupportplattform. 
Du skriver professionell produktdokumentation på svenska.

SWEO AI är en SaaS-plattform som:
- Använder AI (GPT-4o) för att automatiskt svara på kundsupportärenden
- Stödjer flera kanaler: Web chat widget, e-post, WhatsApp, SMS, telefoni
- Har en "Flywheel"-modell: Train → Test → Deploy → Analyze (loop)
- Knowledge Base med URL-crawling, filuppladdning, manuellt innehåll
- Policies (regler i naturligt språk som AI:n följer)
- Procedures (multi-step automatiska workflows)
- Data Connectors (Shopify, Stripe, Salesforce, HubSpot, Custom API)
- Inbox för att hantera ärenden manuellt med AI Copilot
- Analytics dashboard med KPI:er, content gaps, rapporter
- Multi-tenant (varje organisation har isolerat workspace)
- Byggd med Next.js, Appwrite, Pinecone, OpenAI

Regler för ditt skrivande:
1. Skriv BARA valid HTML (p, ul, ol, li, strong, em, code, pre, table, thead, tbody, tr, th, td, h4, blockquote).
2. Skriv INTE markdown, bara HTML.
3. Var saklig, konkret och professionell. Undvik floskler.
4. Inkludera konkreta steg, exempelkonfigurationer och tips.
5. Varje sektion ska vara 150-400 ord. Skriv rikt och detaljerat.
6. Använd inte emojis.
7. Svara ENBART med HTML-innehållet, utan inledande text.
8. Skriv som om du vore en senior produktdokumentation-skribent hos ett SaaS-företag.
9. Inkludera praktiska tips-rutor med <blockquote><strong>Tips:</strong> ...</blockquote> där relevant.`;

// ── Generate content for one article ─────────────────────────────────

async function generateArticle(category, article) {
  const sectionTitles = article.sections.map((s) => `- ${s.title} (id: ${s.id})`).join('\n');

  const prompt = `Skriv rikt HTML-innehåll för varje sektion i denna dokumentationsartikel.

Kategori: ${category.title}
Artikel: ${article.title}
Beskrivning: ${article.description}

Sektioner att skriva (i exakt denna ordning):
${sectionTitles}

Svara i exakt detta JSON-format (en array med objekt):
[
  {"id": "section-id", "content": "<p>HTML content here...</p>"},
  ...
]

KRITISKT: All HTML-innehåll MÅSTE vara på EN rad per "content"-värde. Inga literala radbrytningar inuti strängvärden.
Använd HTML-taggar (p, ul, li) för layout istället för radbrytningar.

Svara ENBART med valid JSON-arrayen. Ingen annan text.`;

  const raw = await callAI(SYSTEM_PROMPT, prompt);

  // Extrahera JSON från svar (hantera eventuella code fences)
  let jsonStr = raw;
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  const bracketStart = jsonStr.indexOf('[');
  const bracketEnd   = jsonStr.lastIndexOf(']');
  if (bracketStart !== -1 && bracketEnd !== -1) {
    jsonStr = jsonStr.slice(bracketStart, bracketEnd + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    try {
      const fixed = jsonStr.replace(/\n\s*/g, ' ').replace(/\t/g, ' ');
      parsed = JSON.parse(fixed);
    } catch {
      try {
        parsed = [];
        const sectionRegex = /"id"\s*:\s*"([^"]+)"[\s\S]*?"content"\s*:\s*"([\s\S]*?)(?:"\s*\})/g;
        let match;
        while ((match = sectionRegex.exec(raw)) !== null) {
          parsed.push({
            id: match[1],
            content: match[2].replace(/\n\s*/g, ' ').replace(/\\n/g, ' ').replace(/\\"/g, '"')
          });
        }
        if (parsed.length === 0) throw new Error('No sections extracted');
        console.log(`  ⚡ Extracted ${parsed.length} sections via regex fallback`);
      } catch {
        console.error(`  ❌ Failed to parse for "${article.title}". Using fallback.`);
        return article.sections.map((s) => ({
          id: s.id,
          title: s.title,
          content: '<p>Innehåll genereras...</p>'
        }));
      }
    }
  }

  // Mappa tillbaka till fullständiga section-objekt
  return article.sections.map((s) => {
    const generated = parsed.find((p) => p.id === s.id);
    return {
      id:      s.id,
      title:   s.title,
      content: generated?.content || '<p>Innehåll genereras...</p>'
    };
  });
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 SWEO AI Docs Generator');
  console.log(`   Model: ${MODEL}`);
  console.log(`   API:   ${API_URL}`);
  console.log('');

  const totalArticles = categories.reduce((sum, c) => sum + c.articles.length, 0);
  let completed = 0;

  for (const cat of categories) {
    console.log(`📂 ${cat.title}`);

    for (const article of cat.articles) {
      completed++;
      console.log(`  📄 [${completed}/${totalArticles}] ${article.title}...`);

      article.sections = await generateArticle(cat, article);

      // Rate-limit: vänta mellan anrop
      await sleep(1500);
    }
  }

  console.log('');
  console.log('✍️  Writing src/config/docs-data.json...');

  const jsonPath = resolve(ROOT, 'src/config/docs-data.json');

  // Backup om filen redan finns
  try {
    const existing = readFileSync(jsonPath, 'utf-8');
    writeFileSync(jsonPath + '.bak', existing, 'utf-8');
    console.log('   Backup saved: docs-data.json.bak');
  } catch {
    // Filen finns inte än – inget att backa upp
  }

  // JSON.stringify hanterar all escaping automatiskt (backticks, ${}, \n, etc.)
  const jsonContent = JSON.stringify(categories, null, 2);
  writeFileSync(jsonPath, jsonContent, 'utf-8');

  console.log(`   ✅ Written ${jsonContent.length} chars to docs-data.json`);
  console.log('');
  console.log('Done! Run `npm run dev` and check /docs to see the new content.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
