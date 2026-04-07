/* eslint-disable @next/next/no-img-element */
interface FeatureCardProps {
  badge?: string;
  title: string;
  description: string;
  image?: string;
  /** Image aspect ratio. 'square' (1:1) for grid cards, 'wide' (2.33:1) for full-width feature cards. Default: 'square'. */
  aspect?: 'square' | 'wide';
}

export function FeatureCard({
  badge,
  title,
  description,
  image,
  aspect = 'square',
}: FeatureCardProps) {
  const ratio = aspect === 'wide' ? 2.3307086614173227 : 1;

  /* ── Card WITH image: SWEO pattern ──
     Bordered box = image only (fills it edge-to-edge).
     Title + description sit BELOW the bordered box. */
  if (image) {
    return (
      <div
        className="flex w-full flex-col gap-x-4 gap-y-4"
        data-slot="card-inner"
      >
        {/* Bordered image box */}
        <div className="relative size-full border border-border-decorative bg-background-highlight">
          {/* Dot pattern */}
          <div className="absolute inset-0 h-full w-full bg-[radial-gradient(color-mix(in_oklab,var(--color-content-primary)_10%,_transparent)_1px,transparent_1px)] [background-size:20px_20px] z-0" />

          {/* Badge */}
          {badge && (
            <span className="inline-flex border border-border-decorative bg-background-highlight px-2.5 py-2 absolute -top-px -left-px z-3">
              <span className="font-mono uppercase text-[0.6875rem] leading-[1.273] tracking-[0.094rem] block translate-y-[1px] text-content-tertiary">
                {badge}
              </span>
            </span>
          )}

          {/* Image — fills the card, uses aspect-ratio container */}
          <div className="relative z-1 size-full">
            <div className="relative z-1">
              <div className="relative w-full">
                <div
                  className="relative w-full"
                  style={{ aspectRatio: ratio }}
                >
                  <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 z-1 h-full w-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text — outside the bordered box */}
        <div className="flex w-auto max-w-[45ch] flex-col gap-y-3">
          <div className="flex flex-col gap-y-2">
            <span className="font-sans text-[1rem] md:text-[1rem] xl:text-[1.125rem] leading-[1.375] md:leading-[1.375] xl:leading-[1.33] tracking-[0rem] text-content-primary">
              {title}
            </span>
            <p className="font-sans text-[0.875rem] leading-[1.286] tracking-[0.031rem] text-content-secondary">
              {description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Card WITHOUT image: text-only ──
     Everything inside the bordered box with padding. */
  return (
    <div className="relative size-full border border-border-decorative bg-background-highlight">
      {/* Dot pattern */}
      <div className="absolute inset-0 h-full w-full bg-[radial-gradient(color-mix(in_oklab,var(--color-content-primary)_10%,_transparent)_1px,transparent_1px)] [background-size:20px_20px] z-0" />

      <div
        className="relative z-3 flex h-full flex-col p-4 md:p-5 lg:p-8"
        data-slot="card-inner"
      >
        {/* Badge */}
        {badge && (
          <span className="inline-flex border border-border-decorative bg-background-highlight px-2.5 py-2 absolute -top-px -left-px z-3">
            <span className="font-mono uppercase text-[0.6875rem] leading-[1.273] tracking-[0.094rem] block translate-y-[1px] text-content-tertiary">
              {badge}
            </span>
          </span>
        )}

        {/* Text content */}
        <div className={`flex flex-col gap-2 ${badge ? 'mt-10' : 'mt-auto'}`}>
          <h3 className="font-sans text-[1rem] md:text-[1rem] xl:text-[1.125rem] leading-[1.375] md:leading-[1.375] xl:leading-[1.33] tracking-[0rem] text-content-primary">
            {title}
          </h3>
          <p className="font-sans text-[0.875rem] leading-[1.286] tracking-[0.031rem] text-content-secondary">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
