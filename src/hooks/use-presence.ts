'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRealtime } from '@/hooks/use-realtime';
import type { Models } from 'appwrite';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PresenceEntry {
  /** Unique id for dedup (agentId + conversationId) */
  id: string;
  agentId: string;
  agentName: string;
  conversationId: string;
  /** unix ms of last heartbeat */
  lastSeen: number;
  /** Whether the agent is actively typing */
  typing: boolean;
}

/** Lightweight Appwrite doc shape stored in the presence collection */
export interface PresenceDocument extends Models.Document {
  agentId: string;
  agentName: string;
  conversationId: string;
  lastSeen: number;
  typing: boolean;
  tenantId: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How often to send heartbeat (ms) */
const HEARTBEAT_INTERVAL = 10_000; // 10s
/** Consider agent offline after this many ms without heartbeat */
const STALE_THRESHOLD = 30_000; // 30s
/** Debounce for typing indicator (ms) */
const TYPING_DEBOUNCE = 2_000;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UsePresenceOptions {
  conversationId: string;
  tenantId: string;
  agentId: string;
  agentName: string;
  enabled?: boolean;
}

export function usePresence({
  conversationId,
  tenantId,
  agentId,
  agentName,
  enabled = true
}: UsePresenceOptions) {
  const [participants, setParticipants] = useState<PresenceEntry[]>([]);
  const presenceMapRef = useRef<Map<string, PresenceEntry>>(new Map());
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const docIdRef = useRef<string | null>(null);

  // ── Heartbeat: create/update presence doc ──────────────────────────
  const sendHeartbeat = useCallback(
    async (typing = false) => {
      if (!enabled) return;
      try {
        const res = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            tenantId,
            agentId,
            agentName,
            typing
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.docId) docIdRef.current = data.docId;
        }
      } catch {
        // Silently fail — presence is best-effort
      }
    },
    [conversationId, tenantId, agentId, agentName, enabled]
  );

  // ── Join on mount, leave on unmount ────────────────────────────────
  useEffect(() => {
    if (!enabled || !conversationId) return;

    // Initial heartbeat
    sendHeartbeat(false);

    // Periodic heartbeat
    heartbeatRef.current = setInterval(() => {
      sendHeartbeat(false);
    }, HEARTBEAT_INTERVAL);

    return () => {
      // Clear interval
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // Leave — fire-and-forget
      fetch('/api/presence', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, agentId, tenantId })
      }).catch(() => {});
    };
  }, [conversationId, enabled, sendHeartbeat, agentId, tenantId]);

  // ── Load existing presence docs on mount ────────────────────────────
  useEffect(() => {
    if (!enabled || !conversationId) return;

    fetch(
      `/api/presence?conversationId=${encodeURIComponent(conversationId)}&tenantId=${encodeURIComponent(tenantId)}`
    )
      .then((r) => r.json())
      .then((data: { participants: PresenceEntry[] }) => {
        const now = Date.now();
        const map = presenceMapRef.current;
        for (const p of data.participants ?? []) {
          if (now - p.lastSeen < STALE_THRESHOLD && p.agentId !== agentId) {
            map.set(p.agentId, p);
          }
        }
        setParticipants(Array.from(map.values()));
      })
      .catch(() => {});
  }, [conversationId, tenantId, agentId, enabled]);

  // ── Listen for realtime presence events ─────────────────────────────
  useRealtime<PresenceDocument>({
    collection: 'PRESENCE',
    events: ['create', 'update', 'delete'],
    filter: (doc) =>
      doc.conversationId === conversationId && doc.agentId !== agentId,
    onEvent: (doc, event) => {
      const map = presenceMapRef.current;

      if (event === 'delete') {
        map.delete(doc.agentId);
      } else {
        const entry: PresenceEntry = {
          id: doc.$id,
          agentId: doc.agentId,
          agentName: doc.agentName,
          conversationId: doc.conversationId,
          lastSeen: doc.lastSeen,
          typing: doc.typing
        };
        map.set(doc.agentId, entry);
      }

      setParticipants(Array.from(map.values()));
    },
    enabled
  });

  // ── Prune stale entries periodically ────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    const prune = setInterval(() => {
      const now = Date.now();
      const map = presenceMapRef.current;
      let changed = false;
      for (const [key, entry] of map) {
        if (now - entry.lastSeen > STALE_THRESHOLD) {
          map.delete(key);
          changed = true;
        }
      }
      if (changed) setParticipants(Array.from(map.values()));
    }, STALE_THRESHOLD / 2);

    return () => clearInterval(prune);
  }, [enabled]);

  // ── Typing signal ──────────────────────────────────────────────────
  const setTyping = useCallback(() => {
    if (!enabled) return;
    sendHeartbeat(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Auto-clear typing after debounce
    typingTimeoutRef.current = setTimeout(() => {
      sendHeartbeat(false);
    }, TYPING_DEBOUNCE);
  }, [enabled, sendHeartbeat]);

  // ── Derived state ──────────────────────────────────────────────────
  const otherParticipants = participants.filter((p) => p.agentId !== agentId);
  const typingAgents = otherParticipants.filter((p) => p.typing);

  return {
    /** All other agents currently viewing this conversation */
    participants: otherParticipants,
    /** Agents currently typing */
    typingAgents,
    /** Call this on keystrokes in the editor to signal typing */
    setTyping,
    /** Total count of other viewers */
    viewerCount: otherParticipants.length
  };
}
