'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { navItems } from '@/config/nav-config';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFilteredNavItems } from '@/hooks/use-nav';
import {
  Bell,
  ChevronRight,
  ChevronsDown,
  FileText,
  LogOut,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Settings
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import { useTenant } from '@/hooks/use-tenant';
import { logoutAction } from '@/features/auth/actions/logout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function UserAvatar() {
  const { tenant } = useTenant();
  const initials = (tenant?.name ?? 'U').slice(0, 1).toUpperCase();
  return (
    <Avatar className='h-8 w-8'>
      <AvatarFallback className='bg-primary/20 text-primary text-xs'>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function UserName() {
  const { tenant, loading } = useTenant();
  const name = loading ? '…' : (tenant?.name ?? 'User');
  const plan = tenant?.plan ?? 'trial';
  return (
    <>
      <span className='truncate text-sm font-medium'>{name}</span>
      <span className='text-muted-foreground truncate text-xs'>{plan}</span>
    </>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen } = useMediaQuery();
  const itemsToShow = useFilteredNavItems(navItems);
  const [isAway, setIsAway] = React.useState(false);
  const { tenant, loading: tenantLoading } = useTenant();
  const workspaceName = tenantLoading
    ? '…'
    : (tenant?.name ?? 'Workspace');

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='h-12 shrink-0 justify-center py-0'>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup className='pt-3'>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {itemsToShow.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip='Search'>
              <Search className='h-4 w-4' />
              <span>Search</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <UserAvatar />
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <UserName />
                  </div>
                  <ChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                {/* User info */}
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                    <UserAvatar />
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <UserName />
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Away mode */}
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsAway(!isAway);
                  }}
                >
                  <Moon className='mr-2 h-4 w-4' />
                  <span className='flex-1'>Away mode</span>
                  <Switch
                    checked={isAway}
                    className='ml-2 pointer-events-none'
                  />
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Workspace */}
                <DropdownMenuLabel className='text-muted-foreground text-xs'>
                  Workspace
                </DropdownMenuLabel>
                <DropdownMenuItem className='gap-2 font-medium'>
                  <div className='bg-primary/20 text-primary flex size-6 items-center justify-center rounded-sm text-xs font-bold'>
                    {workspaceName.slice(0, 1).toUpperCase()}
                  </div>
                  {workspaceName}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='gap-2'
                  onClick={() => router.push('/dashboard/workspaces/new')}
                >
                  <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                    <Plus className='size-4' />
                  </div>
                  <span className='text-muted-foreground'>Add workspace</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Settings & Notifications */}
                <DropdownMenuItem asChild>
                  <Link href='/dashboard/settings'>
                    <Settings className='mr-2 h-4 w-4' />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className='mr-2 h-4 w-4' />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Community & Legal */}
                <DropdownMenuItem asChild>
                  <Link href='/docs'>
                    <MessageCircle className='mr-2 h-4 w-4' />
                    SWEO Community Forum
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/legal'>
                    <FileText className='mr-2 h-4 w-4' />
                    Terms &amp; Policies
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Log out */}
                <DropdownMenuItem
                  onClick={() => logoutAction()}
                  className='text-destructive focus:text-destructive'
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
