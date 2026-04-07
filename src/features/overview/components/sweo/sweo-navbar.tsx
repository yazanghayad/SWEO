/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { NavChevron, NavDropdownItem, NavDropdownSection, NavDropdownSubSection } from './shared';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from './language-switcher';

/* ─── Navigation ─── */
export function SweoNavbar() {
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Close menus on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuEnter = (menu: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(menu);
  };

  const handleMenuLeave = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 200);
  };

  return (
    <header className={`sweo-nav ${scrolled ? 'sweo-nav-scrolled' : ''}`}>
      <nav ref={navRef} className="sweo-nav-inner" role="navigation" aria-label="Main Navigation">
        {/* Logo + Site Switcher */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-white" aria-label="SWEO Home">
            <img
              src="/logo-icon-dark.svg"
              alt="SWEO"
              className="h-8 w-8 lg:h-9 lg:w-9"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>

          {/* Navigation Links */}
          <ul className="sweo-nav-links">
            <li>
              <Link href="/" className="sweo-nav-link">{t.nav.home}</Link>
            </li>

            {/* Product Mega Menu */}
            <li
              className="group relative"
              onMouseEnter={() => handleMenuEnter('product')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                className="sweo-nav-link sweo-nav-link-btn"
                aria-haspopup="true"
                aria-expanded={openMenu === 'product'}
              >
                {t.nav.product}
                <NavChevron className="h-5 w-5 flex-none" />
              </button>
              <ul
                className={`sweo-nav-dropdown sweo-nav-dropdown-wide columns-2 ${openMenu === 'product' ? 'sweo-nav-dropdown-open' : ''}`}
                role="menu"
                aria-label="Product submenu"
              >
                <NavDropdownSection title={t.nav.capabilities}>
                  <NavDropdownItem href="/capabilities" title={t.nav.sweoOverview} description={t.nav.sweoOverviewDesc} />
                  <NavDropdownItem href="/channels" title={t.nav.channels} description={t.nav.channelsDesc} />
                  <NavDropdownItem href="/trust-reliability" title={t.nav.trustAndReliability} description={t.nav.trustAndReliabilityDesc} />
                  <NavDropdownSubSection title={t.nav.featuredCapabilities}>
                    <NavDropdownItem href="/voice" title={t.nav.voice} />
                    <NavDropdownItem href="/procedures" title={t.nav.procedures} />
                    <NavDropdownItem href="/insights" title={t.nav.insights} />
                    <NavDropdownItem href="/testing" title={t.nav.testing} />
                  </NavDropdownSubSection>
                </NavDropdownSection>

                <NavDropdownSection title={t.nav.integrations}>
                  <NavDropdownItem href="/integrations" title={t.nav.integrationsOverview} description={t.nav.integrationsOverviewDesc} />
                  <NavDropdownSubSection title={t.nav.featuredIntegrations}>
                    <NavDropdownItem href="/zendesk-integration" title={t.nav.zendesk} description={t.nav.zendeskDesc} />
                    <NavDropdownItem href="/salesforce-integration" title={t.nav.salesforce} description={t.nav.salesforceDesc} />
                    <NavDropdownItem href="/integrations" title={t.nav.shopify} description={t.nav.shopifyDesc} />
                    <NavDropdownItem href="/integrations" title={t.nav.stripe} description={t.nav.stripeDesc} />
                  </NavDropdownSubSection>
                </NavDropdownSection>

                <NavDropdownSection title={t.nav.vision}>
                  <NavDropdownItem href="/customer-agent" title={t.nav.customerAgent} description={t.nav.customerAgentDesc} />
                </NavDropdownSection>
              </ul>
            </li>

            {/* AI Technology Menu */}
            <li
              className="group relative"
              onMouseEnter={() => handleMenuEnter('ai')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                className="sweo-nav-link sweo-nav-link-btn"
                aria-haspopup="true"
                aria-expanded={openMenu === 'ai'}
              >
                {t.nav.aiTechnology}
                <NavChevron className="h-5 w-5 flex-none" />
              </button>
              <ul
                className={`sweo-nav-dropdown sweo-nav-dropdown-single ${openMenu === 'ai' ? 'sweo-nav-dropdown-open' : ''}`}
                role="menu"
                aria-label="AI Technology submenu"
              >
                <NavDropdownItem href="/ai-engine" title={t.nav.aiEngine} description={t.nav.aiEngineDesc} />
                <NavDropdownItem href="/cx-models" title={t.nav.models} description={t.nav.modelsDesc} />
                <NavDropdownItem href="/learn" title={t.nav.aiResearch} description={t.nav.aiResearchDesc} />
              </ul>
            </li>

            {/* Solutions Menu */}
            <li
              className="group relative"
              onMouseEnter={() => handleMenuEnter('solutions')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                className="sweo-nav-link sweo-nav-link-btn"
                aria-haspopup="true"
                aria-expanded={openMenu === 'solutions'}
              >
                {t.nav.solutions}
                <NavChevron className="h-5 w-5 flex-none" />
              </button>
              <ul
                className={`sweo-nav-dropdown sweo-nav-dropdown-wide columns-2 ${openMenu === 'solutions' ? 'sweo-nav-dropdown-open' : ''}`}
                role="menu"
                aria-label="Solutions submenu"
              >
                <NavDropdownSection title={t.nav.industries}>
                  <NavDropdownItem href="/solutions/financial-services" title={t.nav.financialServices} description={t.nav.financialServicesDesc} />
                  <NavDropdownItem href="/solutions/ecommerce" title={t.nav.retailAndEcommerce} description={t.nav.retailAndEcommerceDesc} />
                  <NavDropdownItem href="/solutions/technology" title={t.nav.technology} description={t.nav.technologyDesc} />
                  <NavDropdownItem href="/solutions/gaming" title={t.nav.gaming} description={t.nav.gamingDesc} />
                </NavDropdownSection>
                <NavDropdownSection title={t.nav.companySize}>
                  <NavDropdownItem href="/solutions/enterprise" title={t.nav.enterprise} description={t.nav.enterpriseDesc} />
                </NavDropdownSection>
              </ul>
            </li>

            <li>
              <Link href="/customers" className="sweo-nav-link">{t.nav.customers}</Link>
            </li>

            <li>
              <Link href="/pricing" className="sweo-nav-link">{t.nav.pricing}</Link>
            </li>

            {/* Resources Menu */}
            <li
              className="group relative"
              onMouseEnter={() => handleMenuEnter('resources')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                className="sweo-nav-link sweo-nav-link-btn"
                aria-haspopup="true"
                aria-expanded={openMenu === 'resources'}
              >
                {t.nav.resources}
                <NavChevron className="h-5 w-5 flex-none" />
              </button>
              <ul
                className={`sweo-nav-dropdown sweo-nav-dropdown-wide columns-2 ${openMenu === 'resources' ? 'sweo-nav-dropdown-open' : ''}`}
                role="menu"
                aria-label="Resources submenu"
              >
                <NavDropdownSection title={t.nav.events}>
                  <NavDropdownItem href="/learn" title={t.nav.pioneer} description={t.nav.pioneerDesc} />
                  <NavDropdownItem href="/learn" title={t.nav.webinars} description={t.nav.webinarsDesc} />
                </NavDropdownSection>

                <NavDropdownSection title={t.nav.launches}>
                  <NavDropdownItem href="/fin3" title={t.nav.sweo3} description={t.nav.sweo3Desc} />
                  <NavDropdownItem href="/updates" title={t.nav.productUpdates} description={t.nav.productUpdatesDesc} />
                </NavDropdownSection>

                <NavDropdownSection title={t.nav.learn}>
                  <NavDropdownItem href="/docs" title={t.nav.helpCenter} description={t.nav.helpCenterDesc} />
                  <NavDropdownItem href="/docs" title={t.nav.documentation} description={t.nav.documentationDesc} />
                  <NavDropdownItem href="/learn" title={t.nav.aiAgentBlueprint} description={t.nav.aiAgentBlueprintDesc} />
                </NavDropdownSection>
              </ul>
            </li>


          </ul>
        </div>

        {/* Right side: actions — SWEO pattern */}
        <ul className="flex items-center gap-1 ml-auto">
          <li className="hidden xl:list-item">
            <LanguageSwitcher />
          </li>
          <li className="hidden xl:list-item">
            <Link
              href="/contact-sales"
              className="sweo-nav-link text-sm text-white/80 hover:text-white"
            >
              {t.nav.contactSales}
            </Link>
          </li>
          <li className="hidden xl:list-item">
            <Link
              href="/auth/sign-in"
              className="sweo-nav-link text-sm text-white/80 hover:text-white"
            >
              {t.nav.signIn}
            </Link>
          </li>
          <li className="hidden md:list-item">
            <Link href="/view-demos" className="sweo-nav-link text-sm text-white/80 hover:text-white cursor-pointer">
              {t.nav.viewDemo}
            </Link>
          </li>
          <li className="ml-1">
            <Link href="/auth/sign-up" className="sweo-btn-primary text-sm !px-2.5 !py-2.5 sm:!px-4 lg:!px-4 lg:!py-2.5">
              {t.nav.startFreeTrial}
            </Link>
          </li>
        </ul>

          {/* Mobile hamburger */}
          <div className="z-50 ml-3 flex xl:hidden">
          <button
            className="flex flex-col gap-1.5 p-2 text-white"
            aria-label="Toggle mobile menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className={`block w-5 h-px bg-white transition-transform ${mobileOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
            <span className={`block w-5 h-px bg-white transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-white transition-transform ${mobileOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="sweo-nav-mobile">
          <div className="flex flex-col gap-1 p-4">
            <Link href="/" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>{t.nav.home}</Link>
            <Link href="/capabilities" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>{t.nav.product}</Link>
            <Link href="/ai-engine" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>{t.nav.aiTechnology}</Link>
            <Link href="/customers" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>{t.nav.customers}</Link>
            <Link href="/pricing" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>{t.nav.pricing}</Link>
            <Link href="/docs" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>{t.nav.resources}</Link>

            <hr className="border-white/10 my-2" />
            <LanguageSwitcher />
            <hr className="border-white/10 my-2" />
            <Link href="/auth/sign-in" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>{t.nav.signIn}</Link>
            <Link href="/auth/sign-up" className="sweo-btn-primary text-sm mt-2 text-center" onClick={() => setMobileOpen(false)}>{t.nav.startFreeTrial}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
