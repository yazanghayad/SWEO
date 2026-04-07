'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Users, Plus, MoreHorizontal, Mail, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  ensureTeamAction,
  listTeamMembersAction,
  inviteTeamMemberAction,
  removeMemberAction
} from '@/features/auth/actions/team-management';
import type { TeamMember } from '@/lib/appwrite/teams';

export default function WorkspaceTeammatesClient() {
  const { tenant, loading } = useTenant();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [inviting, setInviting] = useState(false);

  // Load real team members from Appwrite
  useEffect(() => {
    async function loadMembers() {
      if (!tenant?.$id) return;

      // Ensure team exists first
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
      <div className='flex items-center justify-center py-20'>
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
        // Refresh members list
        const refreshed = await listTeamMembersAction(tenant.$id);
        if (refreshed.success && refreshed.members) {
          setMembers(refreshed.members);
        }
      } else {
        toast.error(result.error || 'Failed to send invitation');
      }
    } catch {
      toast.error('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(membershipId: string, memberName: string) {
    if (!tenant?.$id) return;

    const result = await removeMemberAction(tenant.$id, membershipId);
    if (result.success) {
      toast.success(`${memberName} removed from team`);
      setMembers((prev) =>
        prev.filter((m) => m.membershipId !== membershipId)
      );
    } else {
      toast.error(result.error || 'Failed to remove member');
    }
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Teammates</h2>
          <p className='text-muted-foreground'>
            Manage team members, roles, and permissions
          </p>
        </div>
        <Badge variant='outline' className='text-sm'>
          {members.length} member{members.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Invite */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Mail className='h-4 w-4' />
            Invite Teammate
          </CardTitle>
          <CardDescription>
            Send an invitation to join your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-2'>
            <Input
              placeholder='email@example.com'
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className='max-w-sm'
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='admin'>Admin</SelectItem>
                <SelectItem value='agent'>Agent</SelectItem>
                <SelectItem value='viewer'>Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleInvite} disabled={!inviteEmail || inviting}>
              {inviting ? (
                <Icons.spinner className='mr-1 h-4 w-4 animate-spin' />
              ) : (
                <Plus className='mr-1 h-4 w-4' />
              )}
              Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team List */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Users className='h-4 w-4' />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-1'>
          {members.length === 0 ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              No team members yet. Invite someone to get started.
            </p>
          ) : (
            members.map((member, i) => (
              <div key={member.membershipId}>
                <div className='flex items-center justify-between py-3'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-9 w-9'>
                      <AvatarFallback className='bg-primary/10 text-primary text-xs'>
                        {getInitials(member.name || member.email)}
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
                  <div className='flex items-center gap-2'>
                    <Badge variant='default'>Active</Badge>
                    <Badge variant='outline'>
                      <Shield className='mr-1 h-3 w-3' />
                      {member.roles?.[0] ?? 'member'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          className='text-destructive'
                          onClick={() =>
                            handleRemove(
                              member.membershipId,
                              member.name || member.email
                            )
                          }
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {i < members.length - 1 && <Separator />}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
