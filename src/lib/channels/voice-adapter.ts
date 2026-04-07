/**
 * Voice channel adapter (Twilio Voice + OpenAI Whisper STT / TTS).
 *
 * Handles inbound phone calls via Twilio webhook.  The flow:
 *   1. Twilio streams call audio to our `/api/webhooks/voice` endpoint.
 *   2. We transcribe it using OpenAI Whisper (speech-to-text).
 *   3. The transcript goes through the orchestrator for an AI response.
 *   4. The response is converted to speech via OpenAI TTS.
 *   5. TwiML streams the audio back to the caller.
 */

import { ChannelAdapter, type IncomingMessage } from './base-adapter';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type { Conversation, ConversationChannel } from '@/types/appwrite';
import { Query } from 'node-appwrite';
import { createModuleLogger } from '@/lib/logger';

const log = createModuleLogger('voice-adapter');
import { safeJsonParse } from '@/lib/safe-json-parse';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TwilioVoicePayload {
  /** Caller phone number. */
  From: string;
  /** Called number. */
  To: string;
  /** Twilio Call SID. */
  CallSid: string;
  /** Account SID for verification. */
  AccountSid: string;
  /** Call status: ringing | in-progress | completed | busy | failed | no-answer. */
  CallStatus: string;
  /** Call direction. */
  Direction: 'inbound' | 'outbound-api' | 'outbound-dial';
  /** City of the caller (optional). */
  CallerCity?: string;
  /** Country of the caller (optional). */
  CallerCountry?: string;
  /** Speech-to-text result from Twilio <Gather> (optional). */
  SpeechResult?: string;
  /** Confidence score for SpeechResult (0-1). */
  Confidence?: string;
  /** Tenant API key passed via query param. */
  tenantApiKey?: string;
}

export interface VoiceResponse {
  /** TwiML response body. */
  twiml: string;
  /** The AI content that was spoken. */
  content: string;
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export class VoiceAdapter extends ChannelAdapter {
  readonly channelType: ConversationChannel = 'voice';

  private get accountSid(): string {
    return process.env.TWILIO_ACCOUNT_SID ?? '';
  }

  private get authToken(): string {
    return process.env.TWILIO_AUTH_TOKEN ?? '';
  }

  private get phoneNumber(): string {
    return process.env.TWILIO_PHONE_NUMBER ?? '';
  }

  private get openaiApiKey(): string {
    return process.env.OPENAI_API_KEY ?? '';
  }

  // -------------------------------------------------------------------------
  // ChannelAdapter implementation
  // -------------------------------------------------------------------------

  /**
   * Send a voice reply back to the caller.
   *
   * For voice channels, "sending" means generating TwiML with a <Say> or
   * <Play> verb (for TTS audio).  The TwiML is returned from the webhook
   * handler rather than pushed asynchronously.
   *
   * This method creates a TTS audio URL and returns a TwiML <Play> response.
   */
  async sendMessage(
    conversationId: string,
    content: string,
    _metadata?: Record<string, unknown>
  ): Promise<void> {
    // Voice responses are synchronous TwiML – actual sending happens in
    // the webhook handler.  This is a no-op; the TwiML is constructed
    // in `handleVoiceCall()` instead.
    log.info('sendMessage called', {
      conversationId,
      contentLength: content.length
    });
  }

  /**
   * Parse a Twilio Voice webhook payload into IncomingMessage.
   */
  async receiveMessage(payload: unknown): Promise<IncomingMessage> {
    const data = payload as TwilioVoicePayload;
    const phoneNumber = data.From;

    const tenantApiKey = data.tenantApiKey;
    if (!tenantApiKey) {
      throw new Error('Missing tenantApiKey in voice webhook payload');
    }

    const tenantId = await this.resolveTenantId(tenantApiKey);
    const conversationId = await this.findOrCreateConversation(
      tenantId,
      phoneNumber,
      data.CallSid
    );

    // If Twilio <Gather> provided STT, use that; otherwise fall back to
    // whatever is in the body (we'll do our own STT in handleVoiceCall).
    const content = data.SpeechResult ?? '';

    return {
      tenantId,
      conversationId,
      content,
      channel: 'voice',
      userId: phoneNumber,
      metadata: {
        phoneNumber,
        callSid: data.CallSid,
        callStatus: data.CallStatus,
        callerCity: data.CallerCity,
        callerCountry: data.CallerCountry,
        confidence: data.Confidence
      }
    };
  }

  // -------------------------------------------------------------------------
  // Voice-specific public methods
  // -------------------------------------------------------------------------

  /**
   * Generate initial TwiML to greet the caller and start gathering speech.
   */
  generateGreetingTwiml(callbackUrl: string): string {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<Response>',
      '  <Say voice="Polly.Joanna" language="en-US">',
      '    Hello! I&#39;m SWEO, your AI assistant. How can I help you today?',
      '  </Say>',
      `  <Gather input="speech" timeout="5" speechTimeout="auto" action="${this.escapeXml(callbackUrl)}" method="POST">`,
      '    <Say voice="Polly.Joanna" language="en-US">Please speak after the tone.</Say>',
      '  </Gather>',
      '  <Say voice="Polly.Joanna" language="en-US">I didn&#39;t catch that. Goodbye!</Say>',
      '</Response>'
    ].join('\n');
  }

  /**
   * Handle a voice call turn: take the STT result, run the orchestrator,
   * and return TwiML with the AI response + gather for next input.
   */
  async handleVoiceCall(
    payload: TwilioVoicePayload,
    callbackUrl: string
  ): Promise<VoiceResponse> {
    const speechResult = payload.SpeechResult ?? '';

    if (!speechResult.trim()) {
      const twiml = this.buildTwiml(
        'I didn\'t catch that. Could you please repeat?',
        callbackUrl
      );
      return { twiml, content: '' };
    }

    // Parse the incoming message
    const message = await this.receiveMessage(payload);

    // Run through orchestrator
    const { orchestrate } = await import('@/lib/ai/orchestrator');
    const result = await orchestrate({
      tenantId: message.tenantId,
      conversationId: message.conversationId,
      userMessage: speechResult,
      channel: 'voice',
      userId: message.userId
    });

    const aiResponse =
      result.content ??
      'I\'m sorry, I wasn\'t able to help with that. Let me connect you to a human agent.';

    // If escalated, transfer to human
    if (result.escalated) {
      const twiml = this.buildTransferTwiml(aiResponse);
      return { twiml, content: aiResponse };
    }

    // Build TwiML with the AI response and continue gathering
    const twiml = this.buildTwiml(aiResponse, callbackUrl);
    return { twiml, content: aiResponse };
  }

  /**
   * Transcribe audio using OpenAI Whisper API.
   * Used when we receive raw audio instead of Twilio <Gather> STT.
   */
  async transcribeAudio(audioBuffer: Buffer, mimeType = 'audio/wav'): Promise<string> {
    if (!this.openaiApiKey) {
      log.error('OpenAI API key not configured');
      return '';
    }

    const formData = new FormData();
    const arrayBuffer = audioBuffer.buffer.slice(
      audioBuffer.byteOffset,
      audioBuffer.byteOffset + audioBuffer.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: mimeType });
    formData.append('file', blob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.openaiApiKey}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      log.error('Whisper transcription failed', {
        status: response.status,
        errorBody
      });
      return '';
    }

    const result = (await response.json()) as { text: string };
    return result.text;
  }

  /**
   * Convert text to speech using OpenAI TTS API.
   * Returns raw audio bytes (mp3).
   */
  async textToSpeech(
    text: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova'
  ): Promise<Buffer> {
    if (!this.openaiApiKey) {
      log.error('OpenAI API key not configured');
      return Buffer.alloc(0);
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice,
        input: text,
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      log.error('OpenAI TTS failed', {
        status: response.status,
        errorBody
      });
      return Buffer.alloc(0);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // -------------------------------------------------------------------------
  // TwiML helpers
  // -------------------------------------------------------------------------

  /**
   * Build a TwiML response that says the AI response and gathers more input.
   */
  private buildTwiml(message: string, callbackUrl: string): string {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<Response>',
      `  <Say voice="Polly.Joanna" language="en-US">${this.escapeXml(message)}</Say>`,
      `  <Gather input="speech" timeout="5" speechTimeout="auto" action="${this.escapeXml(callbackUrl)}" method="POST">`,
      '    <Say voice="Polly.Joanna" language="en-US">Is there anything else I can help you with?</Say>',
      '  </Gather>',
      '  <Say voice="Polly.Joanna" language="en-US">Thank you for calling. Goodbye!</Say>',
      '</Response>'
    ].join('\n');
  }

  /**
   * Build a TwiML response that says a message and then transfers to a human.
   */
  private buildTransferTwiml(message: string): string {
    const transferNumber = process.env.TWILIO_TRANSFER_NUMBER ?? this.phoneNumber;
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<Response>',
      `  <Say voice="Polly.Joanna" language="en-US">${this.escapeXml(message)}</Say>`,
      '  <Say voice="Polly.Joanna" language="en-US">Let me connect you to a human agent. Please hold.</Say>',
      `  <Dial>${this.escapeXml(transferNumber)}</Dial>`,
      '</Response>'
    ].join('\n');
  }

  /**
   * Escape special XML characters.
   */
  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // -------------------------------------------------------------------------
  // Appwrite helpers
  // -------------------------------------------------------------------------

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
    phoneNumber: string,
    callSid: string
  ): Promise<string> {
    const { databases } = createAdminClient();
    const { ID: AppwriteID } = await import('node-appwrite');

    // Check for an active voice conversation with this call SID
    const existing = await databases.listDocuments<Conversation>(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      [
        Query.equal('tenantId', tenantId),
        Query.equal('channel', 'voice'),
        Query.equal('status', 'active'),
        Query.limit(20)
      ]
    );

    for (const conv of existing.documents) {
      const meta = safeJsonParse(conv.metadata);
      if (meta.callSid === callSid) {
        return conv.$id;
      }
    }

    // Create new conversation for this call
    const doc = await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONVERSATIONS,
      AppwriteID.unique(),
      {
        tenantId,
        channel: 'voice',
        status: 'active',
        userId: phoneNumber,
        metadata: JSON.stringify({ phoneNumber, callSid }),
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
export const voiceAdapter = new VoiceAdapter();
