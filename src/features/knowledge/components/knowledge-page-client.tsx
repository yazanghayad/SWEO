'use client';

import * as React from 'react';
import { SourceUploader } from '@/features/knowledge/components/source-uploader';
import { SourceList } from '@/features/knowledge/components/source-list';
import { useTenant } from '@/hooks/use-tenant';
import { Loader2 } from 'lucide-react';

/**
 * Knowledge management page – client component that manages refresh state
 * and passes the tenantId to child components.
 */
export default function KnowledgePageClient() {
  const { tenant, loading, error } = useTenant();
  const [refreshKey, setRefreshKey] = React.useState(0);

  function handleSourceAdded() {
    setRefreshKey((k) => k + 1);
  }

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className='text-destructive py-20 text-center'>
        {error ?? 'No tenant found. Please log in again.'}
      </div>
    );
  }

  return (
    <div className='bg-card flex min-h-full flex-1 flex-col items-center overflow-y-auto rounded-xl px-6 py-6 md:px-20 md:pt-6 md:pb-12'>
      <div className='flex w-full max-w-[1200px] flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <h1 className='font-serif text-lg font-light tracking-tight'>Sources</h1>
        </div>
        <div className='space-y-6'>
          <SourceUploader tenantId={tenant.$id} onSourceAdded={handleSourceAdded} />
          <SourceList tenantId={tenant.$id} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
