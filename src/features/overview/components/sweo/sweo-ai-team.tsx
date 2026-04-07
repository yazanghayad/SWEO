'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { flywheelPhases as flywheelPhasesRaw } from './data';
import { useTranslations } from '@/lib/i18n';

/* ─── Platform Section (SWEO Flywheel) ─── */
const FLYWHEEL_KEYS: Record<string, { phase: string; desc: string }> = {
  'Analyze': { phase: 'flywheelAnalyze', desc: 'flywheelAnalyzeDesc' },
  'Train': { phase: 'flywheelTrain', desc: 'flywheelTrainDesc' },
  'Test': { phase: 'flywheelTest', desc: 'flywheelTestDesc' },
  'Deploy': { phase: 'flywheelDeploy', desc: 'flywheelDeployDesc' },
};

export function SweoAITeam() {
  const t = useTranslations();
  const flywheelPhases = useMemo(() => flywheelPhasesRaw.map(p => {
    const keys = FLYWHEEL_KEYS[p.phase];
    const d = t.data as Record<string, string>;
    return {
      ...p,
      phase: keys ? d[keys.phase] ?? p.phase : p.phase,
      description: keys ? d[keys.desc] ?? p.description : p.description,
    };
  }), [t]);
  return (
    <section id="platform" className="sweo-section sweo-section-elevated">
      <div className="sweo-section-inner">
        <div className="grid grid-cols-12 gap-3 sm:gap-4 xl:grid-cols-10 mb-6 sm:mb-12">
          <div className="col-span-12 lg:col-span-5">
            <p className="sweo-section-number mb-2 sm:mb-4">05</p>
            <h3 className="sweo-section-heading">
              {t.platform.heading}
            </h3>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 xl:col-span-4 xl:col-start-7">
            <p className="sweo-section-description mb-4 sm:mb-6">
              {t.platform.description}
            </p>
            <Link href="/docs" className="sweo-btn-secondary text-sm">
              {t.platform.cta}
            </Link>
          </div>
        </div>

        {/* Flywheel Phases */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {flywheelPhases.map((phase, i) => (
            <div key={phase.phase} className="sweo-engine-step text-center">
              <div className="text-xl sm:text-3xl mb-2 sm:mb-3">{phase.icon}</div>
              <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                <div className="sweo-engine-step-number">{i + 1}</div>
                <h4 className="text-sm font-semibold">{phase.phase}</h4>
              </div>
              <p className="text-sm text-[var(--sweo-content-secondary)] leading-relaxed">
                {phase.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
