'use client';

import { cn } from '@/lib/utils';
import { SERIES_TEMPLATES } from '../lib/outbound-data';
import { Layers, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

const categoryColors: Record<string, string> = {
  onboarding: 'bg-blue-500/10 text-blue-600',
  engagement: 'bg-emerald-500/10 text-emerald-600',
  'lead-gen': 'bg-amber-500/10 text-amber-600',
  feedback: 'bg-violet-500/10 text-violet-600',
  activation: 'bg-rose-500/10 text-rose-600'
};

const categoryLabels: Record<string, string> = {
  onboarding: 'Onboarding',
  engagement: 'Engagement',
  'lead-gen': 'Lead generation',
  feedback: 'Feedback',
  activation: 'Activation'
};

export default function OutboundSeries() {
  const categories = [...new Set(SERIES_TEMPLATES.map((t) => t.category))];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 px-6 py-3">
        <Link
          href="/dashboard/outbound"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Layers className="h-4 w-4 text-primary" />
        <h1 className="text-[14px] font-semibold text-foreground">
          Series Templates
        </h1>
        <span className="text-[12px] text-muted-foreground">
          {SERIES_TEMPLATES.length} templates
        </span>
      </div>

      {/* Description */}
      <div className="border-b border-border/40 px-6 py-4">
        <p className="max-w-[600px] text-[13px] leading-relaxed text-muted-foreground">
          Automate your messaging with Series. Create a seamless messaging
          journey to engage customers across every channel, whether it&apos;s
          inside or outside your product.
        </p>
      </div>

      {/* Templates grouped by category */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-[960px] px-6 py-6">
          {categories.map((cat) => {
            const templates = SERIES_TEMPLATES.filter(
              (t) => t.category === cat
            );
            return (
              <div key={cat} className="mb-8">
                <h2 className="mb-3 text-[13px] font-semibold text-foreground">
                  {categoryLabels[cat] ?? cat}
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      className="group flex flex-col rounded-md border border-border/60 bg-background p-4 transition-colors hover:border-border hover:bg-accent/20"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] font-medium',
                            categoryColors[t.category]
                          )}
                        >
                          Series
                        </Badge>
                      </div>
                      <h3 className="mb-1 text-[13px] font-medium text-foreground">
                        {t.title}
                      </h3>
                      <p className="mb-3 flex-1 text-[12px] leading-relaxed text-muted-foreground">
                        {t.description}
                      </p>
                      <button className="self-start text-[12px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Use template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
