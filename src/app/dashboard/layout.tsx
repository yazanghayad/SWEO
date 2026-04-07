import KBar from '@/components/kbar';
import ClientSidebar from '@/components/layout/client-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { checkOnboardingStatusAction } from '@/features/auth/actions/onboarding';

export const metadata: Metadata = {
  title: 'SWEO AI — Dashboard',
  description: 'AI-powered customer support dashboard',
  robots: {
    index: false,
    follow: false
  }
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Redirect to setup if not onboarded
  const { onboarded } = await checkOnboardingStatusAction();
  if (!onboarded) redirect('/setup');

  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <KBar>
      <div className='flex h-screen overflow-hidden bg-background'>
        {/* Context sidebar + main content */}
        <SidebarProvider defaultOpen={defaultOpen}>
          <InfobarProvider defaultOpen={false}>
            <ClientSidebar />
            <SidebarInset className='min-w-0'>
              <Header />
              {/* page main content */}
              {children}
              {/* page main content ends */}
            </SidebarInset>
            <InfoSidebar side='right' />
          </InfobarProvider>
        </SidebarProvider>
      </div>
    </KBar>
  );
}
