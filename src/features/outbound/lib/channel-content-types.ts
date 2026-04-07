/**
 * Channel-specific content types for outbound messages.
 *
 * Each channel (or group of similar channels) has a dedicated content shape.
 * The discriminant field `channelGroup` allows the composer to render the
 * correct editor and preview components.
 */

// ── Shared CTA fields ──────────────────────────────────────────
interface CtaConfig {
  ctaText?: string;
  ctaUrl?: string;
}

// ── Per-channel content shapes ─────────────────────────────────

export interface TextMessageContent extends CtaConfig {
  channelGroup: 'text';
  body: string;
}

export interface EmailContent extends CtaConfig {
  channelGroup: 'email';
  subject: string;
  body: string;
}

export interface BannerContent extends CtaConfig {
  channelGroup: 'banner';
  title: string;
  body: string;
  position: 'top' | 'bottom';
  style: 'info' | 'warning' | 'success' | 'error';
  dismissible: boolean;
}

export interface PostNewsContent extends CtaConfig {
  channelGroup: 'post-news';
  title: string;
  body: string;
}

export interface TooltipContent extends CtaConfig {
  channelGroup: 'tooltip';
  title: string;
  body: string;
  cssSelector: string;
}

export interface ProductTourStep {
  id: string;
  selector: string;
  title: string;
  body: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface ProductTourContent {
  channelGroup: 'product-tour';
  title: string;
  steps: ProductTourStep[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  url?: string;
}

export interface ChecklistContent {
  channelGroup: 'checklist';
  title: string;
  items: ChecklistItem[];
}

export interface SurveyContent {
  channelGroup: 'survey';
  title: string;
  question: string;
  questionType: 'rating' | 'text' | 'multiple-choice';
  choices?: string[];
}

export interface MobilePushContent {
  channelGroup: 'mobile-push';
  title: string;
  body: string;
  deepLinkUrl?: string;
}

export interface CarouselSlide {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
}

export interface MobileCarouselContent {
  channelGroup: 'mobile-carousel';
  title: string;
  slides: CarouselSlide[];
}

export interface GenericContent extends CtaConfig {
  channelGroup: 'generic';
  title?: string;
  body: string;
}

// ── Discriminated union ────────────────────────────────────────

export type ChannelContent =
  | TextMessageContent
  | EmailContent
  | BannerContent
  | PostNewsContent
  | TooltipContent
  | ProductTourContent
  | ChecklistContent
  | SurveyContent
  | MobilePushContent
  | MobileCarouselContent
  | GenericContent;

export type ChannelGroup = ChannelContent['channelGroup'];

// ── Channel → Group mapping ────────────────────────────────────

export const CHANNEL_GROUP_MAP: Record<string, ChannelGroup> = {
  'chat': 'text',
  'sms': 'text',
  'whatsapp': 'text',
  'email': 'email',
  'banner': 'banner',
  'post': 'post-news',
  'news': 'post-news',
  'tooltip': 'tooltip',
  'product-tour': 'product-tour',
  'checklist': 'checklist',
  'survey': 'survey',
  'mobile-push': 'mobile-push',
  'mobile-carousel': 'mobile-carousel',
  'workflow': 'generic',
  'broadcast': 'generic',
};

export function getChannelGroup(slug: string): ChannelGroup {
  return CHANNEL_GROUP_MAP[slug] ?? 'generic';
}

// ── Default content per group ──────────────────────────────────

export function getDefaultContent(group: ChannelGroup): ChannelContent {
  switch (group) {
    case 'text':
      return { channelGroup: 'text', body: '' };
    case 'email':
      return { channelGroup: 'email', subject: '', body: '' };
    case 'banner':
      return { channelGroup: 'banner', title: '', body: '', position: 'top', style: 'info', dismissible: true };
    case 'post-news':
      return { channelGroup: 'post-news', title: '', body: '' };
    case 'tooltip':
      return { channelGroup: 'tooltip', title: '', body: '', cssSelector: '' };
    case 'product-tour':
      return { channelGroup: 'product-tour', title: '', steps: [{ id: '1', selector: '', title: '', body: '', position: 'bottom' }] };
    case 'checklist':
      return { channelGroup: 'checklist', title: '', items: [{ id: '1', label: '' }] };
    case 'survey':
      return { channelGroup: 'survey', title: '', question: '', questionType: 'rating' };
    case 'mobile-push':
      return { channelGroup: 'mobile-push', title: '', body: '' };
    case 'mobile-carousel':
      return { channelGroup: 'mobile-carousel', title: '', slides: [{ id: '1', title: '', body: '' }] };
    case 'generic':
    default:
      return { channelGroup: 'generic', body: '' };
  }
}

// ── Backward-compat normalizer ─────────────────────────────────

export function normalizeContent(raw: string, channelSlug?: string): ChannelContent {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.channelGroup) return parsed as ChannelContent;
    // Legacy shape: { subject?, body, templateId? }
    if (channelSlug) {
      const group = getChannelGroup(channelSlug);
      const defaults = getDefaultContent(group);
      return { ...defaults, ...parsed };
    }
    return {
      channelGroup: 'generic',
      title: parsed.subject,
      body: parsed.body ?? '',
      ctaText: parsed.ctaText,
      ctaUrl: parsed.ctaUrl,
    };
  } catch {
    return { channelGroup: 'generic', body: '' };
  }
}
