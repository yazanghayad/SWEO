#!/usr/bin/env node

/**
 * Seed script – creates realistic conversations & messages for all channels.
 *
 * Usage:
 *   node scripts/seed-conversations.mjs
 *
 * Looks up the first tenant and inserts sample conversations with messages
 * across all channels (web, email, whatsapp, sms, voice, instagram,
 * facebook_messenger, slack) so the inbox and profile pages show real data.
 */

import { Client, Databases, ID, Query } from 'node-appwrite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  const envFile = resolve(process.cwd(), '.env.local');
  try {
    const content = readFileSync(envFile, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}

loadEnv();

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT || !DB_ID || !API_KEY) {
  console.error('Missing required env vars. Check .env.local');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT)
  .setKey(API_KEY);

const db = new Databases(client);

// ── Helpers ──────────────────────────────────────────────────────────────────
function ago(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

// ── Seed Data ────────────────────────────────────────────────────────────────

const CONVERSATIONS = [
  // ── Facebook Messenger ──
  {
    channel: 'facebook_messenger',
    status: 'active',
    metadata: JSON.stringify({
      customerName: 'Anna Lindgren',
      customerEmail: 'anna@example.com',
      pageId: 'sweo-official',
      lastMessage: 'Hej! Jag undrar om era öppettider?'
    }),
    messages: [
      { role: 'user', content: 'Hej! Jag undrar om era öppettider?', minsAgo: 120 },
      {
        role: 'assistant',
        content:
          'Hej Anna! 👋 Vi har öppet måndag–fredag 08:00–17:00. Finns det något mer jag kan hjälpa dig med?',
        minsAgo: 119
      },
      { role: 'user', content: 'Har ni öppet på lördagar?', minsAgo: 115 },
      {
        role: 'assistant',
        content:
          'Vi har tyvärr stängt på helger, men du kan alltid nå oss via chatten eller email under kontorstid. 😊',
        minsAgo: 114
      }
    ]
  },
  {
    channel: 'facebook_messenger',
    status: 'resolved',
    metadata: JSON.stringify({
      customerName: 'Erik Johansson',
      customerEmail: 'erik.j@example.com',
      lastMessage: 'Tack för hjälpen!'
    }),
    messages: [
      { role: 'user', content: 'Hur returnerar jag en produkt?', minsAgo: 200 },
      {
        role: 'assistant',
        content:
          'Du kan enkelt starta en retur via din orderbekräftelse. Klicka på "Returnera" och följ stegen. Vill du att jag hjälper dig hitta din order?',
        minsAgo: 199
      },
      { role: 'user', content: 'Ja tack, ordernummer #12345', minsAgo: 195 },
      {
        role: 'assistant',
        content:
          'Jag har hittat din order. En returetikett har skickats till din email. Du har 14 dagar på dig.',
        minsAgo: 194
      },
      { role: 'user', content: 'Tack för hjälpen!', minsAgo: 190 }
    ]
  },

  // ── Email ──
  {
    channel: 'email',
    status: 'active',
    metadata: JSON.stringify({
      customerName: 'Maria Svensson',
      customerEmail: 'maria.svensson@company.se',
      subject: 'Fakturafråga – #INV-2024-0891',
      lastMessage: 'Jag har en fråga om min senaste faktura...'
    }),
    messages: [
      {
        role: 'user',
        content:
          'Hej,\n\nJag har en fråga om min senaste faktura #INV-2024-0891. Beloppet verkar inte stämma med det vi avtalade. Kan ni kolla på detta?\n\nMvh,\nMaria Svensson',
        minsAgo: 180
      },
      {
        role: 'assistant',
        content:
          'Hej Maria,\n\nTack för att du hör av dig. Jag har tittat på faktura #INV-2024-0891 och ser att det finns en rabatt på 15% som inte applicerats korrekt. \n\nJag har skickat en korrigerad faktura till din email. Det korrekta beloppet är 8 500 kr.\n\nHör av dig om du har fler frågor!\n\nVänliga hälsningar,\nSWEO Support',
        minsAgo: 170
      }
    ]
  },
  {
    channel: 'email',
    status: 'active',
    metadata: JSON.stringify({
      customerName: 'Johan Berg',
      customerEmail: 'johan.berg@startup.io',
      subject: 'API integration – behöver hjälp',
      lastMessage: 'Vi får 401 errors vid anrop...'
    }),
    messages: [
      {
        role: 'user',
        content:
          'Hej!\n\nVi försöker integrera ert API men får 401 Unauthorized vid varje anrop. Vi har genererat en ny API-nyckel i dashboarden.\n\nKan ni hjälpa oss?\n\nMvh Johan',
        minsAgo: 90
      },
      {
        role: 'assistant',
        content:
          'Hej Johan,\n\nDet låter som att API-nyckeln inte har rätt permissions. Kan du kontrollera att:\n\n1. API-nyckeln har "read" och "write" scope\n2. Du skickar nyckeln i Authorization-headern: `Bearer <din-nyckel>`\n3. Nyckeln inte har gått ut\n\nOm det fortfarande inte fungerar, kan du dela det exakta error-meddelandet?',
        minsAgo: 85
      },
      {
        role: 'user',
        content: 'Det var headern som saknades! Tack, fungerar nu.',
        minsAgo: 60
      }
    ]
  },

  // ── WhatsApp ──
  {
    channel: 'whatsapp',
    status: 'active',
    metadata: JSON.stringify({
      customerName: 'Sara Ahmed',
      phoneNumber: '+46701234567',
      lastMessage: 'Kan jag boka en demo?'
    }),
    messages: [
      { role: 'user', content: 'Hej! Kan jag boka en demo av er plattform?', minsAgo: 130 },
      {
        role: 'assistant',
        content:
          'Hej Sara! Absolut! 🎉 Du kan boka en demo direkt här: https://sweo.ai/demo\n\nVilken tid passar dig bäst? Vi har lediga tider imorgon kl 10:00 och 14:00.',
        minsAgo: 128
      },
      { role: 'user', content: 'Kl 14:00 imorgon funkar perfekt!', minsAgo: 125 },
      {
        role: 'assistant',
        content: 'Toppen! Du är bokad för imorgon kl 14:00. Jag skickar en kalenderinbjudan till dig. 📅',
        minsAgo: 124
      }
    ]
  },

  // ── Instagram ──
  {
    channel: 'instagram',
    status: 'active',
    metadata: JSON.stringify({
      customerName: 'Lisa Nilsson',
      instagramHandle: '@lisa.nilsson',
      lastMessage: 'Vilka planer har ni?'
    }),
    messages: [
      { role: 'user', content: 'Hej! Såg er annons, vilka planer har ni?', minsAgo: 140 },
      {
        role: 'assistant',
        content:
          'Hej Lisa! 🙌\n\nVi har tre planer:\n• Trial – Gratis i 14 dagar\n• Growth – 499 kr/mån\n• Enterprise – Anpassat pris\n\nAlla inkluderar AI Agent, Inbox och Analytics. Vill du testa gratis?',
        minsAgo: 138
      },
      { role: 'user', content: 'Ja, jag vill testa! Hur gör jag?', minsAgo: 135 },
      {
        role: 'assistant',
        content: 'Gå till sweo.ai och klicka "Start Free Trial". Du behöver bara en email! 🚀',
        minsAgo: 134
      }
    ]
  },

  // ── SMS ──
  {
    channel: 'sms',
    status: 'active',
    metadata: JSON.stringify({
      customerName: 'Oscar Holm',
      phoneNumber: '+46709876543',
      lastMessage: 'Bekräfta min bokning'
    }),
    messages: [
      { role: 'user', content: 'Hej, kan ni bekräfta min bokning för demo imorgon?', minsAgo: 100 },
      {
        role: 'assistant',
        content: 'Hej Oscar! Din demo är bokad för imorgon kl 10:00. Du får en länk via email 30 min innan. ✅',
        minsAgo: 98
      }
    ]
  },

  // ── Voice ──
  {
    channel: 'voice',
    status: 'resolved',
    metadata: JSON.stringify({
      customerName: 'Karl Eriksson',
      phoneNumber: '+46731112233',
      duration: '4m 23s',
      lastMessage: 'Samtal avslutat – ärende löst'
    }),
    messages: [
      {
        role: 'user',
        content: '[Transcription] Hej, jag ringer angående min prenumeration. Jag vill uppgradera till Growth-planen.',
        minsAgo: 160
      },
      {
        role: 'assistant',
        content:
          '[Transcription] Absolut Karl! Jag har uppgraderat ditt konto till Growth-planen. Du har nu tillgång till alla funktioner. Fakturan justeras automatiskt.',
        minsAgo: 158
      }
    ]
  },

  // ── Slack ──
  {
    channel: 'slack',
    status: 'active',
    metadata: JSON.stringify({
      customerName: 'DevOps Team',
      slackChannel: '#sweo-support',
      lastMessage: 'Webhook delivery failing'
    }),
    messages: [
      {
        role: 'user',
        content: 'Hey, our webhook endpoint is getting 504 timeouts from your side. Can you check?',
        minsAgo: 45
      },
      {
        role: 'assistant',
        content:
          'Hi! I can see the webhook deliveries to your endpoint are timing out. Your endpoint at `https://api.yourapp.com/webhooks` is responding in 35+ seconds.\n\nOur timeout is 30s. Can you optimize the endpoint or acknowledge with 200 first, then process async?',
        minsAgo: 43
      },
      {
        role: 'user',
        content: 'Good catch, we\'ll move to async processing. Thanks!',
        minsAgo: 40
      }
    ]
  },

  // ── Web (Messenger widget) ──
  {
    channel: 'web',
    status: 'active',
    metadata: JSON.stringify({
      customerName: 'Besökare',
      pageUrl: 'https://sweo.ai/pricing',
      lastMessage: 'Hur funkar er AI Agent?'
    }),
    messages: [
      { role: 'user', content: 'Hej! Hur funkar er AI Agent?', minsAgo: 30 },
      {
        role: 'assistant',
        content:
          'Hej! 👋 Vår AI Agent svarar automatiskt på kundernas frågor genom att använda din kunskapsbas. Den kan:\n\n• Svara på vanliga frågor\n• Eskalera till en människa vid behov\n• Arbeta på alla kanaler (email, chat, WhatsApp, etc.)\n\nVill du se en demo?',
        minsAgo: 29
      },
      { role: 'user', content: 'Ja, kan jag testa det direkt?', minsAgo: 25 },
      {
        role: 'assistant',
        content: 'Absolut! Du pratar med vår AI Agent just nu. 😊 Ställ valfri fråga så visar jag hur det fungerar.',
        minsAgo: 24
      }
    ]
  },
  {
    channel: 'web',
    status: 'handoff_requested',
    metadata: JSON.stringify({
      customerName: 'Frustrated User',
      pageUrl: 'https://sweo.ai/billing',
      lastMessage: 'Jag vill prata med en människa'
    }),
    messages: [
      { role: 'user', content: 'Min betalning gick inte igenom', minsAgo: 15 },
      {
        role: 'assistant',
        content: 'Jag förstår att det är frustrerande. Kan du berätta vilken betalmetod du använder?',
        minsAgo: 14
      },
      { role: 'user', content: 'Visa-kort. Jag vill prata med en människa', minsAgo: 10 },
      {
        role: 'assistant',
        content: 'Jag kopplar dig till en av våra supportagenter. Vänta en stund... 🔄',
        minsAgo: 9
      }
    ]
  }
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Seeding conversations & messages…\n');

  // Find the first tenant
  const tenantResult = await db.listDocuments(DB_ID, 'tenants', [
    Query.limit(1)
  ]);

  if (tenantResult.total === 0) {
    console.error(
      '❌ No tenants found. Create a tenant first (sign up in the app).'
    );
    process.exit(1);
  }

  const tenantId = tenantResult.documents[0].$id;
  const tenantName = tenantResult.documents[0].name;
  console.log(`Using tenant: ${tenantName} (${tenantId})\n`);

  let convCount = 0;
  let msgCount = 0;

  for (const conv of CONVERSATIONS) {
    try {
      const convDoc = await db.createDocument(
        DB_ID,
        'conversations',
        ID.unique(),
        {
          tenantId,
          channel: conv.channel,
          status: conv.status,
          userId: null,
          metadata: conv.metadata,
          resolvedAt:
            conv.status === 'resolved' ? ago(conv.messages[conv.messages.length - 1].minsAgo) : null,
          firstResponseAt: conv.messages.length > 1 ? ago(conv.messages[1].minsAgo) : null,
          csatScore: conv.status === 'resolved' ? 5 : null,
          assignedTo: null
        }
      );

      convCount++;
      const channelLabel = conv.channel.padEnd(20);
      console.log(`  ✓ ${channelLabel} → ${convDoc.$id}`);

      // Insert messages
      for (const msg of conv.messages) {
        await db.createDocument(DB_ID, 'messages', ID.unique(), {
          conversationId: convDoc.$id,
          role: msg.role,
          content: msg.content,
          confidence: msg.role === 'assistant' ? 0.92 : null,
          citations: null,
          metadata: null
        });
        msgCount++;
      }
    } catch (err) {
      console.error(`  ✗ ${conv.channel}: ${err.message}`);
    }
  }

  console.log(
    `\n✅ Seeded ${convCount} conversations with ${msgCount} messages.`
  );
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
