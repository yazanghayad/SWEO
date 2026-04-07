'use client';

import { SweoSubmenuSidebar } from '@/features/overview/components/sweo-submenu-sidebar';

export function SweoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-[calc(100dvh-44px)] overflow-hidden'>
      <SweoSubmenuSidebar />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>{children}</div>
    </div>
  );
}
