'use client';

import { usePathname } from 'next/navigation';
import SettingsSidebar from '@/features/settings/components/settings-sidebar';
import { SweoLayout } from '@/features/overview/components/sweo-layout';

const FIN_SETTINGS_PREFIXES = [
  '/dashboard/settings/channels/',
  '/dashboard/settings/general'
];

export default function SettingsSubLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSweoSettings = FIN_SETTINGS_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );

  if (isSweoSettings) {
    return <SweoLayout>{children}</SweoLayout>;
  }

  return (
    <div className='flex h-[calc(100dvh-44px)] overflow-hidden'>
      <SettingsSidebar />
      <div className='flex flex-1 flex-col overflow-hidden'>{children}</div>
    </div>
  );
}
