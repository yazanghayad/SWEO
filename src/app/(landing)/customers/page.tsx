import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customers | Trusted by Leading Companies Worldwide',
  description:
    'See how leading companies use our AI-powered customer service platform to deliver exceptional support at scale.',
  openGraph: {
    images: ['/img/social/customers.jpg'],
  },
};

const logos = [
  { src: '/img/blueprint/customer-logos/anthropic.svg', alt: 'Anthropic' },
  { src: '/img/blueprint/customer-logos/miro.svg', alt: 'Miro' },
  { src: '/img/blueprint/customer-logos/synthesia.svg', alt: 'Synthesia' },
  { src: '/img/blueprint/customer-logos/bcg.svg', alt: 'BCG' },
  { src: '/img/blueprint/customer-logos/lightspeed.svg', alt: 'Lightspeed' },
  { src: '/img/blueprint/customer-logos/honeybook.svg', alt: 'HoneyBook' },
  { src: '/img/blueprint/customer-logos/gainsight.svg', alt: 'Gainsight' },
  { src: '/img/blueprint/customer-logos/clay.svg', alt: 'Clay' },
  { src: '/img/blueprint/customer-logos/dotdigital.svg', alt: 'Dotdigital' },
  { src: '/img/blueprint/customer-logos/gamma.svg', alt: 'Gamma' },
  {
    src: '/img/blueprint/customer-logos/culture_amp.svg',
    alt: 'Culture Amp',
  },
  {
    src: '/img/blueprint/customer-logos/uo_san_francisco.svg',
    alt: 'University of San Francisco',
  },
];

const stats = [
  { value: '50%', label: 'Average resolution rate' },
  { value: '99.97%', label: 'Uptime' },
  { value: '<2s', label: 'Average response time' },
  { value: '45M+', label: 'Conversations resolved' },
];

const testimonials = [
  {
    quote:
      'The AI agent resolved half of our customer queries instantly, letting our team focus on what matters most.',
    author: 'Head of Customer Support',
    company: 'Enterprise SaaS Company',
  },
  {
    quote:
      'We went from 24-hour response times to under 2 seconds. Our customers love the instant, accurate answers.',
    author: 'VP of Customer Experience',
    company: 'E-commerce Leader',
  },
  {
    quote:
      'The AI handles complex multi-step workflows that used to require senior agents. Resolution quality has never been higher.',
    author: 'Director of Operations',
    company: 'Financial Services Firm',
  },
];

export default function CustomersPage() {
  return (
    <>
      {/* Hero */}
      <div className="@container relative overflow-hidden">
        <div className="mx-auto w-full max-w-[1600px] px-3 relative grid grid-cols-12 items-center gap-x-4 pt-32 pb-20 md:px-10 lg:px-6 lg:pt-40 lg:pb-28">
          <div className="relative z-2 col-span-12 lg:col-start-2 lg:col-span-10 text-center">
            <div className="space-y-6 pb-8 lg:space-y-8">
              <h1 className="font-serif font-light text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem] text-content-primary/60 [&>strong]:font-normal [&>strong]:text-content-primary">
                <strong>Trusted by industry leaders</strong> who demand
                exceptional customer service.
              </h1>
              <p className="mx-auto max-w-[600px] font-sans text-[1rem] md:text-[1.125rem] leading-[1.375] text-content-primary/60">
                From startups to enterprises, companies worldwide rely on our
                AI-powered platform to transform their customer support.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  className="a11y-focus relative inline-flex cursor-pointer items-center justify-center rounded-md text-center font-normal tracking-tight whitespace-nowrap transition-colors duration-400 ease-out-quart focus-visible:outline-offset-2 lg:text-base/none bg-interactive-primary text-interactive-control hover:bg-button-hover px-4 py-3 text-base/none"
                  href="/contact-sales"
                >
                  Start free trial
                </a>
                <a
                  className="a11y-focus relative inline-flex cursor-pointer items-center justify-center rounded-md text-center font-normal tracking-tight whitespace-nowrap transition-colors duration-400 ease-out-quart focus-visible:outline-offset-2 lg:text-base/none border border-interactive-primary text-interactive-primary hover:bg-interactive-primary hover:text-interactive-control px-4 py-3 text-base/none"
                  href="/view-demos"
                >
                  View demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Logos */}
      <div className="mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6 py-16 lg:py-24">
        <p className="mb-10 text-center font-mono text-[0.6875rem] uppercase tracking-[0.094rem] text-content-tertiary">
          Powering support for leading companies
        </p>
        <div className="mx-auto grid max-w-[1000px] grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {logos.map((logo) => (
            <div
              key={logo.alt}
              className="flex items-center justify-center rounded-lg border border-border-decorative/40 bg-background-elevated p-6 transition-colors hover:border-border-decorative"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-8 w-auto max-w-[120px] opacity-70 brightness-0 invert"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="border-y border-border-decorative">
        <div className="mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6 py-16 lg:py-20">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-[2.5rem] md:text-[3.375rem] font-light leading-[1] tracking-[-0.063rem] text-content-primary">
                  {stat.value}
                </p>
                <p className="mt-2 font-sans text-sm text-content-tertiary">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6 py-16 lg:py-24">
        <h2 className="mb-12 text-center font-serif font-light text-[1.75rem] md:text-[2.5rem] leading-[1] tracking-[-0.063rem] text-content-primary">
          What our customers say
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-lg border border-border-decorative/40 bg-background-elevated p-6 lg:p-8"
            >
              <blockquote className="mb-6 font-sans text-[1rem] leading-[1.5] text-content-secondary">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div>
                <p className="font-sans text-sm font-medium text-content-primary">
                  {t.author}
                </p>
                <p className="font-sans text-sm text-content-tertiary">
                  {t.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        data-testid="cta-banner-wrapper"
        className="@container relative"
      >
        <div className="mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6 relative z-20 overflow-hidden gap-4 py-40">
          <div className="relative mx-auto max-w-[800px] text-center">
            <h2 className="font-serif font-light text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem] text-content-primary/60 [&>strong]:font-normal [&>strong]:text-content-primary mb-8">
              Join the companies <strong>transforming</strong> customer service
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                className="a11y-focus relative inline-flex cursor-pointer items-center justify-center rounded-md text-center font-normal tracking-tight whitespace-nowrap transition-colors duration-400 ease-out-quart focus-visible:outline-offset-2 lg:text-base/none bg-interactive-primary text-interactive-control hover:bg-button-hover px-4 py-3 text-base/none"
                href="/contact-sales"
              >
                Start free trial
              </a>
              <a
                className="a11y-focus relative inline-flex cursor-pointer items-center justify-center rounded-md text-center font-normal tracking-tight whitespace-nowrap transition-colors duration-400 ease-out-quart focus-visible:outline-offset-2 lg:text-base/none border border-interactive-primary text-interactive-primary hover:bg-interactive-primary hover:text-interactive-control px-4 py-3 text-base/none"
                href="/view-demos"
              >
                View demo
              </a>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-1 mx-auto max-w-screen-3xl">
          <div
            className="absolute inset-0 mask-t-from-transparent mask-t-to-black mask-t-to-40% mask-b-from-transparent mask-b-to-black mask-b-to-40%"
            role="presentation"
            aria-hidden="true"
          >
            <div className="overflow-hidden bg-cover absolute inset-0 size-full block md:hidden">
              <img
                alt="A decorative background"
                loading="lazy"
                decoding="async"
                className="size-full object-cover object-center opacity-100"
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                }}
                src="/img/backdrops/cta-banner-default-mobile.webp"
              />
            </div>
            <div className="overflow-hidden bg-cover absolute inset-0 size-full hidden md:block">
              <img
                alt="A decorative background"
                loading="lazy"
                decoding="async"
                className="size-full object-cover object-center opacity-100"
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                }}
                src="/img/backdrops/cta-banner-default-desktop.webp"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* SWEO Footer — static version injected into fin.ai pages */}
      </div>
    </>
  );
}
