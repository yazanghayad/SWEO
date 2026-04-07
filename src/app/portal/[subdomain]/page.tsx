import { getTenantBySubdomain } from '@/lib/tenant/subdomain';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { checkIpRateLimit } from '@/lib/rate-limit';

interface PortalPageProps {
  params: Promise<{ subdomain: string }>;
}

/**
 * Public portal page served when a user visits `acme.sweo.se`.
 * This is where the embedded chat widget / help center would render.
 *
 * Rate-limited by IP to prevent subdomain enumeration.
 */
export default async function PortalPage({ params }: PortalPageProps) {
  // ── Rate limit to prevent subdomain enumeration ─────────────────────
  const hdrs = await headers();
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    hdrs.get('x-real-ip') ??
    '127.0.0.1';
  const rateLimit = await checkIpRateLimit(`portal:${ip}`);
  if (!rateLimit.success) {
    notFound();
  }

  const { subdomain } = await params;
  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    notFound();
  }

  const _config = (
    typeof tenant.config === 'string'
      ? JSON.parse(tenant.config)
      : tenant.config
  ) as Record<string, unknown>;

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900'>
      <div className='mx-auto max-w-md space-y-6 text-center'>
        <div className='bg-primary/10 text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold'>
          {tenant.name.charAt(0).toUpperCase()}
        </div>
        <h1 className='text-2xl font-bold'>{tenant.name}</h1>
        <p className='text-muted-foreground'>
          Welcome to our support portal. How can we help you today?
        </p>

        {/* Chat widget will auto-load here */}
        <div
          id='sweo-chat-container'
          data-tenant-id={tenant.$id}
          data-subdomain={subdomain}
        />

        {/*
          API key is injected server-side. This is safe — it's a public
          widget key (same as Intercom/Crisp) used only to identify the
          tenant, not to grant dashboard access.
        */}
        <script
          src='/widget/chat-widget.js'
          data-api-key={tenant.apiKey}
          data-tenant-id={tenant.$id}
          defer
        />
      </div>
    </div>
  );
}
