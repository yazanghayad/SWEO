'use client';

import type { ChannelContent, ChannelGroup } from '../../lib/channel-content-types';
import EditorText from './editor-text';
import EditorEmail from './editor-email';
import EditorBanner from './editor-banner';
import EditorPostNews from './editor-post-news';
import EditorTooltip from './editor-tooltip';
import EditorProductTour from './editor-product-tour';
import EditorChecklist from './editor-checklist';
import EditorSurvey from './editor-survey';
import EditorMobilePush from './editor-mobile-push';
import EditorMobileCarousel from './editor-mobile-carousel';
import EditorGeneric from './editor-generic';
import type { ComponentType } from 'react';

export interface ChannelEditorProps {
  value: ChannelContent;
  onChange: (v: ChannelContent) => void;
  channelSlug: string;
}

const EDITOR_MAP: Record<ChannelGroup, ComponentType<any>> = {
  'text': EditorText,
  'email': EditorEmail,
  'banner': EditorBanner,
  'post-news': EditorPostNews,
  'tooltip': EditorTooltip,
  'product-tour': EditorProductTour,
  'checklist': EditorChecklist,
  'survey': EditorSurvey,
  'mobile-push': EditorMobilePush,
  'mobile-carousel': EditorMobileCarousel,
  'generic': EditorGeneric,
};

export function getEditorComponent(channelGroup: ChannelGroup): ComponentType<any> {
  return EDITOR_MAP[channelGroup] ?? EditorGeneric;
}
