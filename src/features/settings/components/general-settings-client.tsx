'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/use-tenant';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArticleIcon } from '@/components/icons/sweo-icons';
import { deleteWorkspaceAction } from '@/features/settings/actions/delete-workspace';

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Stockholm',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

export default function GeneralSettingsClient() {
  const { tenant, loading } = useTenant();
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [subdomain, setSubdomain] = useState('');
  const [saving, setSaving] = useState(false);

  // Toggle states
  const [companiesEnabled, setCompaniesEnabled] = useState(true);
  const [preventCompanyAttr, setPreventCompanyAttr] = useState(false);
  const [testWorkspace, setTestWorkspace] = useState(false);
  const [attributionMessage, setAttributionMessage] = useState(true);
  const [teamMentions, setTeamMentions] = useState(false);

  // Delete workspace
  const [deleteName, setDeleteName] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDeleteWorkspace() {
    setDeleting(true);
    try {
      const result = await deleteWorkspaceAction();
      if (result.success) {
        toast.success('Workspace deleted successfully');
        router.push('/auth/sign-in');
      } else {
        toast.error(result.error || 'Failed to delete workspace');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }

  useEffect(() => {
    if (tenant) {
      setName(tenant.name ?? '');
      const cfg = (tenant.config ?? {}) as Record<string, unknown>;
      setTimezone((cfg.timezone as string) ?? 'UTC');
      setSubdomain(
        (tenant.subdomain as string) ?? (cfg.subdomain as string) ?? ''
      );
    }
  }, [tenant]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/tenant/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, timezone, subdomain })
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [name, timezone, subdomain]);

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='bg-muted/30 flex flex-1 flex-col overflow-hidden rounded-lg shadow-sm'>
      {/* Header bar – matches SWEO's settings header */}
      <div className='flex items-center justify-between border-b px-6 pt-4 pb-4'>
        <h1 className='text-lg font-semibold'>General</h1>
        <Button disabled={saving} onClick={save} size='sm'>
          {saving && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
          Save
        </Button>
      </div>

      {/* Content – scrollable area */}
      <div className='overflow-auto p-6'>
        <div className='max-w-3xl space-y-0'>
          {/* Section: Workspace name & time zone */}
          <SettingsSection
            title='Workspace name & time zone'
            description='The workspace time zone will affect time-dependent features across the platform.'
          >
            <div className='space-y-5'>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='My Company'
                  className='max-w-sm'
                />
              </div>

              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  App ID
                </Label>
                <div className='flex max-w-sm items-center gap-2'>
                  <Input
                    readOnly
                    disabled
                    value={tenant?.$id ?? ''}
                    className='font-mono text-xs'
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tenant?.$id ?? '');
                      toast.success('Copied');
                    }}
                    className='text-primary text-xs font-medium whitespace-nowrap hover:underline'
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Time zone
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className='max-w-sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SettingsSection>

          <Separator />

          {/* Section: Companies */}
          <SettingsSection
            title='Companies'
            description='Treats all users as individuals, but this feature groups all the users from the same company together.'
            helpLink='#'
            helpText='How does the companies feature work'
          >
            <div className='space-y-4'>
              <ToggleRow
                checked={companiesEnabled}
                onCheckedChange={setCompaniesEnabled}
                label='Enable company related features'
              />
              <div>
                <ToggleRow
                  checked={preventCompanyAttr}
                  onCheckedChange={setPreventCompanyAttr}
                  label='Prevent company attribute updates on Messenger'
                />
                <p className='text-muted-foreground mt-2 ml-10 text-xs'>
                  Enabling this will prevent tampering with the data. Workflows
                  can still be used to collect attribute data from customers.
                </p>
              </div>
            </div>
          </SettingsSection>

          <Separator />

          {/* Section: Test workspace */}
          <SettingsSection
            title='Test workspace'
            description='Experiment with features and integrations in a risk-free environment. Test and configure changes without affecting your live setup.'
            helpLink='#'
            helpText='How to set up a test workspace'
          >
            <ToggleRow
              checked={testWorkspace}
              onCheckedChange={setTestWorkspace}
              label='Enable test workspace'
            />
          </SettingsSection>

          <Separator />

          {/* Section: Delete workspace */}
          <SettingsSection
            title='Delete workspace'
            description='You can delete this workspace by entering your full name and confirming the deletion. The workspace will be deleted within 14 days of confirmation.'
          >
            <div>
              <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                Enter your full name
              </Label>
              <div className='flex max-w-sm items-center gap-3'>
                <Input
                  value={deleteName}
                  onChange={(e) => setDeleteName(e.target.value)}
                  placeholder=''
                />
                <Button
                  variant='destructive'
                  size='sm'
                  disabled={!deleteName}
                  className='whitespace-nowrap'
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  Confirm delete
                </Button>
              </div>

              <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete workspace permanently?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All data including conversations,
                      knowledge sources, contacts, and settings will be permanently
                      deleted. Your account will also be removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteWorkspace}
                      disabled={deleting}
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                      {deleting ? (
                        <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                      ) : null}
                      Delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </SettingsSection>

          <Separator />

          {/* Section: Attribution Message */}
          <SettingsSection
            title='Attribution Message'
            description='Enabling this adds a subtle attribution message at the bottom of your Messenger and emails.'
          >
            <ToggleRow
              checked={attributionMessage}
              onCheckedChange={setAttributionMessage}
              label='Show attribution message'
            />
          </SettingsSection>

          <Separator />

          {/* Section: Team mentions */}
          <SettingsSection
            title='Team mentions'
            description='Control whether teammates can @mention teams in notes and internal ticket conversations.'
          >
            <ToggleRow
              checked={teamMentions}
              onCheckedChange={setTeamMentions}
              label='Allow team mentions'
            />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components matching SWEO's section pattern ─── */

function SettingsSection({
  title,
  description,
  helpLink,
  helpText,
  children
}: {
  title: string;
  description: string;
  helpLink?: string;
  helpText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='py-5'>
      <div className='mb-4'>
        <p className='mb-1 text-sm font-semibold'>{title}</p>
        <p className='text-muted-foreground text-xs leading-relaxed'>
          {description}
        </p>
        {helpLink && helpText && (
          <a
            href={helpLink}
            className='text-primary mt-2 inline-flex items-center gap-1 text-xs hover:underline'
            target='_blank'
            rel='noopener noreferrer'
          >
            <ArticleIcon className='h-3.5 w-3.5' />
            <span>{helpText}</span>
          </a>
        )}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  checked,
  onCheckedChange,
  label
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className='flex cursor-pointer items-center gap-2'>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      <span className='text-sm'>{label}</span>
    </label>
  );
}
