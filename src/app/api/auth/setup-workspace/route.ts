import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'node-appwrite';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE } from '@/lib/appwrite/constants';
import { COLLECTION } from '@/lib/appwrite/collections';
import {
  validateSubdomain,
  normalizeSubdomain,
  isSubdomainAvailable
} from '@/lib/tenant/subdomain';
import { logger } from '@/lib/logger';
import { logAuditEventAsync, maskEmail } from '@/lib/audit/logger';

/**
 * POST /api/auth/setup-workspace
 *
 * Called after Google OAuth for new users who need to pick a subdomain.
 * Creates tenant, team, provisions DNS.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { account } = await createSessionClient();
    const user = await account.get();

    const body = await request.json();
    const subdomain = normalizeSubdomain(body.subdomain ?? '');

    if (!subdomain) {
      return NextResponse.json(
        { error: 'En subdomän krävs.' },
        { status: 400 }
      );
    }

    const subdomainError = validateSubdomain(subdomain);
    if (subdomainError) {
      return NextResponse.json({ error: subdomainError }, { status: 400 });
    }

    const available = await isSubdomainAvailable(subdomain);
    if (!available) {
      return NextResponse.json(
        { error: 'Denna subdomän är redan tagen. Välj en annan.' },
        { status: 409 }
      );
    }

    const { databases } = createAdminClient();

    // Create team
    let teamId: string | undefined;
    try {
      const { createTeam } = await import('@/lib/appwrite/teams');
      teamId = await createTeam(user.name || 'My Workspace', user.$id);
    } catch (teamErr) {
      logger.warn('Failed to create team during workspace setup', {
        err: teamErr
      });
    }

    // Create tenant document
    await databases.createDocument(
      APPWRITE_DATABASE,
      COLLECTION.TENANTS,
      ID.unique(),
      {
        name: user.name || user.email,
        plan: 'trial',
        config: JSON.stringify({
          subdomain,
          timezone: 'UTC',
          language: 'en',
          teamId,
          onboarded: false,
          companyName: '',
          industry: '',
          companySize: '',
          channels: [],
          aiSettings: {
            enabled: true,
            agentName: 'AI Agent',
            tone: 'professional',
            instructions: ''
          }
        }),
        apiKey: crypto.randomUUID().replace(/-/g, ''),
        userId: user.$id,
        subdomain
      }
    );

    // Provision DNS + Vercel domain (fire-and-forget)
    import('@/lib/dns/provision')
      .then(({ provisionSubdomain }) => provisionSubdomain(subdomain))
      .catch(() => {});

    logAuditEventAsync('system', 'auth.workspace_created', {
      email: maskEmail(user.email),
      subdomain,
      userId: user.$id
    });

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    if (rootDomain && process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        redirect: `/auth/preparing?subdomain=${subdomain}`
      });
    }

    return NextResponse.json({ redirect: '/dashboard/overview' });
  } catch (err) {
    logger.error('[Setup Workspace] Failed', { err });
    return NextResponse.json(
      { error: 'Kunde inte skapa workspace. Försök igen.' },
      { status: 500 }
    );
  }
}
