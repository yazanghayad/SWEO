'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Icons } from '@/components/icons';

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

function ToggleRow({
  checked,
  onCheckedChange,
  label,
  description
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className='flex items-center justify-between py-1'>
      <div>
        <p className='text-sm'>{label}</p>
        {description && (
          <p className='text-muted-foreground text-xs'>{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function AssignmentsClient() {
  const { config, loading, saving, save } = useTenantSettings();
  const [autoAssign, setAutoAssign] = useState(true);
  const [roundRobin, setRoundRobin] = useState(true);
  const [reassignOnReply, setReassignOnReply] = useState(false);
  const [loadBalancing, setLoadBalancing] = useState(false);
  const [maxConversations, setMaxConversations] = useState('20');

  useEffect(() => {
    if (!config) return;
    setAutoAssign(config.assignments?.autoAssign ?? true);
    setRoundRobin(config.assignments?.roundRobin ?? true);
    setReassignOnReply(config.assignments?.reassignOnReply ?? false);
    setLoadBalancing(config.assignments?.loadBalancing ?? false);
    setMaxConversations(config.assignments?.maxConversations ?? '20');
  }, [config]);

  function handleSave() {
    save(
      {
        assignments: {
          autoAssign,
          roundRobin,
          loadBalancing,
          maxConversations,
          reassignOnReply
        }
      },
      'Assignment settings saved'
    );
  }

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
        <h1 className='text-lg font-semibold'>Assignments</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          size='sm'
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='max-w-3xl space-y-0'>
          {/* Auto-assignment */}
          <SettingsSection
            title='Auto-assignment'
            description='Automatically assign incoming conversations to available teammates.'
          >
            <ToggleRow
              checked={autoAssign}
              onCheckedChange={setAutoAssign}
              label='Enable auto-assignment'
              description='New conversations will be automatically assigned to available teammates.'
            />
          </SettingsSection>

          <Separator />

          {/* Round-robin */}
          <SettingsSection
            title='Round-robin'
            description='Distribute conversations evenly across available teammates.'
          >
            <div className='space-y-4'>
              <ToggleRow
                checked={roundRobin}
                onCheckedChange={setRoundRobin}
                label='Enable round-robin assignment'
                description='Conversations are assigned to teammates in a rotating order.'
              />
              <ToggleRow
                checked={loadBalancing}
                onCheckedChange={setLoadBalancing}
                label="Load-aware balancing"
                description="Factor in each teammate's current workload when assigning."
              />
            </div>
          </SettingsSection>

          <Separator />

          {/* Limits */}
          <SettingsSection
            title='Assignment limits'
            description='Set the maximum number of active conversations per teammate.'
          >
            <div className='flex items-center gap-3'>
              <Select
                value={maxConversations}
                onValueChange={setMaxConversations}
              >
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5</SelectItem>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                  <SelectItem value='unlimited'>Unlimited</SelectItem>
                </SelectContent>
              </Select>
              <span className='text-muted-foreground text-sm'>
                conversations per teammate
              </span>
            </div>
          </SettingsSection>

          <Separator />

          {/* Re-assignment */}
          <SettingsSection
            title='Re-assignment'
            description='Control when conversations are re-assigned.'
          >
            <ToggleRow
              checked={reassignOnReply}
              onCheckedChange={setReassignOnReply}
              label='Re-assign on customer reply'
              description='Reassign unassigned conversations when a customer replies.'
            />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
