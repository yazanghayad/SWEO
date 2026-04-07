'use client';

import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import { UserNav } from './user-nav';
import { ThemeModeToggle } from '../themes/theme-mode-toggle';
import { FileText, Headset } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useChatbotStore } from '@/features/chatbot/store';

export default function Header() {
  const openChat = useChatbotStore((s) => s.setOpen);

  return (
    <header className='flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border/40 bg-background/80 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-10'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4 opacity-40' />
        <Breadcrumbs />
      </div>

      <div className='flex items-center gap-1 px-4'>
        <Button
          variant='ghost'
          size='sm'
          className='hidden h-7 gap-1.5 px-2.5 text-[13px] text-muted-foreground hover:text-foreground md:flex'
          asChild
        >
          <Link href='/docs'>
            <FileText className='h-3.5 w-3.5' />
            Docs
          </Link>
        </Button>
        <Button
          variant='ghost'
          size='sm'
          className='hidden h-7 gap-1.5 px-2.5 text-[13px] text-muted-foreground hover:text-foreground md:flex'
          onClick={() => openChat(true)}
        >
          <Headset className='h-3.5 w-3.5' />
          Support
        </Button>
        <Separator orientation='vertical' className='mx-1 hidden h-4 opacity-30 md:block' />
        <ThemeModeToggle />
        <UserNav />
      </div>
    </header>
  );
}
