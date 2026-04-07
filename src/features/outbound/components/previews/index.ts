import type { ChannelGroup } from '../../lib/channel-content-types';
import type { ComponentType } from 'react';

import { PreviewText } from './preview-text';
import { PreviewEmail } from './preview-email';
import { PreviewBanner } from './preview-banner';
import { PreviewPostNews } from './preview-post-news';
import { PreviewTooltip } from './preview-tooltip';
import { PreviewProductTour } from './preview-product-tour';
import { PreviewChecklist } from './preview-checklist';
import { PreviewSurvey } from './preview-survey';
import { PreviewMobilePush } from './preview-mobile-push';
import { PreviewMobileCarousel } from './preview-mobile-carousel';
import { PreviewGeneric } from './preview-generic';

const PREVIEW_MAP: Record<ChannelGroup, ComponentType<{ value: any; channelSlug: string }>> = {
  'text': PreviewText,
  'email': PreviewEmail,
  'banner': PreviewBanner,
  'post-news': PreviewPostNews,
  'tooltip': PreviewTooltip,
  'product-tour': PreviewProductTour,
  'checklist': PreviewChecklist,
  'survey': PreviewSurvey,
  'mobile-push': PreviewMobilePush,
  'mobile-carousel': PreviewMobileCarousel,
  'generic': PreviewGeneric,
};

export function getPreviewComponent(
  channelGroup: ChannelGroup,
): ComponentType<{ value: any; channelSlug: string }> {
  return PREVIEW_MAP[channelGroup] ?? PreviewGeneric;
}

export { PREVIEW_MAP };

export { PreviewText } from './preview-text';
export { PreviewEmail } from './preview-email';
export { PreviewBanner } from './preview-banner';
export { PreviewPostNews } from './preview-post-news';
export { PreviewTooltip } from './preview-tooltip';
export { PreviewProductTour } from './preview-product-tour';
export { PreviewChecklist } from './preview-checklist';
export { PreviewSurvey } from './preview-survey';
export { PreviewMobilePush } from './preview-mobile-push';
export { PreviewMobileCarousel } from './preview-mobile-carousel';
export { PreviewGeneric } from './preview-generic';
