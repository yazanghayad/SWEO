#!/usr/bin/env node
/**
 * Generate Swedish page files for remaining landing pages (batch 2)
 * These are massive inline JSX pages - we do string replacements for:
 * 1. Metadata (title, description)
 * 2. Function name (add Sv prefix)
 * 3. Common English UI strings → Swedish
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const BASE = process.cwd();
const EN_DIR = join(BASE, 'src/app/(landing)');
const SV_DIR = join(BASE, 'src/app/sv/(landing)');

// Pages to generate with their Swedish metadata
const pages = [
  {
    slug: 'capabilities',
    fnName: 'CapabilitiesPage',
    svFnName: 'SvCapabilitiesPage',
    title: 'SWEO AI-agent: Funktioner & kapaciteter',
    description: 'Utforska SWEO AI-agentens kompletta funktionsuppsättning: Träna, Testa, Distribuera och Analysera. Upptäck hur SWEO levererar branschledande AI-kundtjänst.',
  },
  {
    slug: 'contact-sales',
    fnName: 'ContactSalesPage',
    svFnName: 'SvContactSalesPage',
    title: 'Kontakta sälj | SWEO AI-agent',
    description: 'Upptäck vad SWEO kan göra för din kundtjänst. Kontakta vårt säljteam för att lära dig mer om världens främsta AI-agent.',
  },
  {
    slug: 'glossary',
    fnName: 'GlossaryPage',
    svFnName: 'SvGlossaryPage',
    title: 'AI-kundtjänst ordlista | SWEO',
    description: 'Utforska viktiga termer och definitioner inom AI-kundtjänst, från AI-agenter till lösningsgrad. Din kompletta guide till modern kundtjänstteknik.',
  },
  {
    slug: 'guarantee',
    fnName: 'GuaranteePage',
    svFnName: 'SvGuaranteePage',
    title: 'SWEO AI-agentgaranti',
    description: 'SWEO erbjuder en resultatgaranti för vår AI-agent. Upptäck hur vi säkerställer kundnöjdhet och prestanda.',
  },
  {
    slug: 'integrations',
    fnName: 'IntegrationsPage',
    svFnName: 'SvIntegrationsPage',
    title: 'SWEO AI-agent integrationer',
    description: 'Integrera SWEO AI-agenten med dina befintliga verktyg och system. Shopify, Stripe, Salesforce, Zendesk och fler.',
  },
  {
    slug: 'pricing',
    fnName: 'PricingPage',
    svFnName: 'SvPricingPage',
    title: 'Priser | SWEO AI-agent',
    description: 'Flexibla prisplaner för SWEO AI-agenten. Betala per löst ärende med branschens bästa AI-kundtjänst.',
  },
  {
    slug: 'professional-services',
    fnName: 'ProfessionalServicesPage',
    svFnName: 'SvProfessionalServicesPage',
    title: 'Professionella tjänster | SWEO AI',
    description: 'Få experthjälp med att implementera och optimera SWEO AI-agenten. Vårt team hjälper dig att maximera din AI-investering.',
  },
  {
    slug: 'salesforce-integration',
    fnName: 'SalesforceIntegrationPage',
    svFnName: 'SvSalesforceIntegrationPage',
    title: 'Salesforce-integration | SWEO AI-agent',
    description: 'Integrera SWEO AI-agenten med Salesforce. Leverera AI-driven kundtjänst direkt i din Salesforce-miljö.',
  },
  {
    slug: 'solutions/ecommerce',
    fnName: 'EcommercePage',
    svFnName: 'SvEcommercePage',
    title: 'AI-kundtjänst för e-handel | SWEO',
    description: 'SWEO AI-agent för e-handelsföretag. Automatisera orderfrågor, returer och produktsupport med branschledande AI.',
  },
  {
    slug: 'solutions/enterprise',
    fnName: 'EnterprisePage',
    svFnName: 'SvEnterprisePage',
    title: 'Enterprise AI-kundtjänst | SWEO',
    description: 'SWEO AI-agent för företag. Företagsklassad säkerhet, skalbarhet och efterlevnad för de mest krävande organisationerna.',
  },
  {
    slug: 'solutions/financial-services',
    fnName: 'FinancialServicesPage',
    svFnName: 'SvFinancialServicesPage',
    title: 'AI-kundtjänst för finansiella tjänster | SWEO',
    description: 'SWEO AI-agent för finansiella tjänster. Säker, kompatibel och intelligent kundtjänst för banker och försäkringsbolag.',
  },
  {
    slug: 'solutions/gaming',
    fnName: 'GamingPage',
    svFnName: 'SvGamingPage',
    title: 'AI-kundtjänst för gaming | SWEO',
    description: 'SWEO AI-agent för spelbranschen. Hantera spelarfrågor, kontoproblematik och teknisk support med AI.',
  },
  {
    slug: 'solutions/technology',
    fnName: 'TechnologyPage',
    svFnName: 'SvTechnologyPage',
    title: 'AI-kundtjänst för teknikföretag | SWEO',
    description: 'SWEO AI-agent för teknikföretag. Skala din kundsupport med intelligent AI som förstår tekniska frågor.',
  },
  {
    slug: 'updates',
    fnName: 'UpdatesPage',
    svFnName: 'SvUpdatesPage',
    title: 'Uppdateringar | SWEO AI-agent',
    description: 'De senaste uppdateringarna och nyheterna om SWEO AI-agenten. Nya funktioner, förbättringar och produktnyheter.',
  },
  {
    slug: 'view-demos',
    fnName: 'ViewDemosPage',
    svFnName: 'SvViewDemosPage',
    title: 'Se demos | SWEO AI-agent',
    description: 'Se SWEO AI-agenten i aktion. Boka en demo och upptäck hur SWEO kan transformera din kundtjänst.',
  },
  {
    slug: 'zendesk-integration',
    fnName: 'ZendeskIntegrationPage',
    svFnName: 'SvZendeskIntegrationPage',
    title: 'Zendesk-integration | SWEO AI-agent',
    description: 'Integrera SWEO AI-agenten med Zendesk. Leverera AI-driven kundtjänst direkt i din Zendesk-miljö.',
  },
];

// Common text replacements (English → Swedish)
const textReplacements = [
  // CTA buttons
  ['Start free trial', 'Starta gratis provperiod'],
  ['Start Free Trial', 'Starta gratis provperiod'],
  ['View demo', 'Se demo'],
  ['View Demo', 'Se demo'],
  ['View demos', 'Se demos'],
  ['View Demos', 'Se demos'],
  ['Learn more', 'Läs mer'],
  ['Learn More', 'Läs mer'],
  ['Get started', 'Kom igång'],
  ['Get Started', 'Kom igång'],
  ['Contact sales', 'Kontakta sälj'],
  ['Contact Sales', 'Kontakta sälj'],
  ['Book a demo', 'Boka en demo'],
  ['Book a Demo', 'Boka en demo'],
  ['Watch video', 'Se video'],
  ['Watch Video', 'Se video'],
  ['Read more', 'Läs mer'],
  ['Read More', 'Läs mer'],
  ['See how', 'Se hur'],
  ['Try for free', 'Testa gratis'],
  ['Sign up', 'Registrera dig'],
  ['Sign Up', 'Registrera dig'],
  ['Request demo', 'Begär demo'],
  ['Request Demo', 'Begär demo'],

  // Navigation/section labels
  ['Featured Capabilities:', 'Utvalda funktioner:'],
  ['Featured Channels:', 'Utvalda kanaler:'],
  ['Featured capabilities:', 'Utvalda funktioner:'],

  // Brand references - Fin → SWEO
  ['Fin AI Agent', 'SWEO AI-agent'],
  ['Fin AI agent', 'SWEO AI-agent'],
  ["Fin\\'s AI Engine", 'SWEOs AI Engine'],
  ['The #1 AI Agent', 'Sveriges #1 AI-agent'],
  ['the #1 AI Agent', 'Sveriges #1 AI-agent'],
  ['#1 AI Agent', '#1 AI-agent'],

  // FAQ label
  ['>FAQs<', '>Vanliga frågor<'],
];

let generated = 0;

for (const page of pages) {
  const enPath = join(EN_DIR, page.slug, 'page.tsx');
  const svPath = join(SV_DIR, page.slug, 'page.tsx');

  if (!existsSync(enPath)) {
    console.warn(`⚠️  English source not found: ${page.slug}`);
    continue;
  }

  // Read English source
  let content = readFileSync(enPath, 'utf-8');

  // 1. Replace metadata
  content = content.replace(
    /title:\s*['"`]([^'"`]*?)['"`]/,
    `title: '${page.title}'`
  );
  content = content.replace(
    /description:\s*['"`]([^'"`]*?)['"`]/,
    `description: '${page.description}'`
  );
  // Handle template literal descriptions
  content = content.replace(
    /description:\s*["`]([^"`]*?)["`]/,
    `description: '${page.description}'`
  );

  // 2. Replace function name
  content = content.replace(
    `function ${page.fnName}`,
    `function ${page.svFnName}`
  );
  // Also handle default export patterns where function name appears
  content = content.replace(
    new RegExp(`export default function ${page.fnName}`),
    `export default function ${page.svFnName}`
  );

  // 3. Apply common text replacements
  for (const [en, sv] of textReplacements) {
    // Replace in JSX text content (between > and <)
    content = content.replaceAll(`>${en}<`, `>${sv}<`);
    // Replace in JSX text content with quotes
    content = content.replaceAll(`">${en}<`, `">${sv}<`);
  }

  // Ensure directory exists
  const dir = dirname(svPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(svPath, content, 'utf-8');
  generated++;
  console.log(`✅ Generated: /sv/${page.slug}`);
}

console.log(`\n🎉 Generated ${generated}/${pages.length} Swedish pages`);
