interface SubpageSectionProps {
  id: string;
  label?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  number?: string;
  bg?: 'screen' | 'elevated';
  children?: React.ReactNode;
}

export function SubpageSection({
  id,
  label,
  title,
  description,
  number,
  bg = 'screen',
  children,
}: SubpageSectionProps) {
  return (
    <section
      id={id}
      data-slugify="id"
      className={`relative px-3 py-6 text-content-primary md:px-6 md:py-8 lg:px-12 lg:pb-12 scroll-mt-20 md:my-0 md:scroll-mt-24 [&>[data-slot='content']]:space-y-12 md:[&>[data-slot='content']]:space-y-20 ${
        bg === 'elevated' ? 'bg-background-elevated' : 'bg-background-screen'
      }`}
    >
      {/* Corner decorations — exact SWEO markup */}
      <span
        role="presentation"
        aria-hidden="true"
        className="absolute h-6 w-6 border-border-decorative top-0 left-0 border-t border-l md:top-2 md:left-2 hidden md:block z-10"
      />
      <span
        role="presentation"
        aria-hidden="true"
        className="absolute h-6 w-6 border-border-decorative top-0 right-0 border-t border-r md:top-2 md:right-2 hidden md:block z-10"
      />
      <span
        role="presentation"
        aria-hidden="true"
        className="absolute h-6 w-6 border-border-decorative bottom-0 left-0 border-b border-l md:bottom-2 md:left-2 hidden md:block z-10"
      />
      <span
        role="presentation"
        aria-hidden="true"
        className="absolute h-6 w-6 border-border-decorative bottom-0 right-0 border-b border-r md:bottom-2 md:right-2 hidden md:block z-10"
      />

      {/* Section label row */}
      {label && (
        <div className="font-mono uppercase text-[0.6875rem] leading-[1.273] tracking-[0.094rem] mb-6 flex items-center gap-2 border-b border-border-decorative pt-2 lg:pb-3 pb-2">
          {number && (
            <span className="mr-6 font-mono text-xs text-content-tertiary md:mr-10">
              {number}
            </span>
          )}
          {label}
        </div>
      )}

      {/* Heading group — 12→10 col grid */}
      <hgroup className="grid grid-cols-12 gap-x-4 gap-y-6 xl:grid-cols-10">
        <h2 className="col-span-12 xl:col-span-7 font-serif font-light text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem] text-content-primary/60 [&>strong]:font-normal [&>strong]:text-content-primary">
          {title}
        </h2>
        {description && (
          <p className="col-span-12 xl:col-start-8 xl:col-span-3 xl:self-end xl:text-right font-sans text-[0.875rem] leading-[1.286] tracking-[0.031rem] text-content-secondary">
            {description}
          </p>
        )}
      </hgroup>

      {/* Content area */}
      {children && (
        <div data-slot="content" className="@container mt-12 md:mt-20">
          {children}
        </div>
      )}
    </section>
  );
}
