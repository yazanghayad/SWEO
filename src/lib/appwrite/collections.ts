/**
 * Collection IDs – central mapping used by helpers and the setup script.
 */
export const COLLECTION = {
  TENANTS: 'tenants',
  KNOWLEDGE_SOURCES: 'knowledge_sources',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  POLICIES: 'policies',
  AUDIT_EVENTS: 'audit_events',
  PROCEDURES: 'procedures',
  DATA_CONNECTORS: 'data_connectors',
  TEST_SCENARIOS: 'test_scenarios',
  CONTENT_SUGGESTIONS: 'content_suggestions',
  VECTORS: 'vectors',
  CHATBOT_CONVERSATIONS: 'chatbot_conversations',
  CHATBOT_MESSAGES: 'chatbot_messages',
  MACROS: 'macros',
  TAGS: 'tags',
  WEBHOOKS: 'webhooks',
  AUTOMATION_RULES: 'automation_rules',
  TEAM_INBOXES: 'team_inboxes',
  GUIDANCE_RULES: 'guidance_rules',
  CONTACTS: 'contacts',
  CASES: 'cases',
  CASE_DOCUMENTS: 'case_documents',
  CASE_NOTES: 'case_notes',
  CASE_TIMELINE: 'case_timeline',
  HELPDESK_INTEGRATIONS: 'helpdesk_integrations',
  HELPDESK_SYNC_LOG: 'helpdesk_sync_log',
  OUTBOUND_MESSAGES: 'outbound_messages',
  OUTBOUND_DELIVERIES: 'outbound_deliveries',
  PRESENCE: 'presence'
} as const;
