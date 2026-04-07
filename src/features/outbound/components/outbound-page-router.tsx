'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const OUTBOUND_COMPONENTS: Record<string, React.ComponentType> = {
  series: dynamic(() => import('./outbound-series')),
  templates: dynamic(() => import('./outbound-templates')),
  new: dynamic(() => import('./outbound-new')),
  compose: dynamic(() => import('./outbound-composer'))
};

export default function OutboundPageRouter({ slug }: { slug: string }) {
  const Component = OUTBOUND_COMPONENTS[slug];

  if (!Component) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[16px] text-muted-foreground">Page not found</p>
        <Link
          href="/dashboard/outbound"
          className="mt-2 text-[13px] text-primary hover:underline"
        >
          Back to Outbound
        </Link>
      </div>
    );
  }

  return <Component />;
}
