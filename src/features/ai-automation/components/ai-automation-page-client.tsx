'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ArrowRight,
  Bot,
  Brain,
  FileText,
  Globe,
  MessageSquare,
  Pen,
  Plus,
  Settings,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import {
  getAISettingsAction,
  updateAISettingsAction,
  type AISettings,
  type AutomationRule
} from '@/features/ai-automation/actions/ai-settings-actions';
import { getAnalyticsAction } from '@/features/analytics/actions/analytics-actions';

export default function AIAutomationPageClient() {
  const { tenant, loading } = useTenant();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);

  // Real metrics from analytics
  const [metrics, setMetrics] = useState({
    resolutionRate: 0,
    avgResponseTime: 0,
    csatScore: 0
  });

  // Load real settings from Appwrite
  useEffect(() => {
    async function load() {
      const result = await getAISettingsAction();
      if (result.success && result.settings) {
        setSettings(result.settings);
      } else {
        // Initialize defaults
        setSettings({
          enabled: true,
          agentName: 'AI Agent',
          tone: 'professional',
          instructions: '',
          channels: { web: true, email: true, whatsapp: false, sms: false },
          inboxAI: {
            compose: true,
            summarize: true,
            autofill: true,
            articles: true
          },
          automationRules: []
        });
      }
      setLoadingSettings(false);
    }

    load();
  }, []);

  // Load real metrics
  useEffect(() => {
    async function loadMetrics() {
      if (!tenant?.$id) return;
      const result = await getAnalyticsAction(tenant.$id, 30);
      if (result.success && result.metrics) {
        setMetrics({
          resolutionRate: Math.round(result.metrics.resolutionRate * 100),
          avgResponseTime: result.metrics.firstResponse?.avg
            ? Math.round(result.metrics.firstResponse.avg * 10) / 10
            : 0,
          csatScore: result.metrics.csat?.avgScore ?? 0
        });
      }
    }
    if (tenant) loadMetrics();
  }, [tenant]);

  if (loading || loadingSettings || !settings) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const result = await updateAISettingsAction(settings);
      if (result.success) {
        toast.success('AI settings saved');
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  function addRule() {
    const newRule: AutomationRule = {
      id: Date.now().toString(),
      name: 'New Rule',
      trigger: '',
      action: '',
      enabled: false
    };
    setSettings((prev) =>
      prev
        ? { ...prev, automationRules: [...prev.automationRules, newRule] }
        : prev
    );
  }

  return (
    <div className='bg-card flex min-h-full flex-1 flex-col items-center overflow-y-auto rounded-xl px-6 py-6 md:px-20 md:pt-6 md:pb-12'>
      <div className='flex w-full max-w-[1200px] flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h1 className='font-serif text-lg font-light tracking-tight'>AI Agent</h1>
            <Badge variant={settings.enabled ? 'default' : 'secondary'}>
              {settings.enabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Button onClick={handleSave} disabled={saving} size='sm'>
            {saving && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
            Save
          </Button>
        </div>

        <div className='space-y-6 pb-8'>
      <Tabs defaultValue='sweo'>
        <TabsList>
          <TabsTrigger value='sweo'>
            <Bot className='mr-1.5 h-4 w-4' />
            SWEO AI Agent
          </TabsTrigger>
          <TabsTrigger value='inbox-ai'>
            <Sparkles className='mr-1.5 h-4 w-4' />
            Inbox AI
          </TabsTrigger>
          <TabsTrigger value='automation'>
            <Zap className='mr-1.5 h-4 w-4' />
            Automation
          </TabsTrigger>
        </TabsList>

        {/* ── SWEO AI Agent Tab ── */}
        <TabsContent value='sweo' className='pt-4'>
          <div className='space-y-5'>
            {/* Status & Metrics */}
            <Card className='relative'>
              {/* Corner decorations */}
              <span role='presentation' aria-hidden='true' className='absolute top-0 left-0 hidden h-6 w-6 border-t border-l border-border/40 rounded-tl-xl z-10 md:block' />
              <span role='presentation' aria-hidden='true' className='absolute top-0 right-0 hidden h-6 w-6 border-t border-r border-border/40 rounded-tr-xl z-10 md:block' />
              <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-md'>
                      <Bot className='h-5 w-5' />
                    </div>
                    <div>
                      <CardTitle className='text-base'>SWEO AI Agent</CardTitle>
                      <CardDescription>
                        Autonomous customer support agent
                      </CardDescription>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Badge variant={settings.enabled ? 'default' : 'secondary'}>
                      {settings.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={settings.enabled}
                      onCheckedChange={(v) =>
                        setSettings((prev) =>
                          prev ? { ...prev, enabled: v } : prev
                        )
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <div className='dashed-line' />
              <CardContent className='pt-4'>
                <div className='grid gap-6 sm:grid-cols-3'>
                  <div>
                    <p className='section-label'>
                      Resolution Rate
                    </p>
                    <p className='mt-1 font-mono text-2xl font-light tabular-nums'>
                      {metrics.resolutionRate}%
                    </p>
                  </div>
                  <div>
                    <p className='section-label'>
                      Avg Response Time
                    </p>
                    <p className='mt-1 font-mono text-2xl font-light tabular-nums'>
                      {metrics.avgResponseTime > 0
                        ? `${metrics.avgResponseTime}m`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className='section-label'>
                      Customer Satisfaction
                    </p>
                    <p className='mt-1 font-mono text-2xl font-light tabular-nums'>
                      {metrics.csatScore > 0
                        ? `${metrics.csatScore.toFixed(1)}/5`
                        : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <Brain className='h-4 w-4' />
                  Personality &amp; Behavior
                </CardTitle>
                <CardDescription>
                  Define how the AI agent communicates with customers
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='sweo-name'>Agent Name</Label>
                    <Input
                      id='sweo-name'
                      value={settings.agentName}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? { ...prev, agentName: e.target.value }
                            : prev
                        )
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='sweo-tone'>Tone of Voice</Label>
                    <Select
                      value={settings.tone}
                      onValueChange={(v) =>
                        setSettings((prev) =>
                          prev ? { ...prev, tone: v } : prev
                        )
                      }
                    >
                      <SelectTrigger id='sweo-tone'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='professional'>
                          Professional
                        </SelectItem>
                        <SelectItem value='friendly'>Friendly</SelectItem>
                        <SelectItem value='casual'>Casual</SelectItem>
                        <SelectItem value='formal'>Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='sweo-instructions'>Custom Instructions</Label>
                  <Textarea
                    id='sweo-instructions'
                    rows={3}
                    placeholder='Add specific instructions for how the agent should behave...'
                    value={settings.instructions}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? { ...prev, instructions: e.target.value }
                          : prev
                      )
                    }
                  />
                  <p className='text-muted-foreground text-xs'>
                    These instructions are prepended to every AI conversation as
                    system context.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Active Channels */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <Globe className='h-4 w-4' />
                  Active Channels
                </CardTitle>
                <CardDescription>
                  Channels where the AI agent responds to queries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='divide-y'>
                  {[
                    {
                      name: 'Messenger (Web)',
                      icon: MessageSquare,
                      key: 'web' as const
                    },
                    {
                      name: 'Email',
                      icon: FileText,
                      key: 'email' as const
                    },
                    {
                      name: 'WhatsApp',
                      icon: MessageSquare,
                      key: 'whatsapp' as const
                    },
                    { name: 'SMS', icon: MessageSquare, key: 'sms' as const }
                  ].map((ch) => {
                    const Icon = ch.icon;
                    return (
                      <div
                        key={ch.name}
                        className='flex items-center justify-between py-3'
                      >
                        <div className='flex items-center gap-2'>
                          <Icon className='text-muted-foreground h-4 w-4' />
                          <span className='text-sm'>{ch.name}</span>
                        </div>
                        <Switch
                          checked={settings.channels[ch.key]}
                          onCheckedChange={(v) =>
                            setSettings((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    channels: {
                                      ...prev.channels,
                                      [ch.key]: v
                                    }
                                  }
                                : prev
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Knowledge & Training */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <Target className='h-4 w-4' />
                  Knowledge &amp; Training
                </CardTitle>
                <CardDescription>
                  Data sources and workflows the agent uses to resolve queries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='divide-y'>
                  <Link
                    href='/dashboard/knowledge'
                    className='hover:bg-muted/50 flex items-center justify-between py-3 transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <FileText className='text-muted-foreground h-4 w-4' />
                      <div>
                        <p className='text-sm font-medium'>Knowledge Base</p>
                        <p className='text-muted-foreground text-xs'>
                          Articles, URLs, and uploaded documents
                        </p>
                      </div>
                    </div>
                    <ArrowRight className='text-muted-foreground h-4 w-4' />
                  </Link>
                  <Link
                    href='/dashboard/procedures'
                    className='hover:bg-muted/50 flex items-center justify-between py-3 transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <Zap className='text-muted-foreground h-4 w-4' />
                      <div>
                        <p className='text-sm font-medium'>Procedures</p>
                        <p className='text-muted-foreground text-xs'>
                          Multi-step workflows the agent can execute
                        </p>
                      </div>
                    </div>
                    <ArrowRight className='text-muted-foreground h-4 w-4' />
                  </Link>
                  <Link
                    href='/dashboard/policies'
                    className='hover:bg-muted/50 flex items-center justify-between py-3 transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <Settings className='text-muted-foreground h-4 w-4' />
                      <div>
                        <p className='text-sm font-medium'>Policies</p>
                        <p className='text-muted-foreground text-xs'>
                          Content filters and response guardrails
                        </p>
                      </div>
                    </div>
                    <ArrowRight className='text-muted-foreground h-4 w-4' />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='flex justify-end pt-2'>
            <Button onClick={handleSave} disabled={saving}>
              {saving && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* ── Inbox AI Tab ── */}
        <TabsContent value='inbox-ai' className='pt-4'>
          <div className='space-y-5'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <Sparkles className='h-4 w-4' />
                  Inbox AI Features
                </CardTitle>
                <CardDescription>
                  AI-powered tools to help agents work faster
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='divide-y'>
                  <div className='flex items-center justify-between py-4'>
                    <div className='flex items-center gap-3'>
                      <Pen className='text-muted-foreground h-4 w-4' />
                      <div>
                        <p className='text-sm font-medium'>AI Compose</p>
                        <p className='text-muted-foreground text-xs'>
                          Generate reply drafts based on conversation context
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.inboxAI.compose}
                      onCheckedChange={(v) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                inboxAI: { ...prev.inboxAI, compose: v }
                              }
                            : prev
                        )
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between py-4'>
                    <div className='flex items-center gap-3'>
                      <FileText className='text-muted-foreground h-4 w-4' />
                      <div>
                        <p className='text-sm font-medium'>AI Summarize</p>
                        <p className='text-muted-foreground text-xs'>
                          Automatically summarize long conversations
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.inboxAI.summarize}
                      onCheckedChange={(v) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                inboxAI: { ...prev.inboxAI, summarize: v }
                              }
                            : prev
                        )
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between py-4'>
                    <div className='flex items-center gap-3'>
                      <Sparkles className='text-muted-foreground h-4 w-4' />
                      <div>
                        <p className='text-sm font-medium'>Autofill</p>
                        <p className='text-muted-foreground text-xs'>
                          Auto-fill conversation attributes from context
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.inboxAI.autofill}
                      onCheckedChange={(v) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                inboxAI: { ...prev.inboxAI, autofill: v }
                              }
                            : prev
                        )
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between py-4'>
                    <div className='flex items-center gap-3'>
                      <FileText className='text-muted-foreground h-4 w-4' />
                      <div>
                        <p className='text-sm font-medium'>AI Articles</p>
                        <p className='text-muted-foreground text-xs'>
                          Suggest relevant knowledge articles to agents
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.inboxAI.articles}
                      onCheckedChange={(v) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                inboxAI: { ...prev.inboxAI, articles: v }
                              }
                            : prev
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='flex justify-end pt-2'>
            <Button onClick={handleSave} disabled={saving}>
              {saving && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* ── Automation Tab ── */}
        <TabsContent value='automation' className='space-y-5 pt-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-serif text-sm font-light tracking-tight'>Automation Rules</h3>
              <p className='text-muted-foreground text-xs'>
                Automate repetitive tasks and routing
              </p>
            </div>
            <Button size='sm' variant='outline' onClick={addRule}>
              <Plus className='mr-1.5 h-3.5 w-3.5' />
              New Rule
            </Button>
          </div>

          <Card>
            <CardContent className='p-0'>
              <div className='divide-y'>
                {(settings?.automationRules ?? []).length === 0 && (
                  <div className='px-4 py-8 text-center'>
                    <p className='text-muted-foreground text-sm'>
                      No automation rules yet. Click &quot;New Rule&quot; to
                      create one.
                    </p>
                  </div>
                )}
                {(settings?.automationRules ?? []).map((rule) => (
                  <div
                    key={rule.id}
                    className='flex items-center justify-between px-4 py-4'
                  >
                    <div className='space-y-0.5'>
                      <p className='text-sm font-medium'>{rule.name}</p>
                      <p className='text-muted-foreground text-xs'>
                        {rule.trigger}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        &rarr; {rule.action}
                      </p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Badge
                        variant={rule.enabled ? 'default' : 'secondary'}
                        className='text-[10px]'
                      >
                        {rule.enabled ? 'Active' : 'Paused'}
                      </Badge>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(v) =>
                          setSettings((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  automationRules: prev.automationRules.map(
                                    (r) =>
                                      r.id === rule.id
                                        ? { ...r, enabled: v }
                                        : r
                                  )
                                }
                              : prev
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {(settings?.automationRules ?? []).length > 0 && (
            <div className='flex justify-end'>
              <Button size='sm' onClick={handleSave} disabled={saving}>
                {saving && (
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                )}
                Save Rules
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}
