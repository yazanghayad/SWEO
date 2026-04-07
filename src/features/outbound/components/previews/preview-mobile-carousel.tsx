/* eslint-disable @next/next/no-img-element */
'use client';

import type { MobileCarouselContent } from '../../lib/channel-content-types';

interface PreviewMobileCarouselProps {
  value: MobileCarouselContent;
  channelSlug: string;
}

export function PreviewMobileCarousel({ value }: PreviewMobileCarouselProps) {
  const slides = value.slides ?? [];
  const firstSlide = slides[0];
  const slideTitle = firstSlide?.title || 'Slide title';
  const slideBody = firstSlide?.body || 'Slide content...';
  const totalSlides = slides.length || 1;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="mx-auto max-w-xs">
        {/* Phone-style card */}
        <div className="overflow-hidden rounded-xl border border-border/50 bg-background shadow-sm">
          {/* Image placeholder */}
          <div className="flex h-32 items-center justify-center bg-muted/60">
            {firstSlide?.imageUrl ? (
              <img
                src={firstSlide.imageUrl}
                alt={slideTitle}
                className="h-full w-full object-cover"
              />
            ) : (
              <svg
                className="h-8 w-8 text-muted-foreground/30"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21z"
                />
              </svg>
            )}
          </div>

          {/* Slide text */}
          <div className="space-y-1 px-4 py-3">
            <h4 className="text-sm font-bold leading-snug text-foreground">{slideTitle}</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">{slideBody}</p>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="mt-3 flex justify-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === 0 ? 'bg-blue-600' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
