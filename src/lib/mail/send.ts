/**
 * Transactional email sending via Resend (free tier: 100 emails/day).
 *
 * Used for system emails: welcome, verification, password reset, etc.
 * NOT for customer support replies (those go through the channel adapter).
 *
 * In development without a RESEND_API_KEY, emails are logged to the console
 * so you can copy verification codes directly.
 */

import { logger } from '@/lib/logger';
import { maskEmail } from '@/lib/audit/logger';

const API_KEY = process.env.RESEND_API_KEY ?? '';
const FROM_ADDRESS =
  process.env.MAIL_FROM_ADDRESS ?? 'SWEO <onboarding@resend.dev>';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  tags?: string[];
}

/**
 * Send a transactional email via Resend.
 * Falls back to console logging in dev when no API key is set.
 * Returns true on success, false on failure (never throws).
 */
export async function sendMail(opts: SendMailOptions): Promise<boolean> {
  if (!API_KEY) {
    // Dev fallback: log email content to console so codes are visible
    logger.warn('RESEND_API_KEY not configured — logging email to console', { module: 'mail' });
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║              📧  DEV EMAIL OUTPUT               ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  To:      ${opts.to}`);
    console.log(`║  Subject: ${opts.subject}`);
    console.log('╠══════════════════════════════════════════════════╣');
    if (opts.text) {
      console.log(opts.text);
    } else {
      // Extract verification code from HTML if present
      const codeMatch = opts.html.match(
        /(\d{6})/
      );
      if (codeMatch) {
        console.log(`║  🔑 VERIFICATION CODE: ${codeMatch[1]}              ║`);
      }
    }
    console.log('╚══════════════════════════════════════════════════╝\n');
    return true; // Return true so the flow continues in dev
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: opts.from ?? FROM_ADDRESS,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        tags: opts.tags?.map((t) => ({ name: 'category', value: t }))
      })
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      logger.error('[mail] Resend send failed', {
        status: res.status,
        body,
        to: maskEmail(opts.to)
      });
      return false;
    }

    logger.info('[mail] Email sent', { to: maskEmail(opts.to), subject: opts.subject });
    return true;
  } catch (err) {
    logger.error('[mail] Failed to send email', { err, to: maskEmail(opts.to) });
    return false;
  }
}
