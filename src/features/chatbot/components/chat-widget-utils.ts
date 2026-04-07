import { Home, MessageSquare, HelpCircle, Megaphone } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────
let _id = 0;
export function uid(): string {
  return `m_${Date.now()}_${++_id}`;
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Nyss';
  if (diffMin < 60) return `${diffMin} m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} t`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} d`;
  return `${Math.floor(diffD / 7)} v`;
}

export type TabId = 'home' | 'messages' | 'help' | 'news';

export const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Hem', icon: Home },
  { id: 'messages', label: 'Meddelanden', icon: MessageSquare },
  { id: 'help', label: 'Hjälp', icon: HelpCircle },
  { id: 'news', label: 'Nyheter', icon: Megaphone }
];
