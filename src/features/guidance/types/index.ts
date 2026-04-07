import type { Models } from 'node-appwrite';

export type GuidanceChannel = 'chat-email' | 'voice';

export type GuidanceCategory = 
  | 'communication_style' 
  | 'context_clarification' 
  | 'content_sources' 
  | 'spam' 
  | 'other';

export type ToneOption = 'friendly' | 'neutral' | 'matter-of-fact' | 'professional' | 'humorous';
export type LengthOption = 'concise' | 'standard' | 'thorough';

export interface GuidanceRule extends Models.Document {
  tenantId: string;
  channel: GuidanceChannel;
  category: GuidanceCategory;
  name: string;
  description?: string;
  ruleContent: string;
  enabled: boolean;
  tone?: ToneOption;
  length?: LengthOption;
}

export interface CreateGuidanceRuleInput {
  channel: GuidanceChannel;
  category: GuidanceCategory;
  name: string;
  description?: string;
  ruleContent: string;
  enabled?: boolean;
  tone?: ToneOption;
  length?: LengthOption;
}

export interface UpdateGuidanceRuleInput {
  name?: string;
  description?: string;
  ruleContent?: string;
  enabled?: boolean;
  tone?: ToneOption;
  length?: LengthOption;
}

// Category metadata for UI display
export const GUIDANCE_CATEGORY_META: Record<GuidanceCategory, { title: string; description: string }> = {
  communication_style: {
    title: 'Communication style',
    description: 'Create customized guidance on the vocabulary and terms SWEO should use.'
  },
  context_clarification: {
    title: 'Context and clarification', 
    description: 'Create customized guidance on the follow-up questions SWEO should ask.'
  },
  content_sources: {
    title: 'Content and sources',
    description: 'Create customized guidance on when and how SWEO should use specific articles or sources in responses.'
  },
  spam: {
    title: 'Spam',
    description: 'Create customized guidance on how SWEO should identify and handle potential spam messages.'
  },
  other: {
    title: 'Other',
    description: 'Any other guidance you want SWEO to follow.'
  }
};
