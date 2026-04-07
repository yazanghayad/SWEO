/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  Plus,
  ChevronDown,
  X,
  Loader2,
  FileText,
  Upload,
  Link
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTenant } from '@/hooks/use-tenant';
import {
  listSourcesAction,
  deleteSourceAction
} from '@/features/knowledge/actions/list-sources';
import type { KnowledgeSource } from '@/types/appwrite';
import type { SourceSection, ChecklistItem } from './knowledge-types';
import {
  SweoLogo,
  ZendeskLogo,
  GuruLogo,
  NotionLogo,
  ConfluenceLogo,
  ArticleIcon,
  LockIcon,
  GlobeIcon,
  DotsIcon,
  ChatIcon,
  MacroIcon,
  NoteIcon,
  AttachmentIcon,
  AIIcon
} from './knowledge-icons';
import { AddArticleDialog, AddUrlDialog, UploadDocumentDialog } from './knowledge-dialogs';
import {
  SourceSectionCard,
  SourcesTabs,
  ChecklistCard,
  AllSourcesBanner,
  AIAgentHero,
  CopilotHero,
  HelpCenterHero
} from './knowledge-sections';
import type { TabType } from './knowledge-sections';

/* ------------------------------------------------------------------ */
/*  Helper Functions                                                   */
/* ------------------------------------------------------------------ */

function parseMeta(source: KnowledgeSource): Record<string, unknown> {
  if (typeof source.metadata === 'string') {
    try {
      return JSON.parse(source.metadata);
    } catch {
      return {};
    }
  }
  return (source.metadata as Record<string, unknown>) ?? {};
}

function sourceLabel(source: KnowledgeSource): string {
  const meta = parseMeta(source);
  if (source.type === 'file') return (meta.fileName as string) ?? 'Uploaded file';
  if (source.type === 'url') return source.url ?? (meta.originalUrl as string) ?? 'URL source';
  return (meta.title as string) ?? 'Manual entry';
}

function getSourceCount(sources: KnowledgeSource[], type: string): number {
  return sources.filter((s) => s.type === type && s.status === 'ready').length;
}

/* ------------------------------------------------------------------ */
/*  Main Knowledge Hub Component                                       */
/* ------------------------------------------------------------------ */

export default function KnowledgeHub() {
  const router = useRouter();
  const { tenant, loading: tenantLoading } = useTenant();
  const [activeTab, setActiveTab] = React.useState<TabType>('AI Agent');
  const [showBanner, setShowBanner] = React.useState(true);
  const [showChecklist, setShowChecklist] = React.useState(true);
  const [sources, setSources] = React.useState<KnowledgeSource[]>([]);
  const [loadingSources, setLoadingSources] = React.useState(true);

  // Dialog states
  const [showAddArticle, setShowAddArticle] = React.useState(false);
  const [showAddUrl, setShowAddUrl] = React.useState(false);
  const [showUploadDoc, setShowUploadDoc] = React.useState(false);

  const tenantId = tenant?.$id ?? '';

  // Load sources
  const loadSources = React.useCallback(async () => {
    if (!tenantId) return;
    setLoadingSources(true);
    try {
      const result = await listSourcesAction(tenantId);
      if (result.success && result.data) {
        setSources(result.data);
      }
    } catch {
      toast.error('Failed to load knowledge sources');
    } finally {
      setLoadingSources(false);
    }
  }, [tenantId]);

  React.useEffect(() => {
    loadSources();
  }, [loadSources]);

  // Auto-refresh while any source is processing
  React.useEffect(() => {
    const hasProcessing = sources.some((s) => s.status === 'processing');
    if (!hasProcessing) return;
    const interval = setInterval(loadSources, 5000);
    return () => clearInterval(interval);
  }, [sources, loadSources]);

  // Count sources
  const manualCount = getSourceCount(sources, 'manual');
  const urlCount = getSourceCount(sources, 'url');
  const fileCount = getSourceCount(sources, 'file');
  const totalCount = manualCount + urlCount + fileCount;

  // Checklists per tab
  const aiAgentChecklist: ChecklistItem[] = [
    {
      label: 'Add at least one source of knowledge',
      linkText: 'source of knowledge',
      done: totalCount > 0,
      onClick: () => setShowAddArticle(true)
    },
    {
      label: 'Set up SWEO AI Agent and go live',
      linkText: 'SWEO AI Agent',
      done: false,
      onClick: () => router.push('/dashboard/settings/ai-agent')
    },
    {
      label: 'Optimize SWEO AI Agent by adding more sources',
      linkText: 'adding more sources',
      done: totalCount > 2,
      onClick: () => setShowAddUrl(true)
    },
    {
      label: "Set up SWEO's multilingual support",
      linkText: "SWEO's multilingual support",
      done: true,
      onClick: () => router.push('/dashboard/settings/languages')
    }
  ];

  const copilotChecklist: ChecklistItem[] = [
    {
      label: 'Add at least one source of knowledge',
      linkText: 'source of knowledge',
      done: totalCount > 0,
      onClick: () => setShowAddArticle(true)
    },
    {
      label: 'Start using Copilot in the Inbox',
      linkText: 'Copilot in the Inbox',
      done: false,
      onClick: () => router.push('/dashboard/inbox')
    },
    {
      label: 'Optimize Copilot by adding more sources',
      linkText: 'adding more sources',
      done: totalCount > 2,
      onClick: () => setShowAddUrl(true)
    }
  ];

  const helpCenterChecklist: ChecklistItem[] = [
    {
      label: 'Create your first collection',
      linkText: 'first collection',
      done: false,
      onClick: () => router.push('/dashboard/help-center/collections')
    },
    {
      label: 'Publish an article in a collection',
      linkText: 'article in a collection',
      done: manualCount > 0,
      onClick: () => setShowAddArticle(true)
    },
    {
      label: 'Set your Help Center live',
      linkText: 'Help Center live',
      done: false,
      onClick: () => router.push('/dashboard/settings/help-center')
    }
  ];

  // Source sections for "All sources" tab
  const allSourcesSections: SourceSection[] = [
    {
      icon: <ArticleIcon />,
      title: 'Public articles',
      description: 'Let SWEO AI Agent and Copilot use public articles from your Help Center.',
      rows: [
        {
          logo: <SweoLogo />,
          name: 'SWEO',
          statusText: manualCount > 0 ? `${manualCount} article${manualCount > 1 ? 's' : ''}` : 'No public articles',
          actionLabel: 'Add article',
          onAction: () => setShowAddArticle(true),
          hasCheckmark: manualCount > 0
        },
        {
          logo: <ZendeskLogo />,
          name: 'Zendesk',
          statusText: 'Not set up',
          actionLabel: 'Sync or Import',
          onAction: () => toast.info('Zendesk integration coming soon')
        }
      ]
    },
    {
      icon: <LockIcon />,
      title: 'Internal articles',
      description: 'Give SWEO AI Agent and Copilot internal knowledge only available to you and your team.',
      rows: [
        {
          logo: <SweoLogo />,
          name: 'SWEO',
          statusText: fileCount > 0 ? `${fileCount} article${fileCount > 1 ? 's' : ''}` : 'No internal articles',
          actionLabel: 'Add article',
          onAction: () => setShowUploadDoc(true),
          hasCheckmark: fileCount > 0
        },
        {
          logo: <GuruLogo />,
          name: 'Guru',
          statusText: 'Not set up',
          actionLabel: 'Sync or Import',
          onAction: () => toast.info('Guru integration coming soon')
        },
        {
          logo: <NotionLogo />,
          name: 'Notion',
          statusText: 'Not set up',
          actionLabel: 'Sync or Import',
          onAction: () => toast.info('Notion integration coming soon')
        },
        {
          logo: <ConfluenceLogo />,
          name: 'Confluence',
          statusText: 'Not set up',
          actionLabel: 'Sync or Import',
          onAction: () => toast.info('Confluence integration coming soon')
        }
      ]
    },
    {
      icon: <ChatIcon />,
      title: 'Conversations',
      description: "Let Copilot use your team's conversations and customer tickets from the past 4 months.",
      rows: [
        {
          logo: <SweoLogo />,
          name: 'SWEO',
          statusText: 'Not enough conversations',
          actionLabel: 'Manage',
          onAction: () => router.push('/dashboard/conversations')
        }
      ]
    }
  ];

  // Source sections for "AI Agent" tab
  const aiAgentSections: SourceSection[] = [
    {
      icon: <ArticleIcon />,
      title: 'Public articles',
      description: 'Let SWEO AI Agent use public articles from your Help Center.',
      rows: [
        {
          logo: <SweoLogo />,
          name: 'SWEO',
          statusText: manualCount > 0 ? `${manualCount} article${manualCount > 1 ? 's' : ''}` : 'No public articles for SWEO AI Agent',
          actionLabel: 'Add article',
          onAction: () => setShowAddArticle(true),
          hasCheckmark: manualCount > 0
        },
        {
          logo: <ZendeskLogo />,
          name: 'Zendesk',
          statusText: 'Not set up',
          actionLabel: 'Sync or Import',
          onAction: () => toast.info('Zendesk integration coming soon')
        }
      ]
    },
    {
      icon: <GlobeIcon />,
      title: 'Websites',
      description: 'Let SWEO AI Agent use any public website.',
      headerAction: (
        <Button
          variant='outline'
          size='sm'
          onClick={() => setShowAddUrl(true)}
          className='border-border bg-accent hover:bg-accent text-foreground'
        >
          Sync
        </Button>
      ),
      rows: urlCount > 0
        ? sources
            .filter((s) => s.type === 'url')
            .map((s) => ({
              id: s.$id,
              logo: <GlobeIcon />,
              name: sourceLabel(s),
              statusText: s.status === 'ready' ? 'Ready' : s.status === 'processing' ? 'Processing...' : 'Failed',
              actionLabel: 'View',
              onAction: () => router.push(`/dashboard/knowledge/sources/${s.$id}`)
            }))
        : []
    },
    {
      icon: <DotsIcon />,
      title: 'More content sources',
      description: "Give SWEO AI Agent sources that aren't visible to your customers.",
      rows: [
        {
          logo: <NoteIcon />,
          name: 'Snippets',
          statusText: 'No snippets for SWEO AI Agent',
          actionLabel: 'Add snippet',
          onAction: () => setShowAddArticle(true)
        },
        {
          logo: <AttachmentIcon />,
          name: 'Documents',
          statusText: fileCount > 0 ? `${fileCount} document${fileCount > 1 ? 's' : ''}` : 'No documents for SWEO AI Agent',
          actionLabel: 'Upload document',
          onAction: () => setShowUploadDoc(true),
          hasCheckmark: fileCount > 0
        }
      ]
    },
    {
      icon: <AIIcon />,
      title: 'Content from conversations',
      description: 'Let SWEO AI Agent learn from AI generated snippets.',
      badge: { label: 'Beta', variant: 'beta' as const },
      rows: []
    }
  ];

  // Source sections for "Copilot" tab
  const copilotSections: SourceSection[] = [
    {
      icon: <LockIcon />,
      title: 'Internal articles',
      description: 'Give Copilot internal knowledge only available to you and your team.',
      rows: [
        {
          logo: <SweoLogo />,
          name: 'SWEO',
          statusText: fileCount > 0 ? `${fileCount} article${fileCount > 1 ? 's' : ''}` : 'No internal articles for Copilot',
          actionLabel: 'Add article',
          onAction: () => setShowUploadDoc(true),
          hasCheckmark: fileCount > 0
        },
        {
          logo: <GuruLogo />,
          name: 'Guru',
          statusText: 'Not set up',
          actionLabel: 'Sync or Import',
          onAction: () => toast.info('Guru integration coming soon')
        },
        {
          logo: <NotionLogo />,
          name: 'Notion',
          statusText: 'Not set up',
          actionLabel: 'Sync or Import',
          onAction: () => toast.info('Notion integration coming soon')
        },
        {
          logo: <ConfluenceLogo />,
          name: 'Confluence',
          statusText: 'Not set up',
          actionLabel: 'Sync or Import',
          onAction: () => toast.info('Confluence integration coming soon')
        }
      ]
    },
    {
      icon: <ChatIcon />,
      title: 'Conversations',
      description: "Let Copilot use your team's conversations and customer tickets from the past 4 months.",
      rows: [
        {
          logo: <SweoLogo />,
          name: 'SWEO',
          statusText: 'Not enough conversations',
          actionLabel: 'Manage',
          onAction: () => router.push('/dashboard/conversations')
        },
        {
          logo: <ZendeskLogo />,
          name: 'Zendesk',
          statusText: 'Import your Zendesk tickets (takes 24-48 hours)',
          actionLabel: 'Import',
          onAction: () => toast.info('Zendesk import coming soon')
        }
      ]
    },
    {
      icon: <MacroIcon />,
      title: 'Macros',
      description: 'Copilot will recommend macros that are available to your teammates.',
      rows: []
    }
  ];

  // Source sections for "Help Center" tab
  const helpCenterSections: SourceSection[] = [
    {
      icon: <ArticleIcon />,
      title: 'Public articles',
      description: 'Share public articles in your Help Center where customers can self-serve.',
      rows: [
        {
          logo: <SweoLogo />,
          name: 'SWEO',
          statusText: manualCount > 0 ? `${manualCount} published article${manualCount > 1 ? 's' : ''}` : 'No published articles',
          actionLabel: 'Add article',
          onAction: () => setShowAddArticle(true),
          hasCheckmark: manualCount > 0
        },
        {
          logo: <ZendeskLogo />,
          name: 'Zendesk',
          statusText: 'Not set up',
          actionLabel: 'Sync or Import',
          onAction: () => toast.info('Zendesk integration coming soon')
        }
      ]
    }
  ];

  // Get sections based on active tab
  const getSections = (): SourceSection[] => {
    switch (activeTab) {
      case 'All sources':
        return allSourcesSections;
      case 'AI Agent':
        return aiAgentSections;
      case 'Copilot':
        return copilotSections;
      case 'Help Center':
        return helpCenterSections;
      default:
        return aiAgentSections;
    }
  };

  // Get checklist based on active tab
  const getChecklist = (): ChecklistItem[] => {
    switch (activeTab) {
      case 'AI Agent':
        return aiAgentChecklist;
      case 'Copilot':
        return copilotChecklist;
      case 'Help Center':
        return helpCenterChecklist;
      default:
        return [];
    }
  };

  // Get checklist title based on active tab
  const getChecklistTitle = (): string => {
    switch (activeTab) {
      case 'AI Agent':
        return 'Get started with SWEO AI Agent';
      case 'Copilot':
        return 'Get started with Copilot';
      case 'Help Center':
        return 'Get started with Help Center';
      default:
        return '';
    }
  };

  if (tenantLoading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20 bg-background'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='flex min-h-full flex-1 flex-col bg-background'>
      {/* ---- Page header ---- */}
      <div className='sticky inset-x-0 top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background px-6 py-4'>
        <div className='flex items-center gap-3'>
          <BookOpen className='h-5 w-5 text-muted-foreground' />
          <h1 className='text-lg font-semibold text-foreground'>Sources</h1>
        </div>
        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='border-border bg-accent hover:bg-accent text-foreground'>
                <ArticleIcon className='mr-1.5 h-3.5 w-3.5' />
                Learn
                <ChevronDown className='ml-1 h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='border-border bg-accent'>
              <DropdownMenuItem onClick={() => router.push('/docs')} className='text-foreground hover:bg-accent'>
                Documentation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='border-border bg-accent hover:bg-accent text-foreground'>
                Test SWEO
                <ChevronDown className='ml-1 h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='border-border bg-accent'>
              <DropdownMenuItem onClick={() => router.push('/dashboard/testing')} className='text-foreground hover:bg-accent'>
                Run simulation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='sm'>
                <Plus className='mr-1.5 h-3.5 w-3.5' />
                New content
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='border-border bg-accent'>
              <DropdownMenuItem onClick={() => setShowAddArticle(true)} className='text-foreground hover:bg-accent'>
                <FileText className='mr-2 h-4 w-4' />
                Add article
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowUploadDoc(true)} className='text-foreground hover:bg-accent'>
                <Upload className='mr-2 h-4 w-4' />
                Upload document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAddUrl(true)} className='text-foreground hover:bg-accent'>
                <Link className='mr-2 h-4 w-4' />
                Add URL
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ---- Tabs ---- */}
      <div className='bg-background px-6'>
        <SourcesTabs active={activeTab} onChange={setActiveTab} />
      </div>

      {/* ---- Content ---- */}
      <div className='flex-1 overflow-y-auto px-6 py-6'>
        <div className='mx-auto max-w-7xl'>
          {activeTab === 'All sources' ? (
            <div className='flex flex-col gap-6'>
              {showBanner && (
                <AllSourcesBanner
                  onClose={() => setShowBanner(false)}
                  onSetupAIAgent={() => router.push('/dashboard/settings/ai-agent')}
                  onGoToInbox={() => router.push('/dashboard/inbox')}
                  onSetupHelpCenter={() => router.push('/dashboard/settings/help-center')}
                />
              )}

              {getSections().map((section) => (
                <SourceSectionCard key={section.title} section={section} />
              ))}

              {/* ---- Uploaded Sources Table ---- */}
              {sources.length > 0 && (
                <section className='rounded-lg border border-border bg-muted/30 px-6 py-5'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-accent text-muted-foreground'>
                        <FileText className='h-4 w-4' />
                      </div>
                      <div>
                        <h2 className='text-sm font-semibold text-foreground'>
                          Uploaded sources ({sources.length})
                        </h2>
                        <p className='text-sm text-muted-foreground'>All knowledge sources you&apos;ve added</p>
                      </div>
                    </div>
                  </div>
                  <div className='overflow-hidden rounded-lg border border-border'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b border-border bg-muted/50'>
                          <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>Name</th>
                          <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>Type</th>
                          <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>Status</th>
                          <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>Added</th>
                          <th className='px-4 py-2.5 text-right font-medium text-muted-foreground'>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sources.map((source) => (
                          <tr key={source.$id} className='border-b border-border/50 last:border-0 hover:bg-accent/30'>
                            <td className='px-4 py-2.5 text-foreground'>
                              {source.type === 'url' ? source.url : source.type === 'manual' ? (source.metadata ? (() => { try { const m = typeof source.metadata === 'string' ? JSON.parse(source.metadata) : source.metadata; return m?.title || 'Manual article'; } catch { return 'Manual article'; } })() : 'Manual article') : source.fileId || 'Uploaded file'}
                            </td>
                            <td className='px-4 py-2.5'>
                              <span className={cn(
                                'inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium',
                                source.type === 'url' ? 'bg-blue-500/15 text-primary' :
                                source.type === 'file' ? 'bg-purple-500/15 text-purple-400' :
                                'bg-teal-500/15 text-teal-400'
                              )}>
                                {source.type === 'url' ? 'URL' : source.type === 'file' ? 'File' : 'Article'}
                              </span>
                            </td>
                            <td className='px-4 py-2.5'>
                              <span className={cn(
                                'inline-flex items-center gap-1.5 text-xs',
                                source.status === 'ready' ? 'text-green-400' :
                                source.status === 'processing' ? 'text-amber-400' :
                                'text-red-400'
                              )}>
                                {source.status === 'processing' && <Loader2 className='h-3 w-3 animate-spin' />}
                                {source.status === 'ready' ? 'Ready' : source.status === 'processing' ? 'Processing...' : 'Failed'}
                              </span>
                            </td>
                            <td className='px-4 py-2.5 text-muted-foreground text-xs'>
                              {source.$createdAt ? new Date(source.$createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td className='px-4 py-2.5 text-right'>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-7 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300'
                                onClick={async () => {
                                  if (!confirm('Delete this source?')) return;
                                  const result = await deleteSourceAction(source.$id, tenantId);
                                  if (result.success) {
                                    toast.success('Source deleted');
                                    loadSources();
                                  } else {
                                    toast.error(result.error || 'Failed to delete');
                                  }
                                }}
                              >
                                <X className='mr-1 h-3 w-3' />
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className='flex gap-6'>
              {/* Main content */}
              <div className='flex flex-1 flex-col gap-6'>
                {/* Hero */}
                {activeTab === 'AI Agent' && (
                  <AIAgentHero
                    onSetup={() => router.push('/dashboard/settings/ai-agent')}
                    onLearnMore={() => router.push('/docs')}
                  />
                )}
                {activeTab === 'Copilot' && (
                  <CopilotHero
                    onGoToInbox={() => router.push('/dashboard/inbox')}
                    onWatchGuide={() => toast.info('Video guide coming soon')}
                    onLearnMore={() => router.push('/docs')}
                  />
                )}
                {activeTab === 'Help Center' && (
                  <HelpCenterHero
                    onSetup={() => router.push('/dashboard/settings/help-center')}
                    onLearnMore={() => router.push('/docs')}
                  />
                )}

                {/* Source sections */}
                {getSections().map((section) => (
                  <SourceSectionCard key={section.title} section={section} />
                ))}
              </div>

              {/* Sidebar checklist */}
              {showChecklist && getChecklist().length > 0 && (
                <div className='hidden w-72 flex-shrink-0 lg:block'>
                  <ChecklistCard
                    title={getChecklistTitle()}
                    items={getChecklist()}
                    onClose={() => setShowChecklist(false)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loadingSources && sources.length === 0 && (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          )}
        </div>
      </div>

      {/* ---- Dialogs ---- */}
      <AddArticleDialog
        open={showAddArticle}
        onOpenChange={setShowAddArticle}
        tenantId={tenantId}
        onSuccess={loadSources}
      />
      <AddUrlDialog
        open={showAddUrl}
        onOpenChange={setShowAddUrl}
        tenantId={tenantId}
        onSuccess={loadSources}
      />
      <UploadDocumentDialog
        open={showUploadDoc}
        onOpenChange={setShowUploadDoc}
        tenantId={tenantId}
        onSuccess={loadSources}
      />
    </div>
  );
}
