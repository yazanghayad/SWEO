'use client';

import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

function SettingsSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='py-5'>
      <div className='mb-4'>
        <p className='mb-1 text-sm font-semibold'>{title}</p>
        {description && (
          <p className='text-muted-foreground text-xs leading-relaxed'>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

const PLAN_DISPLAY: Record<
  string,
  { name: string; badge?: string; tier: number }
> = {
  trial: { name: 'Advanced', badge: 'Trial', tier: 1 },
  growth: { name: 'Advanced', tier: 1 },
  enterprise: { name: 'Expert', tier: 2 }
};

export default function BillingClient() {
  const { tenant, loading } = useTenantSettings();
  const planKey = (tenant?.plan as string) || 'trial';
  const planInfo = PLAN_DISPLAY[planKey] ?? PLAN_DISPLAY.trial;

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='bg-muted/30 flex flex-1 flex-col overflow-hidden rounded-lg shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between border-b px-6 pt-4 pb-4'>
        <h1 className='text-lg font-semibold'>Billing</h1>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='max-w-3xl space-y-0'>
          {/* Current Plan */}
          <SettingsSection
            title='Current plan'
            description='Your subscription details and usage.'
          >
            <div className='rounded-lg border p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='flex items-center gap-2'>
                    <p className='text-base font-semibold'>{planInfo.name}</p>
                    {planInfo.badge && (
                      <Badge className='bg-primary/10 text-primary text-xs'>
                        {planInfo.badge}
                      </Badge>
                    )}
                  </div>
                  {planKey === 'trial' && (
                    <p className='text-muted-foreground mt-1 text-xs'>
                      Trial period active
                    </p>
                  )}
                </div>
                <Button size='sm'>Upgrade</Button>
              </div>

              <Separator className='my-4' />

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <p className='text-muted-foreground text-xs'>Seats</p>
                  <p className='text-lg font-semibold'>1 / 5</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>
                    AI Resolutions
                  </p>
                  <p className='text-lg font-semibold'>0 / 1,000</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>
                    Knowledge Sources
                  </p>
                  <p className='text-lg font-semibold'>0 / 50</p>
                </div>
              </div>
            </div>
          </SettingsSection>

          <Separator />

          {/* Plans comparison */}
          <SettingsSection
            title='Available plans'
            description="Choose the plan that's right for your team."
          >
            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='rounded-lg border p-4'>
                <p className='text-sm font-semibold'>Essential</p>
                <p className='text-muted-foreground mt-1 text-xs'>
                  For small teams getting started
                </p>
                <p className='mt-3 text-2xl font-bold'>
                  $29
                  <span className='text-muted-foreground text-xs font-normal'>
                    /seat/mo
                  </span>
                </p>
                <Button variant='outline' size='sm' className='mt-3 w-full'>
                  Downgrade
                </Button>
              </div>
              <div
                className={cn(
                  'rounded-lg border p-4',
                  planInfo.tier >= 1 && planKey !== 'enterprise'
                    ? 'ring-primary ring-2'
                    : ''
                )}
              >
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-semibold'>Advanced</p>
                  {planInfo.tier === 1 && (
                    <Badge variant='secondary' className='text-xs'>
                      Current
                    </Badge>
                  )}
                </div>
                <p className='text-muted-foreground mt-1 text-xs'>
                  For growing support teams
                </p>
                <p className='mt-3 text-2xl font-bold'>
                  $85
                  <span className='text-muted-foreground text-xs font-normal'>
                    /seat/mo
                  </span>
                </p>
                <Button
                  size='sm'
                  className='mt-3 w-full'
                  disabled={planInfo.tier === 1}
                >
                  {planInfo.tier === 1 ? 'Current plan' : 'Select'}
                </Button>
              </div>
              <div
                className={cn(
                  'rounded-lg border p-4',
                  planKey === 'enterprise' ? 'ring-primary ring-2' : ''
                )}
              >
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-semibold'>Expert</p>
                  {planKey === 'enterprise' && (
                    <Badge variant='secondary' className='text-xs'>
                      Current
                    </Badge>
                  )}
                </div>
                <p className='text-muted-foreground mt-1 text-xs'>
                  For enterprise-scale operations
                </p>
                <p className='mt-3 text-2xl font-bold'>
                  $132
                  <span className='text-muted-foreground text-xs font-normal'>
                    /seat/mo
                  </span>
                </p>
                <Button variant='outline' size='sm' className='mt-3 w-full'>
                  Upgrade
                </Button>
              </div>
            </div>
          </SettingsSection>

          <Separator />

          {/* Payment method */}
          <SettingsSection
            title='Payment method'
            description='Manage your payment details and billing address.'
          >
            <div className='space-y-3'>
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='flex items-center gap-3'>
                  <div className='bg-muted flex h-10 w-14 items-center justify-center rounded text-xs font-bold'>
                    VISA
                  </div>
                  <div>
                    <p className='text-sm font-medium'>•••• •••• •••• 4242</p>
                    <p className='text-muted-foreground text-xs'>
                      Expires 12/2026
                    </p>
                  </div>
                </div>
                <Button variant='outline' size='sm'>
                  Update
                </Button>
              </div>
              <Button
                variant='ghost'
                size='sm'
                className='text-xs'
                onClick={() => toast.info('Add payment method')}
              >
                + Add payment method
              </Button>
            </div>
          </SettingsSection>

          <Separator />

          {/* Invoices */}
          <SettingsSection
            title='Invoices'
            description='View and download your past invoices.'
          >
            <div className='space-y-2'>
              <div className='text-muted-foreground py-6 text-center text-sm'>
                No invoices yet
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
