/**
 * Channel Adapters — Barrel Export
 *
 * Re-exports every channel adapter, helpers, and the abstract base class
 * from a single entry point for convenient imports:
 *
 *   import { EmailAdapter, WhatsAppAdapter, ChannelAdapter } from '@/lib/channels';
 */

// Base class & types
export { ChannelAdapter } from './base-adapter';
export type { IncomingMessage, OutgoingMessage } from './base-adapter';

// Concrete adapters
export { EmailAdapter, emailAdapter } from './email-adapter';
export { WhatsAppAdapter, whatsappAdapter } from './whatsapp-adapter';
export { SMSAdapter, smsAdapter } from './sms-adapter';
export { VoiceAdapter, voiceAdapter } from './voice-adapter';
export { InstagramAdapter, instagramAdapter } from './instagram-adapter';
export { FacebookMessengerAdapter, facebookMessengerAdapter } from './facebook-messenger-adapter';
export { SlackAdapter, slackAdapter } from './slack-adapter';

// Helpers
export { verifyTwilioSignature } from './twilio-verify';
