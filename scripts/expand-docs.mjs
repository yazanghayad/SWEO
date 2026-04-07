#!/usr/bin/env node
/**
 * Expand thin docs articles and add new articles for recent features.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'src', 'config', 'docs-data.json');

const data = JSON.parse(readFileSync(dataPath, 'utf-8'));

// ── Helper ──
function findCategory(slug) {
  return data.find(c => c.slug === slug);
}
function findArticle(catSlug, artSlug) {
  const cat = findCategory(catSlug);
  return cat?.articles.find(a => a.slug === artSlug);
}
function replaceArticle(catSlug, artSlug, newArticle) {
  const cat = findCategory(catSlug);
  const idx = cat.articles.findIndex(a => a.slug === artSlug);
  if (idx >= 0) cat.articles[idx] = newArticle;
}
function addArticle(catSlug, article) {
  const cat = findCategory(catSlug);
  if (!cat.articles.find(a => a.slug === article.slug)) {
    cat.articles.push(article);
  }
}
function addCategory(category) {
  if (!data.find(c => c.slug === category.slug)) {
    data.push(category);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. EXPAND THIN ARTICLES
// ═══════════════════════════════════════════════════════════════════════════

// ── integrations/crm-integration (1695 → ~4000 chars) ──
replaceArticle('integrations', 'crm-integration', {
  slug: 'crm-integration',
  title: 'CRM & Kontakthantering',
  description: 'Synkronisera kontakter med ditt CRM och använd AI-driven kontaktberikning.',
  sections: [
    {
      id: 'contacts-overview',
      title: 'Kontakter i SWEO AI',
      content: `<p>Varje person som interagerar med din AI-agent eller ditt supportteam skapas automatiskt som en <strong>kontakt</strong> i SWEO AI. Kontakter samlar all information på ett ställe:</p><ul><li><strong>Grunddata</strong> — namn, e-post, telefon, företag, roll</li><li><strong>Konversationshistorik</strong> — alla tidigare ärenden och meddelanden</li><li><strong>Taggar &amp; segment</strong> — automatiska och manuella etiketter</li><li><strong>Custom attributes</strong> — egna fält som du definierar (t.ex. kundnummer, plan, land)</li><li><strong>Aktivitetslogg</strong> — sidvisningar, widget-interaktioner, e-postöppningar</li></ul><p>Gå till <a href='/dashboard/contacts'>Contacts</a> för att se alla kontakter. Klicka på en kontakt för att se profilen med fullständig historik.</p>`
    },
    {
      id: 'contact-fields',
      title: 'Custom contact attributes',
      content: `<p>Du kan skapa egna fält för att lagra branschspecifik data om dina kontakter:</p><ol><li>Gå till <a href='/dashboard/settings'>Settings → Contact Attributes</a></li><li>Klicka <em>Add Attribute</em></li><li>Välj typ: <code>text</code>, <code>number</code>, <code>date</code>, <code>boolean</code>, <code>select</code></li><li>Ange namn och valfritt standardvärde</li></ol><p>Custom attributes kan användas i:</p><ul><li><strong>Audience-regler</strong> i Outbound — filtrera kampanjer baserat på attribut</li><li><strong>Procedures</strong> — villkorsstyra flöden baserat på kontaktdata</li><li><strong>Inbox</strong> — visa relevant kundinformation i sidopanelen</li></ul><p>Exempel: Skapa attributet <code>subscription_plan</code> (select: free/growth/enterprise) för att segmentera kunder efter plan.</p>`
    },
    {
      id: 'crm-sync',
      title: 'Synkronisering med externt CRM',
      content: `<p>SWEO AI kan synkronisera kontakter bidirektionellt med populära CRM-system:</p><table><thead><tr><th>CRM</th><th>Synktyp</th><th>Metod</th></tr></thead><tbody><tr><td>Salesforce</td><td>Bi-direktionell</td><td>OAuth + REST API</td></tr><tr><td>HubSpot</td><td>Bi-direktionell</td><td>OAuth + REST API</td></tr><tr><td>Zendesk</td><td>Bi-direktionell</td><td>API-nyckel</td></tr><tr><td>Pipedrive</td><td>Push</td><td>Webhook</td></tr><tr><td>Custom CRM</td><td>Valfri</td><td>Webhook / REST API</td></tr></tbody></table><p>Konfigurera under <a href='/dashboard/connectors'>Connectors</a>:</p><ol><li>Välj CRM-provider</li><li>Autentisera via OAuth eller API-nyckel</li><li>Mappa fält (SWEO-fält ↔ CRM-fält)</li><li>Välj synkfrekvens: realtid, var 5:e minut, eller dagligen</li><li>Aktivera och verifiera med testsynk</li></ol><p><strong>Konflikthantering:</strong> Vid dubbletter används senast uppdaterad post som master. Du kan konfigurera vilken källa som har prioritet.</p>`
    },
    {
      id: 'contact-enrichment',
      title: 'AI-driven kontaktberikning',
      content: `<p>SWEO AI:s kontaktberikning använder AI för att automatiskt fylla i saknad information:</p><ul><li><strong>Företagsdata</strong> — organisationsnamn, storlek, bransch, webbplats</li><li><strong>Sociala profiler</strong> — LinkedIn, Twitter/X (baserat på e-post)</li><li><strong>Geografisk data</strong> — land, stad, tidszon</li><li><strong>Teknografi</strong> — vilka verktyg/plattformar företaget använder</li></ul><p>Berikning sker automatiskt när en ny kontakt skapas. Du kan även trigga manuellt via kontaktprofilen.</p><p>Aktivera under <a href='/dashboard/settings'>Settings → AI → Contact Enrichment</a>. Berikning kräver att kontakten har minst en e-postadress.</p>`
    },
    {
      id: 'contact-lifecycle',
      title: 'Kontaktens livscykel',
      content: `<p>Kontakter går genom definierade livscykelstadier:</p><ol><li><strong>Visitor</strong> — Anonym besökare, identifierad via session-cookie</li><li><strong>Lead</strong> — Har angett e-post eller namn via widget/formulär</li><li><strong>Active</strong> — Har pågående ärende eller nyligen interagerat</li><li><strong>Customer</strong> — Markerad som kund (manuellt eller via CRM-synk)</li><li><strong>Churned</strong> — Inaktiv i >90 dagar (konfigurerbart)</li></ol><p>Livscykeln uppdateras automatiskt men kan även ändras manuellt. Använd livscykelstadier för att segmentera kontakter i <a href='/dashboard/outbound'>Outbound-kampanjer</a>.</p>`
    }
  ]
});

// ── inbox/csat-feedback (1614 → ~3500 chars) ──
replaceArticle('inbox', 'csat-feedback', {
  slug: 'csat-feedback',
  title: 'CSAT & Kundfeedback',
  description: 'Samla in, mät och agera på kundfeedback för att förbättra supportkvaliteten.',
  sections: [
    {
      id: 'csat-setup',
      title: 'Aktivera CSAT',
      content: `<p>CSAT-enkäter (Customer Satisfaction) skickas automatiskt efter avslutade konversationer. Aktivera under <a href='/dashboard/settings'>Settings → CSAT</a>:</p><ol><li>Slå på <em>Enable CSAT surveys</em></li><li>Välj <strong>timing</strong>: direkt efter stängning, 1h efter, eller 24h efter</li><li>Välj <strong>kanaler</strong>: widget, e-post, eller båda</li><li>Anpassa frågan (standard: "Hur nöjd är du med din upplevelse?")</li><li>Välj skala: 1-5 stjärnor, 1-10 NPS, eller emoji (😡😐😊)</li></ol><p>Du kan även lägga till en friformsfråga för kvalitativ feedback.</p><p><strong>Exkludera automatiskt:</strong> Konversationer som eskalerades men aldrig besvarades av en agent utesluts från CSAT.</p>`
    },
    {
      id: 'csat-widget',
      title: 'CSAT i widgeten',
      content: `<p>I chattwidgeten visas CSAT-enkäten som en inline-komponent efter att konversationen stängs:</p><ul><li>Enkäten visas i samma chattfönster — kunden behöver inte lämna</li><li>Svaret sparas direkt och kopplas till konversationen</li><li>Valfritt: Visa ett tack-meddelande efter svar</li><li>Om kunden ger <strong>1-2 stjärnor</strong> kan du trigga en automatisk eskalering till teamledare</li></ul><p>I e-post skickas CSAT som en länk i uppföljningsmailet. Länken tar kunden till en kort inline-sida med samma fråga.</p>`
    },
    {
      id: 'csat-analytics',
      title: 'CSAT i Analytics',
      content: `<p>Alla CSAT-data samlas i <a href='/dashboard/analytics'>Analytics</a>:</p><ul><li><strong>Genomsnittligt CSAT</strong> — Totalt och per agent, per kanal, per tidsperiod</li><li><strong>Svarsfrekvens</strong> — Hur stor andel av kunderna som svarar</li><li><strong>Trendgraf</strong> — CSAT över tid med möjlighet att jämföra perioder</li><li><strong>Fördelning</strong> — Cirkeldiagram som visar fördelningen av betyg</li><li><strong>Kommentarer</strong> — Lista med alla fritextsvar, filtrerbara på betyg</li></ul><p>Exportera CSAT-data som CSV för externa analyser via <a href='/docs/analytics/reports-export'>Reports &amp; Export</a>.</p><p><strong>AI-analys:</strong> SWEO AI kan automatiskt kategorisera fritextsvar i teman (t.ex. "väntetid", "tonalitet", "lösning") och visa vanligaste förbättringsområdena.</p>`
    },
    {
      id: 'feedback-loop',
      title: 'Feedback-loop & förbättring',
      content: `<p>CSAT-data ingår i <strong>Flywheel-modellen</strong> och driver förbättringar:</p><ol><li><strong>Identifiera mönster</strong> — AI-analys grupperar negativ feedback i teman</li><li><strong>Koppla till konversationer</strong> — Klicka på ett lågt betyg för att se hela konversationen</li><li><strong>Skapa Knowledge-artiklar</strong> — Om ett tema saknar kunskapskälla, skapar AI ett förslag</li><li><strong>Uppdatera Policies</strong> — Justera tonalitet eller svarslängd baserat på feedback</li><li><strong>Mät förbättring</strong> — Jämför CSAT före och efter ändringar</li></ol><p>Automatiska åtgärder vid låga betyg:</p><ul><li><strong>Alert</strong> — Notifiera teamledare vid betyg ≤ 2</li><li><strong>Auto-eskalering</strong> — Skapa uppföljningsärende</li><li><strong>Outbound</strong> — Skicka personligt uppföljningsmeddelande</li></ul>`
    },
    {
      id: 'nps-surveys',
      title: 'NPS-undersökningar',
      content: `<p>Utöver CSAT stödjer SWEO AI <strong>NPS (Net Promoter Score)</strong> som mäter kundlojalitet:</p><ul><li>Fråga: "Hur sannolikt är det att du rekommenderar oss?" (0-10)</li><li>Kategorisering: Detractors (0-6), Passives (7-8), Promoters (9-10)</li><li>NPS = % Promoters - % Detractors</li></ul><p>NPS-undersökningar kan schemaläggas som <a href='/dashboard/outbound'>Outbound-kampanjer</a> och skickas via e-post, SMS eller i widgeten.</p>`
    }
  ]
});

// ── team-management/contacts-management (1840 → ~3500 chars) ──
replaceArticle('team-management', 'contacts-management', {
  slug: 'contacts-management',
  title: 'Kontakthantering',
  description: 'Hantera, sök, filtrera och slå ihop kontakter i SWEO AI.',
  sections: [
    {
      id: 'contacts-page',
      title: 'Kontakter-sidan',
      content: `<p>Alla kontakter som interagerat med din AI-agent eller supportteam finns under <a href='/dashboard/contacts'>Contacts</a>. Sidan visar:</p><ul><li><strong>Tabellvy</strong> — Namn, e-post, telefon, företag, senaste interaktion, livscykelstadie</li><li><strong>Snabbstatistik</strong> — Totalt antal kontakter, nya denna vecka, aktiva nu</li><li><strong>Bulk-åtgärder</strong> — Markera flera kontakter för taggning, export eller borttagning</li></ul><p>Klicka på kolumnrubriker för att sortera. Dra kolumnkanter för att ändra bredd. Paginering visar 50 kontakter per sida med oändlig scroll-laddning.</p><p>Skapa nya kontakter manuellt via <em>Add Contact</em>-knappen eller importera via CSV (se <a href='/docs/advanced/bulk-operations'>Bulk-operationer</a>).</p>`
    },
    {
      id: 'contact-detail',
      title: 'Kontaktprofil',
      content: `<p>Kontaktprofilen samlar allt om en person:</p><table><thead><tr><th>Sektion</th><th>Innehåll</th></tr></thead><tbody><tr><td>Grunddata</td><td>Namn, e-post, telefon, företag, roll — redigera direkt</td></tr><tr><td>Custom attributes</td><td>Egna fält som du definierat (se <a href='/docs/integrations/crm-integration'>CRM &amp; Kontakthantering</a>)</td></tr><tr><td>Konversationer</td><td>Lista med alla ärenden, status, kanal, handläggare</td></tr><tr><td>Aktivitet</td><td>Tidslinje med alla händelser: meddelanden, sidvisningar, statusändringar</td></tr><tr><td>Taggar</td><td>Manuella och automatiska etiketter</td></tr><tr><td>Anteckningar</td><td>Interna noteringar synliga för teamet</td></tr></tbody></table><p>Från profilen kan du direkt starta en ny konversation, skicka outbound-meddelande, eller ta bort kontakten.</p>`
    },
    {
      id: 'contact-search',
      title: 'Sök & filtrera kontakter',
      content: `<p>Använd sökfältet för att hitta kontakter via:</p><ul><li>Namn eller e-post (fritext, case-insensitive)</li><li>Telefonnummer (exakt eller partiell matchning)</li><li>Företagsnamn</li><li>Custom attribute-värden</li></ul><p><strong>Avancerade filter:</strong></p><ul><li><strong>Livscykel</strong> — Visitor, Lead, Active, Customer, Churned</li><li><strong>Kanal</strong> — Widget, e-post, WhatsApp, SMS, etc.</li><li><strong>Senaste interaktion</strong> — Idag, senaste 7 dagar, 30 dagar, etc.</li><li><strong>CSAT-betyg</strong> — Filtrera på senaste betyg</li><li><strong>Taggar</strong> — Inkludera/exkludera specifika taggar</li></ul><p>Spara ofta använda filter som <em>Saved views</em> för snabb åtkomst.</p>`
    },
    {
      id: 'contact-merge',
      title: 'Slå ihop kontakter',
      content: `<p>Om samma person har flera kontaktposter (t.ex. från olika kanaler) kan du slå ihop dem:</p><ol><li>Öppna en av kontakternas profil</li><li>Klicka <em>Merge</em> i menyn</li><li>Sök efter den andra kontakten</li><li>Välj <strong>primär kontakt</strong> (den som behålls)</li><li>Granska vilka data som sammanfogas</li><li>Bekräfta</li></ol><p>Vid sammanslagning:</p><ul><li>Alla konversationer kopplas till den primära kontakten</li><li>Aktivitetshistorik sammanfogas kronologiskt</li><li>Custom attributes från sekundär kontakt fylls i om primär saknar värde</li><li>Taggar från båda behålls</li><li>Sekundär kontakt arkiveras (kan återställas i 30 dagar)</li></ul><p><strong>AI-föreslag:</strong> SWEO AI identifierar automatiskt potentiella dubbletter baserat på e-post och namn och föreslår sammanslagning.</p>`
    },
    {
      id: 'contact-import-export',
      title: 'Import & export',
      content: `<p>Importera kontakter via CSV:</p><ol><li>Gå till <a href='/dashboard/contacts'>Contacts</a> → <em>Import</em></li><li>Ladda upp CSV-fil (max 10 000 rader)</li><li>Mappa kolumner till SWEO-fält</li><li>Välj: skapa nya, uppdatera befintliga, eller båda</li><li>Starta import</li></ol><p>Exportera kontakter till CSV via <em>Export</em>-knappen. Välj vilka fält som ska inkluderas och applicera filter innan export.</p>`
    }
  ]
});

// ── advanced/bulk-operations (1555 → ~3000 chars) ──
replaceArticle('advanced', 'bulk-operations', {
  slug: 'bulk-operations',
  title: 'Bulk-operationer',
  description: 'Importera och exportera kunskap, kontakter och konversationer i bulk.',
  sections: [
    {
      id: 'bulk-knowledge-import',
      title: 'Bulk-import av kunskapskällor',
      content: `<p>Importera flera kunskapskällor samtidigt:</p><ol><li>Gå till <a href='/dashboard/knowledge'>Knowledge</a></li><li>Klicka <em>Bulk Import</em></li><li>Dra-och-släpp upp till <strong>50 filer</strong> (PDF, DOCX, TXT, MD, CSV, HTML)</li><li>Filerna processas parallellt: text extraheras, chunkas (800 tecken, 150 overlap) och vektoriseras</li><li>Progressindikator visar status per fil</li></ol><p>Alternativt: ange flera URL:er (en per rad) för att crawla och indexera externt innehåll. Crawlern respekterar <code>robots.txt</code> och begränsar till max 100 sidor per domän.</p><p><strong>API-alternativ:</strong></p><pre><code>curl -X POST /api/knowledge/bulk-ingest \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"urls": ["https://docs.example.com/page1", "https://docs.example.com/page2"]}'</code></pre>`
    },
    {
      id: 'bulk-knowledge-export',
      title: 'Bulk-export av kunskapsbas',
      content: `<p>Exportera hela din kunskapsbas för backup eller migration:</p><ol><li>Gå till <a href='/dashboard/knowledge'>Knowledge</a> → <em>Export All</em></li><li>Välj format: <strong>JSON</strong> (fullständig med metadata) eller <strong>Markdown</strong> (läsbart)</li><li>Välj vilka källor som ska inkluderas (alla eller filtrerade)</li><li>Klicka <em>Generate Export</em></li><li>Ladda ner ZIP-filen när den är klar</li></ol><p>JSON-formatet inkluderar: källtext, chunks, metadata, skapad/uppdaterad-datum. Kan återimporteras via bulk-import.</p><p>Markdown-formatet genererar en fil per källa med frontmatter (titel, datum, taggar). Perfekt för att migrera till en annan plattform eller som dokumentationsbackup.</p>`
    },
    {
      id: 'bulk-contacts',
      title: 'Bulk kontaktoperationer',
      content: `<p>Hantera kontakter i bulk:</p><ul><li><strong>Import</strong> — CSV-import av upp till 10 000 kontakter med fältmappning och dubblettdetektering</li><li><strong>Export</strong> — Exportera filtrerade eller alla kontakter med valfria fält</li><li><strong>Tagga</strong> — Markera flera kontakter och lägg till/ta bort taggar</li><li><strong>Ta bort</strong> — Massradering med bekräftelseförteckning</li></ul><p>Se <a href='/docs/team-management/contacts-management'>Kontakthantering</a> för detaljer om import/export.</p>`
    },
    {
      id: 'bulk-conversations',
      title: 'Bulk konversationsåtgärder',
      content: `<p>I <a href='/dashboard/inbox'>Inbox</a> kan du utföra bulk-åtgärder på konversationer:</p><ul><li><strong>Stäng alla</strong> — Markera flera och stäng med ett klick</li><li><strong>Tilldela</strong> — Omfördela konversationer till en specifik agent</li><li><strong>Tagga</strong> — Lägg till etikett (t.ex. "bug", "feature-request", "urgent")</li><li><strong>Exportera</strong> — Ladda ner konversationsloggar som JSON eller CSV</li></ul><p>Via API:</p><pre><code>curl -X POST /api/conversations/bulk \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"action": "close", "ids": ["conv_1", "conv_2", "conv_3"]}'</code></pre><p>Bulk-åtgärder loggas i <a href='/dashboard/analytics'>Analytics</a> och i konversationernas aktivitetslogg.</p>`
    }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. ADD NEW ARTICLES FOR RECENT FEATURES
// ═══════════════════════════════════════════════════════════════════════════

// ── New category: outbound ──
addCategory({
  slug: 'outbound',
  title: 'Outbound & Kampanjer',
  icon: 'megaphone',
  description: 'Skapa, schemalägg och skicka proaktiva meddelanden till dina kunder.',
  articles: [
    {
      slug: 'outbound-overview',
      title: 'Outbound — Översikt',
      description: 'Introduktion till SWEO AI:s outbound-kampanjsystem.',
      sections: [
        {
          id: 'what-is-outbound',
          title: 'Vad är Outbound?',
          content: `<p><strong>Outbound</strong> i SWEO AI låter dig skicka proaktiva meddelanden till dina kunder — utan att vänta på att de kontaktar dig först. Användningsområden:</p><ul><li><strong>Produktnyheter</strong> — Informera om nya funktioner</li><li><strong>Onboarding-serier</strong> — Guida nya kunder steg för steg</li><li><strong>Återengagering</strong> — Nå ut till inaktiva användare</li><li><strong>Undersökningar</strong> — NPS, CSAT, produktfeedback</li><li><strong>Driftsmeddelanden</strong> — Informera om planerat underhåll</li></ul><p>Gå till <a href='/dashboard/outbound'>Outbound</a> för att komma igång.</p>`
        },
        {
          id: 'message-types',
          title: 'Meddelandetyper',
          content: `<p>SWEO AI stödjer <strong>11 meddelandetyper</strong>:</p><table><thead><tr><th>Typ</th><th>Kanal</th><th>Beskrivning</th></tr></thead><tbody><tr><td>Chat</td><td>Widget</td><td>Meddelande som dyker upp i chattwidgeten</td></tr><tr><td>Email</td><td>E-post</td><td>Formatterat HTML-mail med tenant-branding</td></tr><tr><td>SMS</td><td>SMS</td><td>Textmeddelande via Twilio</td></tr><tr><td>WhatsApp</td><td>WhatsApp</td><td>Meddelande via WhatsApp Business</td></tr><tr><td>Banner</td><td>Widget</td><td>Banner i toppen av chattwidgeten</td></tr><tr><td>Post</td><td>Widget</td><td>Längre artikel/nyhet i widgeten</td></tr><tr><td>Tooltip</td><td>Widget</td><td>Liten popup bredvid UI-element</td></tr><tr><td>Product Tour</td><td>Widget</td><td>Steg-för-steg guidad tur</td></tr><tr><td>Survey</td><td>Widget</td><td>Enkätfrågor med svarsalternativ</td></tr><tr><td>Checklist</td><td>Widget</td><td>Onboarding-checklista med progress</td></tr><tr><td>Mobile Push</td><td>App</td><td>Push-notis till mobilapp</td></tr></tbody></table>`
        },
        {
          id: 'campaign-flow',
          title: 'Kampanjflödet',
          content: `<p>Att skapa och skicka en kampanj följer fyra steg:</p><ol><li><strong>Skapa</strong> — Välj meddelandetyp, skriv innehåll, lägg till CTA-knappar</li><li><strong>Målgrupp</strong> — Välj "Alla kontakter" eller definiera regler (t.ex. plan = growth, land = Sverige)</li><li><strong>Schema</strong> — Skicka direkt eller schemalägg till ett framtida datum och tid</li><li><strong>Skicka</strong> — Meddelandet levereras till alla matchande kontakter</li></ol><p>Status-livscykeln: <code>draft</code> → <code>active</code> → <code>sending</code> → <code>sent</code> (eller <code>failed</code>)</p><p>Schemalagda kampanjer kontrolleras var 5:e minut av en bakgrundsprocess.</p>`
        }
      ]
    },
    {
      slug: 'creating-campaigns',
      title: 'Skapa kampanjer',
      description: 'Steg-för-steg guide för att bygga och formatera outbound-meddelanden.',
      sections: [
        {
          id: 'composer',
          title: 'Kampanjkomponisten',
          content: `<p>Kampanjkomponisten (<a href='/dashboard/outbound'>Outbound → New Message</a>) har följande delar:</p><ul><li><strong>Meddelandetyp</strong> — Välj bland 11 typer (chat, email, banner, etc.)</li><li><strong>Rubrik</strong> — Intern titel för kampanjen</li><li><strong>Innehåll</strong> — Rich text-editor med formatering, bilder och länkar</li><li><strong>CTA-knappar</strong> — Valfritt: lägg till knappar med text och URL</li><li><strong>Ämnesrad</strong> — För e-postkampanjer, visas som subject-raden</li></ul><p>Spara som utkast när du vill fortsätta senare. Alla ändringar autosparas var 30:e sekund.</p>`
        },
        {
          id: 'audience-rules',
          title: 'Målgruppsregler',
          content: `<p>Definiera vilka kontakter som ska ta emot kampanjen med regler:</p><table><thead><tr><th>Fält</th><th>Operatorer</th><th>Exempel</th></tr></thead><tbody><tr><td>email</td><td>equals, contains, not_equals</td><td>email contains "@acme.com"</td></tr><tr><td>name</td><td>equals, contains</td><td>name contains "Erik"</td></tr><tr><td>plan</td><td>equals, is_not</td><td>plan equals "growth"</td></tr><tr><td>country</td><td>equals, is_not</td><td>country equals "SE"</td></tr><tr><td>lifecycle</td><td>equals</td><td>lifecycle equals "customer"</td></tr><tr><td>Custom attributes</td><td>equals, contains, not_equals</td><td>industry equals "SaaS"</td></tr></tbody></table><p>Regler kan kombineras (AND-logik). Förhandsgranskning visar antal matchande kontakter innan utskick.</p>`
        },
        {
          id: 'scheduling',
          title: 'Schemaläggning',
          content: `<p>Välj mellan två sändningslägen:</p><ul><li><strong>Skicka direkt</strong> — Kampanjen skickas omedelbart till alla matchande kontakter</li><li><strong>Schemalägg</strong> — Välj datum och tid. Kampanjen markeras som <code>active</code> och skickas automatiskt vid rätt tidpunkt</li></ul><p>Schemalagda kampanjer kan avbrytas eller redigeras fram tills de börjar skickas. En bakgrundsprocess kontrollerar var 5:e minut om en kampanj ska skickas.</p><p><strong>Tips:</strong> Schemalägg e-postkampanjer till tisdag-torsdag 10:00 för bäst öppningsfrekvens.</p>`
        },
        {
          id: 'email-branding',
          title: 'E-postbranding',
          content: `<p>E-postkampanjer omsluts automatiskt med din tenant-branding:</p><ul><li><strong>Logo</strong> — Visas i e-postens header (konfigureras under <a href='/dashboard/settings/customization'>Settings → Customization → Email Branding</a>)</li><li><strong>Avsändarnamn</strong> — T.ex. "SWEO Support" eller ditt företagsnamn</li><li><strong>Avsändaradress</strong> — Konfigureras via supportEmail i inställningar</li><li><strong>Brandcolor</strong> — Primärfärgen används som accent i e-postmallen</li><li><strong>Powered by</strong> — Visas i footer om white-label inte är aktiverat</li></ul><p>E-posten har en responsiv design som fungerar i alla e-postklienter (Gmail, Outlook, Apple Mail).</p>`
        }
      ]
    },
    {
      slug: 'campaign-analytics',
      title: 'Kampanjanalys',
      description: 'Följ upp leverans, öppningsfrekvens och klick för dina kampanjer.',
      sections: [
        {
          id: 'delivery-tracking',
          title: 'Leveransspårning',
          content: `<p>Varje kampanj visar detaljerad leveransstatistik:</p><ul><li><strong>Totalt skickade</strong> — Antal kontakter som kampanjen skickades till</li><li><strong>Lyckade</strong> — Levererade utan fel</li><li><strong>Misslyckade</strong> — Antal som inte kunde levereras (med felmeddelande)</li><li><strong>Status per kontakt</strong> — I <code>outbound_deliveries</code>-samlingen kan du se varje leverans</li></ul><p>Statusar på kampanjnivå:</p><table><thead><tr><th>Status</th><th>Betydelse</th></tr></thead><tbody><tr><td><code>draft</code></td><td>Sparad men inte skickad</td></tr><tr><td><code>active</code></td><td>Schemalagd, väntar på sändningstid</td></tr><tr><td><code>sending</code></td><td>Håller på att skickas (pågår)</td></tr><tr><td><code>sent</code></td><td>Alla mottagare har hanterats</td></tr><tr><td><code>failed</code></td><td>Alla leveranser misslyckades</td></tr></tbody></table>`
        },
        {
          id: 'engagement-metrics',
          title: 'Engagemangsmått',
          content: `<p>För e-postkampanjer spåras även:</p><ul><li><strong>Öppningsfrekvens</strong> — Andel mottagare som öppnade e-posten</li><li><strong>Klickfrekvens</strong> — Andel som klickade på en CTA-länk</li><li><strong>Avregistreringar</strong> — Antal som avprenumererade</li></ul><p>In-app-meddelanden (banner, post, tooltip) spårar:</p><ul><li><strong>Visningar</strong> — Antal kontakter som såg meddelandet</li><li><strong>Klick</strong> — Antal som klickade på CTA</li><li><strong>Avvisningar</strong> — Antal som stängde meddelandet</li></ul>`
        },
        {
          id: 'best-practices',
          title: 'Best practices',
          content: `<p>Tips för effektiva outbound-kampanjer:</p><ol><li><strong>Segmentera</strong> — Skicka relevanta meddelanden till rätt målgrupp istället för alla</li><li><strong>A/B-testa ämnesrader</strong> — Använd varianter och jämför öppningsfrekvens</li><li><strong>Håll det kort</strong> — Meddelanden under 100 ord har 2× högre klickfrekvens</li><li><strong>Personalisera</strong> — Använd kontaktens namn och företag i meddelandet</li><li><strong>Timing</strong> — Schemalägg till kontorstid i mottagarens tidszon</li><li><strong>Följ upp</strong> — Skapa en andra kampanj till de som inte öppnade efter 3 dagar</li></ol>`
        }
      ]
    }
  ]
});

// ── New article: channels/white-label ──
addArticle('channels', {
  slug: 'white-label',
  title: 'White-label & SaaS-mode',
  description: 'Anpassa SWEO AI med din egen branding för en helt vit-märkt upplevelse.',
  sections: [
    {
      id: 'what-is-whitelabel',
      title: 'Vad är White-label?',
      content: `<p><strong>White-label mode</strong> tar bort all SWEO-branding och ersätter den med din egen. Perfekt om du säljer SWEO AI som en del av din egen produkt eller vill ge kunderna en helt skräddarsydd upplevelse.</p><p>White-label omfattar:</p><ul><li><strong>Chattwidget</strong> — Din logo, färger, typsnitt och custom CSS</li><li><strong>E-postmeddelanden</strong> — Ditt avsändarnamn, logo och företagsuppgifter</li><li><strong>Dashboard</strong> — Ditt företagsnamn och favicon</li><li><strong>Help Center</strong> — Egen domän (help.dittforetag.se)</li></ul><p>Aktivera under <a href='/dashboard/settings/customization'>Settings → Customization → White-label branding</a>.</p>`
    },
    {
      id: 'branding-setup',
      title: 'Konfigurera branding',
      content: `<p>Steg-för-steg:</p><ol><li>Gå till <a href='/dashboard/settings/customization'>Settings → Customization</a></li><li>Slå på <em>Enable white-label mode</em></li><li>Ladda upp <strong>företagslogo</strong> (rekommenderat: 200×200px, PNG eller SVG)</li><li>Ladda upp <strong>favicon</strong> (32×32px ICO, PNG eller SVG)</li><li>Ange <strong>företagsnamn</strong> och <strong>support-email</strong></li><li>Välj <strong>sekundärfärg</strong> (komplement till primärfärgen)</li><li>Konfigurera <strong>e-postbranding</strong> — avsändarnamn och e-postlogo</li><li>Valfritt: lägg till <strong>custom CSS</strong> för avancerad widgetstyling</li><li>Klicka <em>Save</em></li></ol><p>Ändringarna tillämpas direkt på widgeten och framtida e-postmeddelanden.</p>`
    },
    {
      id: 'custom-domain',
      title: 'Egen domän',
      content: `<p>Koppla en egen domän till ditt Help Center:</p><ol><li>Ange domänen under <a href='/dashboard/settings/customization'>Settings → Domain Management</a></li><li>Klicka <em>Generate Verification Token</em></li><li>Lägg till en <strong>TXT-record</strong> i din DNS med verifieringstoken</li><li>Lägg till en <strong>CNAME-record</strong>: <code>help.dittforetag.se → cname.sweo.se</code></li><li>Vänta på DNS-propagering (vanligtvis 5-30 minuter)</li><li>SWEO AI verifierar automatiskt och visar en grön "Verified"-badge</li></ol><p>SSL-certifikat provisioneras automatiskt via Let's Encrypt efter verifiering.</p>`
    },
    {
      id: 'custom-css',
      title: 'Custom CSS',
      content: `<p>Injicera egen CSS i chattwidgeten under <a href='/dashboard/settings/customization'>Settings → Custom CSS</a>:</p><pre><code>/* Ändra header-bakgrund */
.fin-widget-header {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
}

/* Runda meddelandebubblor mer */
.fin-message-bubble {
  border-radius: 16px;
}

/* Ändra typsnitt */
.fin-widget-container {
  font-family: 'Inter', sans-serif;
}</code></pre><p>CSS:en injiceras i widgetens iframe och är isolerad från din webbplats. Använd webbläsarens DevTools för att inspektera tillgängliga CSS-klasser.</p>`
    }
  ]
});

// ── New article: getting-started/billing ──
addArticle('getting-started', {
  slug: 'billing',
  title: 'Planer & Fakturering',
  description: 'Välj plan, hantera prenumeration och förstå SWEO AI:s prismodell.',
  sections: [
    {
      id: 'plans',
      title: 'Tillgängliga planer',
      content: `<p>SWEO AI erbjuder tre planer:</p><table><thead><tr><th>Plan</th><th>Pris</th><th>Inkluderar</th></tr></thead><tbody><tr><td><strong>Free</strong></td><td>0 kr/mån</td><td>1 agent, 100 konversationer/mån, widget, grundläggande analytics</td></tr><tr><td><strong>Growth</strong></td><td>990 kr/mån</td><td>5 agenter, obegränsade konversationer, alla kanaler, outbound, AI Copilot</td></tr><tr><td><strong>Enterprise</strong></td><td>2 990 kr/mån</td><td>Obegränsat antal agenter, white-label, custom domain, prioriterad support, SLA</td></tr></tbody></table><p>Alla planer inkluderar grundläggande AI-funktionalitet. Uppgradera under <a href='/dashboard/settings/billing'>Settings → Billing</a>.</p>`
    },
    {
      id: 'manage-subscription',
      title: 'Hantera prenumeration',
      content: `<p>Under <a href='/dashboard/settings/billing'>Settings → Billing</a> kan du:</p><ul><li><strong>Uppgradera</strong> — Byt till en högre plan. Effekten är omedelbar, du betalar proportionellt.</li><li><strong>Nedgradera</strong> — Byt till en lägre plan. Träder i kraft vid nästa faktureringsperiod.</li><li><strong>Avbryt</strong> — Avsluta prenumerationen. Du behåller tillgång till periodens slut.</li><li><strong>Uppdatera betalning</strong> — Ändra kreditkort eller faktureringsuppgifter</li><li><strong>Fakturor</strong> — Se och ladda ner alla tidigare fakturor som PDF</li></ul><p>Betalningar hanteras säkert via <strong>Stripe</strong>. Vi lagrar aldrig kreditkortsuppgifter.</p>`
    },
    {
      id: 'feature-comparison',
      title: 'Funktionsjämförelse',
      content: `<table><thead><tr><th>Funktion</th><th>Free</th><th>Growth</th><th>Enterprise</th></tr></thead><tbody><tr><td>AI-agent</td><td>✅</td><td>✅</td><td>✅</td></tr><tr><td>Knowledge Base</td><td>5 källor</td><td>Obegränsat</td><td>Obegränsat</td></tr><tr><td>Kanaler</td><td>Widget</td><td>Alla</td><td>Alla</td></tr><tr><td>Outbound</td><td>❌</td><td>✅</td><td>✅</td></tr><tr><td>Procedures</td><td>3 st</td><td>Obegränsat</td><td>Obegränsat</td></tr><tr><td>Teammedlemmar</td><td>1</td><td>5</td><td>Obegränsat</td></tr><tr><td>AI Copilot</td><td>❌</td><td>✅</td><td>✅</td></tr><tr><td>White-label</td><td>❌</td><td>❌</td><td>✅</td></tr><tr><td>Custom domain</td><td>❌</td><td>❌</td><td>✅</td></tr><tr><td>API-åtkomst</td><td>Begränsad</td><td>Full</td><td>Full + prioritet</td></tr><tr><td>Support</td><td>Community</td><td>E-post</td><td>Prioriterad + SLA</td></tr></tbody></table>`
    }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
// SAVE
// ═══════════════════════════════════════════════════════════════════════════

writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

// Stats
let totalArticles = 0;
let totalChars = 0;
for (const c of data) {
  for (const a of c.articles) {
    totalArticles++;
    for (const s of a.sections) totalChars += (s.content || '').length;
  }
}
console.log(`✅ Docs updated: ${data.length} categories, ${totalArticles} articles, ${totalChars} chars total`);
