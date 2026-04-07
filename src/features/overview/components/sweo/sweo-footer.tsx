'use client';

import Link from 'next/link';
import { SweoLogo } from './shared';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from './language-switcher';

/* ─── Footer — SWEO pattern ─── */
export function SweoFooter() {
  const t = useTranslations();

  const footerSections = [
    {
      title: t.footer.product,
      links: [
        { text: t.footer.home, href: '/' },
        { text: t.footer.knowledgeBase, href: '/dashboard/knowledge' },
        { text: t.footer.procedures, href: '/dashboard/overview' },
        { text: t.footer.channels, href: '/dashboard/settings' },
        { text: t.footer.inbox, href: '/dashboard/inbox' },
        { text: t.footer.reports, href: '/dashboard/reports' },
      ],
    },
    {
      title: t.footer.aiTechnology,
      links: [
        { text: t.footer.sweoAIEngine, href: '/docs' },
        { text: t.footer.ragPipeline, href: '/docs' },
        { text: t.footer.policyEngine, href: '/docs' },
      ],
    },
    {
      title: t.footer.solutions,
      links: [
        { text: t.footer.softwareAndTechnology, href: '/solutions/technology' },
        { text: t.footer.ecommerce, href: '/solutions/ecommerce' },
        { text: t.footer.financialServices, href: '/solutions/financial-services' },
        { text: t.footer.gaming, href: '/solutions/gaming' },
        { text: t.footer.enterprise, href: '/solutions/enterprise' },
      ],
    },
    {
      title: t.footer.resources,
      links: [
        { text: t.footer.documentation, href: '/docs' },
        { text: t.footer.apiReference, href: '/docs' },
        { text: t.footer.helpCenter, href: '/docs' },
      ],
    },
    {
      title: t.footer.getStarted,
      links: [
        { text: t.footer.freeTrial, href: '/auth/sign-up' },
        { text: t.footer.signIn, href: '/auth/sign-in' },
        { text: t.footer.contactUs, href: '/contact-sales' },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { text: t.footer.about, href: '/' },
        { text: t.footer.privacyPolicy, href: '/privacy-policy' },
        { text: t.footer.termsOfService, href: '/terms-of-service' },
      ],
    },
  ];
  return (
    <footer className="relative z-[1] w-full overflow-hidden pb-6 text-[var(--sweo-content-primary)] md:pb-9 flex flex-col gap-0 pt-12 md:pt-18">
      <div className="mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6">
        {/* Desktop Footer — 5 columns */}
        <div className="hidden gap-6 md:grid md:grid-cols-5 mb-12">
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h3 className="sweo-footer-heading">{section.title}</h3>
                <ul className="flex flex-col gap-0.5 lg:gap-1">
                  {section.links.map((link) => (
                    <li key={link.text}>
                      <Link href={link.href} className="sweo-footer-link">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Footer Accordion — SWEO pattern with dotted dividers */}
        <div className="flex flex-col md:hidden">
          {footerSections.map((section, i) => (
            <div key={section.title}>
              <details className="group/accordion">
                <summary className="flex w-full cursor-pointer list-none items-center justify-between py-4 text-[var(--sweo-content-secondary)] group-open/accordion:text-[var(--sweo-content-primary)] hover:text-[var(--sweo-content-primary)] [&::-webkit-details-marker]:hidden">
                  <h3 className="sweo-footer-heading">{section.title}</h3>
                  <svg
                    width="17"
                    height="17"
                    fill="none"
                    className="rotate-90 group-open/accordion:rotate-[270deg] transition-transform"
                    viewBox="0 0 17 17"
                  >
                    <path d="M6.5 3.5L11 8.5L6.5 13.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </summary>
                <div className="pb-4 text-[var(--sweo-content-secondary)] lg:pb-6">
                  <ul className="flex flex-col gap-0.5">
                    {section.links.map((link) => (
                      <li key={link.text}>
                        <Link href={link.href} className="sweo-footer-link block py-0.5">
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
              {/* Dotted divider */}
              {i < footerSections.length - 1 && (
                <div
                  className="h-px w-full"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--sweo-border-decorative) 5px, transparent 5px)`,
                    backgroundSize: '10px 1px',
                    backgroundRepeat: 'repeat-x',
                    backgroundPosition: '-2.5px 0',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="sweo-dashed-line mt-8 mb-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--sweo-content-tertiary)]">
          <div className="flex items-center gap-2">
            <SweoLogo className="w-5 h-5" />
            <span>{t.footer.copyright.replace('{year}', String(new Date().getFullYear()))}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/terms-of-service" className="sweo-footer-link text-xs">
              {t.footer.terms}
            </Link>
            <Link href="/privacy-policy" className="sweo-footer-link text-xs">
              {t.footer.privacy}
            </Link>
            <a href="mailto:kontakt@sweo.ai" className="sweo-footer-link text-xs">
              kontakt@sweo.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}