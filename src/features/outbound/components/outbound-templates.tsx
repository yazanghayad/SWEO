'use client';

import { QUICK_STARTERS, CHANNEL_TYPES } from '../lib/outbound-data';
import { ArrowLeft, LayoutTemplate } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

export default function OutboundTemplates() {
  const channelsWithStarters = CHANNEL_TYPES.filter((ch) =>
    QUICK_STARTERS.some((s) => s.channel === ch.slug)
  );

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
        <LayoutTemplate className="h-4 w-4 text-primary" />
        <h1 className="text-[14px] font-semibold text-foreground">
          Quick Starters
        </h1>
        <span className="text-[12px] text-muted-foreground">
          {QUICK_STARTERS.length} templates
        </span>
      </div>

      {/* Description */}
      <div className="border-b border-border/40 px-6 py-4">
        <p className="max-w-[600px] text-[13px] leading-relaxed text-muted-foreground">
          Choose a quick starter template to get up and running fast. Each
          template is pre-configured for a specific channel and use case.
        </p>
      </div>

      {/* Templates grouped by channel */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-[960px] px-6 py-6">
          {channelsWithStarters.map((ch) => {
            const Icon = ch.icon;
            const starters = QUICK_STARTERS.filter(
              (s) => s.channel === ch.slug
            );

            return (
              <div key={ch.slug} className="mb-8">
                <div className="mb-3 flex items-center gap-2">
                  <Icon
                    className="h-4 w-4"
                    style={{ color: ch.color }}
                  />
                  <h2 className="text-[13px] font-semibold text-foreground">
                    {ch.label}
                  </h2>
                  <span className="text-[11px] text-muted-foreground">
                    {starters.length} template{starters.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {starters.map((s) => (
                    <div
                      key={s.id}
                      className="group flex flex-col rounded-md border border-border/60 bg-background px-4 py-3 transition-colors hover:border-border hover:bg-accent/20"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className="inline-flex h-5 items-center rounded px-1.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: `${ch.color}15`,
                            color: ch.color
                          }}
                        >
                          {ch.label}
                        </span>
                      </div>
                      <h4 className="mb-1 text-[12px] font-medium text-foreground">
                        {s.title}
                      </h4>
                      <p className="mb-2 flex-1 text-[11px] leading-relaxed text-muted-foreground">
                        {s.description}
                      </p>
                      <Link
                        href={`/dashboard/outbound/compose?template=${s.id}&channel=${s.channel}`}
                        className="self-start text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        Use template
                      </Link>
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
