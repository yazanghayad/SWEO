'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useChatbotStore } from '../store';
import { DEPARTMENTS } from '../types';
import type { ChatMessage, ChatDepartment } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  Send,
  ChevronDown,
  MessageSquare,
  User,
  Mail
} from 'lucide-react';
import Image from 'next/image';
import { uid, TABS } from './chat-widget-utils';
import type { TabId } from './chat-widget-utils';
import { HomeTab, MessagesTab, HelpTab, NewsTab } from './chat-widget-tabs';
import { ConversationHeader, MessageBubble, PoweredBy } from './chat-widget-parts';

// ── Main Widget ───────────────────────────────────────────────────────────
export function ChatBotWidget() {
  const {
    isOpen,
    toggleOpen,
    activeTab,
    setActiveTab,
    department,
    setDepartment,
    messages,
    addMessage,
    updateLastAssistantMessage,
    conversationId,
    setConversationId,
    isStreaming,
    setIsStreaming,
    hasStartedConversation,
    setHasStartedConversation,
    resetChat,
    userName,
    userEmail,
    setUserInfo
  } = useChatbotStore();

  const [inputValue, setInputValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [inConversation, setInConversation] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [salesName, setSalesName] = useState('');
  const [salesEmail, setSalesEmail] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current && inConversation) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, inConversation]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // Sync inConversation with store
  useEffect(() => {
    if (department) setInConversation(true);
  }, [department]);

  const handleSelectDepartment = useCallback(
    (dept: ChatDepartment) => {
      if (dept === 'sales' && !userName && !userEmail) {
        // Show sales form before starting
        setDepartment(dept);
        setShowSalesForm(true);
        setInConversation(true);
        return;
      }

      setDepartment(dept);
      setInConversation(true);
      const info = DEPARTMENTS.find((d) => d.id === dept)!;
      if (!hasStartedConversation) {
        addMessage({
          id: uid(),
          role: 'assistant',
          content: info.greeting,
          timestamp: new Date()
        });
        setHasStartedConversation(true);
      }
    },
    [
      setDepartment,
      addMessage,
      hasStartedConversation,
      setHasStartedConversation,
      userName,
      userEmail
    ]
  );

  const handleSalesFormSubmit = useCallback(() => {
    if (!salesName.trim() || !salesEmail.trim()) return;
    setUserInfo(salesName.trim(), salesEmail.trim());
    setShowSalesForm(false);
    const info = DEPARTMENTS.find((d) => d.id === 'sales')!;
    if (!hasStartedConversation) {
      addMessage({
        id: uid(),
        role: 'assistant',
        content: `Hej ${salesName.trim()}! ${info.greeting}`,
        timestamp: new Date()
      });
      setHasStartedConversation(true);
    }
  }, [
    salesName,
    salesEmail,
    setUserInfo,
    addMessage,
    hasStartedConversation,
    setHasStartedConversation
  ]);

  const handleStartChat = useCallback(() => {
    setActiveTab('messages');
  }, [setActiveTab]);

  const handleBackToHome = useCallback(() => {
    setInConversation(false);
    setActiveTab('home');
  }, [setActiveTab]);

  const handleEndChat = useCallback(() => {
    setShowEndConfirm(false);
    setShowSalesForm(false);
    setInConversation(false);
    resetChat();
    setInputValue('');
    setSalesName('');
    setSalesEmail('');
  }, [resetChat]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isStreaming || !department) return;

    setInputValue('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    addMessage({
      id: uid(),
      role: 'user',
      content: text,
      timestamp: new Date()
    });
    addMessage({
      id: uid(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    });

    setIsStreaming(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          department,
          conversationId,
          userName: userName || undefined,
          userEmail: userEmail || undefined
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        updateLastAssistantMessage(err.error ?? 'Något gick fel. Försök igen.');
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';

      if (!reader) throw new Error('Missing body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === '[DONE]') continue;
          try {
            const ev = JSON.parse(raw);
            if (ev.type === 'delta') {
              full += ev.content;
              updateLastAssistantMessage(full);
            } else if (ev.type === 'done' && ev.conversationId) {
              setConversationId(ev.conversationId);
            } else if (ev.type === 'escalated') {
              updateLastAssistantMessage(
                ev.message ?? 'Jag kopplar dig till en agent.'
              );
              if (ev.conversationId) setConversationId(ev.conversationId);
            } else if (ev.type === 'blocked') {
              updateLastAssistantMessage(
                ev.message ?? 'Förfrågan blockerades av våra policyer.'
              );
            } else if (ev.type === 'error') {
              updateLastAssistantMessage(ev.message ?? 'Ett fel uppstod.');
            }
          } catch {
            /* skip */
          }
        }
      }

      if (!full) {
        updateLastAssistantMessage(
          'Tack för ditt meddelande. Vårt team återkommer till dig inom kort.'
        );
      }
      if (!isOpen) setUnreadCount((c) => c + 1);
    } catch {
      updateLastAssistantMessage('Anslutningen misslyckades. Försök igen.');
    } finally {
      setIsStreaming(false);
    }
  }, [
    inputValue,
    isStreaming,
    department,
    conversationId,
    addMessage,
    updateLastAssistantMessage,
    setConversationId,
    setIsStreaming,
    isOpen,
    userName,
    userEmail
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  };

  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <>
      {/* ── Launcher ───────────────────────────────────────────────── */}
      <motion.button
        onClick={toggleOpen}
        className={cn(
          'fixed right-6 bottom-6 z-[99999]',
          'flex h-[56px] w-[56px] items-center justify-center rounded-full',
          'cursor-pointer select-none',
          'bg-foreground text-background',
          'dark:bg-white',
          'shadow-[0_2px_12px_rgba(0,0,0,0.15)]',
          'transition-all duration-150',
          'hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]',
          'active:scale-[0.96]',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
        )}
        aria-label={isOpen ? 'Stäng chatt' : 'Öppna chatt'}
      >
        <AnimatePresence mode='wait' initial={false}>
          {isOpen ? (
            <motion.span
              key='close'
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown className='h-5 w-5' strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span
              key='open'
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className='relative'
            >
              <MessageSquare
                className='h-8 w-8 fill-orange-500 text-orange-500 dark:fill-[#000000] dark:text-[#000000]'
                strokeWidth={2}
              />
              {unreadCount > 0 && (
                <span className='absolute -top-1.5 -right-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white'>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Panel ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
              'fixed right-6 bottom-[72px] z-[99998]',
              'flex flex-col overflow-hidden',
              'w-[400px] max-w-[calc(100vw-3rem)]',
              'h-[calc(100vh-120px)] max-h-[680px]',
              'rounded-2xl',
              'shadow-[0_5px_40px_rgba(0,0,0,0.14)]',
              'bg-background'
            )}
          >
            {inConversation ? (
              /* ── Conversation View ── */
              <div className='flex min-h-0 flex-1 flex-col'>
                <ConversationHeader
                  department={department}
                  onBack={handleBackToHome}
                  onClose={toggleOpen}
                  onEndChat={() => setShowEndConfirm(true)}
                />

                {/* End chat confirmation */}
                <AnimatePresence>
                  {showEndConfirm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className='border-border bg-muted/50 border-b px-4 py-3'
                    >
                      <p className='text-foreground mb-2 text-[13px] font-medium'>
                        Vill du avsluta chatten?
                      </p>
                      <p className='text-muted-foreground mb-3 text-[12px]'>
                        Konversationen rensas och kan inte återställas.
                      </p>
                      <div className='flex gap-2'>
                        <button
                          onClick={handleEndChat}
                          className='rounded-lg bg-red-500 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-red-600'
                        >
                          Avsluta
                        </button>
                        <button
                          onClick={() => setShowEndConfirm(false)}
                          className='text-muted-foreground hover:text-foreground rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors'
                        >
                          Avbryt
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className='flex-1 overflow-y-auto overscroll-contain'>
                  <div className='space-y-4 px-4 py-4'>
                    {/* Sales form gate */}
                    {showSalesForm && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='space-y-4'
                      >
                        <div className='bg-muted/50 rounded-xl p-4'>
                          <p className='text-foreground mb-1 text-[14px] font-semibold'>
                            Innan vi börjar
                          </p>
                          <p className='text-muted-foreground mb-4 text-[13px]'>
                            Fyll i dina uppgifter så att vi kan hjälpa dig
                            bättre och en handläggare kan följa upp.
                          </p>
                          <div className='space-y-3'>
                            <div>
                              <label className='text-muted-foreground mb-1 block text-[12px] font-medium'>
                                Namn
                              </label>
                              <div className='border-border focus-within:border-foreground/20 flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors dark:bg-black'>
                                <User className='text-muted-foreground h-4 w-4 shrink-0' />
                                <input
                                  type='text'
                                  value={salesName}
                                  onChange={(e) => setSalesName(e.target.value)}
                                  placeholder='Ditt namn'
                                  className='text-foreground flex-1 bg-transparent text-[14px] outline-none placeholder:text-gray-400'
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div>
                              <label className='text-muted-foreground mb-1 block text-[12px] font-medium'>
                                E-post
                              </label>
                              <div className='border-border focus-within:border-foreground/20 flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors dark:bg-black'>
                                <Mail className='text-muted-foreground h-4 w-4 shrink-0' />
                                <input
                                  type='email'
                                  value={salesEmail}
                                  onChange={(e) =>
                                    setSalesEmail(e.target.value)
                                  }
                                  placeholder='din@email.com'
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter')
                                      handleSalesFormSubmit();
                                  }}
                                  className='text-foreground flex-1 bg-transparent text-[14px] outline-none placeholder:text-gray-400'
                                />
                              </div>
                            </div>
                            <button
                              onClick={handleSalesFormSubmit}
                              disabled={!salesName.trim() || !salesEmail.trim()}
                              className={cn(
                                'w-full rounded-lg px-4 py-2.5 text-[14px] font-medium transition-all',
                                salesName.trim() && salesEmail.trim()
                                  ? 'bg-foreground text-background hover:opacity-90 active:scale-[0.98]'
                                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                              )}
                            >
                              Starta konversation
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Chat messages */}
                    {!showSalesForm &&
                      messages.map((msg, i) => (
                        <MessageBubble
                          key={msg.id ?? i}
                          message={msg}
                          isLast={i === messages.length - 1}
                          isStreaming={
                            isStreaming &&
                            i === messages.length - 1 &&
                            msg.role === 'assistant'
                          }
                        />
                      ))}
                    <div ref={endRef} />
                  </div>
                </div>

                {!showSalesForm && (
                  <div className='px-4 pt-2 pb-3'>
                    <div
                      className={cn(
                        'flex items-end gap-2 rounded-xl',
                        'border-border border',
                        'bg-background',
                        'px-3.5 py-2.5',
                        'transition-colors',
                        'focus-within:border-foreground/20'
                      )}
                    >
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder='Ställ en fråga ...'
                        rows={1}
                        disabled={isStreaming}
                        className={cn(
                          'text-foreground placeholder:text-muted-foreground/60',
                          'flex-1 resize-none bg-transparent',
                          'border-0 py-1',
                          'text-[14px] leading-[1.5]',
                          'outline-none',
                          'max-h-[100px] min-h-[24px]',
                          'disabled:cursor-not-allowed disabled:opacity-40'
                        )}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isStreaming}
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          'transition-all duration-100',
                          inputValue.trim() && !isStreaming
                            ? 'bg-foreground text-background'
                            : 'bg-muted text-muted-foreground/40',
                          'disabled:cursor-default',
                          'active:scale-95'
                        )}
                        aria-label='Skicka'
                      >
                        <Send className='h-3.5 w-3.5' />
                      </button>
                    </div>
                    <PoweredBy />
                  </div>
                )}
              </div>
            ) : (
              /* ── Tabbed Home View ── */
              <div className='flex min-h-0 flex-1 flex-col'>
                <div className='flex-1 overflow-y-auto overscroll-contain'>
                  {activeTab === 'home' && (
                    <HomeTab
                      onStartChat={handleStartChat}
                      lastMessage={lastMessage}
                      hasConversation={hasStartedConversation}
                      onResumeChat={() => setInConversation(true)}
                    />
                  )}
                  {activeTab === 'messages' && (
                    <MessagesTab
                      onSelectDepartment={handleSelectDepartment}
                      hasConversation={hasStartedConversation}
                      lastMessage={lastMessage}
                      onResume={() => setInConversation(true)}
                    />
                  )}
                  {activeTab === 'help' && <HelpTab />}
                  {activeTab === 'news' && <NewsTab />}
                </div>

                {/* ── Bottom Tab Bar ── */}
                <nav className='border-border flex border-t'>
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          'flex flex-1 flex-col items-center gap-0.5 py-2.5',
                          'text-[11px] transition-colors',
                          isActive
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground/70'
                        )}
                      >
                        <Icon
                          className='h-5 w-5'
                          strokeWidth={isActive ? 2 : 1.5}
                        />
                        <span className={cn(isActive && 'font-medium')}>
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
