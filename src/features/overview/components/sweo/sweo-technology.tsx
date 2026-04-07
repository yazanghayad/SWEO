'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { SweoLogo } from './shared';
import { engineSteps as engineStepsRaw, STEP_DURATION } from './data';
import { useTranslations } from '@/lib/i18n';

/* ─── Technology Section (SWEO AI Engine — Interactive) ─── */
export function SweoTechnology() {
  const t = useTranslations();
  const engineSteps = useMemo(() => engineStepsRaw.map((step, i) => {
    const n = i + 1;
    const d = t.data as Record<string, string>;
    return {
      ...step,
      label: d[`engineStep${n}Label`] ?? step.label,
      title: d[`engineStep${n}Title`] ?? step.title,
      description: d[`engineStep${n}Desc`] ?? step.description,
    };
  }), [t]);
  const [activeStep, setActiveStep] = useState(3); // start at step 4 (index 3)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-cycle through steps
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % engineSteps.length);
    }, STEP_DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectStep = (index: number) => {
    setActiveStep(index);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % engineSteps.length);
    }, STEP_DURATION);
  };

  const goNext = () => selectStep((activeStep + 1) % engineSteps.length);
  const goPrev = () => selectStep((activeStep - 1 + engineSteps.length) % engineSteps.length);

  return (
    <section id="technology" className="sweo-section sweo-section-elevated">
      <div className="sweo-section-inner">
        {/* Header */}
        <div className="grid grid-cols-12 gap-x-4 gap-y-6 xl:grid-cols-10">
          <h2 className="font-[var(--sweo-font-serif)] font-light text-[1.25rem] md:text-[2.5rem] xl:text-[3.375rem] leading-[1] tracking-[-0.063rem] md:tracking-[-0.094rem] xl:tracking-[-0.188rem] col-span-12 max-w-[25ch] lg:col-span-5 text-balance text-[var(--sweo-content-primary)]"
            style={{ fontFamily: 'var(--sweo-font-serif)' }}
          >
            {t.technologySection.heading}
          </h2>
          <div className="col-span-12 max-w-[420px] lg:pt-[0.35rem] xl:col-span-5 xl:pt-[0.6rem] lg:col-span-7 lg:col-start-6 lg:ml-[10%] xl:col-start-6">
            <p className="text-sm sm:text-base xl:text-lg leading-[1.375] text-[var(--sweo-content-secondary)]">
              <span className="mr-6 font-[var(--sweo-font-mono)] text-xs text-[var(--sweo-content-tertiary)] md:mr-10" style={{ fontFamily: 'var(--sweo-font-mono)' }}>04</span>
              {t.technologySection.description}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/docs" className="sweo-btn-secondary text-sm">
                {t.technologySection.cta}
              </Link>
            </div>
          </div>
        </div>

        {/* Engine Visualization */}
        <div className="mb-4 md:mb-6 lg:my-12">
          {/* Figure label */}
          <div className="pb-3">
            <span
              className="text-current mb-3 flex w-full border-b border-current/20 pb-3 text-[11px] leading-none tracking-wider uppercase lg:mb-0 lg:border-b-0 lg:px-5"
              style={{ fontFamily: 'var(--sweo-font-mono)' }}
            >
              <span className="block w-auto">Fig 4.A&nbsp;-&nbsp;</span>
              <span className="flex-1">{t.technologySection.figLabel}</span>
            </span>

            {/* Main visualization container */}
            <div className="sweo-engine-viz relative w-full pb-3 lg:border lg:border-current/20 lg:p-2 lg:pb-8">
              {/* Corner decorations (mobile) */}
              <div className="lg:hidden">
                <div className="absolute top-0 left-0 z-[1] aspect-square w-6 border-t border-l border-white/20" />
                <div className="absolute top-0 right-0 z-[1] aspect-square w-6 border-t border-r border-white/20" />
                <div className="absolute bottom-0 left-0 z-[1] aspect-square w-6 border-b border-l border-white/20" />
                <div className="absolute right-0 bottom-0 z-[1] aspect-square w-6 border-r border-b border-white/20" />
              </div>

              {/* Dashed line decorations (desktop) */}
              <div className="hidden lg:block">
                <span aria-hidden="true" className="border border-dashed border-current/20 absolute -top-10 -left-px h-10 border-r-0" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 45%)' }} />
                <span aria-hidden="true" className="border border-dashed border-current/20 absolute -top-10 -right-px h-10 border-r-0" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 45%)' }} />
                <span aria-hidden="true" className="border border-dashed border-current/20 absolute -bottom-10 -left-px h-10 rotate-180 border-r-0" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 45%)' }} />
                <span aria-hidden="true" className="border border-dashed border-current/20 absolute -right-px -bottom-10 h-10 rotate-180 border-r-0" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 45%)' }} />
              </div>

              {/* Grid layout: steps on sides, diagram in center */}
              <div className="relative z-[1] grid w-full grid-cols-3">
                {/* Central diagram column */}
                <div className="relative col-span-3 m-6 aspect-square overflow-hidden md:col-span-3 lg:col-span-1 lg:col-start-2 lg:aspect-[387/1000]  lg:border-x lg:border-white/20">
                  {/* Grid background SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 486 718" className="absolute inset-0 -mx-12 h-full w-[calc(100%+92px)]">
                    <g stroke="#fff">
                      {[0, 96.6, 193.2, 289.8, 386.4].map((x) => (
                        <line key={`v-${x}`} x1={x + 1.5} y1="25.5" x2={x + 1.5} y2="697.5" strokeOpacity="0.1" />
                      ))}
                      {[25, 121, 217, 313, 409, 505, 601, 697].map((y) => (
                        <line key={`h-${y}`} x1="1" y1={y} x2="484" y2={y} strokeOpacity="0.1" />
                      ))}
                    </g>
                  </svg>

                  {/* Step images — only active one is visible */}
                  {engineSteps.map((step, i) => (
                    <div
                      key={step.number}
                      className="absolute inset-0 my-auto h-11/12 w-full transition-opacity ease-in-out duration-300 lg:h-full"
                      style={{ opacity: activeStep === i ? 1 : 0 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={`${step.title} diagram`}
                        loading={i <= 1 ? 'eager' : 'lazy'}
                        className="size-full object-contain object-center"
                        style={{ position: 'absolute', inset: 0 }}
                        src={step.image}
                      />
                    </div>
                  ))}

                  {/* Side labels (desktop only) */}
                  <ul className="hidden xl:block xl:relative xl:h-full xl:w-full text-[10px] leading-none tracking-wider uppercase" style={{ fontFamily: 'var(--sweo-font-mono)' }}>
                    {engineSteps.map((step, i) => {
                      const isLeft = i % 2 === 0;
                      const tops = ['13%', '24%', '42%', '54%', '75%', '85%'];
                      return (
                        <li
                          key={step.number}
                          className={`absolute flex justify-center px-3 text-center transition-colors duration-300 ease-in-out ${
                            isLeft ? '-rotate-90 left-[-9%]' : 'rotate-90 right-[-13%]'
                          } ${activeStep === i ? 'text-[var(--sweo-orange)]' : ''}`}
                          style={{ top: tops[i] }}
                        >
                          {step.label}
                          <span className="absolute -bottom-4 mt-2 block w-full border-x border-t border-current/60 pb-1.5" />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Desktop step cards — overlaid on the sides */}
              <div className="relative z-[2] hidden lg:absolute lg:inset-0 lg:flex lg:flex-col lg:items-center">
                <ul className="lg:my-auto lg:grid lg:grid-cols-12 lg:gap-y-10 xl:gap-y-8 2xl:gap-y-16">
                  {engineSteps.map((step, i) => {
                    const isOdd = i % 2 === 0; // 0-indexed: even index = left side
                    return (
                      <li
                        key={step.number}
                        className={`block gap-y-3 lg:col-span-4 lg:mb-0 ${
                          isOdd ? 'lg:pl-6' : 'lg:pr-6'
                        } ${!isOdd ? 'lg:col-start-9' : ''} xl:${isOdd ? 'odd:translate-y-[-25%] odd:pr-8 odd:pl-10' : 'even:translate-y-[20%] even:pr-10 even:pl-8'}`}
                      >
                        <button
                          onClick={() => selectStep(i)}
                          className={`block h-full w-full cursor-pointer items-center justify-center text-left transition-opacity duration-300 ease-in-out lg:flex lg:px-[3vw] xl:px-10 ${
                            activeStep === i ? 'opacity-100' : 'opacity-50'
                          }`}
                        >
                          <div className="relative">
                            {/* Progress bar */}
                            <span className="absolute top-0 right-0 left-0 block h-px w-full overflow-hidden bg-current/20">
                              <span
                                className="absolute top-0 right-0 left-0 block h-px bg-[var(--sweo-orange)]"
                                style={{
                                  width: activeStep === i ? '100%' : '0%',
                                  transition: activeStep === i ? `width ${STEP_DURATION}ms linear` : 'none',
                                }}
                              />
                            </span>
                            <span
                              className="flex w-full items-center gap-2 pt-3 pb-2 text-[11px] leading-[135%] tracking-wider uppercase"
                              style={{ fontFamily: 'var(--sweo-font-mono)' }}
                            >
                              <span
                                className={`block size-2 -translate-y-px transition-colors duration-300 ease-in-out ${
                                  activeStep === i ? 'bg-[var(--sweo-orange)]' : 'bg-current/20'
                                }`}
                              />
                              {step.title}
                            </span>
                            <p className="text-sm leading-[1.286] tracking-[0.031rem] text-current/80">
                              {step.description}
                            </p>
                            {step.model && (
                              <div className="mt-3 flex items-center gap-2">
                                <div className="flex size-4 items-center justify-center rounded-full bg-[var(--sweo-orange)] text-[var(--sweo-dark-blue)] xl:size-6">
                                  <SweoLogo className="w-3 h-3" />
                                </div>
                                <span
                                  className="text-current text-[0.6875rem] leading-[1.273] tracking-[0.094rem] uppercase"
                                  style={{ fontFamily: 'var(--sweo-font-mono)' }}
                                >
                                  {t.data.poweredBy} {step.model}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Mobile: active step card + navigation */}
              <div className="relative z-[2] mx-6 mb-6 block lg:hidden">
                <div>
                  <span className="absolute top-0 right-0 left-0 block h-px w-full overflow-hidden bg-current/20">
                    <span
                      className="absolute top-0 right-0 left-0 block h-px bg-[var(--sweo-orange)]"
                      style={{
                        width: '100%',
                        transition: `width ${STEP_DURATION}ms linear`,
                      }}
                    />
                  </span>
                  <span
                    className="flex w-full items-center gap-2 py-3 text-[11px] leading-none tracking-wider uppercase"
                    style={{ fontFamily: 'var(--sweo-font-mono)' }}
                  >
                    <span className="block size-2 -translate-y-px bg-[var(--sweo-orange)]" />
                    {engineSteps[activeStep].title}
                  </span>
                  <p className="text-sm tracking-normal text-current/80">
                    {engineSteps[activeStep].description}
                  </p>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={goPrev} className="flex size-6 cursor-pointer items-center justify-center border border-current/80 text-current/80">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 9 9" className="w-1/2 rotate-180">
                      <path fill="currentColor" d="M8.354 4.061a.5.5 0 0 1 0 .708L5.172 7.95a.5.5 0 0 1-.708-.708l2.829-2.828-2.829-2.828A.5.5 0 1 1 5.172.88l3.182 3.18ZM0 3.915h8v1H0z" />
                    </svg>
                  </button>
                  <button onClick={goNext} className="flex size-6 cursor-pointer items-center justify-center border border-current/80 text-current/80">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 9 9" className="w-1/2">
                      <path fill="currentColor" d="M8.354 4.061a.5.5 0 0 1 0 .708L5.172 7.95a.5.5 0 0 1-.708-.708l2.829-2.828-2.829-2.828A.5.5 0 1 1 5.172.88l3.182 3.18ZM0 3.915h8v1H0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
