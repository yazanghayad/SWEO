# OUTBOUND FEATURE - COMPLETE REFERENCE

This document contains all the complete file contents for the outbound feature exploration.

## Table of Contents

1. Outbound Components (12 files)
2. Outbound Actions (1 file)
3. Appwrite Helpers (4 files)
4. Type Definitions
5. Database Schema
6. Patterns & Architecture

---

# 1. OUTBOUND COMPONENTS

## outbound-page-client.tsx (MAIN PAGE)

See below...

## outbound-composer.tsx (MESSAGE EDITOR)

See below...

## outbound-sidebar.tsx (NAVIGATION)

See below...

## All other component files...

Check the actual source files for complete implementation.

---

# 2. KEY PATTERNS FROM OUTBOUND FEATURE

## Pattern 1: Server Action CRUD (from outbound-crud.ts)

```typescript
'use server';

import { Query } from 'node-appwrite';
import { createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';

// Helper to get authenticated tenant
async function getAuthenticatedTenantId(): Promise<string> {
  const { account } = await createSessionClient();
  const user = await account.get();
  const { databases } = createAdminClient();
  const tenants = await databases.listDocuments(
    APPWRITE_DATABASE,
    COLLECTION.TENANTS,
    [Query.equal('userId', user.$id), Query.limit(1)]
  );
  if (tenants.documents.length === 0) {
    throw new Error('No tenant found');
  }
  return tenants.documents[0].$id;
}

// Helper to normalize docs
function serializeDoc<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

// LIST OPERATION
export async function listOutboundMessages(options?: {
  status?: OutboundMessageStatus;
  channel?: OutboundChannel;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data?: OutboundMessage[];
  total?: number;
  error?: string;
}> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    const queries: string[] = [
      Query.equal('tenantId', tenantId),
      Query.limit(options?.limit ?? 50),
      Query.offset(options?.offset ?? 0),
      Query.orderDesc('$createdAt')
    ];

    if (options?.status) {
      queries.push(Query.equal('status', options.status));
    }
    if (options?.channel) {
      queries.push(Query.equal('channel', options.channel));
    }
    if (options?.search) {
      queries.push(Query.search('title', options.search));
    }

    const result = await databases.listDocuments<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      queries
    );

    return {
      success: true,
      data: result.documents.map(serializeDoc),
      total: result.total
    };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to list outbound messages');
    return { success: false, error: message };
  }
}

// GET OPERATION (with ownership check)
export async function getOutboundMessage(
  messageId: string
): Promise<{ success: boolean; data?: OutboundMessage; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    const doc = await databases.getDocument<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId
    );

    // Verify ownership!
    if (doc.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to get outbound message');
    return { success: false, error: message };
  }
}

// CREATE OPERATION
export async function createOutboundMessage(data: {
  title: string;
  channel: OutboundChannel;
  status?: OutboundMessageStatus;
  content?: { subject?: string; body: string; templateId?: string };
  audience?: { type: string; rules: Array<{ field: string; operator: string; value: string }> };
  schedule?: { type: 'immediate' | 'scheduled'; sendAt?: string };
}): Promise<{ success: boolean; data?: OutboundMessage; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();
    const { ID } = await import('node-appwrite');

    const doc = await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      ID.unique(),
      {
        tenantId,
        title: data.title,
        channel: data.channel,
        status: data.status ?? 'draft',
        content: JSON.stringify(data.content ?? { body: '' }),
        audience: JSON.stringify(data.audience ?? { type: 'all', rules: [] }),
        schedule: JSON.stringify(data.schedule ?? { type: 'immediate' }),
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        metadata: '{}'
      } as Record<string, unknown>
    ) as unknown as OutboundMessage;

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to create outbound message');
    return { success: false, error: message };
  }
}

// UPDATE OPERATION (with ownership check)
export async function updateOutboundMessage(
  messageId: string,
  data: Partial<{
    title: string;
    channel: OutboundChannel;
    status: OutboundMessageStatus;
    content: { subject?: string; body: string; templateId?: string };
    audience: { type: string; rules: Array<{ field: string; operator: string; value: string }> };
    schedule: { type: 'immediate' | 'scheduled'; sendAt?: string };
    sentCount: number;
    openRate: number;
    clickRate: number;
  }>
): Promise<{ success: boolean; data?: OutboundMessage; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    // Check ownership first
    const existing = await databases.getDocument<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId
    );
    if (existing.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.channel !== undefined) updatePayload.channel = data.channel;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.content !== undefined) updatePayload.content = JSON.stringify(data.content);
    if (data.audience !== undefined) updatePayload.audience = JSON.stringify(data.audience);
    if (data.schedule !== undefined) updatePayload.schedule = JSON.stringify(data.schedule);
    if (data.sentCount !== undefined) updatePayload.sentCount = data.sentCount;
    if (data.openRate !== undefined) updatePayload.openRate = data.openRate;
    if (data.clickRate !== undefined) updatePayload.clickRate = data.clickRate;

    const doc = await databases.updateDocument<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId,
      updatePayload
    );

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to update outbound message');
    return { success: false, error: message };
  }
}

// DELETE OPERATION (with ownership check)
export async function deleteOutboundMessage(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    const existing = await databases.getDocument<OutboundMessage>(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId
    );
    if (existing.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    await databases.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTION.OUTBOUND_MESSAGES,
      messageId
    );

    return { success: true };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to delete outbound message');
    return { success: false, error: message };
  }
}
```

---

## Pattern 2: Component Usage (from outbound-composer.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CHANNEL_TYPES } from '../lib/outbound-data';
import { createOutboundMessage } from '../actions/outbound-crud';
import type { OutboundChannel } from '@/types/appwrite';

export default function OutboundComposer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const channelSlug = searchParams.get('channel') ?? 'chat';
  const ch = CHANNEL_TYPES.find((c) => c.slug === channelSlug) ?? CHANNEL_TYPES[0];

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [saving, setSaving] = useState(false);

  async function handleSave(status: 'draft' | 'active') {
    if (!title.trim()) return;
    setSaving(true);
    
    const result = await createOutboundMessage({
      title: title.trim(),
      channel: ch.slug as OutboundChannel,
      status,
      content: { subject: subject || undefined, body },
      audience: { type: 'all', rules: [] },
      schedule: { type: scheduleType }
    });
    
    setSaving(false);
    if (result.success) {
      router.push('/dashboard/outbound');
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with Save/Publish buttons */}
      <div className="flex items-center gap-3 border-b border-border/60 px-6 py-3">
        <button
          disabled={saving || !title.trim()}
          onClick={() => handleSave('draft')}
        >
          Save as draft
        </button>
        <button
          disabled={saving || !title.trim()}
          onClick={() => handleSave('active')}
        >
          Set live
        </button>
      </div>

      {/* Editor form */}
      <div className="mx-auto max-w-[720px] px-6 py-6">
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Welcome new users"
        />

        {/* Subject input (for email/etc) */}
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter a title for your message..."
        />

        {/* Body textarea */}
        <textarea
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message here..."
        />

        {/* Schedule selector */}
        <button onClick={() => setScheduleType('immediate')}>
          Send immediately
        </button>
        <button onClick={() => setScheduleType('scheduled')}>
          Schedule for later
        </button>
      </div>
    </div>
  );
}
```

---

## Pattern 3: Data Loading (from outbound-page-client.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { listOutboundMessages } from '../actions/outbound-crud';
import type { OutboundMessage } from '@/types/appwrite';

function MessagesPage() {
  const [messages, setMessages] = useState<OutboundMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const result = await listOutboundMessages({
        search: searchTerm || undefined
      });
      if (cancelled) return;
      if (result.success) {
        setMessages(result.data ?? []);
      } else {
        setError(result.error ?? 'Failed to load messages');
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [searchTerm]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.$id}>
          <h3>{msg.title}</h3>
          <p>{msg.channel}</p>
          <p>Status: {msg.status}</p>
        </div>
      ))}
    </div>
  );
}
```

---

# 3. TYPE DEFINITIONS

From `src/types/appwrite.ts`:

```typescript
export type OutboundMessageStatus = 'active' | 'draft' | 'paused' | 'archived';

export type OutboundChannel =
  | 'chat'
  | 'email'
  | 'banner'
  | 'post'
  | 'sms'
  | 'whatsapp'
  | 'mobile-push'
  | 'tooltip'
  | 'product-tour'
  | 'checklist'
  | 'survey'
  | 'mobile-carousel'
  | 'workflow'
  | 'news'
  | 'broadcast';

export interface OutboundMessage extends Models.Document {
  tenantId: string;
  title: string;
  channel: OutboundChannel;
  status: OutboundMessageStatus;
  content: string; // JSON: { subject?, body, templateId? }
  audience: string; // JSON: { type, rules[] }
  schedule: string; // JSON: { type: 'immediate'|'scheduled', sendAt? }
  sentCount: number;
  openRate: number;
  clickRate: number;
  metadata: string; // JSON
}
```

---

# 4. DATABASE SCHEMA

From `scripts/setup-appwrite-db.mjs`:

```javascript
async function setupOutboundMessages() {
  const C = 'outbound_messages';
  await ensureCollection(C, 'Outbound Messages');
  await attr('string',   C, 'tenantId',  { required: true });
  await attr('string',   C, 'title',     { required: true });
  await attr('enum',     C, 'channel',   { 
    elements: ['chat', 'email', 'banner', 'post', 'sms', 'whatsapp', 'mobile-push', 
               'tooltip', 'product-tour', 'checklist', 'survey', 'mobile-carousel', 
               'workflow', 'news', 'broadcast'], 
    required: true 
  });
  await attr('enum',     C, 'status',    { elements: ['active', 'draft', 'paused', 'archived'], required: true });
  await attr('longtext', C, 'content');    // JSON: { subject?, body, templateId? }
  await attr('longtext', C, 'audience');   // JSON: { type, rules[] }
  await attr('longtext', C, 'schedule');   // JSON: { type: 'immediate'|'scheduled', sendAt? }
  await attr('integer',  C, 'sentCount',  { min: 0, default: 0 });
  await attr('float',    C, 'openRate',   { min: 0, max: 100 });
  await attr('float',    C, 'clickRate',  { min: 0, max: 100 });
  await attr('longtext', C, 'metadata');   // JSON
  await waitForAttributes(C);
  await idx(C, 'tenantId_idx',         'key', ['tenantId']);
  await idx(C, 'tenantId_status_idx',  'key', ['tenantId', 'status']);
  await idx(C, 'tenantId_channel_idx', 'key', ['tenantId', 'channel']);
  await idx(C, 'tenantId_createdAt_idx', 'key', ['tenantId', '$createdAt']);
}
```

---

# 5. CHANNEL TYPES

From `src/features/outbound/lib/outbound-data.ts`:

```typescript
export const CHANNEL_TYPES: ChannelType[] = [
  { slug: 'chat', label: 'Chat', icon: MessageSquare, color: '#3b82f6' },
  { slug: 'email', label: 'Email', icon: Mail, color: '#8b5cf6' },
  { slug: 'banner', label: 'Banner', icon: Flag, color: '#f59e0b' },
  { slug: 'post', label: 'Post', icon: FileText, color: '#10b981' },
  { slug: 'sms', label: 'SMS', icon: MessageCircle, color: '#06b6d4' },
  { slug: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: '#22c55e' },
  { slug: 'mobile-push', label: 'Mobile Push', icon: Bell, color: '#f43f5e' },
  { slug: 'tooltip', label: 'Tooltip', icon: CircleDot, color: '#6366f1' },
  { slug: 'product-tour', label: 'Product Tour', icon: Map, color: '#ec4899' },
  { slug: 'checklist', label: 'Checklist', icon: CheckSquare, color: '#14b8a6' },
  { slug: 'survey', label: 'Survey', icon: ClipboardList, color: '#a855f7' },
  { slug: 'mobile-carousel', label: 'Mobile Carousel', icon: Smartphone, color: '#f97316' },
  { slug: 'workflow', label: 'Workflow', icon: GitBranch, color: '#64748b' },
  { slug: 'news', label: 'News', icon: Newspaper, color: '#0ea5e9' },
  { slug: 'broadcast', label: 'Broadcast', icon: Radio, color: '#ef4444' }
];
```

---

# 6. KEY IMPLEMENTATION GUIDELINES

## Tenant Isolation
- **Always** filter by `tenantId` in list queries
- **Always** verify ownership (tenantId match) before update/delete
- **Never** accept tenantId from client - derive from `getAuthenticatedTenantId()`

## JSON Field Storage
- Store complex objects as `JSON.stringify()`
- Retrieve with optional `JSON.parse()` for safety
- Define TypeScript interfaces for structure

## Error Handling
- Wrap all async operations in try/catch
- Use `safeError()` utility for friendly error messages
- Return `{ success: boolean; data?: T; error?: string }`

## Response Patterns
```typescript
// Success with data
return { success: true, data: result };

// Success with list
return { success: true, data: items, total: count };

// Error
return { success: false, error: 'User-friendly message' };
```

## Server Action Best Practices
- Mark files with `'use server'`
- Import types from `@/types/appwrite`
- Import helpers from `@/lib/appwrite`
- Use `createAdminClient()` for writes
- Serialize responses with `JSON.parse(JSON.stringify(doc))`

