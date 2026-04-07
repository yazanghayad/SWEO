'use server';

import { Query } from 'node-appwrite';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type { Contact } from '@/types/appwrite';
import { safeError } from '@/lib/safe-error';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function serializeDoc<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

const AVATAR_COLORS = [
  'bg-green-600',
  'bg-green-500',
  'bg-teal-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-500'
];

function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// ---------------------------------------------------------------------------
// List contacts
// ---------------------------------------------------------------------------

export async function listContacts(options?: {
  type?: 'user' | 'lead';
  status?: 'active' | 'inactive' | 'archived';
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; data?: Contact[]; total?: number; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    const queries: string[] = [
      Query.equal('tenantId', tenantId),
      Query.limit(options?.limit ?? 50),
      Query.offset(options?.offset ?? 0),
      Query.orderDesc('$createdAt')
    ];

    if (options?.type) {
      queries.push(Query.equal('type', options.type));
    }
    if (options?.status) {
      queries.push(Query.equal('status', options.status));
    }
    if (options?.search) {
      queries.push(Query.search('name', options.search));
    }

    const result = await databases.listDocuments<Contact>(
      APPWRITE_DATABASE,
      COLLECTION.CONTACTS,
      queries
    );

    return {
      success: true,
      data: result.documents.map(serializeDoc),
      total: result.total
    };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to list contacts');
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Get single contact
// ---------------------------------------------------------------------------

export async function getContact(
  contactId: string
): Promise<{ success: boolean; data?: Contact; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    const doc = await databases.getDocument<Contact>(
      APPWRITE_DATABASE,
      COLLECTION.CONTACTS,
      contactId
    );

    if (doc.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to get contact');
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Create contact
// ---------------------------------------------------------------------------

export async function createContact(data: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  type?: 'user' | 'lead';
  city?: string;
  country?: string;
  notes?: string;
  tags?: string[];
}): Promise<{ success: boolean; data?: Contact; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();
    const { ID } = await import('node-appwrite');

    const now = new Date().toISOString();

    const doc = await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONTACTS,
      ID.unique(),
      {
        tenantId,
        name: data.name,
        email: data.email ?? '',
        phone: data.phone ?? '',
        company: data.company ?? '',
        type: data.type ?? 'user',
        status: 'active',
        avatarColor: randomAvatarColor(),
        city: data.city ?? '',
        country: data.country ?? '',
        webSessions: 0,
        lastSeenAt: now,
        firstSeenAt: now,
        signedUpAt: now,
        tags: JSON.stringify(data.tags ?? []),
        notes: data.notes ?? '',
        metadata: '{}'
      } as Record<string, unknown>
    ) as unknown as Contact;

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to create contact');
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Update contact
// ---------------------------------------------------------------------------

export async function updateContact(
  contactId: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    company: string;
    type: 'user' | 'lead';
    status: 'active' | 'inactive' | 'archived';
    city: string;
    country: string;
    notes: string;
    tags: string[];
    webSessions: number;
    lastSeenAt: string;
  }>
): Promise<{ success: boolean; data?: Contact; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    // Verify ownership
    const existing = await databases.getDocument<Contact>(
      APPWRITE_DATABASE,
      COLLECTION.CONTACTS,
      contactId
    );
    if (existing.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    // Build update payload – handle tags specially
    const updatePayload: Record<string, unknown> = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.company !== undefined) updatePayload.company = data.company;
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.city !== undefined) updatePayload.city = data.city;
    if (data.country !== undefined) updatePayload.country = data.country;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.tags !== undefined) updatePayload.tags = JSON.stringify(data.tags);
    if (data.webSessions !== undefined) updatePayload.webSessions = data.webSessions;
    if (data.lastSeenAt !== undefined) updatePayload.lastSeenAt = data.lastSeenAt;

    const doc = await databases.updateDocument<Contact>(
      APPWRITE_DATABASE,
      COLLECTION.CONTACTS,
      contactId,
      updatePayload
    );

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to update contact');
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Delete contact
// ---------------------------------------------------------------------------

export async function deleteContact(
  contactId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    const existing = await databases.getDocument<Contact>(
      APPWRITE_DATABASE,
      COLLECTION.CONTACTS,
      contactId
    );
    if (existing.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    await databases.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTION.CONTACTS,
      contactId
    );

    return { success: true };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to delete contact');
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Bulk delete contacts
// ---------------------------------------------------------------------------

export async function bulkDeleteContacts(
  contactIds: string[]
): Promise<{ success: boolean; deleted: number; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();
    let deleted = 0;

    for (const id of contactIds) {
      try {
        const doc = await databases.getDocument<Contact>(
          APPWRITE_DATABASE,
          COLLECTION.CONTACTS,
          id
        );
        if (doc.tenantId === tenantId) {
          await databases.deleteDocument(APPWRITE_DATABASE, COLLECTION.CONTACTS, id);
          deleted++;
        }
      } catch {
        // Skip docs that don't exist
      }
    }

    return { success: true, deleted };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to bulk delete contacts');
    return { success: false, deleted: 0, error: message };
  }
}

// ---------------------------------------------------------------------------
// Add tag to contact(s)
// ---------------------------------------------------------------------------

export async function addTagToContacts(
  contactIds: string[],
  tag: string
): Promise<{ success: boolean; updated: number; error?: string }> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();
    let updated = 0;

    for (const id of contactIds) {
      try {
        const doc = await databases.getDocument<Contact>(
          APPWRITE_DATABASE,
          COLLECTION.CONTACTS,
          id
        );
        if (doc.tenantId !== tenantId) continue;

        const currentTags: string[] = doc.tags
          ? (typeof doc.tags === 'string' ? JSON.parse(doc.tags) : doc.tags)
          : [];

        if (!currentTags.includes(tag)) {
          currentTags.push(tag);
          await databases.updateDocument(
            APPWRITE_DATABASE,
            COLLECTION.CONTACTS,
            id,
            { tags: JSON.stringify(currentTags) }
          );
          updated++;
        }
      } catch {
        // Skip
      }
    }

    return { success: true, updated };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to add tag');
    return { success: false, updated: 0, error: message };
  }
}

// ---------------------------------------------------------------------------
// Get contacts stats/counts
// ---------------------------------------------------------------------------

export async function getContactCounts(): Promise<{
  success: boolean;
  data?: { all: number; users: number; leads: number; active: number; new: number };
  error?: string;
}> {
  try {
    const tenantId = await getAuthenticatedTenantId();
    const { databases } = createAdminClient();

    const [allResult, usersResult, leadsResult, activeResult] = await Promise.all([
      databases.listDocuments(APPWRITE_DATABASE, COLLECTION.CONTACTS, [
        Query.equal('tenantId', tenantId),
        Query.limit(1)
      ]),
      databases.listDocuments(APPWRITE_DATABASE, COLLECTION.CONTACTS, [
        Query.equal('tenantId', tenantId),
        Query.equal('type', 'user'),
        Query.limit(1)
      ]),
      databases.listDocuments(APPWRITE_DATABASE, COLLECTION.CONTACTS, [
        Query.equal('tenantId', tenantId),
        Query.equal('type', 'lead'),
        Query.limit(1)
      ]),
      databases.listDocuments(APPWRITE_DATABASE, COLLECTION.CONTACTS, [
        Query.equal('tenantId', tenantId),
        Query.equal('status', 'active'),
        Query.limit(1)
      ])
    ]);

    // Count "new" contacts created in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const newResult = await databases.listDocuments(APPWRITE_DATABASE, COLLECTION.CONTACTS, [
      Query.equal('tenantId', tenantId),
      Query.greaterThan('$createdAt', sevenDaysAgo),
      Query.limit(1)
    ]);

    return {
      success: true,
      data: {
        all: allResult.total,
        users: usersResult.total,
        leads: leadsResult.total,
        active: activeResult.total,
        new: newResult.total
      }
    };
  } catch (err: unknown) {
    const message = safeError(err, 'Failed to get contact counts');
    return { success: false, error: message };
  }
}
