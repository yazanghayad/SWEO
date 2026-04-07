'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ensureTeamAction,
  listTeamMembersAction,
  inviteTeamMemberAction,
  removeMemberAction,
  updateMemberRoleAction
} from '@/features/auth/actions/team-management';
import type { TeamMember as AppwriteTeamMember } from '@/lib/appwrite/teams';
import { usePermissions } from '@/hooks/use-permissions';
import { ROLE_LABELS, ASSIGNABLE_ROLES } from '@/lib/rbac/permissions';

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  agent: 'Agent',
  viewer: 'Viewer'
};

const roleColors: Record<string, string> = {
  owner: 'text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-950',
  admin: 'text-red-600 border-red-200 bg-red-50 dark:bg-red-950',
  agent: 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950',
  viewer: 'text-gray-600 border-gray-200 bg-gray-50 dark:bg-gray-950'
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/* ── SWEO-style section component ── */

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

export default function TeamSettingsClient() {
  const { tenant, loading } = useTenant();
  const { can, isAtLeast } = usePermissions();
  const [members, setMembers] = useState<AppwriteTeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Teammate settings toggles (SWEO-style)
  const [teamMentions, setTeamMentions] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [inactiveLogout, setInactiveLogout] = useState(false);

  useEffect(() => {
    async function loadMembers() {
      if (!tenant?.$id) return;
      await ensureTeamAction(tenant.$id);
      const result = await listTeamMembersAction(tenant.$id);
      if (result.success && result.members) {
        setMembers(result.members);
      }
      setLoadingMembers(false);
    }
    if (tenant) {
      loadMembers();
    }
  }, [tenant]);

  if (loading || loadingMembers) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  async function handleInvite() {
    if (!inviteEmail || !tenant?.$id) return;
    setInviting(true);
    try {
      const result = await inviteTeamMemberAction(tenant.$id, inviteEmail, [
        inviteRole as 'admin' | 'agent' | 'viewer'
      ]);
      if (result.success) {
        toast.success(`Invitation sent to ${inviteEmail}`);
        setInviteEmail('');
        setInviteName('');
        setDialogOpen(false);
        const refreshed = await listTeamMembersAction(tenant.$id);
        if (refreshed.success && refreshed.members) {
          setMembers(refreshed.members);
        }
      } else {
        toast.error(result.error || 'Failed to invite');
      }
    } catch {
      toast.error('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(membershipId: string) {
    if (!tenant?.$id) return;
    const result = await removeMemberAction(tenant.$id, membershipId);
    if (result.success) {
      toast.success('Team member removed');
      setMembers((prev) =>
        prev.filter((m) => m.membershipId !== membershipId)
      );
    } else {
      toast.error(result.error || 'Failed to remove member');
    }
  }

  const filteredMembers = members.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className='bg-muted/30 flex flex-1 flex-col overflow-hidden rounded-lg shadow-sm'>
      {/* Header bar – SWEO-style */}
      <div className='flex items-center justify-between border-b px-6 pt-4 pb-4'>
        <div>
          <h1 className='text-lg font-semibold'>Teammates</h1>
          <p className='text-muted-foreground text-xs'>
            {members.length} member{members.length !== 1 ? 's' : ''} &middot;{' '}
            {members.filter((m) => m.joinedAt).length} active
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          {can('team.invite') && (
            <DialogTrigger asChild>
              <Button size='sm'>Invite Teammate</Button>
            </DialogTrigger>
          )}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Teammate</DialogTitle>
              <DialogDescription>
                Send an invitation email to add a new team member. They will
                receive an email with a link to join this workspace.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='invite-name'>Name</Label>
                <Input
                  id='invite-name'
                  type='text'
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder='Jane Doe'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='invite-email'>Email address</Label>
                <Input
                  id='invite-email'
                  type='email'
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder='teammate@company.com'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='invite-role'>Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id='invite-role'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='admin'>
                      <div>
                        <span className='font-medium'>Admin</span>
                        <span className='text-muted-foreground ml-2 text-xs'>
                          Full access
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value='agent'>
                      <div>
                        <span className='font-medium'>Agent</span>
                        <span className='text-muted-foreground ml-2 text-xs'>
                          Conversations & knowledge
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value='viewer'>
                      <div>
                        <span className='font-medium'>Viewer</span>
                        <span className='text-muted-foreground ml-2 text-xs'>
                          Read-only
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={!inviteEmail || inviting}
              >
                {inviting && (
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                )}
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='max-w-3xl space-y-0'>
          {/* Team Members section */}
          <SettingsSection
            title='Team members'
            description='Manage your workspace teammates. Invite new team members and assign roles to control what they can do.'
          >
            <div className='space-y-3'>
              {/* Search */}
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search teammates...'
                className='max-w-sm'
              />

              {/* Members list */}
              <div className='rounded-lg border'>
                <Table>
                  <TableHeader>
                    <TableRow className='hover:bg-transparent'>
                      <TableHead className='text-xs'>Member</TableHead>
                      <TableHead className='text-xs'>Role</TableHead>
                      <TableHead className='text-xs'>Status</TableHead>
                      <TableHead className='text-right text-xs'>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className='text-muted-foreground py-8 text-center text-sm'
                        >
                          {searchQuery
                            ? 'No teammates match your search.'
                            : 'No team members yet. Invite someone to get started.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => {
                        const primaryRole =
                          member.roles?.[0] ?? 'member';
                        return (
                          <TableRow key={member.membershipId}>
                            <TableCell>
                              <div className='flex items-center gap-3'>
                                <Avatar className='h-8 w-8'>
                                  <AvatarFallback className='text-xs'>
                                    {getInitials(
                                      member.name || member.email
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className='text-sm font-medium'>
                                    {member.name || member.email}
                                  </p>
                                  <p className='text-muted-foreground text-xs'>
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {primaryRole === 'owner' || !can('team.roles') ? (
                                <Badge
                                  variant='outline'
                                  className={
                                    roleColors[primaryRole] ?? ''
                                  }
                                >
                                  {roleLabels[primaryRole] ??
                                    primaryRole}
                                </Badge>
                              ) : (
                                <Select
                                  value={primaryRole}
                                  onValueChange={async (newRole) => {
                                    if (!tenant?.$id) return;
                                    const result = await updateMemberRoleAction(
                                      tenant.$id,
                                      member.membershipId,
                                      [newRole as 'admin' | 'agent' | 'viewer']
                                    );
                                    if (result.success) {
                                      toast.success(`Role updated to ${ROLE_LABELS[newRole as keyof typeof ROLE_LABELS] ?? newRole}`);
                                      setMembers((prev) =>
                                        prev.map((m) =>
                                          m.membershipId === member.membershipId
                                            ? { ...m, roles: [newRole as 'admin' | 'agent' | 'viewer'] }
                                            : m
                                        )
                                      );
                                    } else {
                                      toast.error(result.error ?? 'Failed to update role');
                                    }
                                  }}
                                >
                                  <SelectTrigger className='h-7 w-[100px] text-xs'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ASSIGNABLE_ROLES.map((r) => (
                                      <SelectItem key={r} value={r}>
                                        {ROLE_LABELS[r]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-1.5'>
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    member.joinedAt
                                      ? 'bg-green-500'
                                      : 'bg-yellow-500'
                                  }`}
                                />
                                <span className='text-xs'>
                                  {member.joinedAt
                                    ? 'Active'
                                    : 'Pending'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className='text-right'>
                              {primaryRole !== 'owner' && can('team.remove') && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='text-xs'
                                  onClick={() =>
                                    handleRemove(member.membershipId)
                                  }
                                >
                                  Remove
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </SettingsSection>

          <Separator />

          {/* Roles & Permissions */}
          <SettingsSection
            title='Roles & Permissions'
            description='Roles define what teammates can access and do in the workspace. Assign the appropriate role when inviting.'
          >
            <div className='space-y-2'>
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950'>
                    <svg
                      className='h-4 w-4 text-purple-600 dark:text-purple-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2}
                    >
                      <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-sm font-medium'>Owner</p>
                    <p className='text-muted-foreground text-xs'>
                      Full access to everything including workspace deletion
                    </p>
                  </div>
                </div>
                <Badge
                  variant='outline'
                  className='text-purple-600 dark:text-purple-400'
                >
                  Owner
                </Badge>
              </div>
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950'>
                    <svg
                      className='h-4 w-4 text-red-600 dark:text-red-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2}
                    >
                      <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                      <circle cx='9' cy='7' r='4' />
                      <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
                      <path d='M16 3.13a4 4 0 0 1 0 7.75' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-sm font-medium'>Admin</p>
                    <p className='text-muted-foreground text-xs'>
                      Full access to all settings, billing, and team management
                    </p>
                  </div>
                </div>
                <Badge
                  variant='outline'
                  className='text-red-600 dark:text-red-400'
                >
                  Full Access
                </Badge>
              </div>
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950'>
                    <svg
                      className='h-4 w-4 text-blue-600 dark:text-blue-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2}
                    >
                      <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                      <circle cx='12' cy='7' r='4' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-sm font-medium'>Agent</p>
                    <p className='text-muted-foreground text-xs'>
                      Can view and respond to conversations, manage knowledge
                      base
                    </p>
                  </div>
                </div>
                <Badge
                  variant='outline'
                  className='text-blue-600 dark:text-blue-400'
                >
                  Limited Access
                </Badge>
              </div>
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900'>
                    <svg
                      className='text-muted-foreground h-4 w-4'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2}
                    >
                      <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' />
                      <circle cx='12' cy='12' r='3' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-sm font-medium'>Viewer</p>
                    <p className='text-muted-foreground text-xs'>
                      Read-only access to conversations, reports, and dashboard
                    </p>
                  </div>
                </div>
                <Badge variant='outline' className='text-muted-foreground'>
                  Read Only
                </Badge>
              </div>
            </div>
          </SettingsSection>

          <Separator />

          {/* Team Settings – Toggles (SWEO-style) */}
          <SettingsSection
            title='Team mentions'
            description='Control whether teammates can @mention teams in notes and internal ticket conversations.'
          >
            <ToggleRow
              checked={teamMentions}
              onCheckedChange={setTeamMentions}
              label='Allow team mentions in notes'
              description='Teammates can use @team to notify all members of a team.'
            />
          </SettingsSection>

          <Separator />

          <SettingsSection
            title='Auto-assignment'
            description='Automatically assign new conversations to available team members.'
          >
            <ToggleRow
              checked={autoAssign}
              onCheckedChange={setAutoAssign}
              label='Enable auto-assignment for new conversations'
              description='New conversations will be assigned to teammates in a round-robin fashion.'
            />
          </SettingsSection>

          <Separator />

          <SettingsSection
            title='Inactive teammate'
            description='Automatically set teammates as away after a period of inactivity.'
          >
            <ToggleRow
              checked={inactiveLogout}
              onCheckedChange={setInactiveLogout}
              label='Auto-set to away after inactivity'
              description='Teammates will be marked as away after 30 minutes without activity.'
            />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
