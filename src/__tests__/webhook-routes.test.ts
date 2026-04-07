import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────

vi.mock('@/lib/rate-limit/middleware', () => ({
  applyIpRateLimit: vi.fn().mockResolvedValue(null)
}));

vi.mock('@/lib/channels/twilio-verify', () => ({
  verifyTwilioSignature: vi.fn().mockReturnValue(true),
  buildWebhookUrl: vi.fn().mockReturnValue('https://example.com/api/webhooks/whatsapp')
}));

const mockHandleIncoming = vi.fn().mockResolvedValue({
  resolved: true,
  content: 'AI response',
  conversationId: 'conv-1'
});

vi.mock('@/lib/channels/whatsapp-adapter', () => ({
  whatsappAdapter: {
    handleIncoming: (...args: unknown[]) => mockHandleIncoming(...args)
  }
}));

const mockSmsHandleIncoming = vi.fn().mockResolvedValue({
  resolved: true,
  content: 'SMS AI response',
  conversationId: 'conv-sms-1'
});

vi.mock('@/lib/channels/sms-adapter', () => ({
  smsAdapter: {
    handleIncoming: (...args: unknown[]) => mockSmsHandleIncoming(...args)
  }
}));

vi.mock('@/lib/channels/email-adapter', () => ({
  emailAdapter: {
    handleIncoming: vi.fn().mockResolvedValue({
      resolved: true,
      content: 'Email AI response'
    })
  }
}));

vi.mock('@/lib/sanitize', () => ({
  sanitizeText: vi.fn((s: string) => s)
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));

// ── Tests ────────────────────────────────────────────────────────────────

describe('WhatsApp webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when API key is missing', async () => {
    const { POST } = await import('@/app/api/webhooks/whatsapp/route');

    const req = new NextRequest(
      'http://localhost:3000/api/webhooks/whatsapp',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ From: '+1234', Body: 'Hello' })
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toContain('Missing tenant API key');
  });

  it('returns 400 when required fields are missing', async () => {
    const { POST } = await import('@/app/api/webhooks/whatsapp/route');

    const req = new NextRequest(
      'http://localhost:3000/api/webhooks/whatsapp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-api-key': 'test-key'
        },
        body: JSON.stringify({ From: '+1234' }) // missing Body
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 403 when Twilio signature is invalid', async () => {
    const { verifyTwilioSignature } = await import(
      '@/lib/channels/twilio-verify'
    );
    vi.mocked(verifyTwilioSignature).mockReturnValueOnce(false);

    const { POST } = await import('@/app/api/webhooks/whatsapp/route');

    const req = new NextRequest(
      'http://localhost:3000/api/webhooks/whatsapp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-api-key': 'test-key'
        },
        body: JSON.stringify({ From: '+1234567890', Body: 'Hi' })
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('processes valid WhatsApp message and returns TwiML', async () => {
    const { POST } = await import('@/app/api/webhooks/whatsapp/route');

    const req = new NextRequest(
      'http://localhost:3000/api/webhooks/whatsapp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-twilio-signature': 'valid',
          'x-tenant-api-key': 'test-key'
        },
        body: JSON.stringify({
          From: 'whatsapp:+1234567890',
          Body: 'What is your return policy?',
          MessageSid: 'SM123'
        })
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(200);

    const text = await res.text();
    expect(text).toContain('<Response>');
    expect(mockHandleIncoming).toHaveBeenCalled();
  });

  it('returns 500 when processing fails to trigger Twilio retry', async () => {
    mockHandleIncoming.mockRejectedValueOnce(new Error('DB connection lost'));

    const { POST } = await import('@/app/api/webhooks/whatsapp/route');

    const req = new NextRequest(
      'http://localhost:3000/api/webhooks/whatsapp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-twilio-signature': 'valid',
          'x-tenant-api-key': 'test-key'
        },
        body: JSON.stringify({
          From: 'whatsapp:+1234567890',
          Body: 'Hello',
          MessageSid: 'SM456'
        })
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(500);

    const text = await res.text();
    // Should still be valid TwiML
    expect(text).toContain('<Response>');
  });
});

describe('Email webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when API key is missing', async () => {
    const { POST } = await import('@/app/api/webhooks/email/route');

    const req = new NextRequest('http://localhost:3000/api/webhooks/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'customer@example.com',
        subject: 'Help',
        text: 'I need help'
      })
    });

    const res = await POST(req);
    // Should be 401 or 403 (depends on signature check)
    expect([401, 403]).toContain(res.status);
  });
});

describe('SMS webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when API key is missing', async () => {
    const { POST } = await import('@/app/api/webhooks/sms/route');

    const req = new NextRequest('http://localhost:3000/api/webhooks/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ From: '+1234', Body: 'Hi' })
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 500 when processing fails to trigger Twilio retry', async () => {
    mockSmsHandleIncoming.mockRejectedValueOnce(
      new Error('Orchestrator timeout')
    );

    const { POST } = await import('@/app/api/webhooks/sms/route');

    const req = new NextRequest('http://localhost:3000/api/webhooks/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-twilio-signature': 'valid',
        'x-tenant-api-key': 'test-key'
      },
      body: JSON.stringify({
        From: '+1234567890',
        Body: 'Help me',
        MessageSid: 'SM789'
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const text = await res.text();
    expect(text).toContain('<Response>');
  });
});

describe('Messenger webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET rejects invalid verification challenge', async () => {
    const { GET } = await import('@/app/api/webhooks/messenger/route');

    const req = new NextRequest(
      'http://localhost:3000/api/webhooks/messenger?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=abc123',
      { method: 'GET' }
    );

    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('POST returns 401 when API key is missing', async () => {
    const { POST } = await import('@/app/api/webhooks/messenger/route');

    const req = new NextRequest(
      'http://localhost:3000/api/webhooks/messenger',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ object: 'page', entry: [] })
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});

describe('Instagram webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET rejects invalid verification', async () => {
    const { GET } = await import('@/app/api/webhooks/instagram/route');

    const req = new NextRequest(
      'http://localhost:3000/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=test',
      { method: 'GET' }
    );

    const res = await GET(req);
    expect(res.status).toBe(403);
  });
});
