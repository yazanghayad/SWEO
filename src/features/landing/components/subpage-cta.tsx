import Link from 'next/link';

interface SubpageCtaProps {
  heading?: React.ReactNode;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
}

export function SubpageCta({
  heading,
  primaryCta = 'Get a demo',
  primaryHref = '/docs',
  secondaryCta = 'Try for free',
  secondaryHref = '/auth/sign-up',
}: SubpageCtaProps) {
  const defaultHeading = (
    <>
      <span className="inline text-content-primary/60">Get started with the </span>
      <span className="text-content-primary inline">#1 AI agent for customer service</span>
    </>
  );

  return (
    <div data-testid="cta-banner-wrapper" className="@container relative">
      {/* Gradient masks to blend edges */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_right,var(--color-background-screen)_0%,transparent_10%,transparent_90%,var(--color-background-screen)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_bottom,var(--color-background-screen)_0%,transparent_20%,transparent_80%,var(--color-background-screen)_100%)]" />

      {/* Subtle radial glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-background-highlight)_0%,transparent_70%)]" />

      <div className="mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6 relative z-20 overflow-hidden gap-4 py-40">
        <div className="flex flex-col items-start gap-8">
          <h2 className="text-current font-serif font-light text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem] text-balance text-left">
            {heading || defaultHeading}
          </h2>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={primaryHref}
              className="relative inline-flex cursor-pointer items-center justify-center rounded-md text-center font-normal tracking-tight whitespace-nowrap transition-colors duration-400 ease-out-quart focus-visible:outline-offset-2 lg:text-base/none bg-interactive-primary text-interactive-control hover:bg-button-hover px-[10px] py-2.5 text-base/none sm:px-4 lg:px-4 lg:py-2.5"
            >
              {primaryCta}
            </Link>
            <Link
              href={secondaryHref}
              className="relative inline-flex cursor-pointer items-center justify-center rounded-md text-center font-normal tracking-tight whitespace-nowrap transition-colors duration-400 ease-out-quart focus-visible:outline-offset-2 lg:text-base/none border border-interactive-primary text-interactive-primary hover:bg-interactive-primary hover:text-interactive-control px-4 py-3 text-base/none"
            >
              {secondaryCta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
