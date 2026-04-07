import type { Models } from 'node-appwrite';

// ---------------------------------------------------------------------------
// Tenant
// ---------------------------------------------------------------------------
/**
 * Typed tenant config stored as JSON in the `config` field.
 */
export interface TenantConfig {
  /** Enabled communication channels. */
  channels?: ConversationChannel[];
  /** LLM model override (e.g. 'gpt-4o-mini'). */
  model?: string;
  /** Minimum RAG confidence to resolve (0-1). Default 0.7. */
  confidenceThreshold?: number;
  /** Max conversation history messages for context. Default 10. */
  maxHistoryMessages?: number;
  /** Custom system prompt prepended to LLM calls. */
  customSystemPrompt?: string;
  /** Webhook URL for handover/escalation notifications. */
  webhookUrl?: string;
  /** Semantic cache TTL in seconds. Default 3600. */
  cacheTtlSeconds?: number;
  /** Appwrite team ID for team management. */
  teamId?: string;
  /** Previous API key kept for grace period rotation. */
  previousApiKey?: string;
  /** ISO timestamp when previousApiKey expires. */
  previousApiKeyExpiresAt?: string;
  /** Subdomain slug (stored on tenant doc, mirrored here for convenience). */
  subdomain?: string;
  /** Default timezone. */
  timezone?: string;
  /** Default language code. */
  language?: string;

  // ── Stripe Billing ────────────────────────────────────────────────
  /** Stripe customer ID. */
  stripeCustomerId?: string | null;
  /** Stripe subscription ID. */
  stripeSubscriptionId?: string | null;
  /** Subscription status from Stripe (active, past_due, cancelled, etc.). */
  subscriptionStatus?: string | null;
  /** ISO timestamp of current billing period end. */
  currentPeriodEnd?: string | null;
  /** ISO timestamp of last successful payment. */
  lastPaymentDate?: string | null;
  /** Amount of last successful payment (minor units). */
  lastPaymentAmount?: number | null;
  /** Currency of last payment. */
  lastPaymentCurrency?: string | null;
  /** ISO timestamp of last payment error. */
  lastPaymentError?: string | null;

  /** Billing address stored as JSON. */
  billingAddress?: {
    companyName: string;
    orgNumber: string;
    vatNumber: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
    reference: string;
    email: string;
  };
  /** Saved payment methods. */
  paymentMethods?: Array<{
    id: string;
    type: string;
    label: string;
    details: string;
    isDefault: boolean;
    addedDate: string;
  }>;

  // ── AI Agent Settings ─────────────────────────────────────────────────
  /** Whether the AI agent is enabled. */
  aiEnabled?: boolean;
  /** AI agent personality style. */
  aiPersonality?: string;
  /** Auto-resolve when AI answers confidently. */
  aiAutoResolve?: boolean;
  /** Allow AI to hand off to human. */
  aiHumanHandoff?: boolean;
  /** Collect feedback after AI resolution. */
  aiCollectFeedback?: boolean;
  /** Show knowledge base sources in AI replies. */
  aiShowSources?: boolean;

  // ── Customization / Widget ────────────────────────────────────────────
  /** Bot display name in the widget. */
  botName?: string;
  /** Welcome / greeting message. */
  welcomeMessage?: string;
  /** Primary brand color (hex). */
  brandColor?: string;
  /** Widget position: 'right' | 'left'. */
  widgetPosition?: 'right' | 'left';
  /** Show "powered by" badge. */
  poweredBy?: boolean;
  /** Show typing indicators. */
  typingIndicators?: boolean;
  /** Show read receipts. */
  readReceipts?: boolean;
  /** Auto-link knowledge articles. */
  universalLinks?: boolean;
  /** Custom domain for help center. */
  customDomain?: string;

  // ── White-label / SaaS ────────────────────────────────────────────────
  /** Company logo URL (Appwrite Storage file). */
  logoUrl?: string;
  /** Favicon URL (Appwrite Storage file). */
  faviconUrl?: string;
  /** Company display name (overrides tenant.name in UI). */
  companyName?: string;
  /** Support email shown to end-users. */
  supportEmail?: string;
  /** Secondary brand color (hex). */
  brandColorSecondary?: string;
  /** Custom CSS injected into widget. */
  customCss?: string;
  /** Email sender name (e.g. "Acme Support"). */
  emailSenderName?: string;
  /** Email logo URL shown in email templates. */
  emailLogoUrl?: string;
  /** Custom domain verified status. */
  customDomainVerified?: boolean;
  /** DNS verification token for custom domain. */
  customDomainToken?: string;
  /** White-label mode: hides all SWEO branding. Requires growth+ plan. */
  whiteLabel?: boolean;

  // ── Webhooks ──────────────────────────────────────────────────────────
  // NOTE: Webhooks are now stored in the dedicated 'webhooks' collection.
  //       The `webhookUrl` field above is for legacy escalation webhook only.

  // ── Office Hours ──────────────────────────────────────────────────────
  /** Whether office hours are enforced. */
  officeHoursEnabled?: boolean;
  /** Weekly schedule per day. */
  officeHoursSchedule?: Record<
    string,
    { enabled: boolean; start: string; end: string }
  >;
  /** Auto-reply outside office hours. */
  officeHoursAutoReply?: boolean;

  // ── Notifications (per-user, but tenant defaults) ─────────────────────
  /** Notification preferences. */
  notifications?: {
    email?: boolean;
    desktop?: boolean;
    mobile?: boolean;
    sound?: boolean;
    newConversation?: boolean;
    newReply?: boolean;
    mentions?: boolean;
    assignedToMe?: boolean;
    escalations?: boolean;
    dailyDigest?: boolean;
  };

  // ── Assignments ───────────────────────────────────────────────────────
  /** Auto-assignment config. */
  assignments?: {
    autoAssign?: boolean;
    roundRobin?: boolean;
    loadBalancing?: boolean;
    maxConversations?: string;
    reassignOnReply?: boolean;
  };

  // ── Automation Rules ──────────────────────────────────────────────────
  // NOTE: Automation rules are now stored in the dedicated 'automation_rules' collection.

  // ── Inbox AI Toggles ──────────────────────────────────────────────────
  /** Inbox AI feature flags. */
  inboxAi?: {
    compose?: boolean;
    summarize?: boolean;
    autofill?: boolean;
    tone?: boolean;
    translate?: boolean;
    suggestMacro?: boolean;
  };

  // ── Macros ────────────────────────────────────────────────────────────
  // NOTE: Macros are now stored in the dedicated 'macros' collection.

  // ── Tags ──────────────────────────────────────────────────────────────
  // NOTE: Tags are now stored in the dedicated 'tags' collection.

  // ── Multilingual ──────────────────────────────────────────────────────
  /** Auto-translate AI responses. */
  autoTranslate?: boolean;
  /** Auto-detect customer language. */
  detectLanguage?: boolean;
  /** Supported languages config. */
  languages?: Array<{
    code: string;
    name: string;
    enabled: boolean;
    isDefault: boolean;
  }>;

  // ── Outbound Messaging ────────────────────────────────────────────────
  /** Outbound channel/tracking config. */
  outbound?: {
    email?: boolean;
    messenger?: boolean;
    sms?: boolean;
    push?: boolean;
    tracking?: boolean;
  };

  // ── Security ──────────────────────────────────────────────────────────
  /** Workspace security settings. */
  security?: {
    emailAuth?: boolean;
    googleSSO?: boolean;
    samlSSO?: boolean;
    enforceSSO?: boolean;
    ipAllowlist?: boolean;
    ipAddresses?: string;
    sessionLength?: string;
    securityEmail?: string;
    aiTraining?: boolean;
    dataRetention?: string;
    dataGracePeriod?: string;
    identityVerification?: boolean;
    requireEmail?: boolean;
    allowAttachments?: boolean;
    maxFileSize?: string;
    allowedFileTypes?: string[];
  };

  // ── Team Inboxes ──────────────────────────────────────────────────────
  // NOTE: Team inboxes are now stored in the dedicated 'team_inboxes' collection.

  // ── Channel-specific configs ──────────────────────────────────────────
  /** SMS channel configuration. */
  smsConfig?: {
    enabled?: boolean;
    twilioPhone?: string;
    twilioSid?: string;
    twilioAuthToken?: string;
    senderName?: string;
    autoReplyEnabled?: boolean;
    autoReplyMessage?: string;
    optOutMessage?: string;
  };
  /** WhatsApp channel configuration. */
  whatsappConfig?: {
    enabled?: boolean;
    twilioSid?: string;
    twilioAuthToken?: string;
    twilioPhone?: string;
    webhookUrl?: string;
  };
  /** Email channel deploy configuration. */
  emailChannelConfig?: {
    enabled?: boolean;
    forwardingEmail?: string;
    autoReply?: boolean;
    replyStyle?: string;
    escalationEmail?: string;
    triggerSteps?: Record<string, unknown>;
  };
  /** Facebook Messenger channel configuration. */
  messengerConfig?: {
    enabled?: boolean;
    pageId?: string;
    pageAccessToken?: string;
    autoReply?: boolean;
  };
  /** AI Voice channel configuration. */
  voiceConfig?: {
    enabled?: boolean;
    voiceModel?: string;
    language?: string;
    greeting?: string;
  };
  /** Instagram DM channel configuration. */
  instagramConfig?: {
    enabled?: boolean;
    autoReply?: boolean;
  };
  /** Slack channel configuration. */
  slackConfig?: {
    enabled?: boolean;
    autoReply?: boolean;
    threadReplies?: boolean;
  };
}

export interface Tenant extends Models.Document {
  name: string;
  plan: 'trial' | 'growth' | 'enterprise';
  config: Record<string, unknown>;
  apiKey: string;
  userId: string;
  /** Unique subdomain slug, e.g. 'acme' → acme.sweo.se */
  subdomain?: string;
  /** Previous API key (top-level indexed field for grace-period rotation). */
  previousApiKey?: string;
  /** ISO timestamp when previousApiKey expires. */
  previousApiKeyExpiresAt?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Source
// ---------------------------------------------------------------------------
export type KnowledgeSourceType = 'url' | 'file' | 'manual';
export type KnowledgeSourceStatus = 'processing' | 'ready' | 'failed';

export interface KnowledgeSource extends Models.Document {
  tenantId: string;
  type: KnowledgeSourceType;
  url: string | null;
  fileId: string | null;
  status: KnowledgeSourceStatus;
  version: number;
  metadata: Record<string, unknown>;
  /** JSON array of targets: ["AI Agent", "Copilot", "Help Center"] */
  targets?: string;
}

// ---------------------------------------------------------------------------
// Conversation
// ---------------------------------------------------------------------------
export type ConversationChannel =
  | 'web'
  | 'email'
  | 'whatsapp'
  | 'sms'
  | 'voice'
  | 'instagram'
  | 'facebook_messenger'
  | 'slack';
export type ConversationStatus =
  | 'active'             // AI_ACTIVE — AI is handling
  | 'handoff_requested'  // User explicitly asked for a human
  | 'queued'             // Waiting in support queue
  | 'human_active'       // Human agent is chatting
  | 'resolved'           // Chat closed / finished
  | 'escalated';         // Legacy — auto-escalation (low confidence)

/** Distinguishes AI-generated vs human-agent messages in the widget. */
export type MessageSenderType = 'ai' | 'human_agent' | 'system';

/** Structured summary generated on handoff for the agent view. */
export interface HandoffSummary {
  userIntent: string;
  accountDetails: string;
  relevantContext: string;
  actionsAttempted: string;
  urgency: 'low' | 'medium' | 'high';
  suggestedNextStep: string;
  requestedAt: string;
}

export interface Conversation extends Models.Document {
  tenantId: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  userId: string | null;
  metadata: Record<string, unknown>;
  resolvedAt: string | null;
  /** ISO timestamp of the first assistant reply. */
  firstResponseAt: string | null;
  /** CSAT score (1-5) left by the customer. */
  csatScore: number | null;
  /** Agent ID/name when escalated or assigned. */
  assignedTo: string | null;
}

// ---------------------------------------------------------------------------
// Message
// ---------------------------------------------------------------------------
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Citation {
  sourceId: string;
  /** Human-readable label resolved from the knowledge source (fileName, title, URL). */
  label?: string;
  /** Source type (file, url, manual). */
  sourceType?: KnowledgeSourceType;
}

export interface Message extends Models.Document {
  conversationId: string;
  role: MessageRole;
  content: string;
  confidence: number | null;
  citations: Citation[];
  metadata: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Policy
// ---------------------------------------------------------------------------
export type PolicyType = 'topic_filter' | 'pii_filter' | 'tone' | 'length';
export type PolicyMode = 'pre' | 'post';

export interface Policy extends Models.Document {
  tenantId: string;
  name: string;
  type: PolicyType;
  mode: PolicyMode;
  config: Record<string, unknown>;
  enabled: boolean;
  priority: number;
}

// ---------------------------------------------------------------------------
// Audit Event
// ---------------------------------------------------------------------------
export interface AuditEvent extends Models.Document {
  tenantId: string;
  eventType: string;
  userId: string | null;
  payload: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Procedure (multi-step workflow)
// ---------------------------------------------------------------------------
export type ProcedureTriggerType = 'keyword' | 'intent' | 'manual';
export type ProcedureStepType =
  | 'message'
  | 'api_call'
  | 'data_lookup'
  | 'conditional'
  | 'approval';

export interface ProcedureTrigger {
  type: ProcedureTriggerType;
  condition: string;
}

export interface ProcedureStep {
  id: string;
  type: ProcedureStepType;
  config: Record<string, unknown>;
  nextStep?: string;
}

export interface Procedure extends Models.Document {
  tenantId: string;
  name: string;
  description: string;
  trigger: ProcedureTrigger;
  steps: ProcedureStep[];
  enabled: boolean;
  version: number;
}

// ---------------------------------------------------------------------------
// Data Connector
// ---------------------------------------------------------------------------
export type DataConnectorProvider =
  | 'shopify'
  | 'stripe'
  | 'linear'
  | 'zendesk'
  | 'salesforce'
  | 'intercom'
  | 'custom';
export type DataConnectorAuthType = 'oauth' | 'api_key' | 'basic';

export interface ConnectorEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  params: Record<string, string>;
  responseMapping: Record<string, string>;
}

export interface DataConnector extends Models.Document {
  tenantId: string;
  name: string;
  provider: DataConnectorProvider;
  auth: {
    type: DataConnectorAuthType;
    credentials: Record<string, string>;
  };
  config: Record<string, unknown>;
  endpoints: ConnectorEndpoint[];
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Test Scenario
// ---------------------------------------------------------------------------
export interface TestScenarioExpected {
  resolved: boolean;
  minConfidence?: number;
}

export interface TestScenario extends Models.Document {
  tenantId: string;
  name: string;
  messages: string[];
  expectedOutcome: TestScenarioExpected;
  lastRun: string | null;
}

// ---------------------------------------------------------------------------
// Content Suggestion (AI Flywheel)
// ---------------------------------------------------------------------------
export type ContentSuggestionStatus = 'pending' | 'approved' | 'dismissed';

export interface ContentSuggestion extends Models.Document {
  tenantId: string;
  topic: string;
  frequency: number;
  exampleQueries: string[];
  suggestedContent: string;
  status: ContentSuggestionStatus;
}

// ---------------------------------------------------------------------------
// Vector (embedding chunk stored in Appwrite)
// ---------------------------------------------------------------------------
export interface VectorDocument extends Models.Document {
  tenantId: string;
  vectorId: string;
  sourceId: string;
  text: string;
  embedding: string; // JSON-stringified number[]
  metadata: string;  // JSON-stringified object
}

// ---------------------------------------------------------------------------
// Guidance Rule
// ---------------------------------------------------------------------------
export type GuidanceChannel = 'chat-email' | 'voice';
export type GuidanceCategory =
  | 'communication_style'
  | 'context_clarification'
  | 'content_sources'
  | 'spam'
  | 'other';
export type ToneOption = 'friendly' | 'neutral' | 'matter-of-fact' | 'professional' | 'humorous';
export type LengthOption = 'concise' | 'standard' | 'thorough';

export interface GuidanceRule extends Models.Document {
  tenantId: string;
  channel: GuidanceChannel;
  category: GuidanceCategory;
  name: string;
  description?: string;
  ruleContent: string;
  enabled: boolean;
  tone?: ToneOption;
  length?: LengthOption;
}

// ---------------------------------------------------------------------------
// Chatbot (public SWEO website chatbot)
// ---------------------------------------------------------------------------
export type ChatbotDepartment = 'sales' | 'support';
export type ChatbotConversationStatus = 'active' | 'closed';

export interface ChatbotConversation extends Models.Document {
  sessionId: string;
  department: ChatbotDepartment;
  status: ChatbotConversationStatus;
  visitorIp: string | null;
  visitorUserAgent: string | null;
  metadata: Record<string, unknown>;
}

export interface ChatbotMessage extends Models.Document {
  conversationId: string;
  role: MessageRole;
  content: string;
}

// ---------------------------------------------------------------------------
// Macro (saved reply template)
// ---------------------------------------------------------------------------
export interface Macro extends Models.Document {
  tenantId: string;
  name: string;
  content: string;
  usageCount: number;
}

// ---------------------------------------------------------------------------
// Tag (conversation label)
// ---------------------------------------------------------------------------
export interface Tag extends Models.Document {
  tenantId: string;
  name: string;
  color: string;
  usageCount: number;
}

// ---------------------------------------------------------------------------
// Webhook (event notification endpoint)
// ---------------------------------------------------------------------------
export type WebhookStatus = 'active' | 'inactive' | 'failed';

export interface Webhook extends Models.Document {
  tenantId: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  lastTriggered: string | null;
}

// ---------------------------------------------------------------------------
// Automation Rule
// ---------------------------------------------------------------------------
export interface AutomationRule extends Models.Document {
  tenantId: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Team Inbox
// ---------------------------------------------------------------------------
export interface TeamInbox extends Models.Document {
  tenantId: string;
  name: string;
  memberCount: number;
  isDefault: boolean;
}

// ---------------------------------------------------------------------------
// Contact (User / Lead / Company)
// ---------------------------------------------------------------------------
export type ContactType = 'user' | 'lead';
export type ContactStatus = 'active' | 'inactive' | 'archived';

export interface Contact extends Models.Document {
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: ContactType;
  status: ContactStatus;
  avatarColor: string;
  city: string;
  country: string;
  webSessions: number;
  lastSeenAt: string | null;
  firstSeenAt: string | null;
  signedUpAt: string | null;
  tags: string;
  notes: string;
  metadata: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Case Management
// ---------------------------------------------------------------------------
export type CaseType =
  | 'invoice_dispute'
  | 'complaint'
  | 'return'
  | 'warranty'
  | 'general';

export type CaseStatus =
  | 'open'
  | 'in_progress'
  | 'awaiting_customer'
  | 'awaiting_internal'
  | 'resolved'
  | 'closed';

export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Case extends Models.Document {
  tenantId: string;
  contactId: string | null;
  conversationId: string | null;
  type: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  subject: string;
  description: string;
  assignedTo: string | null;
  dueDate: string | null;
  resolvedAt: string | null;
  tags: string; // JSON array
  metadata: string; // JSON
}

// ---------------------------------------------------------------------------
// Case Document (file attached to a case)
// ---------------------------------------------------------------------------
export interface CaseDocument extends Models.Document {
  tenantId: string;
  caseId: string;
  fileId: string;
  fileName: string;
  fileMimeType: string;
  fileSize: number;
  uploadedBy: string;
}

// ---------------------------------------------------------------------------
// Case Note (internal agent note)
// ---------------------------------------------------------------------------
export interface CaseNote extends Models.Document {
  tenantId: string;
  caseId: string;
  authorId: string;
  authorName: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Case Timeline Event
// ---------------------------------------------------------------------------
export type CaseTimelineEventType =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'assigned'
  | 'note_added'
  | 'document_added'
  | 'document_removed'
  | 'comment'
  | 'linked_conversation'
  | 'resolved'
  | 'reopened';

export interface CaseTimelineEvent extends Models.Document {
  tenantId: string;
  caseId: string;
  eventType: CaseTimelineEventType;
  actorId: string | null;
  actorName: string;
  description: string;
  metadata: string; // JSON (e.g. { from: 'open', to: 'in_progress' })
}

// ---------------------------------------------------------------------------
// Outbound Message
// ---------------------------------------------------------------------------

export type OutboundMessageStatus = 'active' | 'draft' | 'paused' | 'archived' | 'sending' | 'sent' | 'failed';

export type OutboundChannel =
  | 'chat'
  | 'email'
  | 'banner'
  | 'post'
  | 'sms'
  | 'whatsapp'
  | 'mobile-push'
  | 'tooltip'
  | 'product-tour'
  | 'checklist'
  | 'survey'
  | 'mobile-carousel'
  | 'workflow'
  | 'news'
  | 'broadcast';

export interface OutboundMessage extends Models.Document {
  tenantId: string;
  title: string;
  channel: OutboundChannel;
  status: OutboundMessageStatus;
  content: string; // JSON: { subject?, body, templateId? }
  audience: string; // JSON: { type, rules[] }
  schedule: string; // JSON: { type: 'immediate'|'scheduled', sendAt? }
  sentCount: number;
  openRate: number;
  clickRate: number;
  metadata: string; // JSON
}
