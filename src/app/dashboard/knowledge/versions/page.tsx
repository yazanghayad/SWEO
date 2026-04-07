import { Suspense } from 'react';
import { VersionHistoryClient } from '@/features/knowledge/components/version-history-client';
import { ContentLoader } from '@/components/loaders';

export const metadata = { title: 'Knowledge: Version History' };

export default function VersionHistoryPage() {
  return (
    <Suspense fallback={<ContentLoader />}>
      <VersionHistoryClient />
    </Suspense>
  );
}
