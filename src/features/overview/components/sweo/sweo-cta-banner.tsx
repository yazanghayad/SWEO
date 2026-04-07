'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';

/* ─── CTA Banner with Contact Form ─── */
export function SweoCTABanner() {
  const t = useTranslations();
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
                  <span className="inline text-[var(--sweo-content-secondary)]">{t.cta.heading1}</span>{' '}
                  <span className="text-[var(--sweo-content-primary)] inline">{t.cta.heading2}</span>
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[var(--sweo-content-secondary)] max-w-md leading-relaxed">
                {t.cta.description}
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
                  {t.cta.formHeader}
                </span>
              </div>

              <div className="p-3 sm:p-5 flex flex-col gap-3 sm:gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-[0.1em] text-white/50" htmlFor="cta-name">{t.cta.nameLabel}</label>
                    <input
                      id="cta-name"
                      type="text"
                      required
                      placeholder={t.cta.namePlaceholder}
                      className="sweo-contact-input-v2"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-[0.1em] text-white/50" htmlFor="cta-email">{t.cta.emailLabel}</label>
                    <input
                      id="cta-email"
                      type="email"
                      required
                      placeholder={t.cta.emailPlaceholder}
                      className="sweo-contact-input-v2"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-[0.1em] text-white/50" htmlFor="cta-company">{t.cta.companyLabel}</label>
                  <input
                    id="cta-company"
                    type="text"
                    placeholder={t.cta.companyPlaceholder}
                    className="sweo-contact-input-v2"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-[var(--sweo-font-mono)] text-[11px] uppercase tracking-[0.1em] text-white/50" htmlFor="cta-message">{t.cta.messageLabel}</label>
                  <textarea
                    id="cta-message"
                    required
                    rows={4}
                    placeholder={t.cta.messagePlaceholder}
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
                    className="mt-0.5 w-4 h-4 rounded border border-white/20 bg-transparent accent-[var(--sweo-orange)] cursor-pointer flex-shrink-0"
                  />
                  <span className="text-[12px] leading-[1.5] text-white/45 group-hover:text-white/60 transition-colors">
                    {t.cta.gdprConsent} <Link href="/privacy-policy" className="underline text-white/60 hover:text-white/80">{t.cta.privacyPolicy}</Link> {t.cta.gdprEnd}
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
                    backgroundColor: formState === 'sent' ? '#25D366' : 'var(--sweo-orange)',
                    color: '#fff',
                    border: 'none',
                    cursor: (formState === 'sending' || !formData.gdpr) ? 'not-allowed' : 'pointer',
                    opacity: (formState === 'sending' || !formData.gdpr) ? 0.5 : 1,
                  }}
                >
                  {formState === 'sending' ? t.cta.sending : formState === 'sent' ? t.cta.sent : t.cta.sendMessage}
                </button>
                {formState === 'sent' && (
                  <p className="text-xs text-center text-white/50 font-[var(--sweo-font-mono)]">
                    {t.cta.sentFollowup}
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
