import {
  CONVERSATION_EVENTS,
  WIDGET_CONVERSATION_STATUS,
  toWidgetConversationStatus,
  type WidgetConversationStatus
} from '../conversation/contracts';

/**
 * Advanced Embeddable Chat Widget — Vanilla JS + Inline CSS
 *
 * Features:
 *   • Beautiful modern UI with smooth animations
 *   • Dynamic config loading from /api/widget/config
 *   • Email verification pre-chat form
 *   • Typing indicators + read receipts
 *   • Message timestamps, avatars, status indicators
 *   • Welcome/home screen with greeting
 *   • CSAT star rating after resolution
 *   • Polling for agent replies
 *   • Keyboard-accessible, responsive, mobile-friendly
 *   • Session persistence (conversation survives page reload)
 *
 * Usage:
 *   <script
 *     src="https://your-domain.com/widget/chat-widget.js"
 *     data-api-key="tenant-api-key"
 *     data-api-url="https://your-domain.com"
 *   ></script>
 */
(function () {
  'use strict';

  /* ================================================================== *
   *  Configuration                                                      *
   * ================================================================== */
  const scriptTag = document.currentScript as HTMLScriptElement;
  const API_KEY = scriptTag?.getAttribute('data-api-key') ?? '';
  const API_URL = (
    scriptTag?.getAttribute('data-api-url') ?? window.location.origin
  ).replace(/\/$/, '');

  if (!API_KEY) {
    // Missing API key – widget cannot initialize
    return;
  }

  /* ================================================================== *
   *  Types                                                              *
   * ================================================================== */
  interface WidgetConfig {
    botName: string;
    welcomeMessage: string;
    brandColor: string;
    widgetPosition: 'left' | 'right';
    poweredBy: boolean;
    typingIndicators: boolean;
    aiShowSources: boolean;
    aiCollectFeedback: boolean;
    requireEmail: boolean;
    identityVerification: boolean;
    officeHoursEnabled: boolean;
    officeHoursSchedule: Record<string, unknown> | null;
    officeHoursAutoReply: boolean;
    autoTranslate: boolean;
    detectLanguage: boolean;
    language: string;
    guidance: Array<{ category: string; name: string; ruleContent: string }>;
  }

  interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
    citations?: Array<{ title: string; url?: string }>;
    senderType?: 'ai' | 'human_agent' | 'system';
    eventType?: typeof CONVERSATION_EVENTS.CLOSED;
  }

  /* ================================================================== *
   *  Outbound Message Types                                             *
   * ================================================================== */
  interface OutboundMsg {
    id: string;
    channel: string;
    title: string;
    content: {
      subject?: string;
      body: string;
      position?: 'top' | 'bottom';
      selector?: string;
      steps?: Array<{
        selector: string;
        title: string;
        body: string;
        position?: 'top' | 'bottom' | 'left' | 'right';
      }>;
      items?: Array<{ id: string; label: string; url?: string }>;
      ctaText?: string;
      ctaUrl?: string;
      style?: 'info' | 'warning' | 'success' | 'error';
    };
    audience: {
      type: string;
      rules: Array<{ field: string; operator: string; value: string }>;
    };
  }

  /**
   * Conversation state machine:
   *   active → handoff_requested → queued → human_active → closed
   *   active → escalated (auto, low confidence) → queued → human_active → closed
   */
  type ConversationState = WidgetConversationStatus;

  type Screen = 'home' | 'email' | 'chat';

  /* ================================================================== *
   *  State                                                              *
   * ================================================================== */
  let config: WidgetConfig = {
    botName: 'Support',
    welcomeMessage: 'Hi there! How can we help you today?',
    brandColor: '#6366f1',
    widgetPosition: 'right',
    poweredBy: true,
    typingIndicators: true,
    aiShowSources: false,
    aiCollectFeedback: true,
    requireEmail: false,
    identityVerification: false,
    officeHoursEnabled: false,
    officeHoursSchedule: null,
    officeHoursAutoReply: false,
    autoTranslate: false,
    detectLanguage: false,
    language: 'en',
    guidance: []
  };

  let isOpen = false;
  let currentScreen: Screen = 'home';
  let conversationId: string | null = null;
  let messages: ChatMessage[] = [];
  let streaming = false;
  let userId = getOrCreateUserId();
  let userEmail = localStorage.getItem('__cw_email') || '';
  let userName = localStorage.getItem('__cw_name') || '';
  let emailVerified = false;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let lastPollTime: string | null = null;
  let conversationStatus: ConversationState = WIDGET_CONVERSATION_STATUS.ACTIVE;
  let closeEventReceived = false;
  let queuePosition: number | null = null;
  let csatSent = false;
  let unreadCount = 0;
  let _isTyping = false;

  /* ── Outbound state ── */
  let outboundMessages: OutboundMsg[] = [];
  const dismissedOutbound: Set<string> = new Set(
    JSON.parse(localStorage.getItem('__cw_ob_dismissed') || '[]')
  );
  const impressedOutbound: Set<string> = new Set();
  let activeOutbound = {
    banners: [] as OutboundMsg[],
    tooltips: [] as OutboundMsg[],
    chatPopups: [] as OutboundMsg[],
    tours: [] as OutboundMsg[],
    checklists: [] as OutboundMsg[],
    posts: [] as OutboundMsg[]
  };
  let activeTourStep = 0;
  let activeTour: OutboundMsg | null = null;
  const pageLoadTime = Date.now();
  let visitCount = parseInt(localStorage.getItem('__cw_visit_count') || '0', 10) + 1;
  let sessionCount = parseInt(sessionStorage.getItem('__cw_session_count') || '0', 10);
  if (!sessionStorage.getItem('__cw_session_started')) {
    sessionCount++;
    sessionStorage.setItem('__cw_session_started', '1');
    sessionStorage.setItem('__cw_session_count', String(sessionCount));
  }
  localStorage.setItem('__cw_visit_count', String(visitCount));

  /* ================================================================== *
   *  Utilities                                                          *
   * ================================================================== */
  function getOrCreateUserId(): string {
    const key = '__cw_uid';
    let uid = localStorage.getItem(key);
    if (!uid) {
      uid = 'anon_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(key, uid);
    }
    return uid;
  }

  function esc(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function newMsgId(): string {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  }

  function formatTime(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function darken(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
    const b = Math.max(0, (num & 0x0000ff) - amount);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function normalizeConversationStatus(rawStatus: unknown): ConversationState {
    return toWidgetConversationStatus(
      typeof rawStatus === 'string' ? rawStatus : null
    );
  }

  /* ================================================================== *
   *  Load remote config                                                 *
   * ================================================================== */
  async function loadConfig(): Promise<void> {
    try {
      const res = await fetch(
        `${API_URL}/api/widget/config`,
        { headers: { 'x-tenant-api-key': API_KEY } }
      );
      if (res.ok) {
        const data = await res.json();
        config = { ...config, ...data };
      }
    } catch {
      /* use defaults */
    }
    emailVerified = !config.requireEmail || !!userEmail;
  }

  /* ================================================================== *
   *  Outbound: Audience Rule Evaluator                                  *
   * ================================================================== */
  function evaluateAudienceRules(audience: OutboundMsg['audience']): boolean {
    if (audience.type === 'all' || !audience.rules || audience.rules.length === 0) return true;

    return audience.rules.every((rule) => {
      const { field, operator, value } = rule;
      let actual: string | number = '';

      const key = field.toLowerCase().replace(/\s+/g, '_');
      switch (key) {
        case 'current_page_url':
        case 'page_url':
          actual = window.location.href;
          break;
        case 'time_on_current_page':
        case 'time_on_page':
          actual = Math.floor((Date.now() - pageLoadTime) / 1000);
          break;
        case 'visit_count':
          actual = visitCount;
          break;
        case 'session_count':
          actual = sessionCount;
          break;
        case 'browser_language':
          actual = navigator.language || '';
          break;
        case 'user_type':
          actual = userEmail ? 'User' : 'Visitors';
          break;
        default:
          return true; // Unknown fields pass through
      }

      const aStr = String(actual).toLowerCase();
      const vStr = value.toLowerCase();
      const aNum = typeof actual === 'number' ? actual : parseFloat(aStr);
      const vNum = parseFloat(vStr.replace(/[^0-9.]/g, ''));

      switch (operator) {
        case 'is':
          return aStr === vStr;
        case 'is not':
        case 'is_not':
          return aStr !== vStr;
        case 'contains':
          return aStr.includes(vStr);
        case 'greater than':
        case 'greater_than':
          return !isNaN(aNum) && !isNaN(vNum) && aNum > vNum;
        case 'less than':
        case 'less_than':
          return !isNaN(aNum) && !isNaN(vNum) && aNum < vNum;
        default:
          return true;
      }
    });
  }

  /* ================================================================== *
   *  Outbound: Load + Filter + Track                                    *
   * ================================================================== */
  async function loadOutboundMessages(): Promise<void> {
    try {
      const res = await fetch(
        `${API_URL}/api/widget/outbound`,
        { headers: { 'x-tenant-api-key': API_KEY } }
      );
      if (res.ok) {
        const data = await res.json();
        outboundMessages = data.messages || [];
      }
    } catch {
      /* silent */
    }
  }

  function filterAndCategorizeOutbound(): void {
    activeOutbound = {
      banners: [], tooltips: [], chatPopups: [],
      tours: [], checklists: [], posts: []
    };

    for (const msg of outboundMessages) {
      if (dismissedOutbound.has(msg.id)) continue;
      if (!evaluateAudienceRules(msg.audience)) continue;

      switch (msg.channel) {
        case 'banner':
          activeOutbound.banners.push(msg);
          break;
        case 'tooltip':
          activeOutbound.tooltips.push(msg);
          break;
        case 'chat':
          activeOutbound.chatPopups.push(msg);
          break;
        case 'product-tour':
          activeOutbound.tours.push(msg);
          break;
        case 'checklist':
          activeOutbound.checklists.push(msg);
          break;
        case 'post':
        case 'news':
        case 'survey':
          activeOutbound.posts.push(msg);
          break;
      }
    }
  }

  function trackOutbound(
    messageId: string,
    event: 'impression' | 'click' | 'dismiss'
  ): void {
    if (event === 'impression' && impressedOutbound.has(messageId)) return;
    if (event === 'impression') impressedOutbound.add(messageId);
    if (event === 'dismiss') {
      dismissedOutbound.add(messageId);
      localStorage.setItem(
        '__cw_ob_dismissed',
        JSON.stringify([...dismissedOutbound])
      );
    }

    fetch(`${API_URL}/api/widget/outbound/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        messageId,
        event,
        userId,
        metadata: { url: window.location.href }
      })
    }).catch(() => {});
  }

  /* ================================================================== *
   *  CSS Injection                                                      *
   * ================================================================== */
  function injectStyles(): void {
    const C = config.brandColor;
    const POS = config.widgetPosition;
    const CD = darken(C, 20);

    const style = document.createElement('style');
    style.id = 'cw-styles';
    style.textContent = `
/* Reset */
#cw-root, #cw-root * { box-sizing: border-box; margin: 0; padding: 0; }
#cw-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #1f2937; }

/* Bubble */
#cw-bubble {
  position: fixed; bottom: 24px; ${POS}: 24px;
  width: 60px; height: 60px; border-radius: 50%;
  background: ${C}; color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 24px rgba(0,0,0,.18), 0 1px 4px rgba(0,0,0,.06);
  z-index: 99999; transition: all .3s cubic-bezier(.4,0,.2,1);
}
#cw-bubble:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(0,0,0,.22); }
#cw-bubble:active { transform: scale(.96); }
#cw-bubble svg { width: 28px; height: 28px; transition: transform .3s; }
#cw-bubble.open svg { transform: rotate(90deg); }

/* Unread badge */
#cw-badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 20px; height: 20px; border-radius: 10px;
  background: #ef4444; color: #fff; font-size: 11px; font-weight: 700;
  display: none; align-items: center; justify-content: center;
  padding: 0 5px; border: 2px solid #fff;
}
#cw-badge.show { display: flex; }

/* Panel */
#cw-panel {
  position: fixed; bottom: 100px; ${POS}: 24px;
  width: 400px; max-width: calc(100vw - 48px);
  height: 600px; max-height: calc(100vh - 124px);
  border-radius: 16px; background: #fff;
  box-shadow: 0 24px 80px rgba(0,0,0,.14), 0 4px 16px rgba(0,0,0,.06);
  z-index: 99999; overflow: hidden;
  display: flex; flex-direction: column;
  opacity: 0; transform: translateY(20px) scale(.96);
  pointer-events: none;
  transition: all .35s cubic-bezier(.4,0,.2,1);
}
#cw-panel.open {
  opacity: 1; transform: translateY(0) scale(1); pointer-events: auto;
}

/* Header */
#cw-header {
  background: linear-gradient(135deg, ${C} 0%, ${CD} 100%);
  color: #fff; padding: 20px 20px 16px; position: relative; flex-shrink: 0;
}
#cw-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
#cw-bot-info { display: flex; align-items: center; gap: 10px; }
#cw-bot-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,.2); display: flex;
  align-items: center; justify-content: center;
  font-size: 16px; font-weight: 600; flex-shrink: 0;
}
#cw-bot-name { font-size: 16px; font-weight: 700; }
#cw-bot-status { font-size: 12px; opacity: .85; display: flex; align-items: center; gap: 5px; margin-top: 1px; }
#cw-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; display: inline-block; }
#cw-close {
  background: rgba(255,255,255,.15); border: none; color: #fff;
  cursor: pointer; width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s; flex-shrink: 0;
}
#cw-close:hover { background: rgba(255,255,255,.25); }
#cw-close svg { width: 18px; height: 18px; }

/* Screens container */
#cw-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }

/* Home screen */
#cw-home { flex: 1; display: flex; flex-direction: column; padding: 24px 20px; overflow-y: auto; }
#cw-home.hidden { display: none; }
.cw-welcome-text { font-size: 15px; color: #4b5563; margin-bottom: 24px; line-height: 1.6; }
#cw-start-btn {
  width: 100%; padding: 14px; border: none; border-radius: 12px;
  background: ${C}; color: #fff; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all .2s; display: flex;
  align-items: center; justify-content: center; gap: 8px;
}
#cw-start-btn:hover { background: ${CD}; transform: translateY(-1px); box-shadow: 0 4px 16px ${C}44; }
#cw-start-btn:active { transform: translateY(0); }
#cw-start-btn svg { width: 20px; height: 20px; }
.cw-home-topics { margin-top: 20px; }
.cw-home-topics-title { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: #9ca3af; font-weight: 600; margin-bottom: 10px; }
.cw-topic-btn {
  width: 100%; padding: 12px 14px; border: 1px solid #e5e7eb;
  border-radius: 10px; background: #fff; color: #374151;
  font-size: 14px; cursor: pointer; text-align: left;
  transition: all .2s; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;
}
.cw-topic-btn:hover { border-color: ${C}; background: ${C}08; color: ${C}; }
.cw-topic-icon { width: 32px; height: 32px; border-radius: 8px; background: ${C}10; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cw-topic-icon svg { width: 16px; height: 16px; fill: ${C}; }

/* Email screen */
#cw-email-screen { flex: 1; display: none; flex-direction: column; padding: 24px 20px; }
#cw-email-screen.active { display: flex; }
.cw-email-icon { width: 56px; height: 56px; border-radius: 16px; background: ${C}10; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.cw-email-icon svg { width: 28px; height: 28px; fill: ${C}; }
.cw-email-title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 6px; color: #111827; }
.cw-email-desc { font-size: 13px; color: #6b7280; text-align: center; margin-bottom: 24px; line-height: 1.5; }
.cw-field { margin-bottom: 14px; }
.cw-field label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.cw-field input {
  width: 100%; padding: 10px 14px; border: 1.5px solid #d1d5db;
  border-radius: 10px; font-size: 14px; outline: none;
  transition: all .2s; background: #f9fafb; font-family: inherit;
}
.cw-field input:focus { border-color: ${C}; background: #fff; box-shadow: 0 0 0 3px ${C}18; }
.cw-field input.error { border-color: #ef4444; }
.cw-field-error { font-size: 12px; color: #ef4444; margin-top: 4px; display: none; }
#cw-email-submit {
  width: 100%; padding: 12px; border: none; border-radius: 10px;
  background: ${C}; color: #fff; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all .2s; margin-top: 4px; font-family: inherit;
}
#cw-email-submit:hover { background: ${CD}; }
#cw-email-submit:disabled { opacity: .5; cursor: not-allowed; }

/* Chat screen */
#cw-chat { flex: 1; display: none; flex-direction: column; overflow: hidden; }
#cw-chat.active { display: flex; }

/* Messages */
#cw-messages {
  flex: 1; overflow-y: auto; padding: 16px 16px 8px;
  display: flex; flex-direction: column; gap: 4px;
  scroll-behavior: smooth;
}
#cw-messages::-webkit-scrollbar { width: 4px; }
#cw-messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }

/* Message row */
.cw-msg-row { display: flex; gap: 8px; max-width: 88%; align-items: flex-end; margin-bottom: 2px; }
.cw-msg-row.user { flex-direction: row-reverse; align-self: flex-end; }
.cw-msg-row.assistant { align-self: flex-start; }

/* Avatar */
.cw-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: ${C}; color: #fff; font-size: 12px;
  font-weight: 700; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0;
}
.cw-avatar.user-av { background: #6b7280; }

/* Bubble */
.cw-bubble {
  padding: 10px 14px; border-radius: 18px; font-size: 14px;
  line-height: 1.55; word-break: break-word; position: relative;
  animation: cw-fade-in .25s ease-out;
}
@keyframes cw-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.cw-bubble.user {
  background: ${C}; color: #fff; border-bottom-right-radius: 6px;
}
.cw-bubble.assistant {
  background: #f3f4f6; color: #1f2937; border-bottom-left-radius: 6px;
}
.cw-bubble.system {
  background: transparent; color: #9ca3af;
  font-size: 13px; text-align: center; align-self: center;
  padding: 8px 12px; max-width: 100%;
}

/* Streaming cursor */
.cw-bubble.streaming::after {
  content: '▋'; color: ${C}; animation: cw-blink .8s steps(2) infinite; margin-left: 1px;
}
@keyframes cw-blink { 50% { opacity: 0; } }

/* Message meta */
.cw-meta { font-size: 11px; color: #9ca3af; padding: 2px 4px 0; display: flex; align-items: center; gap: 4px; }
.cw-meta.user { justify-content: flex-end; }
.cw-check { width: 12px; height: 12px; }
.cw-check.read { fill: #3b82f6; }
.cw-check.sent { fill: #9ca3af; }

/* Citations */
.cw-citations { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 4px 0; }
.cw-cite {
  font-size: 11px; padding: 3px 8px; border-radius: 6px;
  background: ${C}10; color: ${C}; border: 1px solid ${C}22;
  cursor: default; display: inline-flex; align-items: center; gap: 3px;
}
.cw-cite svg { width: 10px; height: 10px; fill: ${C}; }

/* Typing indicator */
#cw-typing {
  display: none; align-items: center; gap: 8px; padding: 0 16px 8px;
}
#cw-typing.show { display: flex; }
.cw-typing-avatar { width: 28px; height: 28px; border-radius: 50%; background: ${C}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; }
.cw-typing-dots { display: flex; gap: 4px; padding: 10px 14px; background: #f3f4f6; border-radius: 18px; border-bottom-left-radius: 6px; }
.cw-typing-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #9ca3af;
  animation: cw-typing-bounce 1.4s ease-in-out infinite;
}
.cw-typing-dot:nth-child(2) { animation-delay: .15s; }
.cw-typing-dot:nth-child(3) { animation-delay: .3s; }
@keyframes cw-typing-bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

/* Input area */
#cw-input-area {
  border-top: 1px solid #f0f0f0; padding: 12px 14px;
  display: flex; gap: 8px; align-items: flex-end; background: #fff;
}
#cw-input {
  flex: 1; border: 1.5px solid #e5e7eb; border-radius: 12px;
  padding: 10px 14px; font-size: 14px; outline: none;
  resize: none; min-height: 40px; max-height: 120px;
  line-height: 1.45; font-family: inherit;
  transition: all .2s; background: #f9fafb;
}
#cw-input:focus { border-color: ${C}; background: #fff; box-shadow: 0 0 0 3px ${C}18; }
#cw-input::placeholder { color: #9ca3af; }
#cw-send {
  width: 40px; height: 40px; border-radius: 12px;
  background: ${C}; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .2s;
}
#cw-send:hover { background: ${CD}; transform: scale(1.05); }
#cw-send:active { transform: scale(.95); }
#cw-send:disabled { opacity: .4; cursor: default; transform: none; }
#cw-send svg { width: 18px; height: 18px; fill: #fff; }

/* CSAT */
#cw-csat {
  display: none; padding: 16px 20px; border-top: 1px solid #f0f0f0;
  text-align: center; animation: cw-fade-in .3s ease-out;
}
#cw-csat.show { display: block; }
#cw-csat p { font-size: 14px; color: #374151; margin-bottom: 12px; font-weight: 600; }
.cw-stars { display: flex; justify-content: center; gap: 8px; }
.cw-star {
  width: 36px; height: 36px; cursor: pointer; background: none;
  border: none; padding: 0; transition: all .2s; border-radius: 8px;
}
.cw-star:hover { transform: scale(1.25); }
.cw-star svg { width: 36px; height: 36px; }
.cw-star .star-fill { fill: #d1d5db; transition: fill .15s; }
.cw-star.active .star-fill { fill: #f59e0b; }
.cw-star.hovered .star-fill { fill: #fbbf24; }
#cw-csat-thanks { display: none; font-size: 14px; color: #059669; font-weight: 600; padding: 8px 0; }

/* Footer */
#cw-footer {
  text-align: center; font-size: 11px; color: #b0b0b0;
  padding: 6px 0 10px; background: #fff;
}
#cw-footer a { color: #b0b0b0; text-decoration: none; }
#cw-footer a:hover { color: #888; }

/* Responsive */
@media (max-width: 480px) {
  #cw-panel {
    width: 100vw; height: 100vh; max-height: 100vh;
    bottom: 0; ${POS}: 0; border-radius: 0;
  }
  #cw-bubble { bottom: 16px; ${POS}: 16px; }
}

/* Accessibility */
#cw-root *:focus-visible { outline: 2px solid ${C}; outline-offset: 2px; }

/* ── Handoff / Queue / Closed States ── */
#cw-handoff-bar {
  display: none; padding: 10px 16px; text-align: center;
  border-top: 1px solid #f0f0f0; background: #fefce8;
}
#cw-handoff-bar.show { display: block; }
#cw-handoff-bar p { font-size: 13px; color: #854d0e; margin: 0 0 4px; }
#cw-handoff-bar .cw-queue-pos { font-weight: 700; color: ${C}; }

#cw-handoff-btn {
  display: none; width: calc(100% - 32px); margin: 0 16px 8px;
  padding: 8px 14px; border: 1.5px solid #e5e7eb;
  border-radius: 10px; background: #fff; color: #374151;
  font-size: 13px; cursor: pointer; text-align: center;
  transition: all .2s; font-family: inherit;
}
#cw-handoff-btn:hover { border-color: ${C}; background: ${C}08; color: ${C}; }
#cw-handoff-btn.show { display: block; }

#cw-closed-bar {
  display: none; padding: 16px; text-align: center;
  border-top: 1px solid #f0f0f0; background: #f9fafb;
}
#cw-closed-bar.show { display: block; }
#cw-closed-bar p { font-size: 13px; color: #6b7280; margin: 0 0 10px; }
#cw-new-chat-btn {
  padding: 8px 20px; border: none; border-radius: 10px;
  background: ${C}; color: #fff; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .2s; font-family: inherit;
}
#cw-new-chat-btn:hover { background: ${CD}; }

/* Human agent badge in message */
.cw-agent-badge {
  display: inline-block; font-size: 10px; padding: 1px 6px;
  border-radius: 4px; background: #dcfce7; color: #166534;
  margin-bottom: 2px; font-weight: 600;
}
.cw-avatar.human-agent { background: #16a34a; }
.cw-bubble.system {
  text-align: center; font-style: italic; font-size: 12px;
  color: #6b7280; padding: 6px 12px; background: transparent;
  border-radius: 0; margin: 8px auto; max-width: 80%;
}

/* ── Outbound: Banner ── */
.cw-ob-banner {
  position: fixed; left: 0; right: 0; z-index: 99998;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 12px 20px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  font-size: 14px; line-height: 1.4; color: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,.15); transition: transform .3s ease, opacity .3s ease;
}
.cw-ob-banner.top { top: 0; }
.cw-ob-banner.bottom { bottom: 0; }
.cw-ob-banner.info { background: #3b82f6; }
.cw-ob-banner.warning { background: #f59e0b; color: #1a1a1a; }
.cw-ob-banner.success { background: #22c55e; }
.cw-ob-banner.error { background: #ef4444; }
.cw-ob-banner-body { flex: 1; text-align: center; }
.cw-ob-banner-title { font-weight: 600; margin-bottom: 2px; }
.cw-ob-banner-cta {
  display: inline-block; padding: 6px 16px; border-radius: 6px;
  background: rgba(255,255,255,.2); color: inherit; text-decoration: none;
  font-size: 13px; font-weight: 600; white-space: nowrap; transition: background .2s;
}
.cw-ob-banner-cta:hover { background: rgba(255,255,255,.35); }
.cw-ob-banner-close {
  background: none; border: none; color: inherit; cursor: pointer;
  padding: 4px; opacity: .7; transition: opacity .2s; font-size: 18px; line-height: 1;
}
.cw-ob-banner-close:hover { opacity: 1; }

/* ── Outbound: Tooltip ── */
.cw-ob-beacon {
  position: absolute; z-index: 99997; width: 14px; height: 14px;
  border-radius: 50%; cursor: pointer;
}
.cw-ob-beacon-dot {
  width: 14px; height: 14px; border-radius: 50%; background: var(--cw-brand,#6366f1);
}
.cw-ob-beacon-pulse {
  position: absolute; top: -4px; left: -4px; width: 22px; height: 22px;
  border-radius: 50%; background: var(--cw-brand,#6366f1); opacity: .4;
  animation: cw-pulse 2s ease-in-out infinite;
}
@keyframes cw-pulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.5);opacity:0} }
.cw-ob-tooltip-pop {
  position: absolute; z-index: 99997; width: 280px; padding: 16px;
  background: #fff; border-radius: 10px; box-shadow: 0 8px 30px rgba(0,0,0,.15);
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  font-size: 13px; color: #1a1a1a; line-height: 1.5;
}
.cw-ob-tooltip-pop h4 { margin: 0 0 6px; font-size: 14px; font-weight: 600; }
.cw-ob-tooltip-pop p { margin: 0 0 10px; color: #4b5563; }
.cw-ob-tooltip-close {
  position: absolute; top: 8px; right: 8px; background: none; border: none;
  cursor: pointer; color: #9ca3af; font-size: 16px; line-height: 1;
}
.cw-ob-tooltip-close:hover { color: #374151; }
.cw-ob-tooltip-cta {
  display: inline-block; padding: 6px 14px; border-radius: 6px;
  background: var(--cw-brand,#6366f1); color: #fff; text-decoration: none;
  font-size: 13px; font-weight: 600; transition: opacity .2s;
}
.cw-ob-tooltip-cta:hover { opacity: .85; }

/* ── Outbound: Proactive Chat Popup ── */
.cw-ob-chat-popup {
  position: fixed; z-index: 99997; width: 320px;
  background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.18);
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  overflow: hidden; animation: cw-popup-in .3s ease;
}
.cw-ob-chat-popup.right { right: 24px; bottom: 90px; }
.cw-ob-chat-popup.left { left: 24px; bottom: 90px; }
@keyframes cw-popup-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.cw-ob-chat-popup-header {
  display: flex; align-items: center; gap: 10px; padding: 14px 16px;
  background: var(--cw-brand,#6366f1); color: #fff;
}
.cw-ob-chat-popup-avatar {
  width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,.2);
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;
}
.cw-ob-chat-popup-name { font-weight: 600; font-size: 14px; }
.cw-ob-chat-popup-body { padding: 16px; font-size: 14px; color: #374151; line-height: 1.5; }
.cw-ob-chat-popup-actions { display: flex; gap: 8px; padding: 0 16px 14px; }
.cw-ob-chat-popup-cta {
  flex: 1; padding: 8px 0; text-align: center; border-radius: 8px;
  background: var(--cw-brand,#6366f1); color: #fff; border: none; cursor: pointer;
  font-size: 13px; font-weight: 600; transition: opacity .2s;
}
.cw-ob-chat-popup-cta:hover { opacity: .85; }
.cw-ob-chat-popup-dismiss {
  padding: 8px 14px; text-align: center; border-radius: 8px;
  background: #f3f4f6; color: #6b7280; border: none; cursor: pointer;
  font-size: 13px; transition: background .2s;
}
.cw-ob-chat-popup-dismiss:hover { background: #e5e7eb; }

/* ── Outbound: Product Tour ── */
.cw-ob-tour-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 100001; background: rgba(0,0,0,.45);
  pointer-events: auto; transition: opacity .3s;
}
.cw-ob-tour-highlight {
  position: absolute; z-index: 100002; border-radius: 6px;
  box-shadow: 0 0 0 4000px rgba(0,0,0,.45); pointer-events: none;
  transition: top .3s, left .3s, width .3s, height .3s;
}
.cw-ob-tour-popover {
  position: absolute; z-index: 100003; width: 320px; padding: 20px;
  background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.2);
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  animation: cw-popup-in .3s ease;
}
.cw-ob-tour-popover h4 { margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #1a1a1a; }
.cw-ob-tour-popover p { margin: 0 0 16px; font-size: 13px; color: #4b5563; line-height: 1.5; }
.cw-ob-tour-nav { display: flex; align-items: center; justify-content: space-between; }
.cw-ob-tour-step-count { font-size: 12px; color: #9ca3af; }
.cw-ob-tour-btns { display: flex; gap: 8px; }
.cw-ob-tour-btn {
  padding: 6px 14px; border-radius: 6px; border: none; cursor: pointer;
  font-size: 13px; font-weight: 600; transition: opacity .2s;
}
.cw-ob-tour-btn.secondary { background: #f3f4f6; color: #374151; }
.cw-ob-tour-btn.secondary:hover { background: #e5e7eb; }
.cw-ob-tour-btn.primary { background: var(--cw-brand,#6366f1); color: #fff; }
.cw-ob-tour-btn.primary:hover { opacity: .85; }
.cw-ob-tour-close {
  position: absolute; top: 10px; right: 10px; background: none; border: none;
  cursor: pointer; color: #9ca3af; font-size: 18px; line-height: 1;
}
.cw-ob-tour-close:hover { color: #374151; }

/* ── Outbound: Checklist ── */
.cw-ob-checklist {
  position: fixed; z-index: 99997; width: 300px;
  background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.18);
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  overflow: hidden; animation: cw-popup-in .3s ease;
}
.cw-ob-checklist.right { right: 24px; bottom: 90px; }
.cw-ob-checklist.left { left: 24px; bottom: 90px; }
.cw-ob-checklist-header {
  padding: 14px 16px 10px; display: flex; align-items: center; justify-content: space-between;
}
.cw-ob-checklist-header h4 { margin: 0; font-size: 15px; font-weight: 600; color: #1a1a1a; }
.cw-ob-checklist-close {
  background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 16px; line-height: 1;
}
.cw-ob-checklist-close:hover { color: #374151; }
.cw-ob-checklist-progress {
  margin: 0 16px 12px; height: 4px; border-radius: 2px; background: #e5e7eb; overflow: hidden;
}
.cw-ob-checklist-bar {
  height: 100%; border-radius: 2px; background: var(--cw-brand,#6366f1); transition: width .3s ease;
}
.cw-ob-checklist-items { padding: 0 8px 12px; }
.cw-ob-checklist-item {
  display: flex; align-items: center; gap: 10px; padding: 8px;
  border-radius: 8px; cursor: pointer; transition: background .2s;
  font-size: 13px; color: #374151;
}
.cw-ob-checklist-item:hover { background: #f9fafb; }
.cw-ob-checklist-item.done { color: #9ca3af; text-decoration: line-through; }
.cw-ob-checklist-check {
  width: 18px; height: 18px; border-radius: 50%; border: 2px solid #d1d5db;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: border-color .2s, background .2s;
}
.cw-ob-checklist-item.done .cw-ob-checklist-check {
  border-color: var(--cw-brand,#6366f1); background: var(--cw-brand,#6366f1);
}

/* ── Outbound: Post / Announcement Modal ── */
.cw-ob-post-backdrop {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 100000; background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  animation: cw-fade-in .2s ease;
}
@keyframes cw-fade-in { from{opacity:0} to{opacity:1} }
.cw-ob-post {
  width: 460px; max-width: 90vw; max-height: 80vh; overflow-y: auto;
  background: #fff; border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.25);
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  animation: cw-popup-in .3s ease;
}
.cw-ob-post-header {
  padding: 20px 24px 0; display: flex; align-items: flex-start; justify-content: space-between;
}
.cw-ob-post-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #1a1a1a; line-height: 1.3; }
.cw-ob-post-close {
  background: none; border: none; cursor: pointer; color: #9ca3af;
  font-size: 20px; line-height: 1; flex-shrink: 0; margin-left: 12px;
}
.cw-ob-post-close:hover { color: #374151; }
.cw-ob-post-body {
  padding: 12px 24px 20px; font-size: 14px; line-height: 1.6; color: #374151;
}
.cw-ob-post-actions { padding: 0 24px 20px; }
.cw-ob-post-cta {
  display: inline-block; padding: 10px 24px; border-radius: 8px;
  background: var(--cw-brand,#6366f1); color: #fff; text-decoration: none;
  font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: opacity .2s;
}
.cw-ob-post-cta:hover { opacity: .85; }
`;
    document.head.appendChild(style);
  }

  /* ================================================================== *
   *  DOM Construction                                                   *
   * ================================================================== */
  function buildDOM(): void {
    const initial = config.botName.charAt(0).toUpperCase();
    const root = document.createElement('div');
    root.id = 'cw-root';
    root.innerHTML = `
      <button id="cw-bubble" aria-label="Open chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span id="cw-badge"></span>
      </button>
      <div id="cw-panel" role="dialog" aria-label="Chat">
        <div id="cw-header">
          <div id="cw-header-top">
            <div id="cw-bot-info">
              <div id="cw-bot-avatar">${esc(initial)}</div>
              <div>
                <div id="cw-bot-name">${esc(config.botName)}</div>
                <div id="cw-bot-status"><span id="cw-status-dot"></span> Online</div>
              </div>
            </div>
            <button id="cw-close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div id="cw-body">
          <div id="cw-home">
            <p class="cw-welcome-text">${esc(config.welcomeMessage)}</p>
            <button id="cw-start-btn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>
              Start a conversation
            </button>
            <div class="cw-home-topics" id="cw-topics"></div>
          </div>
          <div id="cw-email-screen">
            <div class="cw-email-icon">
              <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <div class="cw-email-title">Before we chat</div>
            <div class="cw-email-desc">Enter your details so we can give you the best support experience.</div>
            <div class="cw-field">
              <label for="cw-name-input">Name</label>
              <input id="cw-name-input" type="text" placeholder="Your name" autocomplete="name" />
            </div>
            <div class="cw-field">
              <label for="cw-email-input">Email <span style="color:#ef4444">*</span></label>
              <input id="cw-email-input" type="email" placeholder="you@example.com" autocomplete="email" required />
              <div class="cw-field-error" id="cw-email-error">Please enter a valid email address</div>
            </div>
            <button id="cw-email-submit">Continue to chat</button>
          </div>
          <div id="cw-chat">
            <div id="cw-messages"></div>
            <div id="cw-typing">
              <div class="cw-typing-avatar">${esc(initial)}</div>
              <div class="cw-typing-dots">
                <div class="cw-typing-dot"></div>
                <div class="cw-typing-dot"></div>
                <div class="cw-typing-dot"></div>
              </div>
            </div>
            <div id="cw-csat">
              <p>How was your experience?</p>
              <div class="cw-stars" id="cw-stars"></div>
              <div id="cw-csat-thanks">Thank you for your feedback!</div>
            </div>
            <div id="cw-handoff-bar">
              <p>You're in queue — position <span class="cw-queue-pos" id="cw-queue-pos">…</span></p>
              <p style="font-size:11px;color:#a16207">A human agent will be with you shortly.</p>
            </div>
            <div id="cw-closed-bar">
              <p>This conversation has been closed.</p>
              <button id="cw-new-chat-btn">Start a new conversation</button>
            </div>
            <button id="cw-handoff-btn">🙋 Talk to a person</button>
            <div id="cw-input-area">
              <textarea id="cw-input" rows="1" placeholder="Type your message…" aria-label="Message"></textarea>
              <button id="cw-send" aria-label="Send" disabled>
                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </div>
        ${config.poweredBy ? '<div id="cw-footer">Powered by <a href="#">SWEO</a></div>' : ''}
      </div>
    `;
    document.body.appendChild(root);
  }

  /* ================================================================== *
   *  Render Functions                                                   *
   * ================================================================== */
  function showScreen(screen: Screen): void {
    currentScreen = screen;
    const home = document.getElementById('cw-home')!;
    const emailScr = document.getElementById('cw-email-screen')!;
    const chat = document.getElementById('cw-chat')!;

    home.className = screen === 'home' ? '' : 'hidden';
    home.style.display = screen === 'home' ? 'flex' : 'none';
    emailScr.className = screen === 'email' ? 'active' : '';
    chat.className = screen === 'chat' ? 'active' : '';
  }

  function renderMessages(): void {
    const container = document.getElementById('cw-messages')!;
    if (messages.length === 0) {
      container.innerHTML = '';
      return;
    }

    const initial = config.botName.charAt(0).toUpperCase();
    let html = '';
    let lastRole = '';

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const isLast = i === messages.length - 1;
      const showAvatar = m.role !== lastRole;
      lastRole = m.role;

      if (m.role === 'system') {
        html += `<div class="cw-bubble system">${esc(m.content)}</div>`;
        continue;
      }

      const isStreaming = isLast && m.role === 'assistant' && streaming;
      const isHuman = m.senderType === 'human_agent';
      const avatarHtml =
        m.role === 'assistant'
          ? `<div class="cw-avatar${isHuman ? ' human-agent' : ''}">${isHuman ? '&#128100;' : esc(initial)}</div>`
          : `<div class="cw-avatar user-av"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;

      html += `<div class="cw-msg-row ${m.role}">`;
      if (showAvatar) {
        html += avatarHtml;
      } else {
        html += '<div style="width:28px;flex-shrink:0"></div>';
      }
      html += '<div>';
      if (isHuman && showAvatar) {
        html += '<span class="cw-agent-badge">Agent</span>';
      }
      html += `<div class="cw-bubble ${m.role}${isStreaming ? ' streaming' : ''}">${esc(m.content)}</div>`;

      // Citations
      if (m.citations && m.citations.length > 0 && config.aiShowSources) {
        html += '<div class="cw-citations">';
        for (const c of m.citations) {
          html += `<span class="cw-cite"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg> ${esc(c.title)}</span>`;
        }
        html += '</div>';
      }

      // Meta (time + status)
      html += `<div class="cw-meta ${m.role}">${formatTime(m.timestamp)}`;
      if (m.role === 'user' && m.status) {
        const checkClass = m.status === 'read' ? 'read' : 'sent';
        html += `<svg class="cw-check ${checkClass}" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>`;
      }
      html += '</div></div></div>';
    }

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }

  function showTypingIndicator(): void {
    if (!config.typingIndicators) return;
    _isTyping = true;
    const el = document.getElementById('cw-typing');
    if (el) el.classList.add('show');
  }

  function hideTypingIndicator(): void {
    _isTyping = false;
    const el = document.getElementById('cw-typing');
    if (el) el.classList.remove('show');
  }

  function updateBadge(): void {
    const badge = document.getElementById('cw-badge');
    if (!badge) return;
    if (unreadCount > 0 && !isOpen) {
      badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
      badge.classList.add('show');
    } else {
      badge.classList.remove('show');
    }
  }

  /* ================================================================== *
   *  Outbound Renderers                                                 *
   * ================================================================== */

  function renderBanner(msg: OutboundMsg): void {
    const existing = document.getElementById('cw-ob-banner-' + msg.id);
    if (existing) return;

    const pos = msg.content.position || 'top';
    const style = msg.content.style || 'info';
    const el = document.createElement('div');
    el.id = 'cw-ob-banner-' + msg.id;
    el.className = `cw-ob-banner ${pos} ${style}`;
    el.innerHTML = `
      <div class="cw-ob-banner-body">
        ${msg.content.subject ? `<div class="cw-ob-banner-title">${esc(msg.content.subject)}</div>` : ''}
        <div>${esc(msg.content.body)}</div>
      </div>
      ${msg.content.ctaUrl ? `<a class="cw-ob-banner-cta" href="${esc(msg.content.ctaUrl)}" target="_blank" rel="noopener">${esc(msg.content.ctaText || 'Learn more')}</a>` : ''}
      <button class="cw-ob-banner-close" aria-label="Dismiss">&times;</button>
    `;

    el.querySelector('.cw-ob-banner-close')!.addEventListener('click', () => {
      el.remove();
      trackOutbound(msg.id, 'dismiss');
    });

    const ctaLink = el.querySelector('.cw-ob-banner-cta');
    if (ctaLink) {
      ctaLink.addEventListener('click', () => trackOutbound(msg.id, 'click'));
    }

    document.body.appendChild(el);
    trackOutbound(msg.id, 'impression');
  }

  function renderTooltip(msg: OutboundMsg): void {
    const selector = msg.content.selector;
    if (!selector) return;
    const target = document.querySelector(selector) as HTMLElement | null;
    if (!target) return;

    const existingBeacon = document.getElementById('cw-ob-beacon-' + msg.id);
    if (existingBeacon) return;

    // Position beacon near target
    const rect = target.getBoundingClientRect();
    const beacon = document.createElement('div');
    beacon.id = 'cw-ob-beacon-' + msg.id;
    beacon.className = 'cw-ob-beacon';
    beacon.style.cssText = `top:${rect.top + window.scrollY + rect.height / 2 - 7}px;left:${rect.left + window.scrollX + rect.width + 6}px;`;
    beacon.innerHTML = `<div class="cw-ob-beacon-pulse"></div><div class="cw-ob-beacon-dot"></div>`;

    let popoverVisible = false;
    beacon.addEventListener('click', () => {
      if (popoverVisible) return;
      popoverVisible = true;
      const pop = document.createElement('div');
      pop.id = 'cw-ob-tooltip-pop-' + msg.id;
      pop.className = 'cw-ob-tooltip-pop';
      const bRect = beacon.getBoundingClientRect();
      pop.style.cssText = `top:${bRect.bottom + window.scrollY + 8}px;left:${bRect.left + window.scrollX - 130}px;`;
      pop.innerHTML = `
        <button class="cw-ob-tooltip-close" aria-label="Close">&times;</button>
        ${msg.title ? `<h4>${esc(msg.title)}</h4>` : ''}
        <p>${esc(msg.content.body)}</p>
        ${msg.content.ctaUrl ? `<a class="cw-ob-tooltip-cta" href="${esc(msg.content.ctaUrl)}" target="_blank" rel="noopener">${esc(msg.content.ctaText || 'Learn more')}</a>` : ''}
      `;
      pop.querySelector('.cw-ob-tooltip-close')!.addEventListener('click', () => {
        pop.remove();
        beacon.remove();
        trackOutbound(msg.id, 'dismiss');
      });
      const ctaLink = pop.querySelector('.cw-ob-tooltip-cta');
      if (ctaLink) {
        ctaLink.addEventListener('click', () => trackOutbound(msg.id, 'click'));
      }
      document.body.appendChild(pop);
      trackOutbound(msg.id, 'impression');
    });

    document.body.appendChild(beacon);
  }

  function renderChatPopup(msg: OutboundMsg): void {
    const existing = document.getElementById('cw-ob-chat-popup-' + msg.id);
    if (existing) return;

    const side = config.widgetPosition || 'right';
    const el = document.createElement('div');
    el.id = 'cw-ob-chat-popup-' + msg.id;
    el.className = `cw-ob-chat-popup ${side}`;
    const initial = config.botName.charAt(0).toUpperCase();
    el.innerHTML = `
      <div class="cw-ob-chat-popup-header">
        <div class="cw-ob-chat-popup-avatar">${esc(initial)}</div>
        <div class="cw-ob-chat-popup-name">${esc(config.botName)}</div>
      </div>
      <div class="cw-ob-chat-popup-body">${esc(msg.content.body)}</div>
      <div class="cw-ob-chat-popup-actions">
        <button class="cw-ob-chat-popup-cta">${esc(msg.content.ctaText || 'Reply')}</button>
        <button class="cw-ob-chat-popup-dismiss">Dismiss</button>
      </div>
    `;

    el.querySelector('.cw-ob-chat-popup-cta')!.addEventListener('click', () => {
      el.remove();
      trackOutbound(msg.id, 'click');
      // Open chat widget
      isOpen = true;
      showScreen('chat');
      const panel = document.getElementById('cw-panel');
      if (panel) panel.classList.add('open');
      const bubble = document.getElementById('cw-bubble');
      if (bubble) bubble.classList.add('open');
    });

    el.querySelector('.cw-ob-chat-popup-dismiss')!.addEventListener('click', () => {
      el.remove();
      trackOutbound(msg.id, 'dismiss');
    });

    document.body.appendChild(el);
    trackOutbound(msg.id, 'impression');
  }

  function renderTourStep(): void {
    if (!activeTour || !activeTour.content.steps) return;
    const steps = activeTour.content.steps;
    if (activeTourStep >= steps.length) {
      cleanupTour();
      return;
    }

    const step = steps[activeTourStep];
    const target = document.querySelector(step.selector) as HTMLElement | null;

    // Remove previous popover/highlight
    document.getElementById('cw-ob-tour-highlight')?.remove();
    document.getElementById('cw-ob-tour-popover')?.remove();

    // Overlay
    let overlay = document.getElementById('cw-ob-tour-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'cw-ob-tour-overlay';
      overlay.className = 'cw-ob-tour-overlay';
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanupTour();
      });
      document.body.appendChild(overlay);
    }

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Wait for scroll to settle
      setTimeout(() => {
        const rect = target.getBoundingClientRect();

        // Highlight cutout
        const highlight = document.createElement('div');
        highlight.id = 'cw-ob-tour-highlight';
        highlight.className = 'cw-ob-tour-highlight';
        highlight.style.cssText = `top:${rect.top + window.scrollY - 4}px;left:${rect.left + window.scrollX - 4}px;width:${rect.width + 8}px;height:${rect.height + 8}px;`;
        document.body.appendChild(highlight);

        // Popover
        const popover = document.createElement('div');
        popover.id = 'cw-ob-tour-popover';
        popover.className = 'cw-ob-tour-popover';

        const popTop = rect.bottom + window.scrollY + 12;
        const popLeft = Math.max(10, rect.left + window.scrollX - 20);
        popover.style.cssText = `top:${popTop}px;left:${popLeft}px;`;

        popover.innerHTML = buildTourPopoverHTML(step, steps.length);
        document.body.appendChild(popover);
        bindTourPopoverEvents(popover);
      }, 300);
    } else {
      // No target found — show popover centered
      const popover = document.createElement('div');
      popover.id = 'cw-ob-tour-popover';
      popover.className = 'cw-ob-tour-popover';
      popover.style.cssText = 'top:50%;left:50%;transform:translate(-50%,-50%);position:fixed;';
      popover.innerHTML = buildTourPopoverHTML(step, steps.length);
      document.body.appendChild(popover);
      bindTourPopoverEvents(popover);
    }
  }

  function buildTourPopoverHTML(step: NonNullable<OutboundMsg['content']['steps']>[number], totalSteps: number): string {
    return `
      <button class="cw-ob-tour-close" aria-label="Close tour">&times;</button>
      <h4>${esc(step.title)}</h4>
      <p>${esc(step.body)}</p>
      <div class="cw-ob-tour-nav">
        <span class="cw-ob-tour-step-count">${activeTourStep + 1} of ${totalSteps}</span>
        <div class="cw-ob-tour-btns">
          ${activeTourStep > 0 ? '<button class="cw-ob-tour-btn secondary" data-tour="back">Back</button>' : ''}
          <button class="cw-ob-tour-btn primary" data-tour="next">${activeTourStep === totalSteps - 1 ? 'Done' : 'Next'}</button>
        </div>
      </div>
    `;
  }

  function bindTourPopoverEvents(popover: HTMLElement): void {
    popover.querySelector('.cw-ob-tour-close')!.addEventListener('click', () => {
      cleanupTour();
      if (activeTour) trackOutbound(activeTour.id, 'dismiss');
    });
    const nextBtn = popover.querySelector('[data-tour="next"]');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        activeTourStep++;
        if (activeTour && activeTour.content.steps && activeTourStep >= activeTour.content.steps.length) {
          trackOutbound(activeTour.id, 'click');
          cleanupTour();
        } else {
          renderTourStep();
        }
      });
    }
    const backBtn = popover.querySelector('[data-tour="back"]');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (activeTourStep > 0) {
          activeTourStep--;
          renderTourStep();
        }
      });
    }
  }

  function cleanupTour(): void {
    document.getElementById('cw-ob-tour-overlay')?.remove();
    document.getElementById('cw-ob-tour-highlight')?.remove();
    document.getElementById('cw-ob-tour-popover')?.remove();
    if (activeTour) {
      trackOutbound(activeTour.id, 'dismiss');
    }
    activeTour = null;
    activeTourStep = 0;
  }

  function renderTour(msg: OutboundMsg): void {
    if (activeTour) return; // One tour at a time
    if (!msg.content.steps || msg.content.steps.length === 0) return;
    activeTour = msg;
    activeTourStep = 0;
    trackOutbound(msg.id, 'impression');
    renderTourStep();
  }

  function renderChecklist(msg: OutboundMsg): void {
    const existing = document.getElementById('cw-ob-checklist-' + msg.id);
    if (existing) return;
    if (!msg.content.items || msg.content.items.length === 0) return;

    const side = config.widgetPosition || 'right';
    const storageKey = '__cw_ob_cl_' + msg.id;
    const doneIds: Set<string> = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'));

    const el = document.createElement('div');
    el.id = 'cw-ob-checklist-' + msg.id;
    el.className = `cw-ob-checklist ${side}`;

    function renderInner(): void {
      const items = msg.content.items!;
      const doneCount = items.filter(i => doneIds.has(i.id)).length;
      const pct = Math.round((doneCount / items.length) * 100);
      el.innerHTML = `
        <div class="cw-ob-checklist-header">
          <h4>${esc(msg.title)}</h4>
          <button class="cw-ob-checklist-close" aria-label="Close">&times;</button>
        </div>
        <div class="cw-ob-checklist-progress"><div class="cw-ob-checklist-bar" style="width:${pct}%"></div></div>
        <div class="cw-ob-checklist-items">
          ${items.map(item => {
            const done = doneIds.has(item.id);
            return `<div class="cw-ob-checklist-item${done ? ' done' : ''}" data-item-id="${esc(item.id)}">
              <div class="cw-ob-checklist-check">${done ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>' : ''}</div>
              <span>${esc(item.label)}</span>
            </div>`;
          }).join('')}
        </div>
      `;

      el.querySelector('.cw-ob-checklist-close')!.addEventListener('click', () => {
        el.remove();
        trackOutbound(msg.id, 'dismiss');
      });

      el.querySelectorAll('.cw-ob-checklist-item').forEach(itemEl => {
        itemEl.addEventListener('click', () => {
          const itemId = (itemEl as HTMLElement).dataset.itemId!;
          if (doneIds.has(itemId)) {
            doneIds.delete(itemId);
          } else {
            doneIds.add(itemId);
            const item = items.find(i => i.id === itemId);
            if (item?.url) window.open(item.url, '_blank', 'noopener');
          }
          localStorage.setItem(storageKey, JSON.stringify([...doneIds]));
          renderInner();
          trackOutbound(msg.id, 'click');
        });
      });
    }

    renderInner();
    document.body.appendChild(el);
    trackOutbound(msg.id, 'impression');
  }

  function renderPost(msg: OutboundMsg): void {
    const existing = document.getElementById('cw-ob-post-' + msg.id);
    if (existing) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'cw-ob-post-' + msg.id;
    backdrop.className = 'cw-ob-post-backdrop';
    backdrop.innerHTML = `
      <div class="cw-ob-post">
        <div class="cw-ob-post-header">
          <h3>${esc(msg.title)}</h3>
          <button class="cw-ob-post-close" aria-label="Close">&times;</button>
        </div>
        <div class="cw-ob-post-body">${esc(msg.content.body)}</div>
        ${msg.content.ctaUrl ? `
          <div class="cw-ob-post-actions">
            <a class="cw-ob-post-cta" href="${esc(msg.content.ctaUrl)}" target="_blank" rel="noopener">${esc(msg.content.ctaText || 'Learn more')}</a>
          </div>
        ` : ''}
      </div>
    `;

    backdrop.querySelector('.cw-ob-post-close')!.addEventListener('click', () => {
      backdrop.remove();
      trackOutbound(msg.id, 'dismiss');
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.remove();
        trackOutbound(msg.id, 'dismiss');
      }
    });

    const ctaLink = backdrop.querySelector('.cw-ob-post-cta');
    if (ctaLink) {
      ctaLink.addEventListener('click', () => trackOutbound(msg.id, 'click'));
    }

    document.body.appendChild(backdrop);
    trackOutbound(msg.id, 'impression');
  }

  /* ================================================================== *
   *  Outbound Orchestrator                                              *
   * ================================================================== */

  function processOutboundMessages(): void {
    filterAndCategorizeOutbound();

    // Render first banner immediately
    if (activeOutbound.banners.length > 0) {
      renderBanner(activeOutbound.banners[0]);
    }

    // Render all tooltips immediately (they only show beacons until clicked)
    for (const t of activeOutbound.tooltips) {
      renderTooltip(t);
    }

    // Proactive chat popup after 3s delay
    if (activeOutbound.chatPopups.length > 0) {
      setTimeout(() => {
        if (!isOpen && activeOutbound.chatPopups.length > 0) {
          renderChatPopup(activeOutbound.chatPopups[0]);
        }
      }, 3000);
    }

    // First tour
    if (activeOutbound.tours.length > 0) {
      renderTour(activeOutbound.tours[0]);
    }

    // First checklist
    if (activeOutbound.checklists.length > 0) {
      renderChecklist(activeOutbound.checklists[0]);
    }

    // First post/announcement after 5s delay
    if (activeOutbound.posts.length > 0) {
      setTimeout(() => {
        if (activeOutbound.posts.length > 0) {
          renderPost(activeOutbound.posts[0]);
        }
      }, 5000);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let outboundEvalTimer: ReturnType<typeof setInterval> | null = null;

  function startOutboundEvaluation(): void {
    processOutboundMessages();
    // Re-evaluate every 10s for time-based audience rules
    outboundEvalTimer = setInterval(() => {
      filterAndCategorizeOutbound();
      // Only re-render types that aren't already visible
      if (activeOutbound.banners.length > 0 && !document.getElementById('cw-ob-banner-' + activeOutbound.banners[0].id)) {
        renderBanner(activeOutbound.banners[0]);
      }
      for (const t of activeOutbound.tooltips) {
        renderTooltip(t);
      }
      if (!isOpen && activeOutbound.chatPopups.length > 0 && !document.getElementById('cw-ob-chat-popup-' + activeOutbound.chatPopups[0].id)) {
        renderChatPopup(activeOutbound.chatPopups[0]);
      }
    }, 10000);
  }

  /* ================================================================== *
   *  CSAT                                                               *
   * ================================================================== */
  function initCSAT(): void {
    const starsEl = document.getElementById('cw-stars')!;
    if (!starsEl) return;

    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement('button');
      btn.className = 'cw-star';
      btn.setAttribute('aria-label', `${i} star`);
      btn.dataset.score = String(i);
      btn.innerHTML =
        '<svg viewBox="0 0 24 24"><path class="star-fill" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>';
      starsEl.appendChild(btn);

      btn.addEventListener('mouseenter', () => {
        starsEl.querySelectorAll('.cw-star').forEach((s: Element) => {
          const v = +(s as HTMLElement).dataset.score!;
          s.classList.toggle('hovered', v <= i);
        });
      });
      btn.addEventListener('mouseleave', () => {
        starsEl
          .querySelectorAll('.cw-star')
          .forEach((s: Element) => s.classList.remove('hovered'));
      });
      btn.addEventListener('click', () => submitCSAT(i));
    }
  }

  async function submitCSAT(score: number): Promise<void> {
    if (csatSent || !conversationId) return;
    csatSent = true;
    const starsEl = document.getElementById('cw-stars')!;
    const thanksEl = document.getElementById('cw-csat-thanks')!;

    starsEl.querySelectorAll('.cw-star').forEach((s: Element) => {
      s.classList.toggle(
        'active',
        +(s as HTMLElement).dataset.score! <= score
      );
      s.classList.remove('hovered');
      (s as HTMLElement).style.pointerEvents = 'none';
    });

    try {
      await fetch(`${API_URL}/api/conversations/csat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ conversationId, score })
      });
    } catch {
      /* silent */
    }

    setTimeout(() => {
      starsEl.style.display = 'none';
      thanksEl.style.display = 'block';
    }, 400);
  }

  function isConversationClosed(): boolean {
    return (
      conversationStatus === WIDGET_CONVERSATION_STATUS.CLOSED ||
      closeEventReceived
    );
  }

  function showCSAT(): void {
    if (csatSent || !conversationId || !config.aiCollectFeedback) return;
    if (!isConversationClosed()) return;
    const el = document.getElementById('cw-csat');
    if (el) el.classList.add('show');
  }

  /* ================================================================== *
   *  Conversation State Management                                      *
   * ================================================================== */
  function renderStateUI(): void {
    const handoffBtn = document.getElementById('cw-handoff-btn');
    const handoffBar = document.getElementById('cw-handoff-bar');
    const closedBar = document.getElementById('cw-closed-bar');
    const inputArea = document.getElementById('cw-input-area');
    const queuePosEl = document.getElementById('cw-queue-pos');

    // Reset visibility
    handoffBtn?.classList.remove('show');
    handoffBar?.classList.remove('show');
    closedBar?.classList.remove('show');
    if (inputArea) inputArea.style.display = 'flex';

    switch (conversationStatus) {
      case WIDGET_CONVERSATION_STATUS.ACTIVE:
        // Show handoff button once conversation has started
        if (messages.length > 0 && handoffBtn) {
          handoffBtn.classList.add('show');
        }
        break;

      case WIDGET_CONVERSATION_STATUS.HANDOFF_REQUESTED:
      case WIDGET_CONVERSATION_STATUS.QUEUED:
        // Show queue bar, hide input and handoff button
        handoffBar?.classList.add('show');
        if (inputArea) inputArea.style.display = 'none';
        if (queuePosEl) {
          queuePosEl.textContent = queuePosition !== null ? String(queuePosition) : '…';
        }
        break;

      case WIDGET_CONVERSATION_STATUS.HUMAN_ACTIVE:
        // Human agent is chatting — show input, no handoff button
        if (inputArea) inputArea.style.display = 'flex';
        break;

      case WIDGET_CONVERSATION_STATUS.CLOSED:
        // Conversation closed — show closed bar, hide input, show CSAT
        closedBar?.classList.add('show');
        if (inputArea) inputArea.style.display = 'none';
        showCSAT();
        break;

      case WIDGET_CONVERSATION_STATUS.ESCALATED:
        // Legacy auto-escalation: same as queued
        handoffBar?.classList.add('show');
        if (inputArea) inputArea.style.display = 'none';
        break;
    }
  }

  async function requestHandoff(): Promise<void> {
    if (!conversationId) return;
    if (
      conversationStatus !== WIDGET_CONVERSATION_STATUS.ACTIVE &&
      conversationStatus !== WIDGET_CONVERSATION_STATUS.ESCALATED
    )
      return;

    conversationStatus = WIDGET_CONVERSATION_STATUS.HANDOFF_REQUESTED;
    renderStateUI();

    try {
      const res = await fetch(`${API_URL}/api/chat/handoff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          conversationId,
          reason: 'Customer requested to speak with a human agent'
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // Reconcile state from server when available.
        const serverStatus = normalizeConversationStatus(
          (err as Record<string, string | undefined>).status ??
            WIDGET_CONVERSATION_STATUS.ACTIVE
        );
        conversationStatus = serverStatus;
        renderStateUI();
        if (
          serverStatus === WIDGET_CONVERSATION_STATUS.QUEUED ||
          serverStatus === WIDGET_CONVERSATION_STATUS.HUMAN_ACTIVE
        ) {
          startPolling();
        }
        messages.push({
          id: newMsgId(),
          role: 'system',
          content: (err as Record<string, string>).error ?? 'Could not connect to an agent right now. Please try again.',
          timestamp: Date.now()
        });
        renderMessages();
        return;
      }

      const data = await res.json();
      conversationStatus = WIDGET_CONVERSATION_STATUS.QUEUED;
      queuePosition = data.queuePosition ?? null;
      renderStateUI();
      startPolling();

      messages.push({
        id: newMsgId(),
        role: 'system',
        content: "You've been connected to our support queue. A human agent will be with you shortly.",
        timestamp: Date.now()
      });
      renderMessages();
    } catch {
      conversationStatus = WIDGET_CONVERSATION_STATUS.ACTIVE;
      renderStateUI();
    }
  }

  function startNewChat(): void {
    // Clear current conversation
    conversationId = null;
    messages = [];
    conversationStatus = WIDGET_CONVERSATION_STATUS.ACTIVE;
    closeEventReceived = false;
    queuePosition = null;
    csatSent = false;
    streaming = false;
    stopPolling();
    sessionStorage.removeItem('__cw_convo');

    // Reset UI
    const container = document.getElementById('cw-messages');
    if (container) container.innerHTML = '';
    renderStateUI();
    showScreen('home');
  }

  /* ================================================================== *
   *  Chat Logic                                                         *
   * ================================================================== */
  async function sendMessage(text?: string): Promise<void> {
    const input = document.getElementById('cw-input') as HTMLTextAreaElement;
    const sendBtn = document.getElementById('cw-send') as HTMLButtonElement;
    const content = text || input.value.trim();
    if (!content || streaming) return;

    // During human_active, send message to agent via non-streaming endpoint
    if (conversationStatus === WIDGET_CONVERSATION_STATUS.HUMAN_ACTIVE) {
      if (!text) {
        input.value = '';
        input.style.height = 'auto';
      }
      sendBtn.disabled = true;

      const userMsg: ChatMessage = {
        id: newMsgId(),
        role: 'user',
        content,
        timestamp: Date.now(),
        status: 'sending'
      };
      messages.push(userMsg);
      renderMessages();

      try {
        const response = await fetch(`${API_URL}/api/chat/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`
          },
          body: JSON.stringify({ message: content, conversationId, userId, channel: 'web' })
        });

        if (response.status === 409) {
          const payload = await response.json().catch(() => ({}));
          conversationStatus = WIDGET_CONVERSATION_STATUS.CLOSED;
          closeEventReceived = true;
          renderStateUI();
          stopPolling();
          showCSAT();
          messages.push({
            id: newMsgId(),
            role: 'system',
            content:
              (payload as Record<string, string>).error ??
              'This conversation has been closed.',
            timestamp: Date.now(),
            eventType: CONVERSATION_EVENTS.CLOSED
          });
          userMsg.status = 'sent';
          return;
        }

        if (!response.ok) {
          userMsg.status = 'sent';
          messages.push({
            id: newMsgId(),
            role: 'system',
            content: 'Failed to deliver message to the agent.',
            timestamp: Date.now()
          });
          return;
        }

        userMsg.status = 'sent';
      } catch {
        userMsg.status = 'sent';
        messages.push({
          id: newMsgId(),
          role: 'system',
          content: 'Failed to deliver message to the agent.',
          timestamp: Date.now()
        });
      } finally {
        renderMessages();
        sendBtn.disabled = false;
      }
      return;
    }

    // Don't allow AI messages if not in active state
    if (conversationStatus !== WIDGET_CONVERSATION_STATUS.ACTIVE) return;

    if (!text) {
      input.value = '';
      input.style.height = 'auto';
    }
    sendBtn.disabled = true;
    streaming = true;

    const userMsg: ChatMessage = {
      id: newMsgId(),
      role: 'user',
      content,
      timestamp: Date.now(),
      status: 'sending'
    };
    messages.push(userMsg);
    renderMessages();

    showTypingIndicator();

    const assistantMsg: ChatMessage = {
      id: newMsgId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };

    try {
      const body: Record<string, unknown> = {
        message: content,
        conversationId,
        userId,
        channel: 'web'
      };
      if (userEmail) body.userEmail = userEmail;
      if (userName) body.userName = userName;

      const res = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: 'Request failed' }));
        hideTypingIndicator();
        userMsg.status = 'sent';
        assistantMsg.content =
          err.error ?? 'Something went wrong. Please try again.';
        assistantMsg.timestamp = Date.now();
        messages.push(assistantMsg);
        streaming = false;
        renderMessages();
        return;
      }

      userMsg.status = 'sent';
      messages.push(assistantMsg);

      // Parse SSE
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let firstChunk = true;

      if (!reader) throw new Error('No response body');

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
            const data = JSON.parse(raw);

            if (data.type === 'delta') {
              if (firstChunk) {
                hideTypingIndicator();
                firstChunk = false;
              }
              assistantMsg.content += data.content;
              assistantMsg.timestamp = Date.now();
              renderMessages();
            } else if (data.type === 'done') {
              conversationId = data.conversationId ?? conversationId;
              if (conversationId)
                sessionStorage.setItem('__cw_convo', conversationId);
              if (data.citations) assistantMsg.citations = data.citations;
              hideTypingIndicator();
              // Update status from server if provided
              if (data.status) {
                conversationStatus = normalizeConversationStatus(data.status);
              }
              renderStateUI();
              // Only show CSAT when conversation is explicitly resolved/closed
              if (isConversationClosed()) {
                showCSAT();
              }
            } else if (data.type === 'escalated') {
              hideTypingIndicator();
              assistantMsg.content =
                data.message ??
                "I've connected you with a human agent. They'll be with you shortly.";
              conversationId = data.conversationId ?? conversationId;
              if (conversationId)
                sessionStorage.setItem('__cw_convo', conversationId);
              conversationStatus = WIDGET_CONVERSATION_STATUS.QUEUED;
              renderStateUI();
              startPolling();
            } else if (data.type === 'status') {
              // Server tells us the conversation state changed
              hideTypingIndicator();
              if (data.status) {
                conversationStatus = normalizeConversationStatus(data.status);
              }
              if (data.message) assistantMsg.content = data.message;
              renderStateUI();
              if (
                conversationStatus === WIDGET_CONVERSATION_STATUS.QUEUED ||
                conversationStatus === WIDGET_CONVERSATION_STATUS.HUMAN_ACTIVE
              ) {
                startPolling();
              }
            } else if (data.type === 'blocked') {
              hideTypingIndicator();
              assistantMsg.content =
                data.message ?? 'That request was blocked by our policies.';
            } else if (data.type === 'error') {
              hideTypingIndicator();
              assistantMsg.content =
                data.message ?? 'An error occurred. Please try again.';
            }
          } catch {
            /* skip malformed lines */
          }
        }
      }
    } catch {
      hideTypingIndicator();
      assistantMsg.content =
        'Unable to connect. Please check your internet and try again.';
      if (!messages.includes(assistantMsg)) messages.push(assistantMsg);
    } finally {
      streaming = false;
      renderMessages();
      sendBtn.disabled = false;
    }
  }

  /* ================================================================== *
   *  Polling for Agent Replies                                          *
   * ================================================================== */
  function startPolling(): void {
    if (pollTimer) return;
    lastPollTime = new Date().toISOString();
    pollTimer = setInterval(pollMessages, 3000);
  }

  function stopPolling(): void {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  async function pollMessages(): Promise<void> {
    if (!conversationId || streaming) return;
    try {
      let url = `${API_URL}/api/chat/messages?conversationId=${encodeURIComponent(conversationId)}`;
      if (lastPollTime)
        url += `&after=${encodeURIComponent(lastPollTime)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      if (!res.ok) return;
      const data = await res.json();

      // Update conversation status from server
      if (data.conversationStatus && data.conversationStatus !== conversationStatus) {
        conversationStatus = normalizeConversationStatus(data.conversationStatus);
        renderStateUI();
        // Stop polling if resolved
        if (conversationStatus === WIDGET_CONVERSATION_STATUS.CLOSED) {
          stopPolling();
          showCSAT();
        }
      }

      if (data.messages && data.messages.length > 0) {
        let changed = false;
        for (const msg of data.messages) {
          const isDuplicate = messages.some(
            (existing) =>
              existing.content === msg.content &&
              existing.role === msg.role &&
              existing.id === msg.id
          );
          if (!isDuplicate) {
            const eventType =
              msg.eventType === CONVERSATION_EVENTS.CLOSED
                ? CONVERSATION_EVENTS.CLOSED
                : undefined;
            messages.push({
              id: msg.id || newMsgId(),
              role: msg.role as ChatMessage['role'],
              content: msg.content,
              timestamp: msg.createdAt
                ? new Date(msg.createdAt).getTime()
                : Date.now(),
              senderType: msg.senderType || undefined,
              eventType
            });
            changed = true;
            if (eventType === CONVERSATION_EVENTS.CLOSED) {
              closeEventReceived = true;
            }
            if (!isOpen && msg.role === 'assistant') {
              unreadCount++;
              updateBadge();
            }
          }
          if (msg.createdAt > (lastPollTime || '')) {
            lastPollTime = msg.createdAt;
          }
        }
        if (closeEventReceived && conversationStatus !== WIDGET_CONVERSATION_STATUS.CLOSED) {
          conversationStatus = WIDGET_CONVERSATION_STATUS.CLOSED;
          renderStateUI();
          stopPolling();
          showCSAT();
        }
        if (changed) renderMessages();
      }

      // Poll queue position if queued
      if (conversationStatus === WIDGET_CONVERSATION_STATUS.QUEUED) {
        try {
          const qRes = await fetch(
            `${API_URL}/api/chat/queue-status?conversationId=${encodeURIComponent(conversationId)}`,
            { headers: { Authorization: `Bearer ${API_KEY}` } }
          );
          if (qRes.ok) {
            const qData = await qRes.json();
            queuePosition = qData.queuePosition ?? null;
            renderStateUI();
          }
        } catch { /* ignore */ }
      }
    } catch {
      /* ignore poll errors */
    }
  }

  /* ================================================================== *
   *  Event Binding                                                      *
   * ================================================================== */
  function bindEvents(): void {
    const bubble = document.getElementById('cw-bubble')!;
    const panel = document.getElementById('cw-panel')!;
    const closeBtn = document.getElementById('cw-close')!;
    const input = document.getElementById('cw-input') as HTMLTextAreaElement;
    const sendBtn = document.getElementById('cw-send') as HTMLButtonElement;
    const startBtn = document.getElementById('cw-start-btn')!;

    function toggle(): void {
      isOpen = !isOpen;
      panel.classList.toggle('open', isOpen);
      bubble.classList.toggle('open', isOpen);
      if (isOpen) {
        unreadCount = 0;
        updateBadge();
        if (currentScreen === 'chat') {
          setTimeout(() => input.focus(), 100);
        }
      }
    }

    bubble.addEventListener('click', toggle);
    closeBtn.addEventListener('click', toggle);

    // Start button
    startBtn.addEventListener('click', () => {
      if (config.requireEmail && !emailVerified) {
        showScreen('email');
      } else {
        showScreen('chat');
        setTimeout(() => input.focus(), 100);
      }
    });

    // Email form
    const emailSubmit = document.getElementById(
      'cw-email-submit'
    ) as HTMLButtonElement;
    const emailInput = document.getElementById(
      'cw-email-input'
    ) as HTMLInputElement;
    const nameInput = document.getElementById(
      'cw-name-input'
    ) as HTMLInputElement;
    const emailError = document.getElementById('cw-email-error')!;

    emailSubmit?.addEventListener('click', () => {
      const email = emailInput.value.trim();
      const name = nameInput.value.trim();

      if (!isValidEmail(email)) {
        emailInput.classList.add('error');
        emailError.style.display = 'block';
        return;
      }

      emailInput.classList.remove('error');
      emailError.style.display = 'none';

      userEmail = email;
      userName = name;
      emailVerified = true;
      localStorage.setItem('__cw_email', email);
      if (name) localStorage.setItem('__cw_name', name);

      showScreen('chat');
      setTimeout(() => input.focus(), 100);
    });

    emailInput?.addEventListener('input', () => {
      emailInput.classList.remove('error');
      emailError.style.display = 'none';
    });

    emailInput?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        emailSubmit?.click();
      }
    });

    // Input handling
    input.addEventListener('input', () => {
      sendBtn.disabled = !input.value.trim() || streaming;
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    sendBtn.addEventListener('click', () => sendMessage());

    // Handoff button — talk to a person
    const handoffBtn = document.getElementById('cw-handoff-btn')!;
    handoffBtn?.addEventListener('click', () => requestHandoff());

    // New chat button — after conversation closed
    const newChatBtn = document.getElementById('cw-new-chat-btn')!;
    newChatBtn?.addEventListener('click', () => startNewChat());

    // Quick topics
    const topicsContainer = document.getElementById('cw-topics')!;
    topicsContainer?.addEventListener('click', (e: Event) => {
      const target = (e.target as HTMLElement).closest(
        '.cw-topic-btn'
      ) as HTMLElement;
      if (!target) return;
      const topic = target.dataset.topic;
      if (topic) {
        if (config.requireEmail && !emailVerified) {
          showScreen('email');
        } else {
          showScreen('chat');
          setTimeout(() => sendMessage(topic), 200);
        }
      }
    });

    // Close on ESC
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) toggle();
    });

    // === Public API bridge (used by @sweo/widget SDK) ===
    (window as any).__sweoWidget = {
      open()    { if (!isOpen) toggle(); },
      close()   { if (isOpen) toggle(); },
      toggle,
      isOpen()  { return isOpen; },
      destroy() {
        stopPolling();
        document.getElementById('cw-root')?.remove();
        document.getElementById('cw-styles')?.remove();
        delete (window as any).__sweoWidget;
      },
    };
    window.dispatchEvent(new CustomEvent('sweo:widget:ready'));
  }

  /* ================================================================== *
   *  Quick Topics (Suggested Conversation Starters)                     *
   * ================================================================== */
  function renderTopics(): void {
    const container = document.getElementById('cw-topics');
    if (!container) return;

    // Use dedicated suggestedTopics from config if available,
    // otherwise fall back to content_sources guidance rules
    const topics: Array<{ name: string }> = [];
    if (config.guidance && config.guidance.length > 0) {
      const contentRules = config.guidance.filter(
        (g) => g.category === 'content_sources'
      );
      contentRules.slice(0, 3).forEach((r) => topics.push({ name: r.name }));
    }

    if (topics.length === 0) return;

    const icons = [
      '<svg viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1z"/></svg>',
      '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>'
    ];

    let html = '<div class="cw-home-topics-title">Common topics</div>';
    topics.forEach((topic, i) => {
      html += `<button class="cw-topic-btn" data-topic="${esc(topic.name)}">
          <div class="cw-topic-icon">${icons[i % icons.length]}</div>
          <span>${esc(topic.name)}</span>
        </button>`;
    });
    container.innerHTML = html;
  }

  /* ================================================================== *
   *  Initialization                                                     *
   * ================================================================== */
  async function init(): Promise<void> {
    await loadConfig();
    injectStyles();
    buildDOM();
    initCSAT();
    renderTopics();
    bindEvents();

    // Load and process outbound messages
    await loadOutboundMessages();
    startOutboundEvaluation();

    // Restore conversation from session if exists
    const savedConvoId = sessionStorage.getItem('__cw_convo');
    if (savedConvoId) {
      conversationId = savedConvoId;
      try {
        const res = await fetch(
          `${API_URL}/api/chat/messages?conversationId=${encodeURIComponent(conversationId)}`,
          { headers: { Authorization: `Bearer ${API_KEY}` } }
        );
        if (res.ok) {
          const data = await res.json();

          // Restore conversation status
          if (data.conversationStatus) {
            conversationStatus = normalizeConversationStatus(
              data.conversationStatus
            );
          }

          if (data.messages && data.messages.length > 0) {
              messages = data.messages.map(
                (m: Record<string, unknown>) => ({
                  id: (m.id as string) || newMsgId(),
                  role: m.role as ChatMessage['role'],
                  content: m.content as string,
                  timestamp: m.createdAt
                    ? new Date(m.createdAt as string).getTime()
                    : Date.now(),
                  senderType: (m.senderType as string) || undefined,
                  eventType:
                    m.eventType === CONVERSATION_EVENTS.CLOSED
                      ? CONVERSATION_EVENTS.CLOSED
                      : undefined
                })
              );
              closeEventReceived = messages.some(
                (m) => m.eventType === CONVERSATION_EVENTS.CLOSED
              );
              if (
                closeEventReceived &&
                conversationStatus !== WIDGET_CONVERSATION_STATUS.CLOSED
              ) {
                conversationStatus = WIDGET_CONVERSATION_STATUS.CLOSED;
              }
              showScreen('chat');
            renderMessages();
            renderStateUI();

            // Resume polling if conversation is active with agent or queued
            if (
              conversationStatus === WIDGET_CONVERSATION_STATUS.HUMAN_ACTIVE ||
              conversationStatus === WIDGET_CONVERSATION_STATUS.QUEUED ||
              conversationStatus === WIDGET_CONVERSATION_STATUS.ESCALATED ||
              conversationStatus === WIDGET_CONVERSATION_STATUS.HANDOFF_REQUESTED
            ) {
              startPolling();
            }
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  init();
})();
