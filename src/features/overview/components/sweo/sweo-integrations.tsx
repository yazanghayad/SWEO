/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import {
  ZohoDeskLogo,
  WhatsAppLogo,
  GorgiasLogo,
  ZendeskLogo,
  SalesforceLogo,
  SprinklrLogo,
  FrontLogo,
  JiraLogo,
  FreshdeskLogo,
  HubSpotLogo,
} from './shared';
import { useTranslations } from '@/lib/i18n';

/* ─── Integrations Section (Rich Grid) ─── */
export function SweoIntegrations() {
  const t = useTranslations();
  return (
    <section id="integrations" className="sweo-section sweo-section-elevated">
      <div className="sweo-section-inner">
        {/* Side-by-side: text left, grid right */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-12 items-start">
          {/* Left: Text */}
          <div className="lg:w-[38%] flex-shrink-0 lg:sticky lg:top-24">
            <h2
              className="font-light text-[1.25rem] md:text-[2.5rem] xl:text-[3rem] leading-[1.05] tracking-[-0.063rem] md:tracking-[-0.094rem] xl:tracking-[-0.15rem] max-w-[20ch] text-balance text-[var(--sweo-content-primary)]"
              style={{ fontFamily: 'var(--sweo-font-serif)' }}
            >
              SWEO works with any helpdesk
            </h2>
            <p className="mt-3 sm:mt-5 text-sm sm:text-base xl:text-lg leading-[1.45] text-[var(--sweo-content-secondary)] max-w-[38ch]">
              <span
                className="mr-6 text-xs text-[var(--sweo-content-tertiary)] md:mr-10"
                style={{ fontFamily: 'var(--sweo-font-mono)' }}
              >
                03
              </span>
              {t.integrationsSection.description}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/docs" className="sweo-btn-secondary text-sm">
                {t.integrationsSection.cta}
              </Link>
            </div>

          </div>

          {/* Right: Integrations grid */}
          <div className="lg:w-[62%] flex-shrink-0">
            <div className="relative overflow-hidden lg:border lg:border-current/20 lg:p-2">
              <div className="sweo-integrations-grid">
                <div className="sweo-int-cell sweo-int-cell--active"><ZohoDeskLogo /></div>
                <div className="sweo-int-cell sweo-int-cell--active"><WhatsAppLogo /></div>
                <div className="sweo-int-cell sweo-int-cell--active"><GorgiasLogo /></div>
                <div className="sweo-int-cell sweo-int-cell--active"><ZendeskLogo /></div>
                <div className="sweo-int-cell sweo-int-cell--active"><SalesforceLogo /></div>
                <div className="sweo-int-cell sweo-int-cell--sweo flex flex-col items-center justify-center gap-3">
                  <img
                    src="/logo-icon-dark.svg"
                    alt="SWEO"
                    className="w-10 h-10"
                  />
                  <span
                    className="text-[11px] tracking-wider uppercase text-[var(--sweo-orange)]"
                    style={{ fontFamily: 'var(--sweo-font-mono)' }}
                  >
                    SWEO
                  </span>
                </div>
                <div className="sweo-int-cell sweo-int-cell--active"><SprinklrLogo /></div>
                <div className="sweo-int-cell sweo-int-cell--active"><FrontLogo /></div>
                <div className="sweo-int-cell sweo-int-cell--active"><JiraLogo /></div>
                <div className="sweo-int-cell sweo-int-cell--active"><FreshdeskLogo /></div>
                <div className="sweo-int-cell sweo-int-cell--active"><HubSpotLogo /></div>
              </div>

              {/* Connection lines (animated SVG) */}
              <svg className="absolute inset-0 z-0 hidden h-full w-full lg:block" aria-hidden="true">
                <line x1="20%" y1="25%" x2="50%" y2="50%" stroke="var(--sweo-orange)" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" values="0;-8" dur="2s" repeatCount="indefinite" />
                </line>
                <line x1="80%" y1="25%" x2="50%" y2="50%" stroke="var(--sweo-orange)" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" values="0;-8" dur="2s" repeatCount="indefinite" />
                </line>
                <line x1="20%" y1="75%" x2="50%" y2="50%" stroke="var(--sweo-orange)" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" values="0;-8" dur="2.5s" repeatCount="indefinite" />
                </line>
                <line x1="80%" y1="75%" x2="50%" y2="50%" stroke="var(--sweo-orange)" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" values="0;-8" dur="2.5s" repeatCount="indefinite" />
                </line>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
