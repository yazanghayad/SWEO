import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/config/docs-data.json', 'utf8'));

// --- ARTICLE 1: Cases (add to inbox category) ---
const casesArticle = {
  slug: 'cases',
  title: 'Ärenden (Cases)',
  content: '<p>Cases är SWEO AI:s ärendehanteringssystem för att spåra, organisera och lösa kundproblem som kräver uppföljning — från reklamationer och garantiärenden till fakturatvister och returer.</p>',
  sections: [
    {
      id: 'cases-overview',
      title: 'Översikt',
      content: `<p>Gå till <a href="/dashboard/cases">Cases</a> i sidomenyn. Cases-vyn visar alla ärenden i din organisation med:</p>
<ul>
<li><strong>Sökfält</strong> — Sök på ämnesrad</li>
<li><strong>Filtermenyer</strong> — Filtrera på status, typ och prioritet</li>
<li><strong>Ärendekort</strong> — Visar prioritetsikon, ämne, statusbadge, typ och tidsstämpel</li>
<li><strong>Räknare</strong> — Aktiva, lösta och totalt antal ärenden</li>
</ul>
<p>Klicka på <strong>Skapa ärende</strong> för att öppna ett nytt ärende manuellt, eller låt AI skapa ärenden automatiskt från konversationer.</p>`
    },
    {
      id: 'case-lifecycle',
      title: 'Ärendets livscykel',
      content: `<p>Varje ärende genomgår en livscykel med sex statusar:</p>
<table><thead><tr><th>Status</th><th>Beskrivning</th></tr></thead><tbody>
<tr><td><code>Open</code></td><td>Nytt ärende, ännu inte påbörjat</td></tr>
<tr><td><code>In Progress</code></td><td>En agent arbetar aktivt med ärendet</td></tr>
<tr><td><code>Awaiting Customer</code></td><td>Väntar på svar eller information från kunden</td></tr>
<tr><td><code>Awaiting Internal</code></td><td>Väntar på intern feedback eller godkännande</td></tr>
<tr><td><code>Resolved</code></td><td>Ärendet är löst</td></tr>
<tr><td><code>Closed</code></td><td>Ärendet är stängt och arkiverat</td></tr>
</tbody></table>
<p>Statusändringar loggas automatiskt i ärendets <strong>tidslinje</strong> med tidsstämpel och ansvarig.</p>`
    },
    {
      id: 'case-types-priority',
      title: 'Typer & Prioritet',
      content: `<p>Ärenden kategoriseras efter <strong>typ</strong> och <strong>prioritet</strong> för att underlätta filtrering och routing:</p>
<h4>Ärendetyper</h4>
<table><thead><tr><th>Typ</th><th>Användning</th></tr></thead><tbody>
<tr><td><code>general</code></td><td>Allmänt kundärende</td></tr>
<tr><td><code>invoice_dispute</code></td><td>Fakturatvist eller betalningsproblem</td></tr>
<tr><td><code>complaint</code></td><td>Klagomål eller missnöje</td></tr>
<tr><td><code>return</code></td><td>Returer och byten</td></tr>
<tr><td><code>warranty</code></td><td>Garantiärende</td></tr>
</tbody></table>
<h4>Prioritetsnivåer</h4>
<ul>
<li> <strong>Urgent</strong> — Kräver omedelbar åtgärd</li>
<li> <strong>High</strong> — Hög prioritet, bör hanteras samma dag</li>
<li> <strong>Medium</strong> — Normal prioritet</li>
<li> <strong>Low</strong> — Kan vänta, ingen brådska</li>
</ul>`
    },
    {
      id: 'case-detail-view',
      title: 'Ärendedetaljer',
      content: `<p>Klicka på ett ärende för att öppna detaljvyn. Sidan har tre delar:</p>
<h4>Huvudinnehåll</h4>
<ul>
<li><strong>Ämne & beskrivning</strong> — Redigerbar titel och beskrivningstext</li>
<li><strong>Tilldelad till</strong> — Vilken agent som ansvarar</li>
<li><strong>Förfallodatum</strong> — Valfri deadline</li>
</ul>
<h4>Flikar (3 st)</h4>
<table><thead><tr><th>Flik</th><th>Innehåll</th></tr></thead><tbody>
<tr><td><strong>Tidslinje</strong></td><td>Kronologisk logg av alla ändringar — statusbyten, tilldelningar, anteckningar, dokument</td></tr>
<tr><td><strong>Anteckningar</strong></td><td>Interna anteckningar (ej synliga för kunder). Stödjer <code>Ctrl+Enter</code> för att skicka.</td></tr>
<tr><td><strong>Dokument</strong></td><td>Bifoga filer (PDF, DOCX, TXT, PNG, JPG, CSV, XLSX). Max filstorlek beroende på plan.</td></tr>
</tbody></table>
<h4>Höger sidebar</h4>
<p>Visar ärendets metadata: status, prioritet, typ, ansvarig, länkad kontakt/konversation, skapad-datum, förfallodatum och taggar.</p>`
    },
    {
      id: 'case-linking',
      title: 'Länkning & Spårning',
      content: `<p>Cases integrerar med resten av SWEO AI genom länkning:</p>
<ul>
<li><strong>Kontaktlänk</strong> — Koppla ett ärende till en kontakt för att se alla ärenden per kund</li>
<li><strong>Konversationslänk</strong> — Koppla till den konversation som genererade ärendet</li>
<li><strong>Ändringshistorik</strong> — Varje uppdatering (status, prioritet, tilldelning) skapar en tidslinjehändelse med före/efter-värden</li>
</ul>
<p>Tidslinjetyper inkluderar: <code>created</code>, <code>status_changed</code>, <code>priority_changed</code>, <code>assigned</code>, <code>note_added</code>, <code>document_added</code>, <code>document_removed</code>, <code>linked_conversation</code>, <code>resolved</code>, <code>reopened</code>.</p>
<div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4"><strong>Tips:</strong> Använd Cases tillsammans med <a href="/docs/inbox/inbox-workflow">Inbox</a> för att eskalera konversationer till formella ärenden som kräver uppföljning.</div>`
    }
  ]
};

// --- ARTICLE 2: Guidance (add to ai-automation category) ---
const guidanceArticle = {
  slug: 'guidance',
  title: 'Guidance — Anpassa AI:ns beteende',
  content: '<p>Guidance låter dig finjustera hur SWEO AI kommunicerar genom att skapa regler som styr ton, ordval, klarifikationer och innehållsreferenser — utan att behöva skriva om prompten.</p>',
  sections: [
    {
      id: 'guidance-overview',
      title: 'Översikt',
      content: `<p>Gå till <a href="/dashboard/guidance">Guidance</a> i sidomenyn. Här kan du:</p>
<ul>
<li>Ställa in <strong>grundton</strong> och <strong>svarslängd</strong> för AI:n</li>
<li>Skapa <strong>regler</strong> som styr specifika beteenden</li>
<li>Organisera regler per <strong>kanal</strong> (Chat & Email vs Voice)</li>
<li>Förhandsgranska AI-svar i en <strong>live-chatpanel</strong></li>
</ul>
<p>Guidance fungerar som ett extra lager ovanpå AI-agentens kunskapsbas — det ändrar <em>hur</em> AI:n svarar, inte <em>vad</em> den vet.</p>`
    },
    {
      id: 'basics-tone-length',
      title: 'Grundinställningar: Ton & Längd',
      content: `<p>Under <strong>Basics</strong>-sektionen ställer du in standardvärden som gäller alla svar:</p>
<h4>Ton (Tone of voice)</h4>
<table><thead><tr><th>Alternativ</th><th>Beskrivning</th></tr></thead><tbody>
<tr><td><strong>Friendly</strong></td><td>Varm och välkomnande ton med emojis</td></tr>
<tr><td><strong>Neutral</strong></td><td>Balanserad och saklig</td></tr>
<tr><td><strong>Matter-of-fact</strong></td><td>Rak och koncis utan extra fras</td></tr>
<tr><td><strong>Professional</strong></td><td>Formell affärston</td></tr>
<tr><td><strong>Humorous</strong></td><td>Lättsam och skämtsam (lämpligt för vissa branscher)</td></tr>
</tbody></table>
<h4>Svarslängd (Answer length)</h4>
<ul>
<li><strong>Concise</strong> — Korta, direkta svar (1–2 meningar)</li>
<li><strong>Standard</strong> — Normala svar med tillräcklig förklaring</li>
<li><strong>Thorough</strong> — Utförliga svar med bakgrund och kontext</li>
</ul>
<p>Klicka <strong>Spara</strong> för att tillämpa ändringarna. Dessa värden gäller som standard för alla regler.</p>`
    },
    {
      id: 'guidance-categories',
      title: 'Regelkategorier',
      content: `<p>Regler grupperas i fem kategorier:</p>
<table><thead><tr><th>Kategori</th><th>Syfte</th><th>Exempel</th></tr></thead><tbody>
<tr><td><strong>Communication style</strong></td><td>Styr ordval, terminologi och stil</td><td>"Använd enkelt språk", "Shoppingassistent", "Brittisk engelska"</td></tr>
<tr><td><strong>Context & clarification</strong></td><td>AI:n lär sig ställa rätt följdfrågor</td><td>"Fråga vilken plattform vid felsökning", "Bekräfta låntyp"</td></tr>
<tr><td><strong>Content & sources</strong> <span class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Beta</span></td><td>Hänvisa till specifika artiklar/källor</td><td>"Länka felsökningsguide vid betalningsproblem"</td></tr>
<tr><td><strong>Spam</strong></td><td>Identifiera och hantera spam/skadliga meddelanden</td><td>"Upptäck reklamspam"</td></tr>
<tr><td><strong>Other</strong></td><td>Anpassade regler som inte passar ovan</td><td>Branschspecifika regler</td></tr>
</tbody></table>`
    },
    {
      id: 'create-manage-rules',
      title: 'Skapa & hantera regler',
      content: `<p>Så skapar du en ny regel:</p>
<ol>
<li>Välj fliken <strong>Chat and email</strong> eller <strong>Voice</strong></li>
<li>Hitta rätt kategori (t.ex. <em>Communication style</em>)</li>
<li>Klicka <strong>New</strong> eller välj en av exempelpillerna</li>
<li>Fyll i <strong>Namn</strong> (kort etikett) och <strong>Regelinnehåll</strong> (detaljerad instruktion)</li>
<li>Klicka <strong>Skapa</strong></li>
</ol>
<p>Hantera befintliga regler:</p>
<ul>
<li><strong>Aktivera/inaktivera</strong> — Slå av en regel utan att radera den</li>
<li><strong>Redigera</strong> — Ändra namn eller innehåll</li>
<li><strong>Ta bort</strong> — Permanent radering</li>
</ul>
<div class="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4"><strong>Best practice:</strong> Skriv regler som specifika instruktioner: <em>"När kunden frågar om leveranstider, svara alltid med ett datumintervall och inkludera en länk till fraktpolicyn."</em></div>`
    },
    {
      id: 'channels-preview',
      title: 'Kanaler & Live-förhandsgranskning',
      content: `<p>Guidance-regler är <strong>kanalspecifika</strong>:</p>
<ul>
<li><strong>Chat and email</strong> — Regler som gäller för webb-chat, e-post och meddelandekanaler</li>
<li><strong>Voice</strong> — Regler anpassade för röstsamtal (ej tillgängligt ännu)</li>
</ul>
<p>I högerpanelen finns en <strong>live-chatförhandsgranskning</strong> där du kan testa hur AI:n svarar med dina nuvarande regler aktiva. Skriv ett testmeddelande och se svaret direkt — perfekt för att iterera på regler innan de går live.</p>
<div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4"><strong>Tips:</strong> Kombinera Guidance med <a href="/docs/ai-automation/procedures">Procedures</a> för att skapa en AI-agent som både vet <em>hur</em> den ska kommunicera och <em>vad</em> den ska göra i specifika situationer.</div>`
    }
  ]
};

// Add articles to existing categories
const inboxCat = data.find(c => c.slug === 'inbox');
const aiCat = data.find(c => c.slug === 'ai-automation');

if (!inboxCat) {
  console.error('ERROR: inbox category not found');
  process.exit(1);
}
if (!aiCat) {
  console.error('ERROR: ai-automation category not found');
  process.exit(1);
}

// Check for duplicates
if (inboxCat.articles.some(a => a.slug === 'cases')) {
  console.log('cases article already exists, skipping');
} else {
  inboxCat.articles.push(casesArticle);
  console.log('✅ Added "Ärenden (Cases)" to inbox category');
}

if (aiCat.articles.some(a => a.slug === 'guidance')) {
  console.log('guidance article already exists, skipping');
} else {
  aiCat.articles.push(guidanceArticle);
  console.log('✅ Added "Guidance — Anpassa AI:ns beteende" to ai-automation category');
}

fs.writeFileSync('src/config/docs-data.json', JSON.stringify(data, null, 2));
console.log('\nTotal articles:', data.reduce((s, c) => s + c.articles.length, 0));
