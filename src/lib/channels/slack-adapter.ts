/**
 * Slack channel adapter (Slack Events API).
 *
 * Handles inbound messages from Slack community channels via the
 * Events API and sends replies using the Slack Web API.
 *
 * Setup requirements:
 *   1. Slack App with Events API subscriptions (message.channels, message.im)
 *   2. Bot token (xoxb-...) with chat:write, channels:history, im:history scopes
 *   3. Signing secret for webhook verification
 */

import { ChannelAdapter, type IncomingMessage } from './base-adapter';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type { Conversation, ConversationChannel } from '@/types/appwrite';
import { Query } from 'node-appwrite';
import { createModuleLogger } from '@/lib/logger';

const log = createModuleLogger('slack-adapter');
import { safeJsonParse } from '@/lib/safe-json-parse';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Slack Events API envelope. */
export interface SlackEventPayload {
  type: 'url_verification' | 'event_callback';
  /** Only present for url_verification. */
  challenge?: string;
  token?: string;
  team_id?: string;
  api_app_id?: string;
  event?: SlackMessageEvent;
}

export interface SlackMessageEvent {
  type: 'message' | 'app_mention';
  subtype?: string;
  channel: string;
  user: string;
  text: string;
  ts: string;
  thread_ts?: string;
  bot_id?: string;
}

export interface SlackParsedMessage {
  userId: string;
  channelId: string;
  text: string;
  ts: string;
  threadTs?: string;
  teamId: string;
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export class SlackAdapter extends ChannelAdapter {
  readonly channelType: ConversationChannel = 'slack';

  private get botToken(): string {
    return process.env.SLACK_BOT_TOKEN ?? '';
  }

  private get signingSecret(): string {
    return process.env.SLACK_SIGNING_SECRET ?? '';
  }

  // ── Send message via Slack Web API ────────────────────────────────
  async sendMessage(
    conversationId: string,
    content: string,
    _metadata?: Record<string, unknown>
  ): Promise<void> {
    const { databases } = createAdminClient();
    const conversation = await databases.getDocument<Conversation>(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      conversationId
    );

    const convMeta = safeJsonParse(conversation.metadata);

    const channelId = convMeta.channelId as string | undefined;
    const threadTs = convMeta.threadTs as string | undefined;

    if (!channelId) {
      log.error('No channel ID for conversation', {
        conversationId
      });
      return;
    }

    if (!this.botToken) {
      log.error('SLACK_BOT_TOKEN not configured');
      return;
    }

    // Post to channel (in thread if applicable)
    const body: Record<string, string> = {
      channel: channelId,
      text: content
    };
    if (threadTs) {
      body.thread_ts = threadTs;
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.botToken}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      log.error('Send failed', {
        status: response.status,
        errorBody
      });
      return;
    }

    const result = (await response.json()) as { ok: boolean; error?: string };
    if (!result.ok) {
      log.error('Slack API error', {
        error: result.error
      });
    }
  }

  // ── Parse inbound event payload ───────────────────────────────────
  async receiveMessage(payload: unknown): Promise<IncomingMessage> {
    const data = payload as SlackParsedMessage & {
      tenantApiKey?: string;
    };

    const tenantApiKey = data.tenantApiKey;
    if (!tenantApiKey) {
      throw new Error('Missing tenantApiKey in Slack webhook payload');
    }

    const tenantId = await this.resolveTenantId(tenantApiKey);
    const conversationId = await this.findOrCreateConversation(
      tenantId,
      data.channelId,
      data.userId,
      data.threadTs ?? data.ts
    );

    return {
      tenantId,
      conversationId,
      content: data.text,
      channel: 'slack',
      userId: data.userId,
      metadata: {
        channelId: data.channelId,
        ts: data.ts,
        threadTs: data.threadTs,
        teamId: data.teamId
      }
    };
  }

  // ── Parse raw Slack event into message ────────────────────────────
  static parseEventPayload(
    body: SlackEventPayload
  ): SlackParsedMessage | null {
    if (body.type !== 'event_callback' || !body.event) return null;

    const event = body.event;

    // Skip bot messages to prevent infinite loops
    if (event.bot_id || event.subtype === 'bot_message') return null;

    // Only handle regular messages and app_mentions
    if (event.type !== 'message' && event.type !== 'app_mention')
      return null;

    return {
      userId: event.user,
      channelId: event.channel,
      text: event.text,
      ts: event.ts,
      threadTs: event.thread_ts,
      teamId: body.team_id ?? ''
    };
  }

  // ── Verify Slack request signature ────────────────────────────────
  static verifySignature(
    rawBody: string,
    timestamp: string,
    signature: string,
    signingSecret: string
  ): boolean {
    if (!signature || !signingSecret || !timestamp) return false;

    // Reject requests older than 5 minutes
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp, 10)) > 300) return false;

    try {
      const crypto = require('crypto') as typeof import('crypto');
      const sigBaseString = `v0:${timestamp}:${rawBody}`;
      const expectedSig =
        'v0=' +
        crypto
          .createHmac('sha256', signingSecret)
          .update(sigBaseString)
          .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSig)
      );
    } catch {
      return false;
    }
  }

  // ── Private helpers ───────────────────────────────────────────────
  private async resolveTenantId(apiKey: string): Promise<string> {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      [Query.equal('apiKey', apiKey), Query.limit(1)]
    );
    if (result.documents.length === 0) {
      throw new Error('Invalid tenant API key');
    }
    return result.documents[0].$id;
  }

  private async findOrCreateConversation(
    tenantId: string,
    channelId: string,
    userId: string,
    threadTs: string
  ): Promise<string> {
    const { databases } = createAdminClient();
    const { ID: AppwriteID } = await import('node-appwrite');

    // Use thread timestamp as conversation identifier
    const existing = await databases.listDocuments<Conversation>(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      [
        Query.equal('tenantId', tenantId),
        Query.equal('channel', 'slack'),
        Query.equal('status', 'active'),
        Query.limit(50)
      ]
    );

    for (const conv of existing.documents) {
      const meta = safeJsonParse(conv.metadata);
      if (
        meta.channelId === channelId &&
        (meta.threadTs === threadTs || meta.ts === threadTs)
      ) {
        return conv.$id;
      }
    }

    const doc = await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      AppwriteID.unique(),
      {
        tenantId,
        channel: 'slack',
        status: 'active',
        userId,
        metadata: JSON.stringify({ channelId, threadTs, userId }),
        resolvedAt: null,
        firstResponseAt: null,
        csatScore: null,
        assignedTo: null
      }
    );

    return doc.$id;
  }
}

// Singleton
export const slackAdapter = new SlackAdapter();
