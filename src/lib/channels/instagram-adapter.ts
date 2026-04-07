/**
 * Instagram DM channel adapter (Meta Graph API).
 *
 * Handles inbound Instagram Direct Messages via Meta webhook and
 * sends replies through the Instagram Messaging API.
 *
 * Setup requirements:
 *   1. Meta Developer App with Instagram Product enabled
 *   2. Webhook subscription for `messages` field on `instagram` object
 *   3. Page access token with `instagram_manage_messages` permission
 */

import { ChannelAdapter, type IncomingMessage } from './base-adapter';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type { Conversation, ConversationChannel } from '@/types/appwrite';
import { Query } from 'node-appwrite';
import { createModuleLogger } from '@/lib/logger';

const log = createModuleLogger('instagram-adapter');
import crypto from 'node:crypto';
import { safeJsonParse } from '@/lib/safe-json-parse';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Webhook payload from Meta for Instagram messaging. */
export interface InstagramWebhookPayload {
  object: 'instagram';
  entry: Array<{
    id: string;
    time: number;
    messaging: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: {
        mid: string;
        text?: string;
        attachments?: Array<{
          type: string;
          payload: { url: string };
        }>;
      };
    }>;
  }>;
}

export interface InstagramParsedMessage {
  senderId: string;
  recipientId: string;
  messageId: string;
  text: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export class InstagramAdapter extends ChannelAdapter {
  readonly channelType: ConversationChannel = 'instagram';

  private get pageAccessToken(): string {
    return process.env.META_PAGE_ACCESS_TOKEN ?? '';
  }

  private get appSecret(): string {
    return process.env.META_APP_SECRET ?? '';
  }

  // ── Send message via Instagram Messaging API ──────────────────────
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

    const recipientId = convMeta.senderId as string | undefined;
    if (!recipientId) {
      log.error('No sender ID for conversation', {
        conversationId
      });
      return;
    }

    if (!this.pageAccessToken) {
      log.error('META_PAGE_ACCESS_TOKEN not configured');
      return;
    }

    // Instagram Send API — use Authorization header, never token in URL
    const response = await fetch(
      'https://graph.facebook.com/v19.0/me/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pageAccessToken}`
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: content }
        })
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      log.error('Send failed', {
        status: response.status,
        errorBody
      });
    }
  }

  // ── Parse inbound webhook payload ─────────────────────────────────
  async receiveMessage(payload: unknown): Promise<IncomingMessage> {
    const data = payload as InstagramParsedMessage & {
      tenantApiKey?: string;
    };

    const tenantApiKey = data.tenantApiKey;
    if (!tenantApiKey) {
      throw new Error('Missing tenantApiKey in Instagram webhook payload');
    }

    const tenantId = await this.resolveTenantId(tenantApiKey);
    const conversationId = await this.findOrCreateConversation(
      tenantId,
      data.senderId
    );

    return {
      tenantId,
      conversationId,
      content: data.text,
      channel: 'instagram',
      userId: data.senderId,
      metadata: {
        senderId: data.senderId,
        recipientId: data.recipientId,
        messageId: data.messageId
      }
    };
  }

  // ── Parse raw Meta webhook into individual messages ────────────────
  static parseWebhookPayload(
    body: InstagramWebhookPayload
  ): InstagramParsedMessage[] {
    const messages: InstagramParsedMessage[] = [];

    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        if (event.message?.text) {
          messages.push({
            senderId: event.sender.id,
            recipientId: event.recipient.id,
            messageId: event.message.mid,
            text: event.message.text,
            timestamp: event.timestamp
          });
        }
      }
    }

    return messages;
  }

  // ── Verify Meta webhook signature ─────────────────────────────────
  static verifySignature(
    rawBody: string,
    signature: string,
    appSecret: string
  ): boolean {
    if (!signature || !appSecret) return false;

    try {
      const expectedSig = crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex');
      const expected = `sha256=${expectedSig}`;
      // Timing-safe comparison to prevent side-channel attacks
      if (signature.length !== expected.length) return false;
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
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
    senderId: string
  ): Promise<string> {
    const { withLock } = await import('@/lib/cache/distributed-lock');
    const lockKey = `conv:instagram:${tenantId}:${senderId}`;

    return withLock(lockKey, async () => {
      const { databases } = createAdminClient();
      const { ID: AppwriteID } = await import('node-appwrite');

      const existing = await databases.listDocuments<Conversation>(
        APPWRITE_DATABASE,
        COLLECTION.CONVERSATIONS,
        [
          Query.equal('tenantId', tenantId),
          Query.equal('channel', 'instagram'),
          Query.equal('status', 'active'),
          Query.limit(50)
        ]
      );

      for (const conv of existing.documents) {
        const meta = safeJsonParse(conv.metadata);
        if (meta.senderId === senderId) {
          return conv.$id;
        }
      }

      const doc = await databases.createDocument(
        APPWRITE_DATABASE,
        COLLECTION.CONVERSATIONS,
        AppwriteID.unique(),
        {
          tenantId,
          channel: 'instagram',
          status: 'active',
          userId: senderId,
          metadata: JSON.stringify({ senderId }),
          resolvedAt: null,
          firstResponseAt: null,
          csatScore: null,
          assignedTo: null
        }
      );

      return doc.$id;
    });
  }
}

// Singleton
export const instagramAdapter = new InstagramAdapter();
