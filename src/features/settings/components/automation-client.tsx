'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  listAutomationRules,
  updateAutomationRule as updateRuleAction
} from '@/features/settings/actions/list-data-actions';
import type { AutomationRule } from '@/types/appwrite';
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

export default function AutomationClient() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    listAutomationRules()
      .then(setRules)
      .catch(() => toast.error('Failed to load automation rules'))
      .finally(() => setLoading(false));
  }, []);

  function toggleRule(id: string) {
    const rule = rules.find((r) => r.$id === id);
    if (!rule) return;
    const newEnabled = !rule.enabled;

    // Optimistic update
    setRules((prev) =>
      prev.map((r) => (r.$id === id ? { ...r, enabled: newEnabled } : r))
    );

    startTransition(async () => {
      try {
        await updateRuleAction(id, { enabled: newEnabled });
      } catch {
        // Revert on error
        setRules((prev) =>
          prev.map((r) =>
            r.$id === id ? { ...r, enabled: !newEnabled } : r
          )
        );
        toast.error('Failed to update rule');
      }
    });
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
        <div>
          <h1 className='text-lg font-semibold'>Automation</h1>
          <p className='text-muted-foreground text-xs'>
            {rules.filter((r) => r.enabled).length} active rule
            {rules.filter((r) => r.enabled).length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => toast.info('Automation builder coming soon')}
          size='sm'
        >
          Create rule
        </Button>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='max-w-3xl space-y-0'>
          {/* Explanation */}
          <SettingsSection
            title='Workflow automation'
            description='Create rules to automatically tag, assign, and respond to conversations based on conditions. Automations run in the order listed below.'
          >
            <div className='space-y-2'>
              {rules.length === 0 ? (
                <div className='text-muted-foreground py-8 text-center text-sm'>
                  No automation rules configured yet.
                </div>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.$id}
                    className='rounded-lg border p-4'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <Switch
                          checked={rule.enabled}
                          disabled={isPending}
                          onCheckedChange={() => toggleRule(rule.$id)}
                        />
                        <div>
                          <div className='flex items-center gap-2'>
                            <p className='text-sm font-medium'>{rule.name}</p>
                            <Badge
                              variant={
                                rule.enabled ? 'default' : 'secondary'
                              }
                              className='text-xs'
                            >
                              {rule.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className='text-muted-foreground mt-1 text-xs'>
                            <span className='font-medium'>When:</span>{' '}
                            {rule.trigger}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            <span className='font-medium'>Then:</span>{' '}
                            {rule.action}
                          </p>
                        </div>
                      </div>
                      <Button variant='outline' size='sm'>
                        Edit
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SettingsSection>

          <Separator />

          {/* Tips */}
          <SettingsSection
            title='Automation tips'
            description='Best practices for setting up automations.'
          >
            <div className='space-y-2'>
              <div className='rounded-lg border p-3'>
                <p className='text-xs'>
                  <span className='font-medium'>Priority order:</span>{' '}
                  Automations are evaluated top-to-bottom. Place more specific
                  rules before general ones.
                </p>
              </div>
              <div className='rounded-lg border p-3'>
                <p className='text-xs'>
                  <span className='font-medium'>Testing:</span> Use the
                  simulation mode to test automations before enabling them.
                </p>
              </div>
              <div className='rounded-lg border p-3'>
                <p className='text-xs'>
                  <span className='font-medium'>Combining:</span> Multiple
                  automations can fire on the same conversation.
                </p>
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
