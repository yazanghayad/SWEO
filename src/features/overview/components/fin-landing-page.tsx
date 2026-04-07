/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

/* ─── SWEO Logo SVG (vertical bars with smile curve) ─── */
function SweoLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M13.25 1H2.75C1.78312 1 1 1.78312 1 2.75V13.25C1 14.2169 1.78312 15 2.75 15H13.25C14.2169 15 15 14.2169 15 13.25V2.75C15 1.78312 14.2169 1 13.25 1ZM9.86637 3.6425C9.86637 3.38613 10.0764 3.17875 10.3336 3.17875C10.5909 3.17875 10.8 3.38613 10.8 3.6425V9.86725C10.8 10.1245 10.59 10.3336 10.3336 10.3336C10.0755 10.3336 9.86637 10.1236 9.86637 9.86725V3.6425ZM7.53363 3.338C7.53363 3.07812 7.74188 2.8655 8 2.8655C8.25725 2.8655 8.46637 3.07812 8.46637 3.338V10.1735C8.46637 10.4334 8.25637 10.6442 8 10.6442C7.74188 10.6442 7.53363 10.4342 7.53363 10.1735V3.338ZM5.2 3.64425C5.2 3.38613 5.41 3.17788 5.66638 3.17788C5.9245 3.17788 6.13363 3.38525 6.13363 3.64162V9.86637C6.13363 10.1236 5.92362 10.3328 5.66638 10.3328C5.40913 10.3328 5.2 10.1228 5.2 9.86637V3.6425V3.64425ZM2.86637 4.577C2.86637 4.318 3.07638 4.10975 3.33363 4.10975C3.59088 4.10975 3.8 4.318 3.8 4.57612V8.77612C3.8 9.0325 3.59 9.24162 3.33363 9.24162C3.0755 9.24162 2.86637 9.03162 2.86637 8.77525V4.57525V4.577ZM12.97 11.619C12.8983 11.6803 11.1692 13.1328 8 13.1328C4.83075 13.1328 3.10175 11.6803 3.03 11.619C2.834 11.4527 2.81125 11.157 2.97925 10.961C3.1455 10.7659 3.44038 10.7423 3.6355 10.9085C3.6635 10.9356 5.207 12.2 8 12.2C10.828 12.2 12.3488 10.9251 12.3628 10.912C12.5579 10.7458 12.8527 10.7676 13.0208 10.9627C13.1888 11.1587 13.166 11.4527 12.97 11.6207V11.619ZM13.1336 8.77525C13.1336 9.03337 12.9236 9.2425 12.6664 9.2425C12.4091 9.2425 12.2 9.0325 12.2 8.77612V4.57612C12.2 4.31712 12.41 4.10888 12.6664 4.10888C12.9245 4.10888 13.1336 4.31713 13.1336 4.57525V8.77525Z" />
    </svg>
  );
}

/* ─── Nav Chevron Icon ─── */
function NavChevron({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M15.48 10a.25.25 0 0 1 .195.406l-3.48 4.35a.25.25 0 0 1-.39 0l-3.48-4.35A.25.25 0 0 1 8.52 10z" />
    </svg>
  );
}

/* ─── External Link Arrow Icon ─── */
function ExternalArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 8" className="ml-1 inline-block size-1.5 -translate-y-0.5" aria-hidden="true">
      <path fill="currentColor" d="M1.54 0H8v6.46L6.46 8V3.785c0-.51.04-.94.078-1.292l-.013-.013c-.378.417-.848.887-1.305 1.33L1.24 7.792.209 6.761l3.98-3.981c.444-.457.914-.927 1.331-1.305l-.013-.013c-.352.039-.783.078-1.292.078H0z" />
    </svg>
  );
}

/* ─── Nav Dropdown Item ─── */
function NavDropdownItem({
  href,
  title,
  description,
  external = false,
}: {
  href: string;
  title: string;
  description?: string;
  external?: boolean;
}) {
  const Tag = external ? 'a' : Link;
  const extraProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <li role="menuitem">
      <Tag
        href={href}
        className="sweo-nav-dropdown-link"
        {...extraProps}
      >
        <strong className="sweo-nav-dropdown-title">
          {title}
          {external && <ExternalArrow />}
        </strong>
        {description && (
          <span className="sweo-nav-dropdown-desc">{description}</span>
        )}
      </Tag>
    </li>
  );
}

/* ─── Nav Dropdown Section Title ─── */
function NavDropdownSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li role="menuitem" className="mb-2 w-full break-inside-avoid">
      <p className="sweo-nav-dropdown-section-title">{title}</p>
      <ul>{children}</ul>
    </li>
  );
}

/* ─── Nav Dropdown Sub-Section Title ─── */
function NavDropdownSubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="pt-2">
      <p className="sweo-nav-dropdown-subsection-title">{title}</p>
      <ul>{children}</ul>
    </li>
  );
}

/* ─── Navigation ─── */
export function FinNavbar() {
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
              <Link href="/" className="sweo-nav-link">Home</Link>
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
                Product
                <NavChevron className="h-5 w-5 flex-none" />
              </button>
              <ul
                className={`sweo-nav-dropdown sweo-nav-dropdown-wide columns-2 ${openMenu === 'product' ? 'sweo-nav-dropdown-open' : ''}`}
                role="menu"
                aria-label="Product submenu"
              >
                <NavDropdownSection title="Capabilities">
                  <NavDropdownItem href="/docs" title="SWEO Overview" description="Explore all of SWEO's capabilities" />
                  <NavDropdownItem href="/dashboard/inbox" title="Channels" description="Voice, email, live chat, social, and more" />
                  <NavDropdownItem href="#platform" title="Trust and Reliability" description="Safe AI, built on partnership" />
                  <NavDropdownSubSection title="Featured Capabilities">
                    <NavDropdownItem href="/dashboard/inbox" title="Voice" />
                    <NavDropdownItem href="/dashboard/procedures" title="Procedures" />
                    <NavDropdownItem href="/dashboard/reports" title="Insights" />
                    <NavDropdownItem href="/dashboard/testing" title="Testing" />
                  </NavDropdownSubSection>
                </NavDropdownSection>

                <NavDropdownSection title="Integrations">
                  <NavDropdownItem href="/integrations" title="Integrations Overview" description="Connect to systems you already use" />
                  <NavDropdownSubSection title="Featured Integrations">
                    <NavDropdownItem href="/zendesk-integration" title="Zendesk" description="Helpdesk integration" />
                    <NavDropdownItem href="/salesforce-integration" title="Salesforce" description="CRM integration" />
                    <NavDropdownItem href="/integrations" title="Shopify" description="E-commerce order management" />
                    <NavDropdownItem href="/integrations" title="Stripe" description="Payment and billing data" />
                  </NavDropdownSubSection>
                </NavDropdownSection>

                <NavDropdownSection title="Vision">
                  <NavDropdownItem href="/customer-agent" title="Customer Agent" description="SWEO across the customer lifecycle" />
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
                AI Technology
                <NavChevron className="h-5 w-5 flex-none" />
              </button>
              <ul
                className={`sweo-nav-dropdown sweo-nav-dropdown-single ${openMenu === 'ai' ? 'sweo-nav-dropdown-open' : ''}`}
                role="menu"
                aria-label="AI Technology submenu"
              >
                <NavDropdownItem href="#technology" title="AI Engine" description="The system powering SWEO's responses" />
                <NavDropdownItem href="/docs" title="Models" description="Purpose-built for scale and complexity" />
                <NavDropdownItem href="/learn" title="AI Research" description="Insights from the team building SWEO" />
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
                Solutions
                <NavChevron className="h-5 w-5 flex-none" />
              </button>
              <ul
                className={`sweo-nav-dropdown sweo-nav-dropdown-wide columns-2 ${openMenu === 'solutions' ? 'sweo-nav-dropdown-open' : ''}`}
                role="menu"
                aria-label="Solutions submenu"
              >
                <NavDropdownSection title="Industries">
                  <NavDropdownItem href="/solutions/financial-services" title="Financial Services" description="Built to handle financial complexity" />
                  <NavDropdownItem href="/solutions/ecommerce" title="Retail and Ecommerce" description="Turn conversations into conversions" />
                  <NavDropdownItem href="/solutions/technology" title="Technology" description="Drive adoption and retention" />
                  <NavDropdownItem href="/solutions/gaming" title="Gaming" description="Engage audiences, improve retention" />
                </NavDropdownSection>
                <NavDropdownSection title="Company Size">
                  <NavDropdownItem href="/solutions/enterprise" title="Enterprise" description="Built for enterprise-grade success" />
                </NavDropdownSection>
              </ul>
            </li>

            <li>
              <Link href="/customers" className="sweo-nav-link">Customers</Link>
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
                Resources
                <NavChevron className="h-5 w-5 flex-none" />
              </button>
              <ul
                className={`sweo-nav-dropdown sweo-nav-dropdown-wide columns-2 ${openMenu === 'resources' ? 'sweo-nav-dropdown-open' : ''}`}
                role="menu"
                aria-label="Resources submenu"
              >
                <NavDropdownSection title="Events">
                  <NavDropdownItem href="/learn" title="Pioneer" description="Catch up on our flagship event" />
                  <NavDropdownItem href="/learn" title="Webinars" description="Watch case studies, demos, and more" />
                </NavDropdownSection>

                <NavDropdownSection title="Launches">
                  <NavDropdownItem href="/fin3" title="SWEO 3" description="The highest performing AI Agent" />
                  <NavDropdownItem href="/updates" title="Product Updates" description="Discover how SWEO is evolving" />
                </NavDropdownSection>

                <NavDropdownSection title="Learn">
                  <NavDropdownItem href="/docs" title="Help Center" description="Support articles to help you set up SWEO" />
                  <NavDropdownItem href="/docs" title="Documentation" description="Technical docs and API references" />
                  <NavDropdownItem href="/learn" title="AI Agent Blueprint" description="Your map for AI in customer service" />
                </NavDropdownSection>
              </ul>
            </li>


          </ul>
        </div>

        {/* Right side: actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/sign-in"
            className="hidden lg:inline-flex text-sm text-white/80 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link href="/docs" className="sweo-btn-secondary text-sm hidden md:inline-flex">
            Documentation
          </Link>
          <Link href="/auth/sign-up" className="sweo-btn-primary text-sm">
            Start free trial
          </Link>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
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
            <Link href="/" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/docs" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>Product</Link>
            <Link href="#technology" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>AI Technology</Link>
            <Link href="/customers" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>Customers</Link>
            <Link href="/docs" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>Resources</Link>

            <hr className="border-white/10 my-2" />
            <Link href="/auth/sign-in" className="sweo-nav-mobile-link" onClick={() => setMobileOpen(false)}>Sign in</Link>
            <Link href="/auth/sign-up" className="sweo-btn-primary text-sm mt-2 text-center" onClick={() => setMobileOpen(false)}>Start free trial</Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Chapter Navigation (sticky sidebar) ─── */
const chapters = [
  { number: '01', label: 'capabilities', href: '#capabilities' },
  { number: '02', label: 'performance', href: '#performance' },
  { number: '03', label: 'integrations', href: '#integrations' },
  { number: '04', label: 'technology', href: '#technology' },
  { number: '05', label: 'our platform', href: '#platform' },

];

export function FinChapterNav() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState<number[]>(() =>
    chapters.map(() => 0)
  );
  const ticking = useRef(false);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;

    requestAnimationFrame(() => {
      const ids = chapters.map((c) => c.href.slice(1));
      const sections = ids.map((id) => document.getElementById(id));
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const newProgress = [...progressRef.current];
      let newActive = 0;

      sections.forEach((el, i) => {
        if (!el) {
          newProgress[i] = 0;
          return;
        }
        const top = el.offsetTop;
        const height = el.offsetHeight;
        const sectionStart = top - vh * 0.3;
        const sectionEnd = top + height - vh * 0.3;

        if (scrollY < sectionStart) {
          newProgress[i] = 0;
        } else if (scrollY >= sectionEnd) {
          newProgress[i] = 1;
        } else {
          newProgress[i] = (scrollY - sectionStart) / (sectionEnd - sectionStart);
        }

        // Active = last section whose top we've passed
        if (scrollY >= top - vh * 0.5) {
          newActive = i;
        }
      });

      setActiveIndex(newActive);
      setProgress(newProgress);
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="sweo-chapter-nav-wrapper">
      <div className="sweo-chapter-nav" id="_chapter_nav">
        <nav aria-label="Chapter navigation">
          {/* Desktop: vertical list */}
          <ul className="sweo-chapter-list">
            {chapters.map((ch, i) => (
              <li key={ch.href} className="sweo-chapter-item">
                <a
                  className={`sweo-chapter-link ${
                    activeIndex === i ? 'sweo-chapter-link-active' : ''
                  }`}
                  href={ch.href}
                  data-active={activeIndex === i}
                  aria-current={activeIndex === i ? 'location' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(ch.href.slice(1));
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <span className="flex translate-y-px">
                    <span className="shrink-0 pr-3">{ch.number}</span>
                    <span>{ch.label}</span>
                  </span>
                </a>
                {/* Progress bar */}
                <div className="sweo-chapter-progress-track">
                  <span className="sweo-chapter-progress-bg" />
                  <span
                    role="progressbar"
                    aria-label="Progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="sweo-chapter-progress-fill"
                    style={{
                      transform: `scaleX(${progress[i]})`,
                      transition: 'transform linear 60ms',
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>

          {/* Mobile: single progress bar under horizontal scroll */}
          <div className="sweo-chapter-progress-track sweo-chapter-progress-mobile">
            <span className="sweo-chapter-progress-bg" />
            <span
              role="progressbar"
              aria-label="Progress"
              className="sweo-chapter-progress-fill"
              style={{
                transform: `scaleX(${
                  (activeIndex + (progress[activeIndex] || 0)) / chapters.length
                })`,
                transition: 'transform linear 60ms',
              }}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ─── Hero Section ─── */
export function FinHero() {
  return (
    <section className="sweo-hero relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Background image (desktop + mobile) — slow zoom+pan */}
      <div
        className="sweo-hero-bg-animate absolute inset-[-10%] z-0 hidden bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: "url('/fin/images/image.png')" }}
      />
      <div
        className="sweo-hero-bg-animate absolute inset-[-10%] z-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/fin/images/image.png')" }}
      />

      {/* Floating glow orbs */}
      <div className="sweo-hero-orb sweo-hero-orb--1 absolute z-[1]" />
      <div className="sweo-hero-orb sweo-hero-orb--2 absolute z-[1]" />
      <div className="sweo-hero-orb sweo-hero-orb--3 absolute z-[1]" />

      {/* Dot grid overlay — drifting */}
      <div className="sweo-hero-dot-grid absolute inset-0 z-[1]" />

      {/* Edge gradient overlays */}
      <div className="absolute top-0 right-0 left-0 z-[2] h-[20px] w-full bg-gradient-to-b from-[var(--sweo-dark-blue)] via-[var(--sweo-dark-blue)] via-45% to-transparent md:h-[100px]" />
      <div className="absolute right-0 bottom-0 left-0 z-[2] h-[20px] w-full bg-gradient-to-t from-[var(--sweo-dark-blue)] via-[var(--sweo-dark-blue)] via-45% to-transparent md:h-[100px]" />
      <div className="absolute top-0 right-0 bottom-0 z-[2] hidden h-full w-[20px] bg-gradient-to-l from-[var(--sweo-dark-blue)] via-[var(--sweo-dark-blue)] via-45% to-transparent md:block md:w-[100px]" />
      <div className="absolute top-0 bottom-0 left-0 z-[2] hidden h-full w-[20px] bg-gradient-to-r from-[var(--sweo-dark-blue)] via-[var(--sweo-dark-blue)] via-45% to-transparent md:block md:w-[100px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-3 md:px-4 lg:px-6 text-left">
        <div className="flex flex-col items-start gap-4 sm:gap-6 pt-8 pb-16 md:pt-20 md:pb-32">
          <h1 className="sweo-hero-title max-w-4xl">
            The #1 AI Agent for<br />
            all your customer service
          </h1>
          <ul className="flex flex-col gap-1 text-sm sm:text-base text-[var(--sweo-content-secondary)] list-none p-0 m-0">
            <li>#1 in bake-offs</li>
            <li>#1 in benchmarks</li>
            <li>#1 for complex queries</li>
            <li>#1 on G2</li>
          </ul>
          <div className="flex flex-wrap items-start justify-start gap-3 mt-4">
            <Link href="/auth/sign-up" className="sweo-btn-primary">
              Start free trial
            </Link>
            <Link href="/demo" className="sweo-btn-secondary">
              Get a demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Logo Banner (scrolling customer logos) ─── */
export function FinLogoBanner() {
  const phases = [
    'Analyze', 'Train', 'Test', 'Deploy',
    'Knowledge', 'Procedures', 'Policies', 'Channels',
    'Insights', 'Automation',
  ];

  return (
    <div className="overflow-hidden py-4 sm:py-8 border-y border-white/10">
      <div className="sweo-logo-banner">
        {[...phases, ...phases, ...phases].map((name, i) => (
          <span key={i} className="opacity-40">{name}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── Capabilities Section ─── */

/* 01a Knowledge chart data */
const knowledgeSourceData = [
  { month: 'JAN', urls: 12, files: 8, manual: 5 },
  { month: 'FEB', urls: 18, files: 12, manual: 7 },
  { month: 'MAR', urls: 28, files: 15, manual: 9 },
  { month: 'APR', urls: 35, files: 22, manual: 11 },
  { month: 'MAY', urls: 42, files: 28, manual: 14 },
  { month: 'JUN', urls: 51, files: 34, manual: 16 },
  { month: 'JUL', urls: 60, files: 39, manual: 19 },
  { month: 'AUG', urls: 72, files: 45, manual: 21 },
  { month: 'SEP', urls: 85, files: 52, manual: 24 },
  { month: 'OCT', urls: 96, files: 58, manual: 27 },
  { month: 'NOV', urls: 110, files: 64, manual: 30 },
  { month: 'DEC', urls: 124, files: 71, manual: 34 },
];

const sourceTypeBreakdown = [
  { type: 'URL Crawling', count: 124, pct: 54 },
  { type: 'File Upload', count: 71, pct: 31 },
  { type: 'Manual Entry', count: 34, pct: 15 },
];

const knowledgeTargets = [
  { target: 'AI Agent', sources: 189, active: true },
  { target: 'Copilot', sources: 145, active: true },
  { target: 'Help Center', sources: 98, active: true },
];

/* 01b Procedures chart data */
const procedureStepData = [
  { step: 'Message', count: 156, color: '#FF5600' },
  { step: 'API Call', count: 89, color: '#FF5600' },
  { step: 'Data Lookup', count: 72, color: '#FF5600' },
  { step: 'Conditional', count: 64, color: '#FF5600' },
  { step: 'Approval', count: 28, color: '#FF5600' },
];

const procedureMetrics = [
  { name: 'Active Procedures', value: '47', change: '+8' },
  { name: 'Avg. Steps/Procedure', value: '4.2', change: '+0.3' },
  { name: 'Auto-resolved', value: '73%', change: '+5%' },
  { name: 'Avg. Execution Time', value: '1.8s', change: '-0.4s' },
];

const procedureFlowSteps = [
  { id: 'trigger', label: 'Intent Match', type: 'trigger', color: '#FF5600' },
  { id: 'lookup', label: 'Data Lookup', type: 'data_lookup', color: '#E8E7E0' },
  { id: 'condition', label: 'Conditional', type: 'conditional', color: '#E8E7E0' },
  { id: 'approval', label: 'Approval Gate', type: 'approval', color: '#E8E7E0' },
  { id: 'api', label: 'API Call', type: 'api_call', color: '#E8E7E0' },
  { id: 'message', label: 'Send Message', type: 'message', color: '#FF5600' },
];

/* 01c Channels chart data */
const channelVolumeData = [
  { channel: 'WEB', volume: 4520, resolved: 3842, rate: 85 },
  { channel: 'EMAIL', volume: 2180, resolved: 1744, rate: 80 },
  { channel: 'WHATSAPP', volume: 1340, resolved: 1139, rate: 85 },
  { channel: 'SMS', volume: 680, resolved: 544, rate: 80 },
  { channel: 'VOICE', volume: 420, resolved: 315, rate: 75 },
];

const channelTimeData = [
  { month: 'JAN', web: 320, email: 180, whatsapp: 80, sms: 40, voice: 25 },
  { month: 'FEB', web: 380, email: 195, whatsapp: 95, sms: 48, voice: 28 },
  { month: 'MAR', web: 420, email: 210, whatsapp: 110, sms: 55, voice: 32 },
  { month: 'APR', web: 460, email: 220, whatsapp: 125, sms: 60, voice: 35 },
  { month: 'MAY', web: 510, email: 230, whatsapp: 140, sms: 68, voice: 38 },
  { month: 'JUN', web: 540, email: 240, whatsapp: 155, sms: 72, voice: 40 },
  { month: 'JUL', web: 580, email: 250, whatsapp: 170, sms: 78, voice: 42 },
  { month: 'AUG', web: 620, email: 260, whatsapp: 180, sms: 82, voice: 44 },
  { month: 'SEP', web: 660, email: 270, whatsapp: 195, sms: 88, voice: 46 },
  { month: 'OCT', web: 700, email: 280, whatsapp: 210, sms: 92, voice: 48 },
  { month: 'NOV', web: 740, email: 290, whatsapp: 225, sms: 96, voice: 50 },
  { month: 'DEC', web: 780, email: 300, whatsapp: 240, sms: 100, voice: 52 },
];

const inboxViews = [
  { view: 'Your Inbox', count: 12 },
  { view: 'Unassigned', count: 8 },
  { view: 'SWEO Resolved', count: 342 },
  { view: 'SWEO Escalated', count: 18 },
  { view: 'All', count: 1247 },
];

export function FinCapabilities() {
  return (
    <section id="capabilities" className="space-y-0">
      {/* ─── 01a Knowledge ─── */}
      <div className="sweo-perf-section sweo-theme-light">
        <span className="sweo-perf-corner sweo-perf-corner-tl" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-tr" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-bl" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-br" aria-hidden="true" />

        <span className="sweo-perf-label">
          <span className="sweo-perf-label-dot" />
          01a — Knowledge
        </span>

        <div className="sweo-perf-content">
          <div className="flex flex-col gap-3 sm:gap-6 mb-6 sm:mb-12">
            <h3 className="sweo-perf-heading">
              <span className="block max-w-[16ch]">Train SWEO on everything your team knows.</span>
            </h3>
            <p className="text-sm sm:text-base text-black/60 max-w-[65ch]">
              Upload docs, crawl URLs, or write content manually. SWEO learns from your help center,
              PDFs, and more — with full versioning and rollback.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/knowledge" className="sweo-btn-secondary">
                Explore Knowledge
              </Link>
            </div>
          </div>

          {/* Fig 1.A + Fig 1.B Row */}
          <div className="grid grid-cols-1 gap-2 pb-8 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-3 lg:py-10 min-w-0">
            {/* Fig 1.A - Knowledge Growth Area Chart */}
            <div className="relative row-span-2 grid w-full min-w-0" style={{ gridTemplateRows: 'subgrid' }}>
              <div>
                <span className="sweo-perf-fig-label">
                  <span className="block w-auto">Fig 1.A&nbsp;-&nbsp;</span>
                  <span className="flex-1">Knowledge base growth by source type (cumulative)</span>
                </span>
              </div>
              <div className="sweo-perf-chart-box">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                <div className="w-full" style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={knowledgeSourceData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                      <defs>
                        <linearGradient id="gradUrls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF5600" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#FF5600" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="gradFiles" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#313130" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#313130" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gradManual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C3C2BD" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#C3C2BD" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="8 8" strokeWidth={0.5} stroke="#c5c5c140" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                        width={35}
                      />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #ccc', fontFamily: 'var(--sweo-font-mono)', fontSize: 11 }}
                      />
                      <Area type="monotone" dataKey="urls" stackId="1" stroke="#FF5600" strokeWidth={2} fill="url(#gradUrls)" name="URLs" />
                      <Area type="monotone" dataKey="files" stackId="1" stroke="#313130" strokeWidth={1.5} fill="url(#gradFiles)" name="Files" />
                      <Area type="monotone" dataKey="manual" stackId="1" stroke="#C3C2BD" strokeWidth={1} fill="url(#gradManual)" name="Manual" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Fig 1.B - Source Type Breakdown + Targets */}
            <div className="relative row-span-2 mt-8 grid w-full min-w-0 lg:mt-0" style={{ gridTemplateRows: 'subgrid' }}>
              <div>
                <span className="sweo-perf-fig-label">
                  <span className="block w-auto">Fig 1.B&nbsp;-&nbsp;</span>
                  <span className="flex-1">Source types &amp; deployment targets</span>
                </span>
              </div>
              <div className="sweo-perf-chart-box flex-col justify-between p-2 sm:p-4">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                {/* Source types as horizontal bars */}
                <div className="space-y-4 mb-6">
                  <p className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-wider text-black/50 mb-3">Source Distribution</p>
                  {sourceTypeBreakdown.map((src) => (
                    <div key={src.type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-[var(--sweo-font-mono)] uppercase tracking-wider text-black/80">{src.type}</span>
                        <span className="font-[var(--sweo-font-mono)] text-black/50">{src.count} ({src.pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-black/5 overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${src.pct}%`,
                            backgroundColor: src.type === 'URL Crawling' ? '#FF5600' : src.type === 'File Upload' ? '#313130' : '#C3C2BD',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Deployment targets */}
                <div>
                  <p className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-wider text-black/50 mb-3">Deployment Targets</p>
                  <div className="space-y-2">
                    {knowledgeTargets.map((t) => (
                      <div key={t.target} className="flex items-center justify-between py-2 border-b border-black/10 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#FF5600]" />
                          <span className="text-sm text-black/80">{t.target}</span>
                        </div>
                        <span className="font-[var(--sweo-font-mono)] text-xs text-black/50">{t.sources} sources</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-black/10">
                  <div className="flex items-center gap-2 text-xs text-black/50">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span>Supports PDF, DOCX, HTML, CSV, TXT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 01b Procedures ─── */}
      <div className="sweo-perf-section sweo-theme-light" style={{ borderTop: '1px solid #c5c5c140' }}>
        <span className="sweo-perf-corner sweo-perf-corner-tl" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-tr" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-bl" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-br" aria-hidden="true" />

        <span className="sweo-perf-label">
          <span className="sweo-perf-label-dot" />
          01b — Procedures
        </span>

        <div className="sweo-perf-content">
          <div className="flex flex-col gap-3 sm:gap-6 mb-6 sm:mb-12">
            <h3 className="sweo-perf-heading">
              <span className="block max-w-[18ch]">Multi-step workflows that resolve on autopilot.</span>
            </h3>
            <p className="text-sm sm:text-base text-black/60 max-w-[65ch]">
              Define multi-step workflows with conditionals, API calls, and approval gates —
              so SWEO can resolve complex queries autonomously.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/procedures" className="sweo-btn-secondary">
                Explore Procedures
              </Link>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-8">
            {procedureMetrics.map((m) => (
              <div key={m.name} className="sweo-perf-chart-box flex-col p-2 sm:p-4">
                <span className="font-[var(--sweo-font-mono)] text-[10px] sm:text-[11px] uppercase tracking-wider text-black/50 mb-1 sm:mb-2">{m.name}</span>
                <div className="flex items-end gap-1 sm:gap-2">
                  <span className="text-xl sm:text-3xl font-light text-black">{m.value}</span>
                  <span className="font-[var(--sweo-font-mono)] text-[10px] sm:text-xs text-[#FF5600] mb-0.5 sm:mb-1">{m.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Fig 1.C + Fig 1.D Row */}
          <div className="grid grid-cols-1 gap-2 pb-8 lg:grid-cols-[1fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-3 lg:py-10 min-w-0">
            {/* Fig 1.C - Step Types Bar Chart */}
            <div className="relative row-span-2 grid w-full min-w-0" style={{ gridTemplateRows: 'subgrid' }}>
              <div>
                <span className="sweo-perf-fig-label">
                  <span className="block w-auto">Fig 1.C&nbsp;-&nbsp;</span>
                  <span className="flex-1">Step types used across all procedures</span>
                </span>
              </div>
              <div className="sweo-perf-chart-box">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                <div className="w-full h-[220px] sm:h-[300px] lg:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={procedureStepData} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 5 }}>
                      <CartesianGrid strokeDasharray="8 8" strokeWidth={0.5} stroke="#c5c5c140" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="step"
                        tick={{ fontSize: 10, fill: '#00000090', fontFamily: 'var(--sweo-font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                        width={75}
                      />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #ccc', fontFamily: 'var(--sweo-font-mono)', fontSize: 11 }}
                        formatter={(value: number) => [`${value} steps`, 'Count']}
                      />
                      <Bar dataKey="count" radius={[0, 2, 2, 0]} barSize={20}>
                        {procedureStepData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx === 0 ? '#FF5600' : '#E8E7E0'} stroke={idx === 0 ? '#FF5600' : '#00000030'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Fig 1.D - Procedure Flow Visualization */}
            <div className="relative row-span-2 mt-8 grid w-full min-w-0 lg:mt-0" style={{ gridTemplateRows: 'subgrid' }}>
              <div>
                <span className="sweo-perf-fig-label">
                  <span className="block w-auto">Fig 1.D&nbsp;-&nbsp;</span>
                  <span className="flex-1">Example: Refund request procedure flow</span>
                </span>
              </div>
              <div className="sweo-perf-chart-box flex-col p-2 sm:p-4">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                <div className="flex flex-col gap-0">
                  {procedureFlowSteps.map((step, idx) => (
                    <div key={step.id} className="flex items-stretch gap-3">
                      {/* Vertical line + dot */}
                      <div className="flex flex-col items-center w-4 flex-shrink-0">
                        <div
                          className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                          style={{
                            borderColor: step.id === 'trigger' || step.id === 'message' ? '#FF5600' : '#C3C2BD',
                            backgroundColor: step.id === 'trigger' || step.id === 'message' ? '#FF5600' : 'transparent',
                          }}
                        />
                        {idx < procedureFlowSteps.length - 1 && (
                          <div className="w-px flex-1 min-h-[28px]" style={{ backgroundColor: '#C3C2BD' }} />
                        )}
                      </div>
                      {/* Step card */}
                      <div
                        className="flex-1 mb-2 px-3 py-2 border text-sm"
                        style={{
                          borderColor: step.id === 'trigger' || step.id === 'message' ? '#FF5600' : '#c5c5c140',
                          backgroundColor: step.id === 'trigger' || step.id === 'message' ? '#FF560010' : '#f8f8f4',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-wider text-black/50">{step.type.replace('_', ' ')}</span>
                          {step.id === 'condition' && (
                            <span className="font-[var(--sweo-font-mono)] text-[10px] text-[#FF5600]">IF amount &gt; $100</span>
                          )}
                        </div>
                        <p className="text-black/80 mt-0.5">{step.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-black/10 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-black/50">
                    <span className="w-2 h-2 rounded-full bg-[#FF5600]" />
                    <span>Trigger/Output</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-black/50">
                    <span className="w-2 h-2 rounded-full border border-[#C3C2BD]" />
                    <span>Processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 01c Channels ─── */}
      <div className="sweo-perf-section sweo-theme-light" style={{ borderTop: '1px solid #c5c5c140' }}>
        <span className="sweo-perf-corner sweo-perf-corner-tl" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-tr" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-bl" aria-hidden="true" />
        <span className="sweo-perf-corner sweo-perf-corner-br" aria-hidden="true" />

        <span className="sweo-perf-label">
          <span className="sweo-perf-label-dot" />
          01c — Channels
        </span>

        <div className="sweo-perf-content">
          <div className="flex flex-col gap-3 sm:gap-6 mb-6 sm:mb-12">
            <h3 className="sweo-perf-heading">
              <span className="block max-w-[16ch]">One agent. Every channel.</span>
              <span className="block lg:text-right">Unified inbox.</span>
            </h3>
            <p className="text-sm sm:text-base text-black/60 max-w-[65ch]">
              Deploy across web chat, email, WhatsApp, SMS, and voice — all from a single
              dashboard with a unified inbox.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/inbox" className="sweo-btn-secondary">
                Open Inbox
              </Link>
            </div>
          </div>

          {/* Fig 1.E - Channel Volume + Resolution Rate */}
          <div className="flex flex-col gap-2 md:gap-3 xl:gap-4 mb-8">
            <div className="mb-8 flex w-full flex-col lg:mb-3">
              <span className="sweo-perf-fig-label">
                <span className="block w-auto">Fig 1.E&nbsp;-&nbsp;</span>
                <span className="flex-1">Channel volume &amp; resolution rate across all deployments</span>
              </span>
              <div className="sweo-perf-chart-box">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                <div className="w-full mt-4">
                  <div className="flex items-end gap-2 sm:gap-4 md:gap-8 justify-center pb-4" style={{ height: 200 }}>
                    {channelVolumeData.map((ch) => {
                      const maxVol = 4520;
                      const totalHeight = `${(ch.volume / maxVol) * 100}%`;
                      const resolvedHeight = `${(ch.resolved / ch.volume) * 100}%`;
                      return (
                        <div key={ch.channel} className="flex flex-col items-center gap-1 sm:gap-2 flex-1 min-w-0 h-full justify-end">
                          <div className="sweo-perf-bar-label" style={{ borderColor: '#00000060' }}>
                            <span className="font-[var(--sweo-font-mono)] text-[9px] sm:text-[11px] uppercase tracking-wider text-black/60">
                              {ch.volume.toLocaleString('en-US')}
                            </span>
                          </div>
                          <div
                            className="w-full relative overflow-hidden"
                            style={{
                              height: totalHeight,
                              border: '1px solid #00000020',
                              backgroundColor: '#E8E7E0',
                            }}
                          >
                            {/* Resolved portion */}
                            <div
                              className="absolute bottom-0 left-0 right-0"
                              style={{
                                height: resolvedHeight,
                                backgroundColor: '#FF5600',
                              }}
                            >
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundImage: 'radial-gradient(circle, #EFEFEF 1px, transparent 1px)',
                                  backgroundSize: '6.67px 6.67px',
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-center min-w-0">
                            <span className="font-[var(--sweo-font-mono)] text-[9px] sm:text-[11px] uppercase tracking-wider text-black/80 block truncate">
                              {ch.channel}
                            </span>
                            <span className="font-[var(--sweo-font-mono)] text-[9px] sm:text-[10px] text-[#FF5600]">
                              {ch.rate}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-2 px-2">
                    <div className="flex items-center gap-1.5 text-xs text-black/50">
                      <span className="w-3 h-2 bg-[#FF5600] inline-block" />
                      <span>Resolved by SWEO</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-black/50">
                      <span className="w-3 h-2 bg-[#E8E7E0] border border-black/20 inline-block" />
                      <span>Total volume</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fig 1.F + Inbox Views Row */}
          <div className="grid grid-cols-1 gap-2 pb-8 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-3 lg:py-10 min-w-0">
            {/* Fig 1.F - Channel Growth Over Time */}
            <div className="relative row-span-2 grid w-full min-w-0" style={{ gridTemplateRows: 'subgrid' }}>
              <div>
                <span className="sweo-perf-fig-label">
                  <span className="block w-auto">Fig 1.F&nbsp;-&nbsp;</span>
                  <span className="flex-1">Conversation volume by channel over time</span>
                </span>
              </div>
              <div className="sweo-perf-chart-box">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                <div className="w-full h-[180px] sm:h-[260px] lg:h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={channelTimeData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                      <defs>
                        <linearGradient id="gradWeb" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF5600" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#FF5600" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gradEmail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#313130" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#313130" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="8 8" strokeWidth={0.5} stroke="#c5c5c140" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                        tickLine={false}
                        axisLine={false}
                        width={35}
                      />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #ccc', fontFamily: 'var(--sweo-font-mono)', fontSize: 11 }}
                      />
                      <Area type="monotone" dataKey="web" stackId="1" stroke="#FF5600" strokeWidth={2} fill="url(#gradWeb)" name="Web Chat" />
                      <Area type="monotone" dataKey="email" stackId="1" stroke="#313130" strokeWidth={1.5} fill="url(#gradEmail)" name="Email" />
                      <Area type="monotone" dataKey="whatsapp" stackId="1" stroke="#25D366" strokeWidth={1} fill="#25D36615" name="WhatsApp" />
                      <Area type="monotone" dataKey="sms" stackId="1" stroke="#7C3AED" strokeWidth={1} fill="#7C3AED10" name="SMS" />
                      <Area type="monotone" dataKey="voice" stackId="1" stroke="#C3C2BD" strokeWidth={1} fill="#C3C2BD10" name="Voice" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Unified Inbox Panel */}
            <div className="relative row-span-2 mt-8 grid w-full min-w-0 lg:mt-0" style={{ gridTemplateRows: 'subgrid' }}>
              <div>
                <span className="sweo-perf-fig-label">
                  <span className="block w-auto">Fig 1.G&nbsp;-&nbsp;</span>
                  <span className="flex-1">Unified Inbox views</span>
                </span>
              </div>
              <div className="sweo-perf-chart-box flex-col p-2 sm:p-4">
                <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
                <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

                {/* Mock inbox sidebar */}
                <div className="space-y-0 mb-4">
                  <p className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-wider text-black/50 mb-3">Inbox Navigation</p>
                  {inboxViews.map((v, idx) => (
                    <div
                      key={v.view}
                      className="flex items-center justify-between py-2.5 px-3 text-sm border-b border-black/5 last:border-0"
                      style={{
                        backgroundColor: idx === 2 ? '#FF560010' : 'transparent',
                        borderLeft: idx === 2 ? '2px solid #FF5600' : '2px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className={idx === 2 ? 'text-black font-medium' : 'text-black/70'}>{v.view}</span>
                      </div>
                      <span
                        className="font-[var(--sweo-font-mono)] text-[11px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: idx === 2 ? '#FF5600' : '#E8E7E0',
                          color: idx === 2 ? '#fff' : '#00000060',
                        }}
                      >
                        {v.count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Channel icons */}
                <div className="mt-auto pt-4 border-t border-black/10">
                  <p className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-wider text-black/50 mb-3">Active Channels</p>
                  <div className="flex flex-wrap gap-2">
                    {['Messenger', 'Email', 'WhatsApp', 'SMS', 'Voice'].map((ch) => (
                      <div
                        key={ch}
                        className="py-2 px-3 text-center border border-black/10 rounded text-[10px] font-[var(--sweo-font-mono)] uppercase tracking-wider text-black/60 hover:border-[#FF5600] hover:text-[#FF5600] transition-colors cursor-default"
                      >
                        {ch}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Performance Section ─── */
const resolutionTimeData = [
  { month: 'MAY 2023', rate: 23 },
  { month: 'JUN 2023', rate: 29 },
  { month: 'JUL 2023', rate: 34 },
  { month: 'AUG 2023', rate: 35 },
  { month: 'SEP 2023', rate: 36 },
  { month: 'OCT 2023', rate: 37 },
  { month: 'NOV 2023', rate: 41 },
  { month: 'DEC 2023', rate: 41 },
  { month: 'JAN 2024', rate: 43 },
  { month: 'FEB 2024', rate: 43 },
  { month: 'MAR 2024', rate: 41 },
  { month: 'APR 2024', rate: 45 },
  { month: 'MAY 2024', rate: 46 },
  { month: 'JUN 2024', rate: 46 },
  { month: 'JUL 2024', rate: 48 },
  { month: 'AUG 2024', rate: 49 },
  { month: 'SEP 2024', rate: 50 },
  { month: 'OCT 2024', rate: 52 },
  { month: 'NOV 2024', rate: 52 },
  { month: 'DEC 2024', rate: 53 },
  { month: 'JAN 2025', rate: 54 },
  { month: 'FEB 2025', rate: 55 },
  { month: 'MAR 2025', rate: 55 },
  { month: 'APR 2025', rate: 56 },
  { month: 'MAY 2025', rate: 59 },
  { month: 'JUN 2025', rate: 62 },
  { month: 'JUL 2025', rate: 65 },
  { month: 'AUG 2025', rate: 65 },
  { month: 'SEP 2025', rate: 66 },
  { month: 'OCT 2025', rate: 66 },
  { month: 'NOV 2025', rate: 67 },
  { month: 'DEC 2025', rate: 67 },
];

const competitorData = [
  { name: 'DECAGON', rate: 49 },
  { name: 'FORETHOUGHT', rate: 50 },
  { name: 'SWEO', rate: 73 },
];

const videoTestimonials = [
  {
    id: 'anthropic',
    title: 'Build vs. buy: Why Anthropic chose SWEO',
    thumbnail: '/fin/images/image_10.webp',
  },
  {
    id: 'lightspeed',
    title: 'AI at enterprise scale: Why Lightspeed chose SWEO',
    thumbnail: '/fin/images/image_6.webp',
  },
  {
    id: 'rocket',
    title: 'How Rocket Money operationalized AI',
    thumbnail: '/fin/images/image_7.webp',
  },
];

export function FinPerformance() {
  const [activeVideo, setActiveVideo] = useState(0);

  return (
    <section id="performance" className="sweo-perf-section sweo-theme-light">
      {/* Corner decorations */}
      <span className="sweo-perf-corner sweo-perf-corner-tl" aria-hidden="true" />
      <span className="sweo-perf-corner sweo-perf-corner-tr" aria-hidden="true" />
      <span className="sweo-perf-corner sweo-perf-corner-bl" aria-hidden="true" />
      <span className="sweo-perf-corner sweo-perf-corner-br" aria-hidden="true" />

      {/* Section Label */}
      <span className="sweo-perf-label">
        <span className="sweo-perf-label-dot" />
        Unrivaled Performance
      </span>

      <div className="sweo-perf-content">
        {/* Main Heading */}
        <div className="flex flex-col gap-3 sm:gap-6 mb-6 sm:mb-12">
          <h3 className="sweo-perf-heading">
            <span className="block max-w-[13ch]">SWEO outperforms every competitor.</span>
            <span className="block lg:text-right">Every time.</span>
          </h3>
        </div>

        {/* Fig 2.A - Resolution Rate Line Chart */}
        <div className="flex flex-col gap-2 md:gap-3 xl:gap-4 mb-8">
          <div className="mb-8 flex w-full flex-col lg:mb-3">
            <span className="sweo-perf-fig-label">
              <span className="block w-auto">Fig 2.A&nbsp;-&nbsp;</span>
              <span className="flex-1">SWEO&apos;s average resolution rate increases 1% every month</span>
            </span>
            <div className="sweo-perf-chart-box">
              {/* Dashed connectors (hidden on mobile) */}
              <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

              <div className="w-full" style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={resolutionTimeData} margin={{ top: 10, right: 0, bottom: 60, left: 0 }}>
                    <defs>
                      <linearGradient id="perfVertGrad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0" stopColor="#FF5600" stopOpacity={0} />
                        <stop offset="0.2" stopColor="#FF5600" stopOpacity={0.3} />
                        <stop offset="0.5" stopColor="#FF5600" stopOpacity={0.7} />
                        <stop offset="0.8" stopColor="#FF5600" stopOpacity={0.9} />
                        <stop offset="1" stopColor="#FF5600" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="8 8" strokeWidth={0.5} stroke="#c5c5c140" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                      angle={-90}
                      textAnchor="end"
                      interval="preserveStartEnd"
                      tickLine={false}
                      axisLine={false}
                      height={70}
                    />
                    <YAxis
                      tickFormatter={(v: number) => `${v}%`}
                      tick={{ fontSize: 11, fill: '#00000060', fontFamily: 'var(--sweo-font-mono)' }}
                      domain={[0, 70]}
                      ticks={[10, 20, 30, 40, 50, 60, 70]}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #ccc',
                        fontFamily: 'var(--sweo-font-mono)',
                        fontSize: 11,
                      }}
                      formatter={(value: number) => [`${value}%`, 'Resolution Rate']}
                    />
                    <Area
                      type="linear"
                      dataKey="rate"
                      stroke="#FF5600"
                      strokeWidth={2}
                      fill="url(#perfVertGrad)"
                      dot={{ r: 3, stroke: '#FF5600', strokeWidth: 1, fill: '#F4F3EC' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Fig 2.B + Fig 2.C Row */}
        <div className="grid grid-cols-1 gap-2 pb-8 lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-3 lg:py-10 min-w-0">
          {/* Fig 2.B - Bar Chart */}
          <div className="relative row-span-2 grid w-full min-w-0" style={{ gridTemplateRows: 'subgrid' }}>
            <div>
              <span className="sweo-perf-fig-label">
                <span className="block w-auto">Fig 2.B&nbsp;-&nbsp;</span>
                <span className="flex-1">SWEO wins every head-to-head test ON RESOLUTION RATE</span>
              </span>
            </div>
            <div className="sweo-perf-chart-box md:pl-4">
              <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

              <div className="mt-8 w-full">
                <div className="flex items-end gap-3 sm:gap-6 md:gap-10 justify-center pb-4" style={{ height: 220 }}>
                  {competitorData.map((comp) => {
                    const isSweo = comp.name === 'SWEO';
                    const barHeight = `${(comp.rate / 80) * 100}%`;
                    return (
                      <div key={comp.name} className="flex flex-col items-center gap-2 flex-1 min-w-0 sm:max-w-[120px] h-full justify-end">
                        {/* Value label */}
                        <div
                          className="sweo-perf-bar-label"
                          style={{
                            borderColor: isSweo ? '#FF5600' : '#00000060',
                          }}
                        >
                          <span className={`font-[var(--sweo-font-mono)] text-xs uppercase tracking-wider ${isSweo ? 'opacity-80' : 'opacity-60'}`}>
                            {comp.rate}%
                          </span>
                        </div>
                        {/* Bar */}
                        <div
                          className="w-full relative"
                          style={{
                            height: barHeight,
                            backgroundColor: isSweo ? '#FF5600' : '#E8E7E0',
                            border: `1px solid ${isSweo ? '#FF5600' : '#00000060'}`,
                          }}
                        >
                          {/* Dot pattern overlay */}
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `radial-gradient(circle, ${isSweo ? '#EFEFEF' : '#00000040'} 1px, transparent 1px)`,
                              backgroundSize: '6.67px 6.67px',
                            }}
                          />
                        </div>
                        {/* Label */}
                        <span
                          className={`font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-wider ${isSweo ? 'text-black font-semibold' : 'text-black/60'}`}
                        >
                          {comp.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-black/60 px-2 pb-5 lg:pr-4 lg:pb-0 lg:pl-0">
                  Resolution rate based on independent testing conducted by SWEO customers.
                </p>
              </div>
            </div>
          </div>

          {/* Fig 2.C - Customer Testimonial */}
          <div className="relative row-span-2 mt-8 grid w-full min-w-0 lg:mt-0" style={{ gridTemplateRows: 'subgrid' }}>
            <div>
              <span className="sweo-perf-fig-label">
                <span className="block w-auto">Fig 2.C&nbsp;-&nbsp;</span>
                <span className="flex-1">OptiTech Sverige AB</span>
              </span>
            </div>
            <div className="sweo-perf-chart-box flex-col justify-between p-2 sm:p-4">
              <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" />
              <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" />

              {/* Decorative side ticks */}
              <svg className="absolute top-0 bottom-0 -left-3 hidden h-full lg:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 382" aria-hidden="true">
                <g stroke="#C3C2BD">{Array.from({ length: 19 }, (_, i) => <line key={`g1-${i}`} x1="0" y1={327 + i * 3} x2="10" y2={327 + i * 3} />)}</g>
                <g stroke="#FF5600">{Array.from({ length: 19 }, (_, i) => <line key={`o1-${i}`} x1="0" y1={216 + i * 3} x2="10" y2={216 + i * 3} />)}</g>
                <g stroke="#C3C2BD">{Array.from({ length: 19 }, (_, i) => <line key={`g2-${i}`} x1="0" y1={107 + i * 3} x2="10" y2={107 + i * 3} />)}</g>
                <g stroke="#FF5600">{Array.from({ length: 18 }, (_, i) => <line key={`o2-${i}`} x1="0" y1={1 + i * 3} x2="10" y2={1 + i * 3} />)}</g>
              </svg>

              {/* Avatar */}
              <div className="mb-3 sm:mb-4 size-[60px] sm:size-[85px]">
                <div className="overflow-hidden rounded-sm">
                  <img
                    alt="Yazan Ghayad, Vice President of OptiTech Sverige AB"
                    width={85}
                    height={85}
                    className="w-full"
                    src="/fin/images/image_21.jpg"
                  />
                </div>
              </div>

              <div>
                <blockquote>
                  <p className="font-[var(--sweo-font-sans)] font-light text-base sm:text-xl md:text-xl xl:text-2xl leading-[1.4] md:leading-[1.4] xl:leading-[1.33] mb-3 sm:mb-5">
                    &ldquo;SWEO is in a completely different league. It&apos;s now involved in 99% of conversations and{' '}
                    <span className="bg-[#FF5600] text-white px-1">successfully resolves up to 65% end-to-end—even the more complex ones.</span>&rdquo;
                  </p>
                </blockquote>
                <p className="text-sm text-black/60">
                  <cite className="not-italic">Yazan Ghayad, Vice President of OptiTech Sverige AB</cite>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Testimonials */}
        <div className="mt-4">
          {/* Active Video Player */}
          <div className="relative overflow-hidden rounded-md bg-[var(--sweo-dark-blue)]">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={videoTestimonials[activeVideo].thumbnail}
                alt={videoTestimonials[activeVideo].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                {/* Overlay text */}
                <div className="absolute top-0 left-0 w-full p-3 lg:p-6 xl:p-8">
                  <p className="font-[var(--sweo-font-sans)] font-light text-sm sm:text-xl md:text-2xl xl:text-[2rem] text-white leading-tight max-w-[50ch]">
                    &ldquo;If you&apos;re debating whether to build your own AI solution or buy one, my advice would be to buy – and specifically, buy SWEO.&rdquo;
                  </p>
                </div>
                {/* Play button */}
                <button className="flex items-center gap-2 rounded-full border border-white/80 bg-white/20 backdrop-blur-lg px-4 py-3 text-white shadow-lg hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 25 25" className="w-5">
                    <path d="m6.972 3.903 12.444 8-12.444 8z" />
                  </svg>
                  <span className="font-[var(--sweo-font-mono)] text-xs uppercase tracking-wider">Play</span>
                </button>
              </div>
            </div>
          </div>

          {/* Video Picker */}
          <div className="mt-2 flex flex-col sm:flex-row sm:snap-x sm:snap-mandatory sm:overflow-x-auto gap-2 sm:gap-0 md:gap-3">
            {videoTestimonials.map((video, idx) => (
              <button
                key={video.id}
                data-active={idx === activeVideo}
                onClick={() => setActiveVideo(idx)}
                className="sweo-perf-video-card"
              >
                <div className="relative flex aspect-[4/3] w-[60px] sm:w-[85px] flex-none items-center justify-center overflow-hidden rounded-sm bg-[#161e2e] lg:w-[107px]">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid">
                  <span className="font-[var(--sweo-font-mono)] text-[10px] sm:text-xs uppercase tracking-wider mb-1 text-black/50">
                    {idx === activeVideo ? 'Now Playing' : 'Play Next'}
                  </span>
                  <span className="text-sm sm:text-base leading-snug line-clamp-2 pr-5 text-black">
                    {video.title}
                  </span>
                </div>
                <div className={`absolute top-2.5 right-2.5 flex h-5 w-6 rounded-md border ${idx === activeVideo ? 'border-black bg-black text-white' : 'border-black/50 text-black/50'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 25 25" className="m-auto w-4">
                    <path d="m6.972 3.903 12.444 8-12.444 8z" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Integrations Section (Rich Grid) ─── */

/* Inline SVG logos for helpdesk integrations */
function ZohoDeskLogo() {
  return (
    <svg viewBox="0 0 80 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Zoho Desk</text>
    </svg>
  );
}
function WhatsAppLogo() {
  return (
    <svg viewBox="0 0 90 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">WhatsApp</text>
    </svg>
  );
}
function GorgiasLogo() {
  return (
    <svg viewBox="0 0 65 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Gorgias</text>
    </svg>
  );
}
function ZendeskLogo() {
  return (
    <svg viewBox="0 0 75 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Zendesk</text>
    </svg>
  );
}
function SalesforceLogo() {
  return (
    <svg viewBox="0 0 95 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Salesforce</text>
    </svg>
  );
}
function SprinklrLogo() {
  return (
    <svg viewBox="0 0 72 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Sprinklr</text>
    </svg>
  );
}
function FrontLogo() {
  return (
    <svg viewBox="0 0 50 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Front</text>
    </svg>
  );
}
function JiraLogo() {
  return (
    <svg viewBox="0 0 35 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Jira</text>
    </svg>
  );
}
function FreshdeskLogo() {
  return (
    <svg viewBox="0 0 85 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Freshdesk</text>
    </svg>
  );
}
function HubSpotLogo() {
  return (
    <svg viewBox="0 0 75 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">HubSpot</text>
    </svg>
  );
}

type IntegrationsGridCell = {
  id: string;
  logo?: React.ReactNode;
  label?: string;
  isSweo?: boolean;
  rowSpan?: number;
  isEmpty?: boolean;
  dimmed?: boolean;
};

const _integrationsGrid: IntegrationsGridCell[] = [
  // Row 1
  { id: 'zoho', logo: <ZohoDeskLogo />, label: 'Zoho Desk' },
  { id: 'whatsapp', logo: <WhatsAppLogo />, label: 'WhatsApp' },
  { id: 'empty1', isEmpty: true },
  { id: 'gorgias', logo: <GorgiasLogo />, label: 'Gorgias' },
  { id: 'empty2', isEmpty: true },
  // Row 2
  { id: 'zendesk', logo: <ZendeskLogo />, label: 'Zendesk' },
  { id: 'empty3', isEmpty: true },
  { id: 'sweo', isSweo: true, rowSpan: 2 },
  { id: 'empty4', isEmpty: true },
  { id: 'salesforce', logo: <SalesforceLogo />, label: 'Salesforce' },
  // Row 3
  { id: 'sprinklr', logo: <SprinklrLogo />, label: 'Sprinklr' },
  { id: 'front', logo: <FrontLogo />, label: 'Front' },
  /* sweo spans into this row */
  { id: 'jira', logo: <JiraLogo />, label: 'Jira' },
  { id: 'empty5', isEmpty: true },
  // Row 4
  { id: 'empty6', isEmpty: true },
  { id: 'freshdesk', logo: <FreshdeskLogo />, label: 'Freshdesk' },
  { id: 'empty7', isEmpty: true, dimmed: true },
  { id: 'hubspot', logo: <HubSpotLogo />, label: 'HubSpot' },
  { id: 'empty8', isEmpty: true, dimmed: true },
];


export function FinIntegrations() {
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
              SWEO connects to your existing helpdesk, CRM, and commerce tools.
              Deploy alongside your current setup with zero complex migrations.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/docs" className="sweo-btn-secondary text-sm">
                See all integrations
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

/* ─── Technology Section (SWEO AI Engine — Interactive) ─── */
const engineSteps = [
  {
    number: 1,
    label: 'Refine the query',
    title: '[4.a.1] Refine the query',
    description:
      'In order to optimize the accuracy of an answer that an LLM generates, the inputs the LLM receives must be refined for comprehension.',
    model: null,
    image: '/fin/images/ai-engine-1.svg',
  },
  {
    number: 2,
    label: 'Retrieve relevant content',
    title: '[4.a.2] Retrieve relevant content',
    description:
      'The retrieval process, powered by our proprietary sweo-cx-retrieval model, searches across all knowledge sources and selects the most relevant information for accurate answers.',
    model: 'sweo-cx',
    image: '/fin/images/ai-engine-2.svg',
  },
  {
    number: 3,
    label: 'Rerank for precision',
    title: '[4.a.3] Rerank for precision',
    description:
      'The reranking process, powered by our proprietary sweo-cx-reranker model, scores retrieved content for relevance and accuracy, then selects the optimal pieces for the LLM to use.',
    model: 'sweo-cx',
    image: '/fin/images/ai-engine-3.svg',
  },
  {
    number: 4,
    label: 'Generate a response',
    title: '[4.a.4] Generate a response',
    description:
      'Using a bespoke generative process, it creates answers with the highest resolution potential. Custom Guidance controls tone and behavior, ensuring responses align with your brand.',
    model: null,
    image: '/fin/images/ai-engine-4.svg',
  },
  {
    number: 5,
    label: 'Validate accuracy',
    title: '[4.a.5] Validate accuracy',
    description:
      'In the final step, the SWEO AI Engine checks whether the LLM output meets response accuracy and safety standards.',
    model: null,
    image: '/fin/images/ai-engine-5.svg',
  },
  {
    number: 6,
    label: 'Engine optimization',
    title: '[4.a.6] Engine optimization',
    description:
      'To calibrate performance, the SWEO AI Engine uses integrated tools that optimize answer generation, efficiency, precision, and coverage.',
    model: null,
    image: '/fin/images/ai-engine-6.svg',
  },
];

const STEP_DURATION = 6000; // 6 seconds per step

export function FinTechnology() {
  const [activeStep, setActiveStep] = useState(3); // start at step 4 (index 3)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-cycle through steps
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % engineSteps.length);
    }, STEP_DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const selectStep = (index: number) => {
    setActiveStep(index);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % engineSteps.length);
    }, STEP_DURATION);
  };

  const goNext = () => selectStep((activeStep + 1) % engineSteps.length);
  const goPrev = () => selectStep((activeStep - 1 + engineSteps.length) % engineSteps.length);

  return (
    <section id="technology" className="sweo-section sweo-section-elevated">
      <div className="sweo-section-inner">
        {/* Header */}
        <div className="grid grid-cols-12 gap-x-4 gap-y-6 xl:grid-cols-10">
          <h2 className="font-[var(--sweo-font-serif)] font-light text-[1.25rem] md:text-[2.5rem] xl:text-[3.375rem] leading-[1] tracking-[-0.063rem] md:tracking-[-0.094rem] xl:tracking-[-0.188rem] col-span-12 max-w-[25ch] lg:col-span-5 text-balance text-[var(--sweo-content-primary)]"
            style={{ fontFamily: 'var(--sweo-font-serif)' }}
          >
            Powered by the SWEO AI Engine
          </h2>
          <div className="col-span-12 max-w-[420px] lg:pt-[0.35rem] xl:col-span-5 xl:pt-[0.6rem] lg:col-span-7 lg:col-start-6 lg:ml-[10%] xl:col-start-6">
            <p className="text-sm sm:text-base xl:text-lg leading-[1.375] text-[var(--sweo-content-secondary)]">
              <span className="mr-6 font-[var(--sweo-font-mono)] text-xs text-[var(--sweo-content-tertiary)] md:mr-10" style={{ fontFamily: 'var(--sweo-font-mono)' }}>04</span>
              The SWEO AI Engine is a purpose-built AI architecture specifically engineered
              for complex customer service queries. Every layer is optimized for accuracy,
              speed, and reliability — so SWEO can resolve more conversations, more
              effectively than competing AI Agents.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/docs" className="sweo-btn-secondary text-sm">
                Learn more
              </Link>
            </div>
          </div>
        </div>

        {/* Engine Visualization */}
        <div className="mb-4 md:mb-6 lg:my-12">
          {/* Figure label */}
          <div className="pb-3">
            <span
              className="text-current mb-3 flex w-full border-b border-current/20 pb-3 text-[11px] leading-none tracking-wider uppercase lg:mb-0 lg:border-b-0 lg:px-5"
              style={{ fontFamily: 'var(--sweo-font-mono)' }}
            >
              <span className="block w-auto">Fig 4.A&nbsp;-&nbsp;</span>
              <span className="flex-1">SWEO AI Engine</span>
            </span>

            {/* Main visualization container */}
            <div className="sweo-engine-viz relative w-full pb-3 lg:border lg:border-current/20 lg:p-2 lg:pb-8">
              {/* Corner decorations (mobile) */}
              <div className="lg:hidden">
                <div className="absolute top-0 left-0 z-[1] aspect-square w-6 border-t border-l border-white/20" />
                <div className="absolute top-0 right-0 z-[1] aspect-square w-6 border-t border-r border-white/20" />
                <div className="absolute bottom-0 left-0 z-[1] aspect-square w-6 border-b border-l border-white/20" />
                <div className="absolute right-0 bottom-0 z-[1] aspect-square w-6 border-r border-b border-white/20" />
              </div>

              {/* Dashed line decorations (desktop) */}
              <div className="hidden lg:block">
                <span aria-hidden="true" className="border border-dashed border-current/20 absolute -top-10 -left-px h-10 border-r-0" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 45%)' }} />
                <span aria-hidden="true" className="border border-dashed border-current/20 absolute -top-10 -right-px h-10 border-r-0" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 45%)' }} />
                <span aria-hidden="true" className="border border-dashed border-current/20 absolute -bottom-10 -left-px h-10 rotate-180 border-r-0" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 45%)' }} />
                <span aria-hidden="true" className="border border-dashed border-current/20 absolute -right-px -bottom-10 h-10 rotate-180 border-r-0" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 45%)' }} />
              </div>

              {/* Grid layout: steps on sides, diagram in center */}
              <div className="relative z-[1] grid w-full grid-cols-3">
                {/* Central diagram column */}
                <div className="relative col-span-3 m-6 aspect-square overflow-hidden md:col-span-3 lg:col-span-1 lg:col-start-2 lg:aspect-[387/1000]  lg:border-x lg:border-white/20">
                  {/* Grid background SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 486 718" className="absolute inset-0 -mx-12 h-full w-[calc(100%+92px)]">
                    <g stroke="#fff">
                      {[0, 96.6, 193.2, 289.8, 386.4].map((x) => (
                        <line key={`v-${x}`} x1={x + 1.5} y1="25.5" x2={x + 1.5} y2="697.5" strokeOpacity="0.1" />
                      ))}
                      {[25, 121, 217, 313, 409, 505, 601, 697].map((y) => (
                        <line key={`h-${y}`} x1="1" y1={y} x2="484" y2={y} strokeOpacity="0.1" />
                      ))}
                    </g>
                  </svg>

                  {/* Step images — only active one is visible */}
                  {engineSteps.map((step, i) => (
                    <div
                      key={step.number}
                      className="absolute inset-0 my-auto h-11/12 w-full transition-opacity ease-in-out duration-300 lg:h-full"
                      style={{ opacity: activeStep === i ? 1 : 0 }}
                    >
                      <img
                        alt={`${step.title} diagram`}
                        loading={i <= 1 ? 'eager' : 'lazy'}
                        className="size-full object-contain object-center"
                        style={{ position: 'absolute', inset: 0 }}
                        src={step.image}
                      />
                    </div>
                  ))}

                  {/* Side labels (desktop only) */}
                  <ul className="hidden xl:block xl:relative xl:h-full xl:w-full text-[10px] leading-none tracking-wider uppercase" style={{ fontFamily: 'var(--sweo-font-mono)' }}>
                    {engineSteps.map((step, i) => {
                      const isLeft = i % 2 === 0;
                      const tops = ['13%', '24%', '42%', '54%', '75%', '85%'];
                      return (
                        <li
                          key={step.number}
                          className={`absolute flex justify-center px-3 text-center transition-colors duration-300 ease-in-out ${
                            isLeft ? '-rotate-90 left-[-9%]' : 'rotate-90 right-[-13%]'
                          } ${activeStep === i ? 'text-[var(--sweo-orange)]' : ''}`}
                          style={{ top: tops[i] }}
                        >
                          {step.label}
                          <span className="absolute -bottom-4 mt-2 block w-full border-x border-t border-current/60 pb-1.5" />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Desktop step cards — overlaid on the sides */}
              <div className="relative z-[2] hidden lg:absolute lg:inset-0 lg:flex lg:flex-col lg:items-center">
                <ul className="lg:my-auto lg:grid lg:grid-cols-12 lg:gap-y-10 xl:gap-y-8 2xl:gap-y-16">
                  {engineSteps.map((step, i) => {
                    const isOdd = i % 2 === 0; // 0-indexed: even index = left side
                    return (
                      <li
                        key={step.number}
                        className={`block gap-y-3 lg:col-span-4 lg:mb-0 ${
                          isOdd ? 'lg:pl-6' : 'lg:pr-6'
                        } ${!isOdd ? 'lg:col-start-9' : ''} xl:${isOdd ? 'odd:translate-y-[-25%] odd:pr-8 odd:pl-10' : 'even:translate-y-[20%] even:pr-10 even:pl-8'}`}
                      >
                        <button
                          onClick={() => selectStep(i)}
                          className={`block h-full w-full cursor-pointer items-center justify-center text-left transition-opacity duration-300 ease-in-out lg:flex lg:px-[3vw] xl:px-10 ${
                            activeStep === i ? 'opacity-100' : 'opacity-50'
                          }`}
                        >
                          <div className="relative">
                            {/* Progress bar */}
                            <span className="absolute top-0 right-0 left-0 block h-px w-full overflow-hidden bg-current/20">
                              <span
                                className="absolute top-0 right-0 left-0 block h-px bg-[var(--sweo-orange)]"
                                style={{
                                  width: activeStep === i ? '100%' : '0%',
                                  transition: activeStep === i ? `width ${STEP_DURATION}ms linear` : 'none',
                                }}
                              />
                            </span>
                            <span
                              className="flex w-full items-center gap-2 pt-3 pb-2 text-[11px] leading-[135%] tracking-wider uppercase"
                              style={{ fontFamily: 'var(--sweo-font-mono)' }}
                            >
                              <span
                                className={`block size-2 -translate-y-px transition-colors duration-300 ease-in-out ${
                                  activeStep === i ? 'bg-[var(--sweo-orange)]' : 'bg-current/20'
                                }`}
                              />
                              {step.title}
                            </span>
                            <p className="text-sm leading-[1.286] tracking-[0.031rem] text-current/80">
                              {step.description}
                            </p>
                            {step.model && (
                              <div className="mt-3 flex items-center gap-2">
                                <div className="flex size-4 items-center justify-center rounded-full bg-[var(--sweo-orange)] text-[var(--sweo-dark-blue)] xl:size-6">
                                  <SweoLogo className="w-3 h-3" />
                                </div>
                                <span
                                  className="text-current text-[0.6875rem] leading-[1.273] tracking-[0.094rem] uppercase"
                                  style={{ fontFamily: 'var(--sweo-font-mono)' }}
                                >
                                  Powered by {step.model}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Mobile: active step card + navigation */}
              <div className="relative z-[2] mx-6 mb-6 block lg:hidden">
                <div>
                  <span className="absolute top-0 right-0 left-0 block h-px w-full overflow-hidden bg-current/20">
                    <span
                      className="absolute top-0 right-0 left-0 block h-px bg-[var(--sweo-orange)]"
                      style={{
                        width: '100%',
                        transition: `width ${STEP_DURATION}ms linear`,
                      }}
                    />
                  </span>
                  <span
                    className="flex w-full items-center gap-2 py-3 text-[11px] leading-none tracking-wider uppercase"
                    style={{ fontFamily: 'var(--sweo-font-mono)' }}
                  >
                    <span className="block size-2 -translate-y-px bg-[var(--sweo-orange)]" />
                    {engineSteps[activeStep].title}
                  </span>
                  <p className="text-sm tracking-normal text-current/80">
                    {engineSteps[activeStep].description}
                  </p>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={goPrev} className="flex size-6 cursor-pointer items-center justify-center border border-current/80 text-current/80">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 9 9" className="w-1/2 rotate-180">
                      <path fill="currentColor" d="M8.354 4.061a.5.5 0 0 1 0 .708L5.172 7.95a.5.5 0 0 1-.708-.708l2.829-2.828-2.829-2.828A.5.5 0 1 1 5.172.88l3.182 3.18ZM0 3.915h8v1H0z" />
                    </svg>
                  </button>
                  <button onClick={goNext} className="flex size-6 cursor-pointer items-center justify-center border border-current/80 text-current/80">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 9 9" className="w-1/2">
                      <path fill="currentColor" d="M8.354 4.061a.5.5 0 0 1 0 .708L5.172 7.95a.5.5 0 0 1-.708-.708l2.829-2.828-2.829-2.828A.5.5 0 1 1 5.172.88l3.182 3.18ZM0 3.915h8v1H0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust & Compliance Section ─── */
const complianceBadges = [
  'GDPR Compliant',
  'ISO 27001',
  'EU Data Residency',
  'SOC 2 Type II',
  'CCPA Compliant',
];

export function FinTrust() {
  return (
    <div className="sweo-trust-marquee-wrapper overflow-hidden py-4 sm:py-8 border-y border-[var(--sweo-border-decorative)]">
      <div className="sweo-section-inner mb-4">
        <span
          className="text-[11px] tracking-wider uppercase text-[var(--sweo-content-tertiary)]"
          style={{ fontFamily: 'var(--sweo-font-mono)' }}
        >
          Trusted and fully certified
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

/* ─── Platform Section (SWEO Flywheel) ─── */
const flywheelPhases = [
  {
    phase: 'Analyze',
    description: 'AI-powered insights detect content gaps and surface opportunities to improve.',
    icon: '',
  },
  {
    phase: 'Train',
    description: 'Knowledge base, procedures, policies, and data connectors — teach SWEO your business.',
    icon: '',
  },
  {
    phase: 'Test',
    description: 'Simulate conversations before launch to validate accuracy and coverage.',
    icon: '',
  },
  {
    phase: 'Deploy',
    description: 'Go live across chat, email, WhatsApp, SMS, and voice with one click.',
    icon: '',
  },
];

export function FinAITeam() {
  return (
    <section id="platform" className="sweo-section sweo-section-elevated">
      <div className="sweo-section-inner">
        <div className="grid grid-cols-12 gap-3 sm:gap-4 xl:grid-cols-10 mb-6 sm:mb-12">
          <div className="col-span-12 lg:col-span-5">
            <p className="sweo-section-number mb-2 sm:mb-4">05</p>
            <h3 className="sweo-section-heading">
              The SWEO Flywheel: continuous improvement, built in
            </h3>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 xl:col-span-4 xl:col-start-7">
            <p className="sweo-section-description mb-4 sm:mb-6">
              SWEO doesn&apos;t just answer questions — it gets smarter over time. The Flywheel
              continuously analyzes performance, identifies knowledge gaps, and suggests
              improvements so your AI agent keeps getting better.
            </p>
            <Link href="/docs" className="sweo-btn-secondary text-sm">
              Learn about the Flywheel
            </Link>
          </div>
        </div>

        {/* Flywheel Phases */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {flywheelPhases.map((phase, i) => (
            <div key={phase.phase} className="sweo-engine-step text-center">
              <div className="text-xl sm:text-3xl mb-2 sm:mb-3">{phase.icon}</div>
              <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                <div className="sweo-engine-step-number">{i + 1}</div>
                <h4 className="text-sm font-semibold">{phase.phase}</h4>
              </div>
              <p className="text-sm text-[var(--sweo-content-secondary)] leading-relaxed">
                {phase.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ─── Footer ─── */
const footerSections = [
  {
    title: 'Product',
    links: [
      { text: 'Home', href: '/' },
      { text: 'Knowledge Base', href: '/dashboard/knowledge' },
      { text: 'Procedures', href: '/dashboard/overview' },
      { text: 'Channels', href: '/dashboard/settings' },
      { text: 'Inbox', href: '/dashboard/inbox' },
      { text: 'Reports', href: '/dashboard/reports' },
    ],
  },
  {
    title: 'AI Technology',
    links: [
      { text: 'SWEO AI Engine', href: '/docs' },
      { text: 'RAG Pipeline', href: '/docs' },
      { text: 'Policy Engine', href: '/docs' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { text: 'Software & Technology', href: '/solutions/technology' },
      { text: 'eCommerce', href: '/solutions/ecommerce' },
      { text: 'Financial Services', href: '/solutions/financial-services' },
      { text: 'Gaming', href: '/solutions/gaming' },
      { text: 'Enterprise', href: '/solutions/enterprise' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { text: 'Documentation', href: '/docs' },
      { text: 'API Reference', href: '/docs' },
      { text: 'Help Center', href: '/docs' },
    ],
  },
  {
    title: 'Get Started',
    links: [
      { text: 'Free trial', href: '/auth/sign-up' },
      { text: 'Sign in', href: '/auth/sign-in' },
      { text: 'Contact us', href: '/contact-sales' },
    ],
  },
  {
    title: 'Company',
    links: [
      { text: 'About', href: '/' },
      { text: 'Privacy Policy', href: '/privacy-policy' },
      { text: 'Terms of Service', href: '/terms-of-service' },
    ],
  },
];

export function FinCTABanner() {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    gdpr: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    // Simulate send
    await new Promise((r) => setTimeout(r, 1500));
    setFormState('sent');
    setFormData({ name: '', email: '', company: '', message: '', gdpr: false });
    setTimeout(() => setFormState('idle'), 4000);
  };

  return (
    <section className="sweo-cta-banner" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background image with dark overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/IMG_9599.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          zIndex: 1,
        }}
      />
      <div className="mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6 relative z-20 overflow-hidden gap-4 py-12 sm:py-24 xl:py-32">
        <div className="relative mx-auto max-w-5xl">
          <div className="relative z-2 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-16 items-start">
            {/* Left: Heading */}
            <div>
              <div className="mb-4 sm:mb-6 grid gap-2 sm:gap-4">
                <h2 className="sweo-cta-banner-heading">
                  <span className="inline text-[var(--sweo-content-secondary)]">Get started with</span>{' '}
                  <span className="text-[var(--sweo-content-primary)] inline">SWEO today</span>
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[var(--sweo-content-secondary)] max-w-md leading-relaxed">
                Tell us about your needs and we&apos;ll get back to you within 24 hours with a tailored solution.
              </p>
            </div>

            {/* Right: Contact Form */}
            <form onSubmit={handleSubmit} className="sweo-perf-chart-box flex-col p-0" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span className="sweo-perf-dash sweo-perf-dash-br" aria-hidden="true" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
              <span className="sweo-perf-dash sweo-perf-dash-bl" aria-hidden="true" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
              <span className="sweo-perf-dash sweo-perf-dash-tl" aria-hidden="true" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
              <span className="sweo-perf-dash sweo-perf-dash-tr" aria-hidden="true" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />

              {/* Form header */}
              <div className="px-3 sm:px-5 pt-3 sm:pt-5 pb-2 sm:pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-[0.1em] text-white/50">
                  Contact — Get in touch
                </span>
              </div>

              <div className="p-3 sm:p-5 flex flex-col gap-3 sm:gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-[0.1em] text-white/50" htmlFor="cta-name">Name</label>
                    <input
                      id="cta-name"
                      type="text"
                      required
                      placeholder="Your name"
                      className="sweo-contact-input-v2"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-[0.1em] text-white/50" htmlFor="cta-email">Email</label>
                    <input
                      id="cta-email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="sweo-contact-input-v2"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-[0.1em] text-white/50" htmlFor="cta-company">Company</label>
                  <input
                    id="cta-company"
                    type="text"
                    placeholder="Company name"
                    className="sweo-contact-input-v2"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-[0.1em] text-white/50" htmlFor="cta-message">Message</label>
                  <textarea
                    id="cta-message"
                    required
                    rows={4}
                    placeholder="Tell us about your customer service needs..."
                    className="sweo-contact-input-v2"
                    style={{ resize: 'vertical', minHeight: '5rem' }}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
              </div>

              {/* GDPR consent */}
              <div className="px-3 sm:px-5 pt-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={formData.gdpr}
                    onChange={(e) => setFormData({ ...formData, gdpr: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border border-white/20 bg-transparent accent-[#FF5600] cursor-pointer flex-shrink-0"
                  />
                  <span className="text-[12px] leading-[1.5] text-white/45 group-hover:text-white/60 transition-colors">
                    Jag godkänner att mina uppgifter lagras och behandlas i enlighet med <Link href="/privacy-policy" className="underline text-white/60 hover:text-white/80">dataskyddspolicyn</Link> och GDPR.
                  </span>
                </label>
              </div>

              {/* Form footer */}
              <div className="px-3 sm:px-5 pb-3 sm:pb-5 pt-2 sm:pt-3 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={formState === 'sending' || !formData.gdpr}
                  className="w-full py-3 text-sm font-normal tracking-tight rounded-md transition-colors duration-300"
                  style={{
                    backgroundColor: formState === 'sent' ? '#25D366' : '#FF5600',
                    color: '#fff',
                    border: 'none',
                    cursor: (formState === 'sending' || !formData.gdpr) ? 'not-allowed' : 'pointer',
                    opacity: (formState === 'sending' || !formData.gdpr) ? 0.5 : 1,
                  }}
                >
                  {formState === 'sending' ? 'Sending...' : formState === 'sent' ? '✓ Message sent!' : 'Send message'}
                </button>
                {formState === 'sent' && (
                  <p className="text-xs text-center text-white/50 font-[var(--sweo-font-mono)]">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinFooter() {
  return (
    <footer className="sweo-footer">
      <div className="sweo-section-inner">
        {/* Desktop Footer */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h3 className="sweo-footer-heading">{section.title}</h3>
              <ul className="flex flex-col gap-1">
                {section.links.map((link) => (
                  <li key={link.text}>
                    <Link
                      href={link.href}
                      className="sweo-footer-link"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile Footer Accordion */}
        <div className="md:hidden space-y-0">
          {footerSections.map((section) => (
            <details key={section.title} className="group border-b border-[var(--sweo-border-decorative)]">
              <summary className="flex w-full cursor-pointer items-center justify-between py-4 text-[var(--sweo-content-secondary)] hover:text-[var(--sweo-content-primary)]">
                <h3 className="sweo-footer-heading">{section.title}</h3>
                <svg
                  width="17"
                  height="17"
                  fill="currentColor"
                  className="rotate-90 group-open:rotate-[270deg] transition-transform"
                  viewBox="0 0 17 17"
                >
                  <path d="M6.5 3.5L11 8.5L6.5 13.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </summary>
              <div className="pb-4">
                <ul className="flex flex-col gap-1">
                  {section.links.map((link) => (
                    <li key={link.text}>
                      <Link
                        href={link.href}
                        className="sweo-footer-link block py-0.5"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="sweo-dashed-line mt-8 mb-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--sweo-content-tertiary)]">
          <div className="flex items-center gap-2">
            <SweoLogo className="w-5 h-5" />
            <span>© {new Date().getFullYear()} OptiTech Sverige AB</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms-of-service" className="hover:text-[var(--sweo-content-primary)] transition-colors">
              Terms
            </Link>
            <Link href="/privacy-policy" className="hover:text-[var(--sweo-content-primary)] transition-colors">
              Privacy
            </Link>
            <a href="mailto:kontakt@sweo.ai" className="hover:text-[var(--sweo-content-primary)] transition-colors">
              kontakt@sweo.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
