'use client';

import ReportsSidebar from './reports-sidebar';
import ReportPageRouter from './report-page-router';

export default function ReportSlugClient({ slug }: { slug: string }) {
  return (
    <div className='reports-workspace flex h-[calc(100vh-44px)]'>
      <ReportsSidebar />
      <div className='flex flex-1 flex-col overflow-hidden'>
        <ReportPageRouter slug={slug} />
      </div>
    </div>
  );
}
