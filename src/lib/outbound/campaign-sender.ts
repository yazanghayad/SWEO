/**
 * Outbound Campaign Sender
 *
 * Handles the actual sending of outbound campaigns across channels.
 * Supports immediate and scheduled sending, with per-channel delivery
 * via the existing channel adapters (email, SMS, WhatsApp) or
 * in-app delivery (chat, banner, tooltip, etc.).
 */

import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query } from 'node-appwrite';
import type {
  OutboundMessage,
  OutboundChannel,
  Contact,
  Tenant,
  TenantConfig
} from '@/types/appwrite';
import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SendResult {
  messageId: string;
  totalRecipients: number;
  sent: number;
  failed: number;
  errors: Array<{ contactId: string; error: string }>;
}

interface ParsedSchedule {
  type: 'immediate' | 'scheduled';
  sendAt?: string;
}

interface ParsedAudience {
  type: 'all' | 'rules';
  rules: Array<{ field: string; operator: string; value: string }>;
}

interface ParsedContent {
  subject?: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  title?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Channel capabilities
// ---------------------------------------------------------------------------

/** Channels that require external delivery (email, SMS, WhatsApp) */
const PUSH_CHANNELS: OutboundChannel[] = ['email', 'sms', 'whatsapp', 'mobile-push'];

/** Channels delivered in-app (stored and shown to matching users) */
const INAPP_CHANNELS: OutboundChannel[] = [
  'chat', 'banner', 'post', 'tooltip', 'product-tour',
  'checklist', 'survey', 'mobile-carousel', 'news', 'broadcast', 'workflow'
];

// ---------------------------------------------------------------------------
// Main send function
// ---------------------------------------------------------------------------

/**
 * Execute a campaign send. Updates the message status and metrics.
 */
export async function sendCampaign(messageId: string): Promise<SendResult> {
  const { databases } = createAdminClient();

  // 1. Load the message
  const message = await databases.getDocument<OutboundMessage>(
    APPWRITE_DATABASE,
    COLLECTION.OUTBOUND_MESSAGES,
    messageId
  );

  // 2. Guard: only send draft/active messages
  if (!['draft', 'active'].includes(message.status)) {
    throw new Error(`Cannot send message with status "${message.status}"`);
  }

  // 3. Mark as sending
  await databases.updateDocument(
    APPWRITE_DATABASE,
    COLLECTION.OUTBOUND_MESSAGES,
    messageId,
    { status: 'sending' }
  );

  const content: ParsedContent = JSON.parse(message.content);
  const audience: ParsedAudience = JSON.parse(message.audience);

  try {
    // 4. Resolve recipients
    const recipients = await resolveAudience(message.tenantId, audience);

    if (recipients.length === 0) {
      // No recipients — mark as sent with 0
      await databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.OUTBOUND_MESSAGES,
        messageId,
        { status: 'sent', sentCount: 0 }
      );
      return { messageId, totalRecipients: 0, sent: 0, failed: 0, errors: [] };
    }

    // 5. Deliver based on channel type
    let result: SendResult;

    if (PUSH_CHANNELS.includes(message.channel)) {
      result = await deliverPush(message, content, recipients);
    } else if (INAPP_CHANNELS.includes(message.channel)) {
      result = await deliverInApp(message, content, recipients);
    } else {
      result = {
        messageId,
        totalRecipients: recipients.length,
        sent: recipients.length,
        failed: 0,
        errors: []
      };
    }

    // 6. Update message with results
    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId,
      {
        status: result.failed === result.totalRecipients ? 'failed' : 'sent',
        sentCount: result.sent,
        metadata: JSON.stringify({
          ...JSON.parse(message.metadata || '{}'),
          sentAt: new Date().toISOString(),
          totalRecipients: result.totalRecipients,
          failedCount: result.failed
        })
      }
    );

    logger.info('[outbound] Campaign sent', {
      messageId,
      channel: message.channel,
      sent: result.sent,
      failed: result.failed
    });

    return result;
  } catch (err) {
    // Mark as failed on unrecoverable error
    await databases.updateDocument(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId,
      {
        status: 'failed',
        metadata: JSON.stringify({
          ...JSON.parse(message.metadata || '{}'),
          error: err instanceof Error ? err.message : 'Unknown error',
          failedAt: new Date().toISOString()
        })
      }
    );
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Audience resolution
// ---------------------------------------------------------------------------

interface Recipient {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
}

async function resolveAudience(
  tenantId: string,
  audience: ParsedAudience
): Promise<Recipient[]> {
  const { databases } = createAdminClient();

  const queries: string[] = [
    Query.equal('tenantId', tenantId),
    Query.limit(1000) // Batch limit
  ];

  // Apply audience rules as filters
  if (audience.type === 'rules' && audience.rules.length > 0) {
    for (const rule of audience.rules) {
      switch (rule.operator) {
        case 'equals':
        case 'is':
          queries.push(Query.equal(rule.field, rule.value));
          break;
        case 'contains':
          queries.push(Query.search(rule.field, rule.value));
          break;
        case 'not_equals':
        case 'is_not':
          queries.push(Query.notEqual(rule.field, rule.value));
          break;
        // For unsupported operators, skip the filter (apply in-memory if needed)
        default:
          break;
      }
    }
  }

  try {
    const result = await databases.listDocuments<Contact>(
      APPWRITE_DATABASE,
      COLLECTION.CONTACTS,
      queries
    );

    return result.documents.map((doc) => ({
      id: doc.$id,
      email: doc.email || undefined,
      phone: doc.phone || undefined,
      name: doc.name || undefined
    }));
  } catch {
    // If CONTACTS collection doesn't exist or query fails, return empty
    logger.warn('[outbound] Could not resolve audience', { tenantId });
    return [];
  }
}

// ---------------------------------------------------------------------------
// Push delivery (email, SMS, WhatsApp, mobile push)
// ---------------------------------------------------------------------------

async function deliverPush(
  message: OutboundMessage,
  content: ParsedContent,
  recipients: Recipient[]
): Promise<SendResult> {
  const errors: Array<{ contactId: string; error: string }> = [];
  let sent = 0;

  for (const recipient of recipients) {
    try {
      switch (message.channel) {
        case 'email':
          await sendEmail(recipient, content, message.tenantId);
          break;
        case 'sms':
        case 'whatsapp':
          await sendSmsOrWhatsApp(message.channel, recipient, content);
          break;
        case 'mobile-push':
          // Mobile push would need FCM/APNS — log for now
          logger.info('[outbound] Mobile push placeholder', {
            recipientId: recipient.id
          });
          break;
        default:
          break;
      }
      sent++;
    } catch (err) {
      errors.push({
        contactId: recipient.id,
        error: err instanceof Error ? err.message : 'Send failed'
      });
    }
  }

  return {
    messageId: message.$id,
    totalRecipients: recipients.length,
    sent,
    failed: errors.length,
    errors
  };
}

// ---------------------------------------------------------------------------
// In-app delivery (store for widget/display)
// ---------------------------------------------------------------------------

async function deliverInApp(
  message: OutboundMessage,
  _content: ParsedContent,
  recipients: Recipient[]
): Promise<SendResult> {
  const { databases } = createAdminClient();
  const { ID } = await import('node-appwrite');

  let sent = 0;
  const errors: Array<{ contactId: string; error: string }> = [];

  // Store a delivery record per recipient so the widget/SDK can fetch them
  for (const recipient of recipients) {
    try {
      await databases.createDocument(
        APPWRITE_DATABASE,
        COLLECTION.OUTBOUND_DELIVERIES,
        ID.unique(),
        {
          tenantId: message.tenantId,
          messageId: message.$id,
          contactId: recipient.id,
          channel: message.channel,
          status: 'delivered',
          content: message.content,
          deliveredAt: new Date().toISOString(),
          readAt: null,
          clickedAt: null
        }
      );
      sent++;
    } catch (err) {
      errors.push({
        contactId: recipient.id,
        error: err instanceof Error ? err.message : 'Delivery failed'
      });
    }
  }

  return {
    messageId: message.$id,
    totalRecipients: recipients.length,
    sent,
    failed: errors.length,
    errors
  };
}

// ---------------------------------------------------------------------------
// Email sender (uses existing Resend/SendGrid config)
// ---------------------------------------------------------------------------

async function loadTenantConfig(tenantId: string): Promise<TenantConfig> {
  try {
    const { databases } = createAdminClient();
    const tenant = await databases.getDocument<Tenant>(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      tenantId
    );
    const cfg: TenantConfig =
      typeof tenant.config === 'string'
        ? JSON.parse(tenant.config)
        : (tenant.config as unknown as TenantConfig);
    return cfg;
  } catch {
    return {} as TenantConfig;
  }
}

function wrapEmailWithBranding(
  body: string,
  cfg: TenantConfig
): string {
  const brandColor = cfg.brandColor ?? '#6366f1';
  const companyName = cfg.companyName || cfg.botName || 'Support';
  const logoHtml = cfg.emailLogoUrl
    ? `<img src="${cfg.emailLogoUrl}" alt="${companyName}" style="max-height:40px;max-width:200px;" />`
    : `<span style="font-size:18px;font-weight:700;color:${brandColor};">${companyName}</span>`;

  const poweredByHtml = cfg.whiteLabel
    ? ''
    : '<p style="color:#999;font-size:11px;margin-top:20px;">Powered by SWEO</p>';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
  <tr><td style="padding:24px 32px;border-bottom:3px solid ${brandColor};">
    ${logoHtml}
  </td></tr>
  <tr><td style="padding:32px;">
    ${body}
  </td></tr>
  <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;">
    ${poweredByHtml}
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

async function sendEmail(
  recipient: Recipient,
  content: ParsedContent,
  tenantId: string
): Promise<void> {
  if (!recipient.email) {
    throw new Error('Recipient has no email address');
  }

  const apiKey = process.env.EMAIL_API_KEY;
  const provider = process.env.EMAIL_PROVIDER ?? 'resend';

  if (!apiKey) {
    throw new Error('EMAIL_API_KEY not configured');
  }

  // Load tenant branding for email
  const cfg = await loadTenantConfig(tenantId);
  const senderName = cfg.emailSenderName || cfg.companyName || 'Support';
  const fromAddress = cfg.supportEmail || process.env.EMAIL_FROM_ADDRESS || 'noreply@sweo.se';
  const fromField = `${senderName} <${fromAddress}>`;

  const subject = content.subject || content.title || `Message from ${senderName}`;
  const body = wrapEmailWithBranding(content.body, cfg);

  if (provider === 'resend') {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromField,
        to: recipient.email,
        subject,
        html: body
      })
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Resend error ${res.status}: ${errBody}`);
    }
  } else if (provider === 'sendgrid') {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: recipient.email }] }],
        from: { email: fromAddress, name: senderName },
        subject,
        content: [{ type: 'text/html', value: body }]
      })
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`SendGrid error ${res.status}: ${errBody}`);
    }
  }
}

// ---------------------------------------------------------------------------
// SMS / WhatsApp sender (uses Twilio)
// ---------------------------------------------------------------------------

async function sendSmsOrWhatsApp(
  channel: 'sms' | 'whatsapp',
  recipient: Recipient,
  content: ParsedContent
): Promise<void> {
  if (!recipient.phone) {
    throw new Error('Recipient has no phone number');
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber =
    channel === 'whatsapp'
      ? process.env.TWILIO_WHATSAPP_NUMBER
      : process.env.TWILIO_SMS_NUMBER;

  if (!accountSid || !authToken || !twilioNumber) {
    throw new Error('Twilio credentials not configured');
  }

  const toNumber =
    channel === 'whatsapp'
      ? `whatsapp:${recipient.phone}`
      : recipient.phone;
  const fromNumber =
    channel === 'whatsapp'
      ? `whatsapp:${twilioNumber}`
      : twilioNumber;

  const body = content.body;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: toNumber,
        From: fromNumber,
        Body: body
      }).toString()
    }
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Twilio error ${res.status}: ${errBody}`);
  }
}

// ---------------------------------------------------------------------------
// Schedule checker — call this from a cron/API route
// ---------------------------------------------------------------------------

/**
 * Process all scheduled messages that are due. Returns IDs of sent messages.
 */
export async function processScheduledCampaigns(): Promise<string[]> {
  const { databases } = createAdminClient();

  // Find active messages with scheduled type that are due
  const now = new Date().toISOString();

  const result = await databases.listDocuments<OutboundMessage>(
    APPWRITE_DATABASE,
    COLLECTION.OUTBOUND_MESSAGES,
    [
      Query.equal('status', 'active'),
      Query.limit(20) // Process in batches
    ]
  );

  const sentIds: string[] = [];

  for (const message of result.documents) {
    try {
      const schedule: ParsedSchedule = JSON.parse(message.schedule);

      if (schedule.type !== 'scheduled' || !schedule.sendAt) {
        continue;
      }

      // Check if it's time to send
      if (new Date(schedule.sendAt) <= new Date(now)) {
        await sendCampaign(message.$id);
        sentIds.push(message.$id);
      }
    } catch (err) {
      logger.error('[outbound] Failed to process scheduled campaign', {
        messageId: message.$id,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  return sentIds;
}
