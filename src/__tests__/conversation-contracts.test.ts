import { describe, expect, it } from 'vitest';
import {
  CONVERSATION_EVENTS,
  toWidgetConversationStatus,
  WIDGET_CONVERSATION_STATUS
} from '@/lib/conversation/contracts';

describe('conversation contracts', () => {
  it('keeps closed event and status mapping stable for widget integrations', () => {
    expect(CONVERSATION_EVENTS.CLOSED).toBe('conversation_closed');
    expect(toWidgetConversationStatus('resolved')).toBe(
      WIDGET_CONVERSATION_STATUS.CLOSED
    );
    expect(toWidgetConversationStatus('closed')).toBe(
      WIDGET_CONVERSATION_STATUS.CLOSED
    );
  });
});
