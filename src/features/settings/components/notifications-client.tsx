'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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

export default function NotificationsClient() {
  const { config, loading, saving, save } = useTenantSettings();
  const [emailNotif, setEmailNotif] = useState(true);
  const [desktopNotif, setDesktopNotif] = useState(true);
  const [mobileNotif, setMobileNotif] = useState(false);
  const [soundNotif, setSoundNotif] = useState(true);
  const [newConversation, setNewConversation] = useState(true);
  const [newReply, setNewReply] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [assignedToMe, setAssignedToMe] = useState(true);
  const [escalations, setEscalations] = useState(true);
  const [digest, setDigest] = useState(false);

  useEffect(() => {
    if (!config) return;
    setEmailNotif(config.notifications?.email ?? true);
    setDesktopNotif(config.notifications?.desktop ?? true);
    setMobileNotif(config.notifications?.mobile ?? false);
    setSoundNotif(config.notifications?.sound ?? true);
    setNewConversation(config.notifications?.newConversation ?? true);
    setNewReply(config.notifications?.newReply ?? true);
    setMentions(config.notifications?.mentions ?? true);
    setAssignedToMe(config.notifications?.assignedToMe ?? true);
    setEscalations(config.notifications?.escalations ?? true);
    setDigest(config.notifications?.dailyDigest ?? false);
  }, [config]);

  function handleSave() {
    save(
      {
        notifications: {
          email: emailNotif,
          desktop: desktopNotif,
          mobile: mobileNotif,
          sound: soundNotif,
          newConversation,
          newReply,
          mentions,
          assignedToMe,
          escalations,
          dailyDigest: digest
        }
      },
      'Notification settings saved'
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
        <h1 className='text-lg font-semibold'>Notifications</h1>
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
          {/* Channels */}
          <SettingsSection
            title='Notification channels'
            description='Choose how you want to receive notifications.'
          >
            <div className='space-y-4'>
              <ToggleRow
                checked={emailNotif}
                onCheckedChange={setEmailNotif}
                label='Email notifications'
                description='Receive notifications via email.'
              />
              <ToggleRow
                checked={desktopNotif}
                onCheckedChange={setDesktopNotif}
                label='Desktop notifications'
                description='Show browser push notifications.'
              />
              <ToggleRow
                checked={mobileNotif}
                onCheckedChange={setMobileNotif}
                label='Mobile notifications'
                description='Receive push notifications on your mobile device.'
              />
              <ToggleRow
                checked={soundNotif}
                onCheckedChange={setSoundNotif}
                label='Sound'
                description='Play a notification sound for new messages.'
              />
            </div>
          </SettingsSection>

          <Separator />

          {/* Events */}
          <SettingsSection
            title='Events'
            description='Choose which events trigger notifications.'
          >
            <div className='space-y-4'>
              <ToggleRow
                checked={newConversation}
                onCheckedChange={setNewConversation}
                label='New conversations'
                description='When a new customer conversation is created.'
              />
              <ToggleRow
                checked={newReply}
                onCheckedChange={setNewReply}
                label='Customer replies'
                description='When a customer sends a new message.'
              />
              <ToggleRow
                checked={mentions}
                onCheckedChange={setMentions}
                label='Mentions'
                description='When you are @mentioned in a note.'
              />
              <ToggleRow
                checked={assignedToMe}
                onCheckedChange={setAssignedToMe}
                label='Assigned to me'
                description='When a conversation is assigned to you.'
              />
              <ToggleRow
                checked={escalations}
                onCheckedChange={setEscalations}
                label='Escalations'
                description='When a conversation is escalated by AI.'
              />
            </div>
          </SettingsSection>

          <Separator />

          {/* Digest */}
          <SettingsSection
            title='Daily digest'
            description='Receive a summary of your activity at the end of each day.'
          >
            <ToggleRow
              checked={digest}
              onCheckedChange={setDigest}
              label='Enable daily digest'
              description='Get a daily email summary of conversations and metrics.'
            />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
