'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from '@/lib/i18n';

export function ContactSalesContent() {
  const t = useTranslations();
  const cs = t.contactSalesPage;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate submission — replace with real API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <>
      {/* ── Hero ── */}
      <div className="@container relative overflow-hidden">
        <div className="mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6 pt-32 pb-10 md:pb-14">
          <div className="mx-auto max-w-3xl text-center">
            <h1
              className="font-serif font-light text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem] text-content-primary"
              data-slot="heading"
            >
              {cs.discoverWhatFin}
            </h1>
            <p
              className="mt-5 font-sans text-[1rem] md:text-[1.125rem] leading-[1.4] text-content-secondary max-w-[42ch] mx-auto"
              data-slot="description"
            >
              {cs.heroSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main: Form + Benefits ── */}
      <div className="mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6 pb-24 md:pb-32">
        <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* ─ Form Column ─ */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-sm">
                <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-orange/20 text-orange">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={28}
                    height={28}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="font-serif text-2xl text-content-primary">
                  {cs.thankYouTitle}
                </h2>
                <p className="mt-2 text-content-secondary max-w-[30ch]">
                  {cs.thankYouMessage}
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="sweo-contact-form space-y-6 rounded-lg border border-white/10 bg-white/[0.03] p-6 md:p-10 backdrop-blur-sm"
              >
                {/* Name & Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="sweo-contact-label block mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-content-secondary">
                      {cs.formName}
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      autoComplete="name"
                      className="sweo-contact-input w-full rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-[0.9375rem] text-content-primary placeholder:text-content-tertiary outline-none transition-colors focus:border-orange focus:bg-white/[0.08]"
                    />
                  </div>
                  <div>
                    <label className="sweo-contact-label block mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-content-secondary">
                      {cs.formEmail}
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      className="sweo-contact-input w-full rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-[0.9375rem] text-content-primary placeholder:text-content-tertiary outline-none transition-colors focus:border-orange focus:bg-white/[0.08]"
                    />
                  </div>
                </div>

                {/* Company & Phone row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="sweo-contact-label block mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-content-secondary">
                      {cs.formCompany}
                    </label>
                    <input
                      required
                      type="text"
                      name="company"
                      autoComplete="organization"
                      className="sweo-contact-input w-full rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-[0.9375rem] text-content-primary placeholder:text-content-tertiary outline-none transition-colors focus:border-orange focus:bg-white/[0.08]"
                    />
                  </div>
                  <div>
                    <label className="sweo-contact-label block mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-content-secondary">
                      {cs.formPhone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      className="sweo-contact-input w-full rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-[0.9375rem] text-content-primary placeholder:text-content-tertiary outline-none transition-colors focus:border-orange focus:bg-white/[0.08]"
                    />
                  </div>
                </div>

                {/* Company size */}
                <div>
                  <label className="sweo-contact-label block mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-content-secondary">
                    {cs.companySize}
                  </label>
                  <select
                    required
                    name="companySize"
                    defaultValue=""
                    className="sweo-contact-input w-full rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-[0.9375rem] text-content-primary outline-none transition-colors focus:border-orange focus:bg-white/[0.08] appearance-none"
                  >
                    <option value="" disabled className="bg-[#0a1120]">
                      {cs.selectEmployees}
                    </option>
                    <option value="1-10" className="bg-[#0a1120]">
                      1–10
                    </option>
                    <option value="11-50" className="bg-[#0a1120]">
                      11–50
                    </option>
                    <option value="51-200" className="bg-[#0a1120]">
                      51–200
                    </option>
                    <option value="201-1000" className="bg-[#0a1120]">
                      201–1 000
                    </option>
                    <option value="1001+" className="bg-[#0a1120]">
                      1 000+
                    </option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="sweo-contact-label block mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-content-secondary">
                    {cs.formMessage}
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    className="sweo-contact-input sweo-contact-textarea w-full resize-y rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-[0.9375rem] text-content-primary placeholder:text-content-tertiary outline-none transition-colors focus:border-orange focus:bg-white/[0.08] min-h-[6rem]"
                  />
                </div>

                {/* Updates checkbox */}
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="updates"
                    className="mt-1 size-4 accent-orange rounded"
                  />
                  <span className="text-sm text-content-secondary leading-snug">
                    {cs.getUpdates}
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="a11y-focus relative inline-flex cursor-pointer items-center justify-center rounded-md text-center font-normal tracking-tight whitespace-nowrap transition-colors duration-400 ease-out-quart bg-interactive-primary text-interactive-control hover:bg-button-hover px-6 py-3 text-base/none disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="animate-spin size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="opacity-25"
                        />
                        <path
                          d="M4 12a8 8 0 018-8"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="opacity-75"
                        />
                      </svg>
                      {cs.submitButton}
                    </span>
                  ) : (
                    cs.submitButton
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ─ Benefits Column ─ */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:pt-2">
            <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-content-tertiary flex items-center gap-2 before:inline-block before:size-1.5 before:bg-orange">
              {cs.whySweoTitle}
            </h2>

            <BenefitCard
              number="01"
              title={cs.benefit1Title}
              description={cs.benefit1Desc}
            />
            <BenefitCard
              number="02"
              title={cs.benefit2Title}
              description={cs.benefit2Desc}
            />
            <BenefitCard
              number="03"
              title={cs.benefit3Title}
              description={cs.benefit3Desc}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function BenefitCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative border border-white/10 bg-white/[0.02] p-5 md:p-6 rounded-md">
      <span className="font-mono text-[0.6875rem] tracking-[0.1em] text-orange">
        {number}
      </span>
      <h3 className="mt-2 font-sans text-base font-medium text-content-primary">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-content-secondary">
        {description}
      </p>
      {/* Corner decorations */}
      <span
        aria-hidden="true"
        className="border border-dashed border-current/20 absolute -top-4 -left-px h-4 w-0 border-l-0"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}
      />
      <span
        aria-hidden="true"
        className="border border-dashed border-current/20 absolute -right-px -bottom-4 h-4 w-0 rotate-180 border-l-0"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}
      />
    </div>
  );
}
