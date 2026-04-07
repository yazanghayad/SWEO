import { describe, it, expect } from 'vitest';
import {
  InstagramAdapter,
  type InstagramWebhookPayload
} from '@/lib/channels/instagram-adapter';
import {
  FacebookMessengerAdapter,
  type MessengerWebhookPayload
} from '@/lib/channels/facebook-messenger-adapter';
import {
  SlackAdapter,
  type SlackEventPayload
} from '@/lib/channels/slack-adapter';

// ---------------------------------------------------------------------------
// Instagram Adapter
// ---------------------------------------------------------------------------

describe('InstagramAdapter', () => {
  describe('parseWebhookPayload', () => {
    it('extracts messages from a valid Instagram webhook payload', () => {
      const payload: InstagramWebhookPayload = {
        object: 'instagram',
        entry: [
          {
            id: 'page-id-123',
            time: Date.now(),
            messaging: [
              {
                sender: { id: 'user-1' },
                recipient: { id: 'page-1' },
                timestamp: Date.now(),
                message: {
                  mid: 'msg-1',
                  text: 'Hello, I need help'
                }
              }
            ]
          }
        ]
      };

      const messages = InstagramAdapter.parseWebhookPayload(payload);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        senderId: 'user-1',
        recipientId: 'page-1',
        messageId: 'msg-1',
        text: 'Hello, I need help'
      });
    });

    it('handles payload with no text messages (e.g. attachments only)', () => {
      const payload: InstagramWebhookPayload = {
        object: 'instagram',
        entry: [
          {
            id: 'page-id-123',
            time: Date.now(),
            messaging: [
              {
                sender: { id: 'user-1' },
                recipient: { id: 'page-1' },
                timestamp: Date.now(),
                message: {
                  mid: 'msg-2',
                  attachments: [{ type: 'image', payload: { url: 'https://example.com/img.jpg' } }]
                }
              }
            ]
          }
        ]
      };

      const messages = InstagramAdapter.parseWebhookPayload(payload);
      // Adapter only extracts messages with text; attachment-only messages are skipped
      expect(messages).toHaveLength(0);
    });

    it('returns empty for entries with no messaging', () => {
      const payload: InstagramWebhookPayload = {
        object: 'instagram',
        entry: [{ id: 'page-id', time: Date.now(), messaging: [] }]
      };

      const messages = InstagramAdapter.parseWebhookPayload(payload);
      expect(messages).toHaveLength(0);
    });

    it('handles multiple entries with multiple messages', () => {
      const payload: InstagramWebhookPayload = {
        object: 'instagram',
        entry: [
          {
            id: 'page-1',
            time: Date.now(),
            messaging: [
              {
                sender: { id: 'user-a' },
                recipient: { id: 'page-1' },
                timestamp: Date.now(),
                message: { mid: 'm-1', text: 'First' }
              },
              {
                sender: { id: 'user-b' },
                recipient: { id: 'page-1' },
                timestamp: Date.now(),
                message: { mid: 'm-2', text: 'Second' }
              }
            ]
          },
          {
            id: 'page-2',
            time: Date.now(),
            messaging: [
              {
                sender: { id: 'user-c' },
                recipient: { id: 'page-2' },
                timestamp: Date.now(),
                message: { mid: 'm-3', text: 'Third' }
              }
            ]
          }
        ]
      };

      const messages = InstagramAdapter.parseWebhookPayload(payload);
      expect(messages).toHaveLength(3);
    });
  });

  describe('verifySignature', () => {
    const appSecret = 'test-secret-key';

    it('verifies a valid HMAC SHA256 signature', () => {
      const crypto = require('crypto');
      const body = '{"test":"data"}';
      const hash = crypto
        .createHmac('sha256', appSecret)
        .update(body)
        .digest('hex');
      const signature = `sha256=${hash}`;

      expect(
        InstagramAdapter.verifySignature(body, signature, appSecret)
      ).toBe(true);
    });

    it('rejects an invalid signature', () => {
      expect(
        InstagramAdapter.verifySignature(
          '{"test":"data"}',
          'sha256=invalid-hash',
          appSecret
        )
      ).toBe(false);
    });

    it('rejects empty signature', () => {
      expect(
        InstagramAdapter.verifySignature('body', '', appSecret)
      ).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// Facebook Messenger Adapter
// ---------------------------------------------------------------------------

describe('FacebookMessengerAdapter', () => {
  describe('parseWebhookPayload', () => {
    it('parses text messages', () => {
      const payload: MessengerWebhookPayload = {
        object: 'page',
        entry: [
          {
            id: 'page-1',
            time: Date.now(),
            messaging: [
              {
                sender: { id: 'user-1' },
                recipient: { id: 'page-1' },
                timestamp: Date.now(),
                message: { mid: 'mid-1', text: 'Hello Messenger' }
              }
            ]
          }
        ]
      };

      const messages = FacebookMessengerAdapter.parseWebhookPayload(payload);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        senderId: 'user-1',
        text: 'Hello Messenger'
      });
    });

    it('parses postback messages', () => {
      const payload: MessengerWebhookPayload = {
        object: 'page',
        entry: [
          {
            id: 'page-1',
            time: Date.now(),
            messaging: [
              {
                sender: { id: 'user-1' },
                recipient: { id: 'page-1' },
                timestamp: Date.now(),
                postback: {
                  title: 'Get Started',
                  payload: 'GET_STARTED'
                }
              }
            ]
          }
        ]
      };

      const messages = FacebookMessengerAdapter.parseWebhookPayload(payload);
      expect(messages).toHaveLength(1);
      // Postback uses title (not payload) as text
      expect(messages[0].text).toBe('Get Started');
    });

    it('skips entries without message or postback', () => {
      const payload: MessengerWebhookPayload = {
        object: 'page',
        entry: [
          {
            id: 'page-1',
            time: Date.now(),
            messaging: [
              {
                sender: { id: 'user-1' },
                recipient: { id: 'page-1' },
                timestamp: Date.now()
                // no message or postback
              }
            ]
          }
        ]
      };

      const messages = FacebookMessengerAdapter.parseWebhookPayload(payload);
      expect(messages).toHaveLength(0);
    });
  });

  describe('verifySignature', () => {
    it('verifies valid Meta signature', () => {
      const crypto = require('crypto');
      const secret = 'messenger-secret';
      const body = '{"entry":[]}';
      const hash = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      expect(
        FacebookMessengerAdapter.verifySignature(
          body,
          `sha256=${hash}`,
          secret
        )
      ).toBe(true);
    });

    it('rejects tampered body', () => {
      const crypto = require('crypto');
      const secret = 'messenger-secret';
      const originalBody = '{"entry":[]}';
      const hash = crypto
        .createHmac('sha256', secret)
        .update(originalBody)
        .digest('hex');

      expect(
        FacebookMessengerAdapter.verifySignature(
          '{"entry":["tampered"]}',
          `sha256=${hash}`,
          secret
        )
      ).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// Slack Adapter
// ---------------------------------------------------------------------------

describe('SlackAdapter', () => {
  describe('parseEventPayload', () => {
    it('parses a regular message event', () => {
      const payload: SlackEventPayload = {
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'message',
          channel: 'C456',
          user: 'U789',
          text: 'Help me please',
          ts: '1234567890.123456'
        }
      };

      const result = SlackAdapter.parseEventPayload(payload);
      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        userId: 'U789',
        channelId: 'C456',
        text: 'Help me please',
        teamId: 'T123'
      });
    });

    it('parses app_mention events', () => {
      const payload: SlackEventPayload = {
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'app_mention',
          channel: 'C456',
          user: 'U789',
          text: '<@U_BOT> help me',
          ts: '1234567890.999'
        }
      };

      const result = SlackAdapter.parseEventPayload(payload);
      expect(result).not.toBeNull();
      expect(result!.text).toContain('help me');
    });

    it('skips bot messages', () => {
      const payload: SlackEventPayload = {
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'message',
          channel: 'C456',
          user: 'U789',
          text: 'Bot reply',
          ts: '1234567890.123',
          bot_id: 'B_BOT'
        }
      };

      const result = SlackAdapter.parseEventPayload(payload);
      expect(result).toBeNull();
    });

    it('skips bot_message subtypes', () => {
      const payload: SlackEventPayload = {
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'message',
          subtype: 'bot_message',
          channel: 'C456',
          user: 'U789',
          text: 'Automated',
          ts: '1234567890.123'
        }
      };

      const result = SlackAdapter.parseEventPayload(payload);
      expect(result).toBeNull();
    });

    it('returns null for url_verification events', () => {
      const payload: SlackEventPayload = {
        type: 'url_verification',
        challenge: 'test-challenge'
      };

      const result = SlackAdapter.parseEventPayload(payload);
      expect(result).toBeNull();
    });

    it('includes thread_ts when present', () => {
      const payload: SlackEventPayload = {
        type: 'event_callback',
        team_id: 'T123',
        event: {
          type: 'message',
          channel: 'C456',
          user: 'U789',
          text: 'Thread reply',
          ts: '1234567890.999',
          thread_ts: '1234567890.000'
        }
      };

      const result = SlackAdapter.parseEventPayload(payload);
      expect(result).not.toBeNull();
      expect(result!.threadTs).toBe('1234567890.000');
    });
  });

  describe('verifySignature', () => {
    const signingSecret = 'slack-test-signing-secret';

    it('verifies a valid Slack signature', () => {
      const crypto = require('crypto');
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const body = '{"type":"event_callback"}';
      const sigBase = `v0:${timestamp}:${body}`;
      const hash = crypto
        .createHmac('sha256', signingSecret)
        .update(sigBase)
        .digest('hex');

      expect(
        SlackAdapter.verifySignature(
          body,
          timestamp,
          `v0=${hash}`,
          signingSecret
        )
      ).toBe(true);
    });

    it('rejects expired timestamp (>5 min)', () => {
      const crypto = require('crypto');
      const oldTimestamp = (Math.floor(Date.now() / 1000) - 400).toString();
      const body = '{"type":"event_callback"}';
      const sigBase = `v0:${oldTimestamp}:${body}`;
      const hash = crypto
        .createHmac('sha256', signingSecret)
        .update(sigBase)
        .digest('hex');

      expect(
        SlackAdapter.verifySignature(
          body,
          oldTimestamp,
          `v0=${hash}`,
          signingSecret
        )
      ).toBe(false);
    });

    it('rejects invalid signature', () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();

      expect(
        SlackAdapter.verifySignature(
          '{"data":true}',
          timestamp,
          'v0=invalid-hash',
          signingSecret
        )
      ).toBe(false);
    });

    it('rejects empty inputs', () => {
      expect(
        SlackAdapter.verifySignature('body', '', '', signingSecret)
      ).toBe(false);
    });
  });
});
