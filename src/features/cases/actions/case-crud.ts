'use server';

import { Query, ID } from 'node-appwrite';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import type {
  Case,
  CaseType,
  CaseStatus,
  CasePriority,
  CaseNote,
  CaseDocument,
  CaseTimelineEvent,
  CaseTimelineEventType
} from '@/types/appwrite';
import { safeError } from '@/lib/safe-error';
import { logAuditEventAsync } from '@/lib/audit/logger';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAuthenticatedUser(): Promise<{
  userId: string;
  userName: string;
  tenantId: string;
}> {
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
  return {
    userId: user.$id,
    userName: user.name || user.email || 'Unknown',
    tenantId: tenants.documents[0].$id
  };
}

function serializeDoc<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

// ---------------------------------------------------------------------------
// Timeline helper — adds an event to the case_timeline collection
// ---------------------------------------------------------------------------

async function addTimelineEvent(
  tenantId: string,
  caseId: string,
  eventType: CaseTimelineEventType,
  actorId: string | null,
  actorName: string,
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { databases } = createAdminClient();
  await databases.createDocument(
    APPWRITE_DATABASE,
    COLLECTION.CASE_TIMELINE,
    ID.unique(),
    {
      tenantId,
      caseId,
      eventType,
      actorId,
      actorName,
      description,
      metadata: JSON.stringify(metadata ?? {})
    }
  );
}

// ---------------------------------------------------------------------------
// List cases
// ---------------------------------------------------------------------------

export async function listCases(options?: {
  status?: CaseStatus;
  type?: CaseType;
  priority?: CasePriority;
  assignedTo?: string;
  contactId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data?: Case[];
  total?: number;
  error?: string;
}> {
  try {
    const { tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    const queries: string[] = [
      Query.equal('tenantId', tenantId),
      Query.limit(options?.limit ?? 50),
      Query.offset(options?.offset ?? 0),
      Query.orderDesc('$createdAt')
    ];

    if (options?.status) queries.push(Query.equal('status', options.status));
    if (options?.type) queries.push(Query.equal('type', options.type));
    if (options?.priority)
      queries.push(Query.equal('priority', options.priority));
    if (options?.assignedTo)
      queries.push(Query.equal('assignedTo', options.assignedTo));
    if (options?.contactId)
      queries.push(Query.equal('contactId', options.contactId));
    if (options?.search)
      queries.push(Query.search('subject', options.search));

    const result = await databases.listDocuments<Case>(
      APPWRITE_DATABASE,
      COLLECTION.CASES,
      queries
    );

    return {
      success: true,
      data: result.documents.map(serializeDoc),
      total: result.total
    };
  } catch (err: unknown) {
    return { success: false, error: safeError(err, 'Failed to list cases') };
  }
}

// ---------------------------------------------------------------------------
// Get case counts by status
// ---------------------------------------------------------------------------

export async function getCaseCounts(): Promise<{
  success: boolean;
  data?: Record<string, number>;
  error?: string;
}> {
  try {
    const { tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    const statuses: CaseStatus[] = [
      'open',
      'in_progress',
      'awaiting_customer',
      'awaiting_internal',
      'resolved',
      'closed'
    ];

    const counts: Record<string, number> = {};
    let total = 0;

    for (const status of statuses) {
      const result = await databases.listDocuments(
        APPWRITE_DATABASE,
        COLLECTION.CASES,
        [
          Query.equal('tenantId', tenantId),
          Query.equal('status', status),
          Query.limit(0)
        ]
      );
      counts[status] = result.total;
      total += result.total;
    }
    counts.all = total;

    return { success: true, data: counts };
  } catch (err: unknown) {
    return {
      success: false,
      error: safeError(err, 'Failed to get case counts')
    };
  }
}

// ---------------------------------------------------------------------------
// Get single case
// ---------------------------------------------------------------------------

export async function getCase(
  caseId: string
): Promise<{ success: boolean; data?: Case; error?: string }> {
  try {
    const { tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    const doc = await databases.getDocument<Case>(
      APPWRITE_DATABASE,
      COLLECTION.CASES,
      caseId
    );

    if (doc.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    return { success: false, error: safeError(err, 'Failed to get case') };
  }
}

// ---------------------------------------------------------------------------
// Create case
// ---------------------------------------------------------------------------

export async function createCase(input: {
  type: CaseType;
  priority: CasePriority;
  subject: string;
  description?: string;
  contactId?: string;
  conversationId?: string;
  assignedTo?: string;
  dueDate?: string;
  tags?: string[];
}): Promise<{ success: boolean; data?: Case; error?: string }> {
  try {
    const { userId, userName, tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    const doc = await databases.createDocument<Case>(
      APPWRITE_DATABASE,
      COLLECTION.CASES,
      ID.unique(),
      {
        tenantId,
        contactId: input.contactId ?? null,
        conversationId: input.conversationId ?? null,
        type: input.type,
        status: 'open',
        priority: input.priority,
        subject: input.subject,
        description: input.description ?? '',
        assignedTo: input.assignedTo ?? null,
        dueDate: input.dueDate ?? null,
        resolvedAt: null,
        tags: JSON.stringify(input.tags ?? []),
        metadata: JSON.stringify({})
      }
    );

    await addTimelineEvent(
      tenantId,
      doc.$id,
      'created',
      userId,
      userName,
      `Case created: ${input.subject}`
    );

    if (input.conversationId) {
      await addTimelineEvent(
        tenantId,
        doc.$id,
        'linked_conversation',
        userId,
        userName,
        `Linked conversation ${input.conversationId}`,
        { conversationId: input.conversationId }
      );
    }

    logAuditEventAsync(tenantId, 'case.created', {
      caseId: doc.$id,
      type: input.type,
      priority: input.priority
    }, userId);

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    return { success: false, error: safeError(err, 'Failed to create case') };
  }
}

// ---------------------------------------------------------------------------
// Update case
// ---------------------------------------------------------------------------

export async function updateCase(
  caseId: string,
  updates: {
    status?: CaseStatus;
    priority?: CasePriority;
    subject?: string;
    description?: string;
    assignedTo?: string | null;
    dueDate?: string | null;
    type?: CaseType;
    tags?: string[];
  }
): Promise<{ success: boolean; data?: Case; error?: string }> {
  try {
    const { userId, userName, tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    // Fetch current state for timeline diffing
    const current = await databases.getDocument<Case>(
      APPWRITE_DATABASE,
      COLLECTION.CASES,
      caseId
    );

    if (current.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    // Build update payload
    const payload: Record<string, unknown> = {};
    if (updates.subject !== undefined) payload.subject = updates.subject;
    if (updates.description !== undefined)
      payload.description = updates.description;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate;
    if (updates.tags !== undefined)
      payload.tags = JSON.stringify(updates.tags);

    // Status change
    if (updates.status && updates.status !== current.status) {
      payload.status = updates.status;
      if (updates.status === 'resolved') {
        payload.resolvedAt = new Date().toISOString();
      }
      await addTimelineEvent(
        tenantId,
        caseId,
        updates.status === 'resolved'
          ? 'resolved'
          : updates.status === 'open' && current.status === 'resolved'
            ? 'reopened'
            : 'status_changed',
        userId,
        userName,
        `Status changed from ${current.status} to ${updates.status}`,
        { from: current.status, to: updates.status }
      );
    }

    // Priority change
    if (updates.priority && updates.priority !== current.priority) {
      payload.priority = updates.priority;
      await addTimelineEvent(
        tenantId,
        caseId,
        'priority_changed',
        userId,
        userName,
        `Priority changed from ${current.priority} to ${updates.priority}`,
        { from: current.priority, to: updates.priority }
      );
    }

    // Assignment change
    if (updates.assignedTo !== undefined) {
      payload.assignedTo = updates.assignedTo;
      if (updates.assignedTo !== current.assignedTo) {
        await addTimelineEvent(
          tenantId,
          caseId,
          'assigned',
          userId,
          userName,
          updates.assignedTo
            ? `Assigned to ${updates.assignedTo}`
            : 'Unassigned',
          { from: current.assignedTo, to: updates.assignedTo }
        );
      }
    }

    const doc = await databases.updateDocument<Case>(
      APPWRITE_DATABASE,
      COLLECTION.CASES,
      caseId,
      payload
    );

    logAuditEventAsync(tenantId, 'case.updated', {
      caseId,
      updates: Object.keys(payload)
    }, userId);

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    return { success: false, error: safeError(err, 'Failed to update case') };
  }
}

// ---------------------------------------------------------------------------
// Delete case
// ---------------------------------------------------------------------------

export async function deleteCase(
  caseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    const doc = await databases.getDocument<Case>(
      APPWRITE_DATABASE,
      COLLECTION.CASES,
      caseId
    );

    if (doc.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    // Delete related docs first
    const [notes, docs, timeline] = await Promise.all([
      databases.listDocuments(APPWRITE_DATABASE, COLLECTION.CASE_NOTES, [
        Query.equal('caseId', caseId),
        Query.limit(500)
      ]),
      databases.listDocuments(APPWRITE_DATABASE, COLLECTION.CASE_DOCUMENTS, [
        Query.equal('caseId', caseId),
        Query.limit(500)
      ]),
      databases.listDocuments(APPWRITE_DATABASE, COLLECTION.CASE_TIMELINE, [
        Query.equal('caseId', caseId),
        Query.limit(500)
      ])
    ]);

    const deletions = [
      ...notes.documents.map((d) =>
        databases.deleteDocument(
          APPWRITE_DATABASE,
          COLLECTION.CASE_NOTES,
          d.$id
        )
      ),
      ...docs.documents.map((d) =>
        databases.deleteDocument(
          APPWRITE_DATABASE,
          COLLECTION.CASE_DOCUMENTS,
          d.$id
        )
      ),
      ...timeline.documents.map((d) =>
        databases.deleteDocument(
          APPWRITE_DATABASE,
          COLLECTION.CASE_TIMELINE,
          d.$id
        )
      )
    ];
    await Promise.all(deletions);

    await databases.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTION.CASES,
      caseId
    );

    logAuditEventAsync(tenantId, 'case.deleted', { caseId }, userId);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: safeError(err, 'Failed to delete case') };
  }
}

// ---------------------------------------------------------------------------
// Add note
// ---------------------------------------------------------------------------

export async function addCaseNote(
  caseId: string,
  content: string
): Promise<{ success: boolean; data?: CaseNote; error?: string }> {
  try {
    const { userId, userName, tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    // Verify ownership
    const caseDoc = await databases.getDocument<Case>(
      APPWRITE_DATABASE,
      COLLECTION.CASES,
      caseId
    );
    if (caseDoc.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    const note = await databases.createDocument<CaseNote>(
      APPWRITE_DATABASE,
      COLLECTION.CASE_NOTES,
      ID.unique(),
      {
        tenantId,
        caseId,
        authorId: userId,
        authorName: userName,
        content
      }
    );

    await addTimelineEvent(
      tenantId,
      caseId,
      'note_added',
      userId,
      userName,
      'Added a note'
    );

    return { success: true, data: serializeDoc(note) };
  } catch (err: unknown) {
    return { success: false, error: safeError(err, 'Failed to add note') };
  }
}

// ---------------------------------------------------------------------------
// List notes
// ---------------------------------------------------------------------------

export async function listCaseNotes(
  caseId: string
): Promise<{ success: boolean; data?: CaseNote[]; error?: string }> {
  try {
    const { tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    const result = await databases.listDocuments<CaseNote>(
      APPWRITE_DATABASE,
      COLLECTION.CASE_NOTES,
      [
        Query.equal('caseId', caseId),
        Query.equal('tenantId', tenantId),
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ]
    );

    return { success: true, data: result.documents.map(serializeDoc) };
  } catch (err: unknown) {
    return { success: false, error: safeError(err, 'Failed to list notes') };
  }
}

// ---------------------------------------------------------------------------
// List timeline events
// ---------------------------------------------------------------------------

export async function listCaseTimeline(
  caseId: string
): Promise<{ success: boolean; data?: CaseTimelineEvent[]; error?: string }> {
  try {
    const { tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    const result = await databases.listDocuments<CaseTimelineEvent>(
      APPWRITE_DATABASE,
      COLLECTION.CASE_TIMELINE,
      [
        Query.equal('caseId', caseId),
        Query.equal('tenantId', tenantId),
        Query.orderAsc('$createdAt'),
        Query.limit(200)
      ]
    );

    return { success: true, data: result.documents.map(serializeDoc) };
  } catch (err: unknown) {
    return {
      success: false,
      error: safeError(err, 'Failed to list timeline')
    };
  }
}

// ---------------------------------------------------------------------------
// Upload document to case
// ---------------------------------------------------------------------------

export async function addCaseDocument(
  caseId: string,
  fileData: {
    fileId: string;
    fileName: string;
    fileMimeType: string;
    fileSize: number;
  }
): Promise<{ success: boolean; data?: CaseDocument; error?: string }> {
  try {
    const { userId, userName, tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    // Verify ownership
    const caseDoc = await databases.getDocument<Case>(
      APPWRITE_DATABASE,
      COLLECTION.CASES,
      caseId
    );
    if (caseDoc.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    const doc = await databases.createDocument<CaseDocument>(
      APPWRITE_DATABASE,
      COLLECTION.CASE_DOCUMENTS,
      ID.unique(),
      {
        tenantId,
        caseId,
        fileId: fileData.fileId,
        fileName: fileData.fileName,
        fileMimeType: fileData.fileMimeType,
        fileSize: fileData.fileSize,
        uploadedBy: userId
      }
    );

    await addTimelineEvent(
      tenantId,
      caseId,
      'document_added',
      userId,
      userName,
      `Uploaded document: ${fileData.fileName}`,
      { fileId: fileData.fileId, fileName: fileData.fileName }
    );

    return { success: true, data: serializeDoc(doc) };
  } catch (err: unknown) {
    return {
      success: false,
      error: safeError(err, 'Failed to add document')
    };
  }
}

// ---------------------------------------------------------------------------
// List case documents
// ---------------------------------------------------------------------------

export async function listCaseDocuments(
  caseId: string
): Promise<{ success: boolean; data?: CaseDocument[]; error?: string }> {
  try {
    const { tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    const result = await databases.listDocuments<CaseDocument>(
      APPWRITE_DATABASE,
      COLLECTION.CASE_DOCUMENTS,
      [
        Query.equal('caseId', caseId),
        Query.equal('tenantId', tenantId),
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ]
    );

    return { success: true, data: result.documents.map(serializeDoc) };
  } catch (err: unknown) {
    return {
      success: false,
      error: safeError(err, 'Failed to list documents')
    };
  }
}

// ---------------------------------------------------------------------------
// Delete case document
// ---------------------------------------------------------------------------

export async function deleteCaseDocument(
  documentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, userName, tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    const doc = await databases.getDocument<CaseDocument>(
      APPWRITE_DATABASE,
      COLLECTION.CASE_DOCUMENTS,
      documentId
    );

    if (doc.tenantId !== tenantId) {
      return { success: false, error: 'Access denied' };
    }

    await databases.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTION.CASE_DOCUMENTS,
      documentId
    );

    await addTimelineEvent(
      tenantId,
      doc.caseId,
      'document_removed',
      userId,
      userName,
      `Removed document: ${doc.fileName}`,
      { fileId: doc.fileId, fileName: doc.fileName }
    );

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: safeError(err, 'Failed to delete document')
    };
  }
}

// ---------------------------------------------------------------------------
// List cases for a contact (used in contact detail)
// ---------------------------------------------------------------------------

export async function listCasesForContact(
  contactId: string
): Promise<{ success: boolean; data?: Case[]; error?: string }> {
  try {
    const { tenantId } = await getAuthenticatedUser();
    const { databases } = createAdminClient();

    const result = await databases.listDocuments<Case>(
      APPWRITE_DATABASE,
      COLLECTION.CASES,
      [
        Query.equal('tenantId', tenantId),
        Query.equal('contactId', contactId),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]
    );

    return { success: true, data: result.documents.map(serializeDoc) };
  } catch (err: unknown) {
    return {
      success: false,
      error: safeError(err, 'Failed to list cases for contact')
    };
  }
}
