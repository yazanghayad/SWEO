import { NextRequest, NextResponse } from 'next/server';
import { applyIpRateLimit } from '@/lib/rate-limit/middleware';
import { logger } from '@/lib/logger';
import { handlePreflight } from '@/lib/cors';
import { contactBodySchema, formatZodError } from '@/lib/api-schemas';
import { apiOk, apiError } from '@/lib/api-response';

/**
 * POST /api/contact
 *
 * Public contact form endpoint. Sends an email via Resend HTTP API.
 *
 * Body: { name: string, email: string, subject?: string, message: string }
 */
export async function POST(req: NextRequest) {
  // ── Rate limit (IP-based, public endpoint) ─────────────────────
  const rateLimitResponse = await applyIpRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  // ─── Parse & validate body ─────────────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return apiError('Invalid JSON body.', 400, 'INVALID_JSON');
  }

  const parsed = contactBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiError(formatZodError(parsed.error), 400, 'VALIDATION_ERROR');
  }

  const { name, email, subject, message } = parsed.data;

  // ─── Env vars ───────────────────────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;
  const submitEmail = process.env.SUBMIT_EMAIL;
  const fromAddress = process.env.MAIL_FROM_ADDRESS ?? 'SWEO <onboarding@resend.dev>';

  if (!apiKey || !submitEmail) {
    logger.error('Missing RESEND_API_KEY or SUBMIT_EMAIL environment variables');
    return apiError('Server configuration error.', 500, 'CONFIG_ERROR');
  }

  // ─── Compose email ─────────────────────────────────────────────────
  const emailSubject = subject
    ? `Contact Form: ${subject}`
    : `New contact form submission from ${name}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
        New Contact Form Submission
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 100px;">Name</td>
          <td style="padding: 8px 12px;">${escapeHtml(name)}</td>
        </tr>
        <tr style="background: #f9f9f9;">
          <td style="padding: 8px 12px; font-weight: bold; color: #555;">Email</td>
          <td style="padding: 8px 12px;">
            <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
          </td>
        </tr>
        ${
          subject
            ? `<tr>
          <td style="padding: 8px 12px; font-weight: bold; color: #555;">Subject</td>
          <td style="padding: 8px 12px;">${escapeHtml(subject)}</td>
        </tr>`
            : ''
        }
      </table>
      <div style="margin-top: 20px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
        <h3 style="margin: 0 0 8px; color: #333;">Message</h3>
        <p style="margin: 0; white-space: pre-wrap; color: #444;">${escapeHtml(message)}</p>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        Sent via contact form at ${new Date().toISOString()}
      </p>
    </div>
  `;

  const textBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    subject ? `Subject: ${subject}` : null,
    '',
    'Message:',
    message
  ]
    .filter(Boolean)
    .join('\n');

  // ─── Send via Resend ──────────────────────────────────────────────
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [submitEmail],
        subject: emailSubject,
        html: htmlBody,
        text: textBody,
        reply_to: email
      })
    });

    const result = await response.json();

    if (!response.ok) {
      logger.error(`Resend error ${response.status}`, { result });
      return apiError('Failed to send email.', 500, 'EMAIL_SEND_FAILED');
    }

    return apiOk({ message: 'Email sent successfully.' });
  } catch (err) {
    logger.error('Failed to send email', { err });
    return apiError('Failed to send email. Please try again later.', 500, 'EMAIL_SEND_FAILED');
  }
}

/** CORS preflight for cross-origin contact form requests. */
export function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(str).replace(/[&<>"']/g, (c) => map[c]);
}
