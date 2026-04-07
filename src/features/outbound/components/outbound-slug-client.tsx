'use client';

import OutboundSidebar from './outbound-sidebar';
import OutboundPageRouter from './outbound-page-router';

export default function OutboundSlugClient({ slug }: { slug: string }) {
  return (
    <div className="flex min-h-0 flex-1">
      <OutboundSidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <OutboundPageRouter slug={slug} />
      </div>
    </div>
  );
}
