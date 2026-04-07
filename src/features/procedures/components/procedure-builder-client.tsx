'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/use-tenant';
import {
  getProcedureAction,
  updateProcedureAction
} from '@/features/procedures/actions/procedure-crud';
import type {
  Procedure,
  ProcedureStep,
  ProcedureStepType,
  ProcedureTriggerType
} from '@/types/appwrite';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Trash,
  GripVertical,
  MessageSquare,
  Webhook,
  Database,
  GitFork,
  ShieldCheck
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Step type metadata
// ---------------------------------------------------------------------------

interface StepMeta {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  defaultConfig: Record<string, unknown>;
}

const stepMeta: Record<ProcedureStepType, StepMeta> = {
  message: {
    label: 'Send Message',
    description: 'Send a text message to the customer',
    icon: MessageSquare,
    color: 'text-blue-500 bg-blue-500/10',
    defaultConfig: { template: '' }
  },
  api_call: {
    label: 'API Call',
    description: 'Execute an external API request',
    icon: Webhook,
    color: 'text-orange-500 bg-orange-500/10',
    defaultConfig: { dataConnector: '', endpoint: '', params: {} }
  },
  data_lookup: {
    label: 'Data Lookup',
    description: 'Fetch data from a connected source',
    icon: Database,
    color: 'text-green-500 bg-green-500/10',
    defaultConfig: { dataConnector: '', query: '', params: {} }
  },
  conditional: {
    label: 'Condition',
    description: 'Branch based on a condition',
    icon: GitFork,
    color: 'text-purple-500 bg-purple-500/10',
    defaultConfig: { condition: '', trueStep: '', falseStep: '' }
  },
  approval: {
    label: 'Approval',
    description: 'Request human approval before proceeding',
    icon: ShieldCheck,
    color: 'text-amber-500 bg-amber-500/10',
    defaultConfig: { message: '', approvers: [] }
  }
};

// ---------------------------------------------------------------------------
// Sortable Step Card
// ---------------------------------------------------------------------------

function SortableStepCard({
  step,
  index,
  onUpdate,
  onDelete,
  stepsCount
}: {
  step: ProcedureStep;
  index: number;
  onUpdate: (id: string, updates: Partial<ProcedureStep>) => void;
  onDelete: (id: string) => void;
  stepsCount: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const meta = stepMeta[step.type];
  const Icon = meta.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border bg-card p-4 shadow-sm transition-shadow',
        isDragging && 'z-50 shadow-lg ring-2 ring-primary/20'
      )}
    >
      {/* Drag Handle + Header */}
      <div className='flex items-start gap-3'>
        <button
          {...attributes}
          {...listeners}
          className='mt-1 cursor-grab rounded p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing'
          tabIndex={-1}
        >
          <GripVertical className='h-4 w-4' />
        </button>

        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', meta.color)}>
          <Icon className='h-4 w-4' />
        </div>

        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='text-[10px]'>
              Step {index + 1}
            </Badge>
            <Select
              value={step.type}
              onValueChange={(v) =>
                onUpdate(step.id, {
                  type: v as ProcedureStepType,
                  config: stepMeta[v as ProcedureStepType].defaultConfig
                })
              }
            >
              <SelectTrigger className='h-7 w-[160px] text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(stepMeta).map(([key, m]) => (
                  <SelectItem key={key} value={key}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            {meta.description}
          </p>
        </div>

        <Button
          variant='ghost'
          size='sm'
          className='opacity-0 group-hover:opacity-100'
          onClick={() => onDelete(step.id)}
          disabled={stepsCount <= 1}
        >
          <Trash className='h-3.5 w-3.5 text-destructive' />
        </Button>
      </div>

      {/* Step Config */}
      <div className='mt-4 ml-11 space-y-3'>
        <StepConfigEditor
          type={step.type}
          config={step.config}
          onChange={(config) => onUpdate(step.id, { config })}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step Config Editor (type-specific)
// ---------------------------------------------------------------------------

function StepConfigEditor({
  type,
  config,
  onChange
}: {
  type: ProcedureStepType;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}) {
  const set = (key: string, value: unknown) =>
    onChange({ ...config, [key]: value });

  switch (type) {
    case 'message':
      return (
        <div className='space-y-2'>
          <Label className='text-xs'>Message Template</Label>
          <Textarea
            value={(config.template as string) ?? ''}
            onChange={(e) => set('template', e.target.value)}
            placeholder='Your refund of ${{order.total}} has been processed.'
            rows={2}
            className='text-xs'
          />
          <p className='text-[10px] text-muted-foreground'>
            Use {'{{variable}}'} to insert dynamic values from context.
          </p>
        </div>
      );

    case 'api_call':
      return (
        <div className='space-y-3'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Data Connector</Label>
              <Input
                value={(config.dataConnector as string) ?? ''}
                onChange={(e) => set('dataConnector', e.target.value)}
                placeholder='shopify'
                className='h-8 text-xs'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Endpoint</Label>
              <Input
                value={(config.endpoint as string) ?? ''}
                onChange={(e) => set('endpoint', e.target.value)}
                placeholder='refunds.create'
                className='h-8 text-xs'
              />
            </div>
          </div>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Parameters (JSON)</Label>
            <Textarea
              value={
                typeof config.params === 'object'
                  ? JSON.stringify(config.params, null, 2)
                  : (config.params as string) ?? ''
              }
              onChange={(e) => {
                try {
                  set('params', JSON.parse(e.target.value));
                } catch {
                  set('params', e.target.value);
                }
              }}
              placeholder='{ "orderId": "{{order.id}}" }'
              rows={2}
              className='font-mono text-xs'
            />
          </div>
        </div>
      );

    case 'data_lookup':
      return (
        <div className='space-y-3'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Data Connector</Label>
              <Input
                value={(config.dataConnector as string) ?? ''}
                onChange={(e) => set('dataConnector', e.target.value)}
                placeholder='shopify'
                className='h-8 text-xs'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Query</Label>
              <Input
                value={(config.query as string) ?? ''}
                onChange={(e) => set('query', e.target.value)}
                placeholder='orders.get'
                className='h-8 text-xs'
              />
            </div>
          </div>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Parameters (JSON)</Label>
            <Textarea
              value={
                typeof config.params === 'object'
                  ? JSON.stringify(config.params, null, 2)
                  : (config.params as string) ?? ''
              }
              onChange={(e) => {
                try {
                  set('params', JSON.parse(e.target.value));
                } catch {
                  set('params', e.target.value);
                }
              }}
              placeholder='{ "email": "{{user.email}}" }'
              rows={2}
              className='font-mono text-xs'
            />
          </div>
        </div>
      );

    case 'conditional':
      return (
        <div className='space-y-3'>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Condition</Label>
            <Input
              value={(config.condition as string) ?? ''}
              onChange={(e) => set('condition', e.target.value)}
              placeholder='{{order.total}} > 100'
              className='h-8 text-xs'
            />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs text-green-600'>True → Step ID</Label>
              <Input
                value={(config.trueStep as string) ?? ''}
                onChange={(e) => set('trueStep', e.target.value)}
                placeholder='step_3'
                className='h-8 text-xs'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs text-red-600'>False → Step ID</Label>
              <Input
                value={(config.falseStep as string) ?? ''}
                onChange={(e) => set('falseStep', e.target.value)}
                placeholder='step_4'
                className='h-8 text-xs'
              />
            </div>
          </div>
        </div>
      );

    case 'approval':
      return (
        <div className='space-y-3'>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Approval Message</Label>
            <Textarea
              value={(config.message as string) ?? ''}
              onChange={(e) => set('message', e.target.value)}
              placeholder='Refund over $100 requires manager approval'
              rows={2}
              className='text-xs'
            />
          </div>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Approvers (comma-separated emails)</Label>
            <Input
              value={
                Array.isArray(config.approvers)
                  ? (config.approvers as string[]).join(', ')
                  : (config.approvers as string) ?? ''
              }
              onChange={(e) =>
                set(
                  'approvers',
                  e.target.value
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean)
                )
              }
              placeholder='manager@company.com, lead@company.com'
              className='h-8 text-xs'
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Main Builder Component
// ---------------------------------------------------------------------------

export default function ProcedureBuilderClient({
  procedureId
}: {
  procedureId: string;
}) {
  const router = useRouter();
  const { tenant, loading: tenantLoading } = useTenant();
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [steps, setSteps] = useState<ProcedureStep[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<ProcedureTriggerType>('intent');
  const [triggerCondition, setTriggerCondition] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ── Load procedure ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    const res = await getProcedureAction(procedureId, tenant.$id);
    if (res.success && res.procedure) {
      const p = res.procedure;
      setProcedure(p);
      setName(p.name);
      setDescription(p.description);
      setSteps(p.steps ?? []);
      if (p.trigger) {
        setTriggerType(p.trigger.type);
        setTriggerCondition(p.trigger.condition);
      }
    } else {
      toast.error(res.error ?? 'Procedure not found');
    }
    setLoading(false);
  }, [tenant, procedureId]);

  useEffect(() => {
    if (tenant) load();
  }, [tenant, load]);

  // ── Mark dirty on changes ───────────────────────────────────────────
  useEffect(() => {
    if (procedure) setDirty(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, name, description, triggerType, triggerCondition]);

  // ── Save ────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!tenant || !procedure) return;
    setSaving(true);

    // Reassign nextStep links based on order
    const linkedSteps = steps.map((step, i) => ({
      ...step,
      nextStep: step.type === 'conditional' ? step.config.trueStep as string : steps[i + 1]?.id
    }));

    const res = await updateProcedureAction(procedure.$id, tenant.$id, {
      name,
      description,
      trigger: { type: triggerType, condition: triggerCondition },
      steps: linkedSteps
    });
    setSaving(false);

    if (res.success) {
      toast.success('Procedure saved');
      setDirty(false);
    } else {
      toast.error(res.error ?? 'Failed to save');
    }
  }

  // ── Step operations ─────────────────────────────────────────────────
  function addStep(type: ProcedureStepType = 'message') {
    const id = `step_${Date.now()}`;
    setSteps((prev) => [
      ...prev,
      { id, type, config: { ...stepMeta[type].defaultConfig } }
    ]);
  }

  function updateStep(id: string, updates: Partial<ProcedureStep>) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }

  function deleteStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSteps((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === active.id);
        const newIndex = prev.findIndex((s) => s.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  // ── Loading states ──────────────────────────────────────────────────
  if (tenantLoading || loading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!procedure) {
    return (
      <div className='py-20 text-center text-muted-foreground'>
        Procedure not found
      </div>
    );
  }

  return (
    <div className='flex min-h-full flex-1 flex-col overflow-y-auto'>
      {/* Header */}
      <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-3'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.push('/dashboard/procedures')}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-sm font-semibold'>{name || 'Untitled Procedure'}</h1>
            <p className='text-xs text-muted-foreground'>
              v{procedure.version} · {steps.length} step
              {steps.length !== 1 ? 's' : ''}
            </p>
          </div>
          {dirty && (
            <Badge variant='secondary' className='text-[10px]'>
              Unsaved
            </Badge>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={load} disabled={saving}>
            Discard
          </Button>
          <Button size='sm' onClick={handleSave} disabled={saving || !dirty}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Builder Content */}
      <div className='mx-auto w-full max-w-3xl space-y-8 px-6 py-8 pb-24'>
        {/* Procedure Info */}
        <section className='space-y-4'>
          <h2 className='text-sm font-semibold'>Details</h2>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Trigger</Label>
              <div className='flex gap-2'>
                <Select
                  value={triggerType}
                  onValueChange={(v) => setTriggerType(v as ProcedureTriggerType)}
                >
                  <SelectTrigger className='h-8 w-[120px] text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='intent'>Intent</SelectItem>
                    <SelectItem value='keyword'>Keyword</SelectItem>
                    <SelectItem value='manual'>Manual</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={triggerCondition}
                  onChange={(e) => setTriggerCondition(e.target.value)}
                  placeholder='e.g. refund_request'
                  className='h-8 flex-1 text-xs'
                />
              </div>
            </div>
          </div>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className='text-xs'
            />
          </div>
        </section>

        <Separator />

        {/* Steps */}
        <section className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-semibold'>Steps</h2>
            <div className='flex items-center gap-2'>
              {Object.entries(stepMeta).map(([key, m]) => {
                const Icon = m.icon;
                return (
                  <Button
                    key={key}
                    variant='outline'
                    size='sm'
                    className='h-7 text-xs'
                    onClick={() => addStep(key as ProcedureStepType)}
                  >
                    <Icon className='mr-1 h-3 w-3' />
                    {m.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {steps.length === 0 ? (
            <div className='rounded-lg border-2 border-dashed p-12 text-center'>
              <p className='text-muted-foreground text-sm'>
                No steps yet. Add a step to start building your procedure.
              </p>
              <Button
                variant='outline'
                className='mt-4'
                onClick={() => addStep('message')}
              >
                <Plus className='mr-2 h-4 w-4' />
                Add First Step
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={steps.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className='space-y-3'>
                  {steps.map((step, i) => (
                    <SortableStepCard
                      key={step.id}
                      step={step}
                      index={i}
                      onUpdate={updateStep}
                      onDelete={deleteStep}
                      stepsCount={steps.length}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {steps.length > 0 && (
            <Button
              variant='outline'
              size='sm'
              className='w-full'
              onClick={() => addStep('message')}
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Step
            </Button>
          )}
        </section>
      </div>
    </div>
  );
}
