'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';

/* ─── Hero Section ─── */
export function SweoHero() {
  const t = useTranslations();
  return (
    <section className="sweo-hero relative flex items-center overflow-hidden" style={{ minHeight: '75vh' }}>
      {/* Background video — slow looping ocean */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/Blue%20Modern%20Ocean%20Intro%20Video.mp4" type="video/mp4" />
      </video>

      {/* Floating glow orbs */}
      <div className="sweo-hero-orb sweo-hero-orb--1 absolute z-[1]" />
      <div className="sweo-hero-orb sweo-hero-orb--2 absolute z-[1]" />
      <div className="sweo-hero-orb sweo-hero-orb--3 absolute z-[1]" />

      {/* Dot grid overlay — drifting */}
      <div className="sweo-hero-dot-grid absolute inset-0 z-[1]" />

      {/* Edge gradient overlay — top only */}
      <div className="absolute top-0 right-0 left-0 z-[2] h-[20px] w-full bg-gradient-to-b from-[var(--sweo-dark-blue)] via-[var(--sweo-dark-blue)] via-45% to-transparent md:h-[100px]" />

      {/* Content — left-aligned layout */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6">
        <div className="flex h-[calc(75vh-10rem)] flex-col items-start justify-center md:h-[calc(75vh-12rem)] lg:h-[calc(75vh-14rem)] lg:max-h-[560px]">
          <h1 className="sweo-hero-title mb-4 text-pretty text-white lg:mb-6" style={{ textAlign: 'left' }}>
            {t.hero.title}<br className="hidden md:block" />
            <span>{t.hero.titleHighlight}</span>{t.hero.titleEnd}
          </h1>

          <p className="text-sm sm:text-base text-white/60 max-w-2xl leading-relaxed mb-8 lg:mb-10">
            {t.hero.subtitle}
          </p>

          {/* Stat badges — mono uppercase */}
          <ul className="mb-4 flex flex-col items-start gap-1 text-left text-white/80 md:flex-row md:gap-5 lg:mb-5 lg:gap-8" style={{ fontFamily: 'var(--sweo-font-mono)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.063rem' }}>
            <li>{t.hero.stat1}</li>
            <li>{t.hero.stat2}</li>
            <li>{t.hero.stat3}</li>
            <li>{t.hero.stat4}</li>
          </ul>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-start gap-3">
            <Link href="/auth/sign-up" className="sweo-btn-primary">
              {t.hero.ctaPrimary}
            </Link>
            <Link href="/docs" className="sweo-btn-secondary">
              {t.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
