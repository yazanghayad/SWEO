'use client';

import { useEffect, useState } from 'react';
import {
  updatePasswordAction,
  listSessionsAction,
  deleteSessionAction
} from '@/features/settings/actions/profile-actions';
import {
  getMfaStatusAction,
  disableTotpAuthenticatorAction
} from '@/features/auth/actions/mfa';
import { MfaSetupDialog } from './mfa-setup-dialog';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

function _ToggleRow({
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

interface Session {
  id: string;
  provider: string;
  ip: string;
  osName: string;
  clientName: string;
  current: boolean;
  createdAt: string;
}

export default function AccountSecurityClient() {
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [disablingMfa, setDisablingMfa] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const loadMfaStatus = async () => {
    const status = await getMfaStatusAction();
    setTotpEnabled(status.totpEnabled);
  };

  useEffect(() => {
    async function loadData() {
      const [sessionsResult] = await Promise.all([
        listSessionsAction(),
        loadMfaStatus()
      ]);
      if (sessionsResult.error) {
        toast.error(sessionsResult.error);
      } else {
        setSessions(sessionsResult.sessions);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleToggleMfa = async () => {
    if (totpEnabled) {
      // Disable MFA
      setDisablingMfa(true);
      const result = await disableTotpAuthenticatorAction();
      setDisablingMfa(false);
      if (result.success) {
        setTotpEnabled(false);
        toast.success('Authenticator app disabled');
      } else {
        toast.error(result.error ?? 'Failed to disable authenticator');
      }
    } else {
      // Open setup dialog
      setMfaSetupOpen(true);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword)
      return;
    setUpdatingPassword(true);
    const result = await updatePasswordAction(newPassword, currentPassword);
    setUpdatingPassword(false);
    if (result.success) {
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.error ?? 'Failed to update password');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const result = await deleteSessionAction(sessionId);
    if (result.success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success('Session revoked');
    } else {
      toast.error(result.error ?? 'Failed to revoke session');
    }
  };

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
        <h1 className='text-lg font-semibold'>Account Security</h1>
        <Button
          onClick={() => toast.success('Security settings saved')}
          size='sm'
        >
          Save
        </Button>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='max-w-3xl space-y-0'>
          {/* Password */}
          <SettingsSection
            title='Change password'
            description='Update your account password.'
          >
            <div className='max-w-sm space-y-4'>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Current password
                </Label>
                <Input
                  type='password'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  New password
                </Label>
                <Input
                  type='password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Confirm new password
                </Label>
                <Input
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button
                size='sm'
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  newPassword !== confirmPassword ||
                  updatingPassword
                }
                onClick={handleUpdatePassword}
              >
                {updatingPassword ? 'Updating…' : 'Update password'}
              </Button>
            </div>
          </SettingsSection>

          <Separator />

          {/* 2FA */}
          <SettingsSection
            title='Two-factor authentication'
            description='Add an extra layer of security to your account.'
          >
            <div className='space-y-4'>
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='flex items-center gap-3'>
                  <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-lg'>
                    <svg
                      className='text-muted-foreground h-5 w-5'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2}
                    >
                      <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-sm font-medium'>
                      Authenticator app
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      Use Microsoft Authenticator, Google Authenticator, or any TOTP app.
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  {totpEnabled && (
                    <Badge
                      variant='outline'
                      className='text-xs text-green-600 dark:text-green-400'
                    >
                      Enabled
                    </Badge>
                  )}
                  <Button
                    variant={totpEnabled ? 'outline' : 'default'}
                    size='sm'
                    onClick={handleToggleMfa}
                    disabled={disablingMfa}
                  >
                    {disablingMfa
                      ? 'Disabling…'
                      : totpEnabled
                        ? 'Disable'
                        : 'Set up'}
                  </Button>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* MFA Setup Dialog */}
          <MfaSetupDialog
            open={mfaSetupOpen}
            onOpenChange={setMfaSetupOpen}
            onSuccess={loadMfaStatus}
          />

          <Separator />

          {/* Sessions */}
          <SettingsSection
            title='Active sessions'
            description='Manage your active login sessions.'
          >
            <div className='space-y-2'>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div>
                    <p className='text-sm font-medium'>
                      {session.clientName || session.provider}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {session.osName} &middot; {session.ip}
                    </p>
                  </div>
                  {session.current ? (
                    <Badge
                      variant='outline'
                      className='text-xs text-green-600 dark:text-green-400'
                    >
                      Current
                    </Badge>
                  ) : (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
              {sessions.length === 0 && (
                <p className='text-muted-foreground py-4 text-center text-sm'>
                  No active sessions found
                </p>
              )}
            </div>
            <Button
              variant='outline'
              size='sm'
              className='mt-3'
              onClick={async () => {
                const nonCurrent = sessions.filter((s) => !s.current);
                for (const s of nonCurrent) {
                  await deleteSessionAction(s.id);
                }
                setSessions((prev) => prev.filter((s) => s.current));
                toast.info('All other sessions have been revoked');
              }}
            >
              Revoke all other sessions
            </Button>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
