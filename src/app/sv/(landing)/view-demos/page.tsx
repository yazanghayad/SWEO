'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';

export default function SvViewDemosPage() {
  const router = useRouter();
  const t = useTranslations();
  const vd = t.viewDemosPage;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function goBack() {
    router.back();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={goBack}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-[var(--sweo-deep-blue)] text-content-primary shadow-2xl mx-4">
        {/* Close button */}
        <button
          onClick={goBack}
          className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-full bg-white/[0.06] text-content-secondary hover:bg-white/[0.12] hover:text-content-primary transition-colors"
          aria-label="Stäng"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Card body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left: description */}
          <div className="p-8 md:p-12 flex flex-col">
            <button
              onClick={goBack}
              className="text-sm font-mono text-content-secondary underline underline-offset-2 hover:text-content-primary mb-6 inline-block w-fit cursor-pointer transition-colors"
            >
              {vd.back}
            </button>
            <h2 className="font-serif text-[1.75rem] md:text-[2rem] leading-[1.15] font-light tracking-tight text-content-primary mb-4">
              {vd.formTitle}
            </h2>
            <p className="text-[0.9375rem] leading-relaxed text-content-secondary">
              {vd.formSubtitle}
            </p>
          </div>

          {/* Right: form */}
          <div className="p-8 md:p-12">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-orange/20 text-orange">
                  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-content-primary">
                  {vd.thankYouTitle}
                </h3>
                <p className="mt-2 text-content-secondary max-w-[30ch]">
                  {vd.thankYouMessage}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="sweo-contact-form space-y-5">
                <div>
                  <label className="sweo-contact-label block mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-content-secondary">
                    {vd.firstName}
                  </label>
                  <input required type="text" name="firstName" autoComplete="given-name" placeholder={vd.firstNamePlaceholder}
                    className="sweo-contact-input w-full border border-white/10 bg-white/[0.06] px-4 py-3 text-[0.9375rem] text-content-primary placeholder:text-content-tertiary outline-none transition-colors focus:border-orange focus:bg-white/[0.08]" />
                </div>
                <div>
                  <label className="sweo-contact-label block mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-content-secondary">
                    {vd.lastName}
                  </label>
                  <input required type="text" name="lastName" autoComplete="family-name" placeholder={vd.lastNamePlaceholder}
                    className="sweo-contact-input w-full border border-white/10 bg-white/[0.06] px-4 py-3 text-[0.9375rem] text-content-primary placeholder:text-content-tertiary outline-none transition-colors focus:border-orange focus:bg-white/[0.08]" />
                </div>
                <div>
                  <label className="sweo-contact-label block mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-content-secondary">
                    {vd.email}
                  </label>
                  <input required type="email" name="email" autoComplete="email" placeholder={vd.emailPlaceholder}
                    className="sweo-contact-input w-full border border-white/10 bg-white/[0.06] px-4 py-3 text-[0.9375rem] text-content-primary placeholder:text-content-tertiary outline-none transition-colors focus:border-orange focus:bg-white/[0.08]" />
                </div>
                <div>
                  <label className="sweo-contact-label block mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-content-secondary">
                    {vd.companySize}
                  </label>
                  <select required name="companySize" defaultValue=""
                    className="sweo-contact-input w-full border border-white/10 bg-white/[0.06] px-4 py-3 text-[0.9375rem] text-content-primary outline-none transition-colors focus:border-orange focus:bg-white/[0.08] appearance-none">
                    <option value="" disabled className="bg-[#0a1120]">{vd.selectEmployees}</option>
                    <option value="1-10" className="bg-[#0a1120]">1–10</option>
                    <option value="11-50" className="bg-[#0a1120]">11–50</option>
                    <option value="51-200" className="bg-[#0a1120]">51–200</option>
                    <option value="201-1000" className="bg-[#0a1120]">201–1 000</option>
                    <option value="1001+" className="bg-[#0a1120]">1 000+</option>
                  </select>
                </div>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input type="checkbox" name="updates" className="mt-1 size-4 accent-orange rounded" />
                  <span className="text-sm text-content-secondary leading-snug">
                    {vd.getUpdates}
                  </span>
                </label>
                <button type="submit" disabled={loading}
                  className="w-full px-6 py-3 text-base font-medium text-gray-900 bg-white transition-colors hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed border-0">
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      {vd.continueButton}
                    </span>
                  ) : (
                    vd.continueButton
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
