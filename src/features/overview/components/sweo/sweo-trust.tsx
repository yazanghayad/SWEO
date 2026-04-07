'use client';

import { useMemo } from 'react';
import { complianceBadges as complianceBadgesRaw } from './data';
import { useTranslations } from '@/lib/i18n';

/* ─── Trust Section (Compliance Marquee) ─── */
const BADGE_KEYS: Record<string, keyof typeof import('@/lib/i18n/dictionaries/en').default.data> = {
  'GDPR Compliant': 'gdprCompliant',
  'ISO 27001': 'iso27001',
  'EU Data Residency': 'euDataResidency',
  'SOC 2 Type II': 'soc2TypeII',
  'CCPA Compliant': 'ccpaCompliant',
};

export function SweoTrust() {
  const t = useTranslations();
  const complianceBadges = useMemo(() => complianceBadgesRaw.map(b => (t.data as Record<string, string>)[BADGE_KEYS[b]] ?? b), [t]);
  return (
    <div className="sweo-trust-marquee-wrapper overflow-hidden py-4 sm:py-8 border-y border-[var(--sweo-border-decorative)]">
      <div className="sweo-section-inner mb-4">
        <span
          className="text-[11px] tracking-wider uppercase text-[var(--sweo-content-tertiary)]"
          style={{ fontFamily: 'var(--sweo-font-mono)' }}
        >
          {t.trust.label}
        </span>
      </div>
      {/* Scrolling marquee */}
      <div className="relative flex overflow-hidden">
        <div className="sweo-marquee-track flex shrink-0 items-center gap-12">
          {[...complianceBadges, ...complianceBadges].map((badge, i) => (
            <div
              key={`${badge}-${i}`}
              className="sweo-compliance-badge flex shrink-0 items-center gap-2.5 px-5 py-3 border border-[var(--sweo-border-decorative)] rounded-full text-[var(--sweo-content-tertiary)] whitespace-nowrap"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <path
                  d="M10 1L3 4.5V9.5C3 14 6 17.5 10 19C14 17.5 17 14 17 9.5V4.5L10 1Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10L9 12L13 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">{badge}</span>
            </div>
          ))}
        </div>
        <div className="sweo-marquee-track flex shrink-0 items-center gap-12" aria-hidden="true">
          {[...complianceBadges, ...complianceBadges].map((badge, i) => (
            <div
              key={`dup-${badge}-${i}`}
              className="sweo-compliance-badge flex shrink-0 items-center gap-2.5 px-5 py-3 border border-[var(--sweo-border-decorative)] rounded-full text-[var(--sweo-content-tertiary)] whitespace-nowrap"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <path
                  d="M10 1L3 4.5V9.5C3 14 6 17.5 10 19C14 17.5 17 14 17 9.5V4.5L10 1Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10L9 12L13 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
