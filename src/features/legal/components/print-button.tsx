'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className='text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1.5 text-[13px] transition-colors print:hidden'
    >
      <Printer className='h-4 w-4' />
      Print page
    </button>
  );
}
