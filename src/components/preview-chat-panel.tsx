'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Send, Trash, FileText, Link, Pencil } from 'lucide-react';
import { previewChatAction } from '@/features/testing/actions/preview-action';
import type { Citation } from '@/types/appwrite';

/* ------------------------------------------------------------------ */
/*  SWEO spark icon (reusable)                                         */
/* ------------------------------------------------------------------ */

function SweoSparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width='16' height='16' xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 16 16'>
      <path d='M2.125 1.02c.08 0 .158.032.215.088L5.763 4.53c.146.146.391.005.338-.195L5.314 1.4a.303.303 0 0 1 .293-.38H6.81c.137 0 .257.091.293.224l.604 2.25a.814.814 0 0 1 0 .418l-.434 1.615a2.49 2.49 0 0 1-1.76 1.76l-1.617.433a.817.817 0 0 1-.418 0l-2.251-.603A.3.3 0 0 1 1 6.825V5.622c0-.199.189-.344.38-.293l2.938.787c.2.053.34-.192.194-.338L1.09 2.358A.306.306 0 0 1 1 2.142c0-.62.504-1.124 1.125-1.124zM13.875 1a.305.305 0 0 0-.214.089l-3.424 3.42c-.146.147-.391.005-.337-.194l.786-2.934A.303.303 0 0 0 10.393 1H9.19a.304.304 0 0 0-.293.224l-.603 2.25a.814.814 0 0 0 0 .418l.433 1.615c.23.86.901 1.53 1.76 1.76l1.617.433c.137.036.28.036.418 0l2.252-.603A.3.3 0 0 0 15 6.806V5.602a.303.303 0 0 0-.38-.292l-2.938.787c-.2.053-.34-.192-.194-.338l3.423-3.42a.306.306 0 0 0 .09-.215C15 1.504 14.495 1 13.874 1zM13.875 15a.306.306 0 0 1-.214-.089l-3.424-3.42c-.146-.147-.391-.005-.337.194l.786 2.934a.303.303 0 0 1-.293.381H9.19a.304.304 0 0 1-.293-.224l-.603-2.25a.814.814 0 0 1 0-.418l.433-1.615c.23-.86.901-1.53 1.76-1.76l1.617-.433a.817.817 0 0 1 .418 0l2.252.603a.3.3 0 0 1 .226.291v1.204a.302.302 0 0 1-.38.292l-2.938-.787c-.2-.053-.34.192-.194.338l3.423 3.42a.306.306 0 0 1 .09.215c0 .62-.505 1.124-1.126 1.124zM2.125 15c.08 0 .158-.032.215-.089l3.423-3.42c.146-.147.391-.005.338.194l-.787 2.934a.303.303 0 0 0 .293.381H6.81a.304.304 0 0 0 .293-.224l.604-2.25a.814.814 0 0 0 0-.418l-.434-1.615a2.489 2.489 0 0 0-1.76-1.76L3.895 8.3a.817.817 0 0 0-.418 0l-2.251.603A.3.3 0 0 0 1 9.194v1.204c0 .198.189.344.38.292l2.938-.787c.2-.053.34.192.194.338l-3.423 3.42a.306.306 0 0 0-.09.215C1 14.496 1.505 15 2.126 15z' />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  CitationBadge – shows which knowledge source was used              */
/* ------------------------------------------------------------------ */

function CitationBadge({ citation }: { citation: Citation }) {
  const Icon =
    citation.sourceType === 'file'
      ? FileText
      : citation.sourceType === 'url'
        ? Link
        : Pencil;

  return (
    <span className='inline-flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground'>
      <Icon className='h-2.5 w-2.5 shrink-0' />
      <span className='max-w-[140px] truncate'>
        {citation.label ?? citation.sourceId.slice(0, 8)}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  PreviewChatPanel                                                   */
/* ------------------------------------------------------------------ */

interface PreviewMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidence?: number;
}

interface PreviewChatPanelProps {
  tenantId: string;
  /** Empty-state helper text shown below "Test SWEO AI" heading */
  description?: string;
}

export function PreviewChatPanel({
  tenantId,
  description = 'Ask a question to preview how SWEO responds.'
}: PreviewChatPanelProps) {
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading || !tenantId) return;

    setInput('');

    const userMsg: PreviewMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Collect all user messages in this session for multi-turn simulation
      const allUserMessages = [...messages.filter((m) => m.role === 'user').map((m) => m.content), text];

      const result = await previewChatAction({
        tenantId,
        messages: allUserMessages,
      });

      if (!result.success || !result.data) {
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', content: result.error ?? 'Something went wrong.' }
        ]);
        return;
      }

      // The last turn's assistant response is the answer to the latest message
      const lastTurn = result.data.turns?.[result.data.turns.length - 1];
      const reply = lastTurn?.assistantResponse ?? 'No response generated.';

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply,
          citations: lastTurn?.citations ?? [],
          confidence: lastTurn?.confidence ?? 0,
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: 'Failed to connect. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput('');
  };

  const isEmpty = messages.length === 0;

  return (
    <div className='flex w-80 shrink-0 flex-col border-l'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3'>
        <h2 className='text-sm font-semibold'>Preview</h2>
        {!isEmpty && (
          <button
            onClick={handleClear}
            className='rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
            title='Clear chat'
          >
            <Trash className='h-3.5 w-3.5' />
          </button>
        )}
      </div>
      <div className='border-t border-dashed' />

      {/* Messages area */}
      <div ref={scrollRef} className='flex flex-1 flex-col gap-3 overflow-y-auto p-4'>
        {isEmpty ? (
          <div className='flex flex-1 flex-col items-center justify-center gap-3 text-center'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
              <SweoSparkIcon className='h-5 w-5 text-muted-foreground' />
            </div>
            <div>
              <p className='text-sm font-medium text-foreground'>Test SWEO AI</p>
              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                {description}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className='flex flex-col gap-1'>
              <div
                className={cn(
                  'max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted text-foreground'
                )}
              >
                {msg.content}
              </div>

              {/* Citations & confidence for assistant messages */}
              {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                <div className='flex flex-col gap-1 pl-1'>
                  <div className='flex items-center gap-1'>
                    <span className='text-[10px] font-medium text-muted-foreground'>
                      Sources
                    </span>
                    {msg.confidence !== undefined && (
                      <span
                        className={cn(
                          'ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-medium',
                          msg.confidence >= 0.7
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                            : msg.confidence >= 0.4
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                        )}
                      >
                        {(msg.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {msg.citations.map((c, i) => (
                      <CitationBadge key={`${msg.id}-c-${i}`} citation={c} />
                    ))}
                  </div>
                </div>
              )}

              {/* Show low-confidence warning when no citations */}
              {msg.role === 'assistant' &&
                (!msg.citations || msg.citations.length === 0) &&
                msg.confidence !== undefined &&
                msg.confidence > 0 &&
                msg.confidence < 0.7 && (
                  <div className='pl-1'>
                    <span className='rounded-full bg-yellow-100 px-1.5 py-0.5 text-[9px] font-medium text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400'>
                      Low confidence · {(msg.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
            </div>
          ))
        )}
        {isLoading && (
          <div className='flex items-center gap-2 rounded-xl bg-muted px-3 py-2'>
            <Loader2 className='h-3.5 w-3.5 animate-spin text-muted-foreground' />
            <span className='text-xs text-muted-foreground'>Thinking…</span>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className='border-t p-3'>
        <div className='flex items-end gap-2 rounded-lg border bg-card px-3 py-2'>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Ask a question…'
            rows={1}
            disabled={isLoading || !tenantId}
            className='flex-1 resize-none bg-transparent text-xs outline-none placeholder:text-muted-foreground disabled:opacity-50'
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !tenantId}
            className='shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30'
          >
            <Send className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>
    </div>
  );
}
