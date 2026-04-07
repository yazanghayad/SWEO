export const CONVERSATION_EVENTS = {
  CLOSED: 'conversation_closed'
} as const;

export type ConversationEventType =
  (typeof CONVERSATION_EVENTS)[keyof typeof CONVERSATION_EVENTS];

export const WIDGET_CONVERSATION_STATUS = {
  ACTIVE: 'active',
  HANDOFF_REQUESTED: 'handoff_requested',
  QUEUED: 'queued',
  HUMAN_ACTIVE: 'human_active',
  ESCALATED: 'escalated',
  CLOSED: 'closed'
} as const;

export type WidgetConversationStatus =
  (typeof WIDGET_CONVERSATION_STATUS)[keyof typeof WIDGET_CONVERSATION_STATUS];

/**
 * Canonical status mapping for the embeddable widget.
 * Internal DB status "resolved" is intentionally exposed as "closed".
 */
export function toWidgetConversationStatus(
  status: string | null | undefined
): WidgetConversationStatus {
  switch (status) {
    case 'handoff_requested':
      return WIDGET_CONVERSATION_STATUS.HANDOFF_REQUESTED;
    case 'queued':
      return WIDGET_CONVERSATION_STATUS.QUEUED;
    case 'human_active':
      return WIDGET_CONVERSATION_STATUS.HUMAN_ACTIVE;
    case 'escalated':
      return WIDGET_CONVERSATION_STATUS.ESCALATED;
    case 'resolved':
    case 'closed':
      return WIDGET_CONVERSATION_STATUS.CLOSED;
    case 'active':
    default:
      return WIDGET_CONVERSATION_STATUS.ACTIVE;
  }
}
