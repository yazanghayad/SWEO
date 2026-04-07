/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef } from 'react';

interface AiEngineScrollSvgProps {
  phases: { id: string; href: string; src: string }[];
}

export function AiEngineScrollSvg({ phases }: AiEngineScrollSvgProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const rotation = scrollY * 0.08;
        const imgs = container.querySelectorAll<HTMLImageElement>(
          '[data-phase-img]'
        );
        for (const img of imgs) {
          img.style.transform = `rotate(${rotation}deg)`;
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="sticky top-[70px] hidden h-[calc(100vh-70px)] w-1/2 lg:flex"
    >
      {phases.map((phase) => (
        <div
          key={phase.id}
          id={phase.id}
          className="absolute top-0 h-full w-full opacity-100 transition duration-1500"
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `[data-main-content]:has([href*="${phase.href}"][aria-current]) #${phase.id} { opacity: 1; }`
            }}
          />
          <div className="z-8 absolute inset-0 flex items-center justify-center overflow-hidden">
            <img
              data-phase-img
              src={phase.src}
              alt={`${phase.id} phase icon`}
              role="img"
              className="w-[18%] max-w-[90px] opacity-80 will-change-transform"
            />
          </div>
        </div>
      ))}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 387 673"
        className="absolute inset-0 my-auto [mask-image:radial-gradient(black,transparent_93%)]"
      >
        <path stroke="currentColor" strokeOpacity="0.1" d="M.5.61v672" />
        <path
          stroke="currentColor"
          strokeOpacity="0.05"
          d="M24.65.61v672M48.8.61v672M72.95.61v672"
        />
        <path stroke="currentColor" strokeOpacity="0.1" d="M97.1.61v672" />
        <path
          stroke="currentColor"
          strokeOpacity="0.05"
          d="M121.25.61v672M145.4.61v672m24.15-672v672"
        />
        <path stroke="currentColor" strokeOpacity="0.1" d="M193.7.61v672" />
        <path
          stroke="currentColor"
          strokeOpacity="0.05"
          d="M217.85.61v672M242 .61v672m24.15-672v672"
        />
        <path stroke="currentColor" strokeOpacity="0.1" d="M290.3.61v672" />
        <path
          stroke="currentColor"
          strokeOpacity="0.05"
          d="M314.45.61v672M338.6.61v672m24.15-672v672"
        />
        <path stroke="currentColor" strokeOpacity="0.1" d="M386.9.61v672" />
        <path
          stroke="currentColor"
          strokeOpacity="0.05"
          d="M411.05.61v672M435.2.61v672m24.15-672v672"
        />
        <path stroke="currentColor" strokeOpacity="0.1" d="M0 .11h483" />
        <path
          stroke="currentColor"
          strokeOpacity="0.05"
          d="M0 24.11h483m-483 24h483m-483 24h483"
        />
        <path stroke="currentColor" strokeOpacity="0.1" d="M0 96.11h483" />
        <path
          stroke="currentColor"
          strokeOpacity="0.05"
          d="M0 120.11h483m-483 24h483m-483 24h483"
        />
        <path stroke="currentColor" strokeOpacity="0.1" d="M0 192.11h483" />
        <path
          stroke="currentColor"
          strokeOpacity="0.05"
          d="M0 216.11h483m-483 24h483m-483 24h483"
        />
        <path stroke="currentColor" strokeOpacity="0.1" d="M0 288.11h483" />
        <path
          stroke="currentColor"
          strokeOpacity="0.05"
          d="M0 312.11h483m-483 24h483m-483 24h483"
        />
        <path stroke="currentColor" strokeOpacity="0.1" d="M0 384.11h483" />
        <path
          stroke="currentColor"
          strokeOpacity="0.05"
          d="M0 408.11h483m-483 24h483m-483 24h483"
        />
        <path stroke="currentColor" strokeOpacity="0.1" d="M0 480.11h483" />
        <path
          stroke="currentColor"
          strokeOpacity="0.05"
          d="M0 504.11h483m-483 24h483m-483 24h483"
        />
        <path stroke="currentColor" strokeOpacity="0.1" d="M0 576.11h483" />
        <path
          stroke="currentColor"
          strokeOpacity="0.05"
          d="M0 600.11h483m-483 24h483m-483 24h483"
        />
        <path stroke="currentColor" strokeOpacity="0.1" d="M0 672.11h483" />
      </svg>
    </div>
  );
}
