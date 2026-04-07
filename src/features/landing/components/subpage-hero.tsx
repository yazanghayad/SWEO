/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

interface SubpageHeroProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
  heroImage?: string;
  /** Alt text for the hero image. Defaults to empty string for decorative images. */
  heroImageAlt?: string;
  /** Full-width background image behind the hero (gradient-faded at bottom) */
  heroBackground?: string;
  hideCtas?: boolean;
  /** 'large' = voice/train sized H1, 'standard' = capabilities sized */
  variant?: 'standard' | 'large';
  children?: React.ReactNode;
}

export function SubpageHero({
  title,
  description,
  primaryCta = 'Start free trial',
  primaryHref = '/auth/sign-up',
  secondaryCta = 'View demo',
  secondaryHref = '/docs',
  heroImage,
  heroImageAlt,
  heroBackground,
  hideCtas,
  variant = 'large',
  children,
}: SubpageHeroProps) {
  const hasImage = !!heroImage;

  const h1 =
    variant === 'large'
      ? 'enable-ligatures font-serif font-light text-[2.75rem] md:text-[4.5rem] xl:text-[6rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.219rem] xl:tracking-[-0.188rem] max-w-[20ch] text-content-primary/60 [&>strong]:font-normal [&>strong]:text-content-primary'
      : 'font-serif font-light text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem] max-w-[20ch] text-content-primary/60 [&>strong]:font-normal [&>strong]:text-content-primary';

  const desc =
    'font-sans text-[1rem] md:text-[1rem] xl:text-[1.125rem] leading-[1.375] md:leading-[1.375] xl:leading-[1.33] tracking-[0rem] max-w-[35ch] text-content-primary/60 [&>strong]:text-content-primary';

  return (
    <div className="@container relative overflow-hidden">
      {/* Background image (absolute, gradient-faded) */}
      {heroBackground && (
        <div className="absolute inset-0 z-0">
          <img
            src={heroBackground}
            alt=""
            role="presentation"
            aria-hidden="true"
            className="h-full w-full object-cover object-top"
            loading="eager"
            decoding="async"
          />
          {/* Bottom fade to page background */}
          <div className="absolute inset-0 bg-gradient-to-t from-background-screen from-5% via-background-screen/60 via-40% to-transparent" />
          {/* Optional subtle overall tint for text legibility */}
          <div className="absolute inset-0 bg-background-screen/30" />
        </div>
      )}

      <div
        className={`mx-auto w-full max-w-[1600px] px-3 relative grid grid-cols-12 items-center gap-x-4 pt-32 pb-14 md:px-10 lg:px-6 lg:py-0`}
      >
        <div
          className={`relative z-2 ${
            hasImage
              ? 'col-span-12 lg:col-span-6'
              : 'col-span-12 flex flex-col items-center text-center'
          }`}
        >
          <div
            className={`space-y-6 pb-12 lg:space-y-8 lg:pt-40 lg:pb-40 ${
              !hasImage ? 'flex flex-col items-center' : ''
            }`}
          >
            <h1 className={h1}>{title}</h1>

            {description && <p className={desc}>{description}</p>}

            {!hideCtas && (
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
            )}
          </div>
        </div>

        {hasImage && (
          <div className="col-span-12 lg:col-span-5 lg:col-start-8 relative">
            <img src={heroImage} alt={heroImageAlt || 'Feature illustration'} className="w-full h-auto" loading="lazy" />
          </div>
        )}

        {children && <div className="col-span-12">{children}</div>}
      </div>
    </div>
  );
}
