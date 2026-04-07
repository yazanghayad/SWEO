'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import {
  listPoliciesAction,
  createPolicyAction,
  updatePolicyAction,
  deletePolicyAction
} from '@/features/policies/actions/policy-crud';
import type { Policy, PolicyType, PolicyMode } from '@/types/appwrite';
import { Icons } from '@/components/icons';
import { PageLoader, ContentLoader } from '@/components/loaders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const policyTypeLabels: Record<PolicyType, string> = {
  topic_filter: 'Topic Filter',
  pii_filter: 'PII Filter',
  tone: 'Tone Control',
  length: 'Length Limit'
};

const policyModeLabels: Record<PolicyMode, string> = {
  pre: 'Pre-generation',
  post: 'Post-generation'
};

export default function PoliciesPageClient() {
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<PolicyType>('topic_filter');
  const [newMode, setNewMode] = useState<PolicyMode>('pre');
  const [creating, setCreating] = useState(false);

  const loadPolicies = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    const res = await listPoliciesAction(tenant.$id);
    if (res.success) {
      setPolicies(res.policies ?? []);
    }
    setLoading(false);
  }, [tenant]);

  useEffect(() => {
    if (tenant) loadPolicies();
  }, [tenant, loadPolicies]);

  async function handleToggle(policy: Policy, enabled: boolean) {
    const res = await updatePolicyAction({
      policyId: policy.$id,
      tenantId: tenant!.$id,
      enabled
    });
    if (res.success) {
      setPolicies((prev) =>
        prev.map((p) => (p.$id === policy.$id ? { ...p, enabled } : p))
      );
    } else {
      toast.error(res.error ?? 'Failed to update');
    }
  }

  async function handleDelete(policyId: string) {
    const res = await deletePolicyAction(policyId, tenant!.$id);
    if (res.success) {
      setPolicies((prev) => prev.filter((p) => p.$id !== policyId));
      toast.success('Policy deleted');
    } else {
      toast.error(res.error ?? 'Failed to delete');
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await createPolicyAction({
      tenantId: tenant!.$id,
      name: newName.trim(),
      type: newType,
      mode: newMode,
      config: getDefaultConfig(newType)
    });
    setCreating(false);
    if (res.success) {
      toast.success('Policy created');
      setShowCreate(false);
      setNewName('');
      loadPolicies();
    } else {
      toast.error(res.error ?? 'Failed to create');
    }
  }

  if (tenantLoading) {
    return <PageLoader />;
  }

  if (tenantError || !tenant) {
    return (
      <div className='text-destructive py-20 text-center'>
        {tenantError ?? 'Could not load tenant'}
      </div>
    );
  }

  return (
    <div className='bg-card flex min-h-full flex-1 flex-col items-center overflow-y-auto rounded-xl px-6 py-6 md:px-20 md:pt-6 md:pb-12'>
      <div className='flex w-full max-w-[1200px] flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h1 className='font-serif text-lg font-light tracking-tight'>Policies</h1>
            <Badge variant='secondary'>
              {policies.length}
            </Badge>
          </div>
          <Button onClick={() => setShowCreate(true)} size='sm'>
            <Icons.add className='mr-2 h-4 w-4' />
            Add Policy
          </Button>
        </div>

        <div className='dashed-line' />

        <div className='space-y-4'>

      {loading ? (
        <ContentLoader />
      ) : policies.length === 0 ? (
        <Card className='relative overflow-hidden'>
          <div className='pointer-events-none absolute inset-0 dot-pattern text-foreground opacity-20' />
          <CardContent className='relative py-12 text-center'>
            <p className='text-muted-foreground'>
              No policies configured. Add a policy to control AI behavior.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {policies.map((policy) => (
            <Card key={policy.$id}>
              <CardContent className='flex items-center justify-between p-4'>
                <div className='flex items-center gap-4'>
                  <Switch
                    checked={policy.enabled}
                    onCheckedChange={(val) => handleToggle(policy, val)}
                  />
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>{policy.name}</span>
                      <Badge variant='secondary'>
                        {policyTypeLabels[policy.type]}
                      </Badge>
                      <Badge variant='outline'>
                        {policyModeLabels[policy.mode]}
                      </Badge>
                    </div>
                    <p className='text-muted-foreground mt-0.5 text-xs'>
                      Priority: {policy.priority}
                    </p>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDelete(policy.$id)}
                >
                  <Icons.trash className='h-4 w-4' />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Policy</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder='e.g. Block competitor mentions'
              />
            </div>
            <div className='space-y-2'>
              <Label>Type</Label>
              <Select
                value={newType}
                onValueChange={(v) => setNewType(v as PolicyType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='topic_filter'>Topic Filter</SelectItem>
                  <SelectItem value='pii_filter'>PII Filter</SelectItem>
                  <SelectItem value='tone'>Tone Control</SelectItem>
                  <SelectItem value='length'>Length Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Mode</Label>
              <Select
                value={newMode}
                onValueChange={(v) => setNewMode(v as PolicyMode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pre'>Pre-generation</SelectItem>
                  <SelectItem value='post'>Post-generation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
            >
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}

function getDefaultConfig(type: PolicyType): Record<string, unknown> {
  switch (type) {
    case 'topic_filter':
      return { blockedTopics: [], action: 'block' };
    case 'pii_filter':
      return { patterns: ['email', 'phone', 'ssn'], action: 'redact' };
    case 'tone':
      return { style: 'professional', maxInformality: 0.3 };
    case 'length':
      return { maxTokens: 500, truncate: true };
  }
}
