import React from 'react';
import { SweoLayout } from '@/features/overview/components/sweo-layout';
import { GetStartedClient } from '@/features/overview/components/get-started-client';
import { WelcomeModal } from '@/features/overview/components/welcome-modal';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function OverViewLayout(props: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  return (
    <SweoLayout>
      <WelcomeModal />
      <GetStartedClient />
    </SweoLayout>
  );
}
