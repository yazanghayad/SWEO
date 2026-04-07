interface SubpageFaqProps {
  heading?: string;
  items: { question: string; answer: string }[];
}

export function SubpageFaq({ heading = 'Questions?', items }: SubpageFaqProps) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6 flex flex-col gap-4 py-12 md:py-16 lg:py-20">
      <h2 className="font-serif font-light text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem] max-w-[20ch] mb-4 md:mb-6 lg:mb-12 text-content-primary">
        {heading}
      </h2>

      <div className="flex flex-col">
        {items.map((item, i) => (
          <div key={i}>
            {/* Dashed divider — exact SWEO */}
            <div className="h-px w-full bg-[linear-gradient(to_right,var(--color-border-decorative)_5px,transparent_5px)] [background-size:10px_1px]" />

            <details className="group/accordion transition-colors duration-200">
              <summary className="flex w-full cursor-pointer list-none items-center justify-between py-4 text-content-secondary transition-colors duration-200 group-open/accordion:text-content-primary hover:text-content-primary [&::-webkit-details-marker]:hidden">
                <span className="font-sans text-[1rem] md:text-[1rem] xl:text-[1.125rem] leading-[1.375] md:leading-[1.375] xl:leading-[1.33] tracking-[0rem]">
                  {item.question}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="rotate-90 text-content-primary group-open/accordion:rotate-270 ml-4 size-3 shrink-0 transition-transform duration-200"
                >
                  <path
                    d="M4.5 2.25L8.25 6L4.5 9.75"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div>
                <p className="font-sans text-[0.875rem] leading-[1.286] tracking-[0.031rem] max-w-[55ch] pb-4 text-content-secondary">
                  {item.answer}
                </p>
              </div>
            </details>
          </div>
        ))}

        {/* Final dashed divider */}
        <div className="h-px w-full bg-[linear-gradient(to_right,var(--color-border-decorative)_5px,transparent_5px)] [background-size:10px_1px]" />
      </div>
    </section>
  );
}
