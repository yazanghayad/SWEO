import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/config/docs-data.json', 'utf8'));

// --- ARTICLE 1: Multilingual Support ---
const multilingualArticle = {
  slug: 'multilingual',
  title: 'Flerspråkigt stöd',
  content: '<p>SWEO AI stödjer 16 språk och kan automatiskt upptäcka och översätta konversationer. Konfigurera vilka språk din AI-agent ska hantera och ställ in standardspråk för din workspace.</p>',
  sections: [
    {
      id: 'language-setup',
      title: 'Konfigurera språk',
      content: `<p>Gå till <a href="/dashboard/settings/languages">Inställningar → Multilingual</a>. Här kan du:</p>
<ul>
<li><strong>Aktivera/inaktivera språk</strong> — Slå på de språk ditt team kan hantera</li>
<li><strong>Ställa in standardspråk</strong> — Välj det språk som används när inget annat detekteras</li>
<li><strong>Söka bland språk</strong> — Filtrera i listan med sökfältet</li>
</ul>
<h4>Tillgängliga språk</h4>
<table><thead><tr><th>Språk</th><th>Kod</th></tr></thead><tbody>
<tr><td>Engelska</td><td><code>en</code></td></tr>
<tr><td>Svenska</td><td><code>sv</code></td></tr>
<tr><td>Tyska</td><td><code>de</code></td></tr>
<tr><td>Franska</td><td><code>fr</code></td></tr>
<tr><td>Spanska</td><td><code>es</code></td></tr>
<tr><td>Portugisiska</td><td><code>pt</code></td></tr>
<tr><td>Nederländska</td><td><code>nl</code></td></tr>
<tr><td>Danska</td><td><code>da</code></td></tr>
<tr><td>Norska</td><td><code>no</code></td></tr>
<tr><td>Finska</td><td><code>fi</code></td></tr>
<tr><td>Japanska</td><td><code>ja</code></td></tr>
<tr><td>Kinesiska</td><td><code>zh</code></td></tr>
<tr><td>Koreanska</td><td><code>ko</code></td></tr>
<tr><td>Arabiska</td><td><code>ar</code></td></tr>
<tr><td>Italienska</td><td><code>it</code></td></tr>
<tr><td>Polska</td><td><code>pl</code></td></tr>
</tbody></table>`
    },
    {
      id: 'auto-translate',
      title: 'Automatisk översättning',
      content: `<p>Med <strong>auto-translate</strong> aktiverat översätter SWEO AI automatiskt:</p>
<ul>
<li><strong>Inkommande meddelanden</strong> — Kundens meddelanden översätts till agentens språk i inboxen</li>
<li><strong>Utgående svar</strong> — Agentens svar översätts tillbaka till kundens språk</li>
<li><strong>AI-agentsvar</strong> — AI:n svarar automatiskt på kundens detekterade språk</li>
</ul>
<p>Aktivera funktionen under Inställningar → Multilingual:</p>
<ul>
<li><strong>Auto-translate</strong> — Slå på automatisk översättning av konversationer</li>
<li><strong>Auto-detect language</strong> — AI:n identifierar automatiskt kundens språk baserat på meddelandeinnehåll</li>
</ul>
<div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4"><strong>Tips:</strong> Kombinera med <a href="/docs/ai-automation/guidance">Guidance</a>-regler för att ange terminologi-preferenser per språk (t.ex. "Använd brittisk engelska" eller "Använd informell svenska").</div>`
    },
    {
      id: 'multilingual-best-practices',
      title: 'Best practices',
      content: `<p>Rekommendationer för flerspråkig support:</p>
<ul>
<li><strong>Kunskapsbas på flera språk</strong> — Ladda upp artiklar på de språk du stödjer i <a href="/docs/knowledge/knowledge-sources">Knowledge</a>. AI:n kan söka kontextuellt oavsett språk.</li>
<li><strong>Testa med simulering</strong> — Använd <a href="/docs/ai-automation/testing">Test-funktionen</a> med meddelanden på alla aktiverade språk</li>
<li><strong>Övervakning</strong> — Använd <a href="/docs/analytics/report-types">Channels-rapporten</a> för att se volym per språk och identifiera otäckta marknader</li>
<li><strong>Fallback</strong> — Om AI:n inte klarar ett språk eskaleras ärendet till mänsklig agent med originalmeddelandet</li>
</ul>`
    }
  ]
};

// --- ARTICLE 2: Office Hours ---
const officeHoursArticle = {
  slug: 'office-hours',
  title: 'Öppettider & Tillgänglighet',
  content: '<p>Konfigurera ditt teams öppettider för att automatiskt hantera kunders förväntningar utanför arbetstid. AI-agenten kan fortsätta svara dygnet runt medan mänskliga agenter bara är tillgängliga under kontorstid.</p>',
  sections: [
    {
      id: 'configure-hours',
      title: 'Ställ in öppettider',
      content: `<p>Gå till <a href="/dashboard/settings/office-hours">Inställningar → Office Hours</a>. Här konfigurerar du:</p>
<ol>
<li><strong>Aktivera öppettider</strong> — Slå på funktionen med toggle-knappen</li>
<li><strong>Schema per veckodag</strong> — Ställ in start- och sluttid för varje dag (Måndag–Söndag)</li>
<li><strong>Tidsintervall</strong> — Tider anges i 30-minutersintervall (t.ex. 08:00, 08:30, 09:00...)</li>
<li><strong>Tidszon</strong> — Välj den tidszon som gäller för ditt schema</li>
</ol>
<p>Varje dag kan aktiveras eller inaktiveras individuellt — perfekt om du inte har support på helger.</p>`
    },
    {
      id: 'auto-reply',
      title: 'Autosvar utanför öppettider',
      content: `<p>När en kund skriver <strong>utanför kontorstid</strong>:</p>
<ul>
<li><strong>AI-agenten</strong> fortsätter svara som vanligt (om aktiverad)</li>
<li>Om AI:n inte kan lösa ärendet, eller om det behöver mänsklig handläggning, skickas ett <strong>automatiskt meddelande</strong></li>
<li>Autosvaret informerar kunden om att teamet är tillbaka nästa arbetsdag</li>
</ul>
<p>Aktivera autosvar under Office Hours-inställningarna:</p>
<ul>
<li><strong>Auto-reply outside hours</strong> — Slå på/av automatiska svar</li>
<li>Anpassa meddelandet via <a href="/docs/ai-automation/guidance">Guidance</a>-regler</li>
</ul>
<div class="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4"><strong>OBS:</strong> AI-agenten påverkas <em>inte</em> av öppettider — den svarar alltid. Öppettider kontrollerar bara tillgängligheten av mänskliga agenter och autosvarsmeddelanden.</div>`
    },
    {
      id: 'office-hours-integration',
      title: 'Integration med andra funktioner',
      content: `<p>Öppettider påverkar flera delar av SWEO AI:</p>
<table><thead><tr><th>Funktion</th><th>Påverkan</th></tr></thead><tbody>
<tr><td><strong>SLA-rapporter</strong></td><td>Svarstider räknas bara under öppettid — om kunden skriver kl. 22:00 och du svarar kl. 08:00 räknas det som 0 min.</td></tr>
<tr><td><strong>Handoff & Eskalering</strong></td><td>Ekalerade ärenden utanför kontorstid köas till nästa arbetsdag</td></tr>
<tr><td><strong>Chat-widget</strong></td><td>Widgeten kan visa "Vi är offline"-meddelande och dölja livechatt-alternativet</td></tr>
<tr><td><strong>Auto-tilldelning</strong></td><td>Ärenden tilldelas inte agenter utanför deras arbetstid</td></tr>
</tbody></table>
<div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4"><strong>Tips:</strong> Kombinera öppettider med <a href="/docs/channels/web-messenger">Web Messenger</a>-inställningar för att visa anpassade välkomstmeddelanden beroende på tid på dygnet.</div>`
    }
  ]
};

// Add articles
const channelsCat = data.find(c => c.slug === 'channels');
const teamCat = data.find(c => c.slug === 'team-management');

if (!channelsCat || !teamCat) {
  console.error('ERROR: Required categories not found');
  process.exit(1);
}

// Multilingual goes to team-management
if (!teamCat.articles.some(a => a.slug === 'multilingual')) {
  teamCat.articles.push(multilingualArticle);
  console.log('✅ Added "Flerspråkigt stöd" to team-management category');
} else {
  console.log('multilingual already exists, skipping');
}

// Office Hours goes to team-management (workspace config)
if (!teamCat.articles.some(a => a.slug === 'office-hours')) {
  teamCat.articles.push(officeHoursArticle);
  console.log('✅ Added "Öppettider & Tillgänglighet" to team-management category');
} else {
  console.log('office-hours already exists, skipping');
}

fs.writeFileSync('src/config/docs-data.json', JSON.stringify(data, null, 2));
console.log('\nTotal categories:', data.length);
console.log('Total articles:', data.reduce((s, c) => s + c.articles.length, 0));
