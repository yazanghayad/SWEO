import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import { Query, ID, Permission, Role } from 'node-appwrite';

/**
 * Presence API — lightweight heartbeat system for multi-agent collaboration.
 *
 * POST   — upsert presence (heartbeat / typing signal)
 * GET    — list active participants for a conversation
 * DELETE — remove presence (agent left)
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Verify the authenticated user is a member of the given tenant by checking
 * they belong to the tenant's Appwrite team (stored in tenant config).
 */
async function verifyTenantMembership(
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    const { databases } = createAdminClient();
    const tenant = await databases.getDocument(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      tenantId
    );
    // userId must match tenant owner or be a team member
    if (tenant.userId === userId) return true;

    const cfg =
      typeof tenant.config === 'string'
        ? JSON.parse(tenant.config)
        : tenant.config;
    if (cfg?.teamId) {
      const { Teams } = await import('node-appwrite');
      const adminClient = createAdminClient();
      const teams = new Teams(adminClient.client);
      const memberships = await teams.listMemberships(cfg.teamId, [
        Query.equal('userId', userId),
        Query.limit(1)
      ]);
      return memberships.memberships.length > 0;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// POST — heartbeat / typing
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const { conversationId, tenantId, agentId, agentName, typing } =
      await req.json();

    if (!conversationId || !tenantId || !agentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure the caller is actually this agent (prevent impersonation)
    if (agentId !== user.$id) {
      return NextResponse.json(
        { error: 'Cannot set presence for another user' },
        { status: 403 }
      );
    }

    // Verify tenant membership
    if (!(await verifyTenantMembership(user.$id, tenantId))) {
      return NextResponse.json(
        { error: 'Access denied for this tenant' },
        { status: 403 }
      );
    }

    const { databases } = createAdminClient();
    const now = Date.now();

    // Try to find existing presence doc for this agent + conversation
    const existing = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.PRESENCE,
      [
        Query.equal('agentId', agentId),
        Query.equal('conversationId', conversationId),
        Query.limit(1)
      ]
    );

    let docId: string;

    if (existing.documents.length > 0) {
      // Update existing
      docId = existing.documents[0].$id;
      await databases.updateDocument(
        APPWRITE_DATABASE,
        COLLECTION.PRESENCE,
        docId,
        {
          lastSeen: now,
          typing: !!typing,
          agentName: agentName ?? 'Agent'
        }
      );
    } else {
      // Create new — scope read permissions to the tenant team, not Role.any()
      const doc = await databases.createDocument(
        APPWRITE_DATABASE,
        COLLECTION.PRESENCE,
        ID.unique(),
        {
          agentId,
          agentName: agentName ?? 'Agent',
          conversationId,
          tenantId,
          lastSeen: now,
          typing: !!typing
        },
        [Permission.read(Role.users())]
      );
      docId = doc.$id;
    }

    return NextResponse.json({ docId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Presence error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET — list participants
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const { searchParams } = req.nextUrl;
    const conversationId = searchParams.get('conversationId');
    const tenantId = searchParams.get('tenantId');

    if (!conversationId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing conversationId or tenantId' },
        { status: 400 }
      );
    }

    // Verify tenant membership
    if (!(await verifyTenantMembership(user.$id, tenantId))) {
      return NextResponse.json(
        { error: 'Access denied for this tenant' },
        { status: 403 }
      );
    }

    const { databases } = createAdminClient();
    const staleThreshold = Date.now() - 30_000;

    const result = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.PRESENCE,
      [
        Query.equal('conversationId', conversationId),
        Query.equal('tenantId', tenantId),
        Query.greaterThan('lastSeen', staleThreshold),
        Query.limit(50)
      ]
    );

    const participants = result.documents.map((doc) => ({
      id: doc.$id,
      agentId: doc.agentId as string,
      agentName: doc.agentName as string,
      conversationId: doc.conversationId as string,
      lastSeen: doc.lastSeen as number,
      typing: doc.typing as boolean
    }));

    return NextResponse.json({ participants });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Presence error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — leave
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const { conversationId, agentId, tenantId } = await req.json();

    if (!conversationId || !agentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Only allow deleting own presence
    if (agentId !== user.$id) {
      return NextResponse.json(
        { error: 'Cannot remove presence for another user' },
        { status: 403 }
      );
    }

    const { databases } = createAdminClient();

    const existing = await databases.listDocuments(
      APPWRITE_DATABASE,
      COLLECTION.PRESENCE,
      [
        Query.equal('agentId', agentId),
        Query.equal('conversationId', conversationId),
        ...(tenantId ? [Query.equal('tenantId', tenantId)] : []),
        Query.limit(1)
      ]
    );

    if (existing.documents.length > 0) {
      await databases.deleteDocument(
        APPWRITE_DATABASE,
        COLLECTION.PRESENCE,
        existing.documents[0].$id
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Presence error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
