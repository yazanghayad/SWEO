'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { MobileCarouselContent, CarouselSlide } from '../../lib/channel-content-types';

const inputClass =
  'w-full rounded-md border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30';

const labelClass =
  'mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-muted-foreground';

interface EditorMobileCarouselProps {
  value: MobileCarouselContent;
  onChange: (v: MobileCarouselContent) => void;
  channelSlug: string;
}

export default function EditorMobileCarousel({ value, onChange, channelSlug: _channelSlug }: EditorMobileCarouselProps) {
  const slides = value.slides ?? [];

  function updateField<K extends keyof MobileCarouselContent>(key: K, val: MobileCarouselContent[K]) {
    onChange({ ...value, [key]: val });
  }

  function updateSlide(index: number, patch: Partial<CarouselSlide>) {
    const updated = slides.map((s, i) => (i === index ? { ...s, ...patch } : s));
    updateField('slides', updated);
  }

  function removeSlide(index: number) {
    updateField('slides', slides.filter((_, i) => i !== index));
  }

  function addSlide() {
    const newSlide: CarouselSlide = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
    };
    updateField('slides', [...slides, newSlide]);
  }

  return (
    <div className="space-y-4">
      {/* Carousel title */}
      <div>
        <label className={labelClass}>Carousel Title</label>
        <input
          type="text"
          value={value.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g. Feature highlights"
          className={inputClass}
        />
      </div>

      {/* Slides */}
      <div>
        <label className={labelClass}>Slides</label>
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="rounded-md border border-border/60 p-3"
            >
              {/* Slide header */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-foreground">
                  Slide {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeSlide(index)}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Slide title */}
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateSlide(index, { title: e.target.value })}
                    placeholder="Slide title"
                    className={inputClass}
                  />
                </div>

                {/* Slide body */}
                <div>
                  <label className={labelClass}>Body</label>
                  <textarea
                    rows={2}
                    value={slide.body}
                    onChange={(e) => updateSlide(index, { body: e.target.value })}
                    placeholder="Slide description..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className={labelClass}>Image URL (Optional)</label>
                  <input
                    type="text"
                    value={slide.imageUrl ?? ''}
                    onChange={(e) => updateSlide(index, { imageUrl: e.target.value || undefined })}
                    placeholder="https://example.com/image.png"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add slide */}
      <button
        type="button"
        onClick={addSlide}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border/60 px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add slide
      </button>
    </div>
  );
}
