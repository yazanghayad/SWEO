import type { NextConfig } from 'next';

// NOTE: @sentry/nextjs withSentryConfig is intentionally NOT used.
// Next.js 16 replaced middleware.ts with proxy.ts, but Sentry's build
// plugin still tries to instrument middleware.ts, causing:
//   ENOENT: no such file or directory, open '...middleware.js.nft.json'
// Sentry runtime instrumentation works via src/instrumentation.ts and
// src/instrumentation-client.ts without the build plugin.

// ── Security headers applied to all responses ───────────────────────────
const securityHeaders = [
  {
    // Prevent MIME-sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    // Prevent clickjacking
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    // Only send origin as referrer to external sites
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    // Enforce HTTPS (1 year, include subdomains, allow preloading)
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    // Restrict browser features
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  // CSP is set dynamically in middleware.ts (nonce-based).
  // Widget API routes have their own static CSP below.
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  }
];

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  headers: async () => [
    {
      // Apply security headers to all routes
      source: '/(.*)',
      headers: securityHeaders
    },
    {
      // Widget JS needs to be embeddable — relax frame-ancestors & CSP
      source: '/api/widget/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'ALLOWALL' },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; frame-ancestors *;"
        }
      ]
    }
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        // Appwrite Storage (buckets)
        protocol: 'https',
        hostname: '*.cloud.appwrite.io'
      }
    ]
  },
  transpilePackages: ['geist'],
  serverExternalPackages: ['node-appwrite'],
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  experimental: {
    serverActions: {
      allowedOrigins: [
        'sweo.se',
        '*.sweo.se',
        '*.app.github.dev',
        '*.github.dev',
        '*.preview.app.github.dev',
        '*.githubpreview.dev',
        // Include localhost only in development
        ...(process.env.NODE_ENV !== 'production'
          ? ['localhost:3000', 'localhost:3001']
          : []),
        // Explicit codespace hostname
        ...(process.env.CODESPACE_NAME
          ? [
              `${process.env.CODESPACE_NAME}-3000.app.github.dev`,
              `${process.env.CODESPACE_NAME}-3001.app.github.dev`
            ]
          : [])
      ]
    }
  }
};

const nextConfig = baseConfig;
export default nextConfig;
