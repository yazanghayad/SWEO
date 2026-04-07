'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { chapters } from './data';
import { useTranslations } from '@/lib/i18n';

/* ─── Chapter Navigation (sticky sidebar) ─── */
export function SweoChapterNav() {
  const t = useTranslations();
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState<number[]>(() =>
    chapters.map(() => 0)
  );
  const ticking = useRef(false);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;

    requestAnimationFrame(() => {
      const ids = chapters.map((c) => c.href.slice(1));
      const sections = ids.map((id) => document.getElementById(id));
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const newProgress = [...progressRef.current];
      let newActive = 0;

      sections.forEach((el, i) => {
        if (!el) {
          newProgress[i] = 0;
          return;
        }
        const top = el.offsetTop;
        const height = el.offsetHeight;
        const sectionStart = top - vh * 0.3;
        const sectionEnd = top + height - vh * 0.3;

        if (scrollY < sectionStart) {
          newProgress[i] = 0;
        } else if (scrollY >= sectionEnd) {
          newProgress[i] = 1;
        } else {
          newProgress[i] = (scrollY - sectionStart) / (sectionEnd - sectionStart);
        }

        // Active = last section whose top we've passed
        if (scrollY >= top - vh * 0.5) {
          newActive = i;
        }
      });

      setActiveIndex(newActive);
      setProgress(newProgress);
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="sweo-chapter-nav-wrapper">
      <div className="sweo-chapter-nav" id="_chapter_nav">
        <nav aria-label="Chapter navigation">
          {/* Desktop: vertical list */}
          <ul className="sweo-chapter-list">
            {chapters.map((ch, i) => {
              const labelKey = ch.label.replace(/\s+/g, '') as 'capabilities' | 'performance' | 'integrations' | 'technology';
              const translatedLabel = (t.chapters as Record<string, string>)[labelKey] ?? (t.chapters as Record<string, string>)[ch.label] ?? ch.label;
              return (
              <li key={ch.href} className="sweo-chapter-item">
                <a
                  className={`sweo-chapter-link ${
                    activeIndex === i ? 'sweo-chapter-link-active' : ''
                  }`}
                  href={ch.href}
                  data-active={activeIndex === i}
                  aria-current={activeIndex === i ? 'location' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(ch.href.slice(1));
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <span className="flex translate-y-px">
                    <span className="shrink-0 pr-3">{ch.number}</span>
                    <span>{translatedLabel}</span>
                  </span>
                </a>
                {/* Progress bar */}
                <div className="sweo-chapter-progress-track">
                  <span className="sweo-chapter-progress-bg" />
                  <span
                    role="progressbar"
                    aria-label="Progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="sweo-chapter-progress-fill"
                    style={{
                      transform: `scaleX(${progress[i]})`,
                      transition: 'transform linear 60ms',
                    }}
                  />
                </div>
              </li>
              );
            })}
          </ul>

          {/* Mobile: single progress bar under horizontal scroll */}
          <div className="sweo-chapter-progress-track sweo-chapter-progress-mobile">
            <span className="sweo-chapter-progress-bg" />
            <span
              role="progressbar"
              aria-label="Progress"
              className="sweo-chapter-progress-fill"
              style={{
                transform: `scaleX(${
                  (activeIndex + (progress[activeIndex] || 0)) / chapters.length
                })`,
                transition: 'transform linear 60ms',
              }}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}
