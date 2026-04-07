'use client';

import { CHANNEL_TYPES } from '../lib/outbound-data';
import { ArrowLeft, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

export default function OutboundNew() {
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
        <Plus className="h-4 w-4 text-primary" />
        <h1 className="text-[14px] font-semibold text-foreground">
          New message
        </h1>
      </div>

      {/* Channel picker */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-[720px] px-6 py-8">
          <div className="mb-6">
            <h2 className="mb-1 text-[15px] font-semibold text-foreground">
              Choose a channel
            </h2>
            <p className="text-[13px] text-muted-foreground">
              Select the channel you want to use for your outbound message.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {CHANNEL_TYPES.map((ch) => {
              const Icon = ch.icon;
              return (
                <Link
                  key={ch.slug}
                  href={`/dashboard/outbound/compose?channel=${ch.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-md border border-border/60 bg-background px-4 py-5 text-center transition-colors hover:border-border hover:bg-accent/20"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${ch.color}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: ch.color }} />
                  </div>
                  <span className="text-[13px] font-medium text-foreground">
                    {ch.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
