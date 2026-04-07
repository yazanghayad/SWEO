import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/config/docs-data.json', 'utf8'));

// --- ARTICLE 1: Reports deep-dive (add to analytics category) ---
const reportsArticle = {
  slug: 'report-types',
  title: 'Rapporttyper — Alla 19 rapporter',
  content: '<p>SWEO AI har 19 förbyggda rapporter som täcker allt från konversationsvolymer och svarstider till AI-prestanda och SLA-efterlevnad. Varje rapport kan filtreras på tidsperiod, tidszon och exporteras i flera format.</p>',
  sections: [
    {
      id: 'report-navigation',
      title: 'Navigera rapporter',
      content: `<p>Gå till <a href="/dashboard/reports">Rapporter</a> i sidomenyn. Sidebaren till vänster ger snabb åtkomst till:</p>
<ul>
<li><strong>Overview</strong> — Sammanfattning med diagramöversikt och snabblänkar</li>
<li><strong>All Reports</strong> — Komplett lista med alla 19 rapporter</li>
<li><strong>Your Reports</strong> — Dina sparade/favoritmarkerade rapporter</li>
<li><strong>Topics</strong> — Topicanalys och trender</li>
<li><strong>Suggestions</strong> — AI-genererade förbättringsförslag</li>
<li><strong>Dataset Export</strong> — Exportera rådata</li>
<li><strong>Manage Schedules</strong> — Schemalagda rapporter (kommande)</li>
</ul>
<p>Varje rapport har en <strong>verktygsfält</strong> med datumväljare (7/14/30/90 dagar), tidszonsväxlare och exportmeny.</p>`
    },
    {
      id: 'conversation-reports',
      title: 'Konversations- & Volymrapporter',
      content: `<table><thead><tr><th>Rapport</th><th>Visar</th></tr></thead><tbody>
<tr><td><strong>Conversations</strong></td><td>Totalt antal, lösta, eskalerade, aktiva. Daglig trendtabell och statusfördelning.</td></tr>
<tr><td><strong>Tickets</strong></td><td>Ärendevolym, öppen backlog, statusfördelning, daglig trend per kanal.</td></tr>
<tr><td><strong>Channels</strong></td><td>Antal aktiva kanaler, volym per kanal (chat/email/whatsapp etc.), detaljerad kanaltabell.</td></tr>
<tr><td><strong>Busiest Hours</strong></td><td>Volym per timme (0–23) och veckodag, heatmap-matris (dag × timme).</td></tr>
</tbody></table>`
    },
    {
      id: 'performance-reports',
      title: 'Prestanda- & Tidsrapporter',
      content: `<table><thead><tr><th>Rapport</th><th>Visar</th></tr></thead><tbody>
<tr><td><strong>First Response</strong></td><td>Median, genomsnitt och p90 för första svarstiden. Fördelningsbuckets (0–1m, 1–5m, 5–15m, 15–30m, 30–60m, 60m+).</td></tr>
<tr><td><strong>Resolution Time</strong></td><td>Samma metrik-struktur som First Response men för total lösningstid.</td></tr>
<tr><td><strong>Effectiveness</strong></td><td>Övergripande effektivitetsmetrik som kombinerar svarstid, CSAT och lösningsgrad.</td></tr>
<tr><td><strong>Responsiveness</strong></td><td>Svarstidsmetrik fokuserad på agenternas reaktionshastighet.</td></tr>
<tr><td><strong>SLAs</strong></td><td>SLA-mål (t.ex. första svar &lt;5 min, lösning &lt;60 min), efterlevnadsgrad, per-kanal compliance.</td></tr>
</tbody></table>`
    },
    {
      id: 'ai-reports',
      title: 'AI & Automation-rapporter',
      content: `<table><thead><tr><th>Rapport</th><th>Visar</th></tr></thead><tbody>
<tr><td><strong>SWEO AI Agent</strong></td><td>AI-lösta ärenden, deflection rate, genomsnittlig confidence, AI vs mänsklig lösningstid, confidence-fördelning (hög/medel/låg), toppämnen.</td></tr>
<tr><td><strong>SWEO Performance</strong></td><td>Automatiseringsrate, involveringsrate, SVG Sankey-funnel (kanal-in → löst/eskalerad-ut), trendgraf över tid.</td></tr>
<tr><td><strong>SWEO Deflection</strong></td><td>Deflection-metrik — hur stor andel ärenden AI löser utan mänsklig hjälp.</td></tr>
<tr><td><strong>Knowledge Gaps</strong></td><td>Ämnen där AI har låg confidence, saknade kunskapsartiklar, gap-analys.</td></tr>
<tr><td><strong>Copilot</strong></td><td>AI Copilot-användningsmetrik — hur ofta agenter använder AI-assistans i inboxen.</td></tr>
</tbody></table>`
    },
    {
      id: 'team-customer-reports',
      title: 'Team- & Kundnöjdhetsrapporter',
      content: `<table><thead><tr><th>Rapport</th><th>Visar</th></tr></thead><tbody>
<tr><td><strong>Team Performance</strong></td><td>Antal agenter, totalt lösta, genomsnittlig lösningstid, genomsnittlig CSAT, individuell agenttabell.</td></tr>
<tr><td><strong>Team Inbox Performance</strong></td><td>Prestanda per team-inbox (om du har flera team).</td></tr>
<tr><td><strong>CSAT</strong></td><td>Genomsnittligt CSAT-betyg, nöjdhetsgrad, AI vs mänsklig CSAT, sentiment (positiv/neutral/negativ), CSAT per agent.</td></tr>
<tr><td><strong>Surveyed CSAT</strong></td><td>Enkätbaserad CSAT med detaljerade svarsmönster.</td></tr>
<tr><td><strong>Calls</strong></td><td>Samtalsspecifik metrik (för röstkanalen).</td></tr>
</tbody></table>`
    },
    {
      id: 'export-formats',
      title: 'Exportformat',
      content: `<p>Alla rapporter kan exporteras i fyra format:</p>
<table><thead><tr><th>Format</th><th>Innehåll</th></tr></thead><tbody>
<tr><td><strong>CSV</strong></td><td>Sammanfattning + tidsserier + kanaler + agenter + ämnen i tabellformat</td></tr>
<tr><td><strong>JSON</strong></td><td>Rå metrikdata — perfekt för API-integration och vidare bearbetning</td></tr>
<tr><td><strong>PDF</strong></td><td>Formaterat dokument med tabeller via jsPDF (KPI-sammanfattning, kanaldata, agentdata, ämnen)</td></tr>
<tr><td><strong>DOCX</strong></td><td>Word-dokument med stilade tabeller — idealisk för delning med stakeholders</td></tr>
</tbody></table>
<div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4"><strong>Tips:</strong> Kombinera rapporter med <a href="/docs/analytics/ai-insights">AI Insights</a> för att automatiskt identifiera förbättringsområden baserat på rapportdata.</div>`
    }
  ]
};

// --- ARTICLE 2: Macros & Tags (add to inbox category) ---
const macrosTagsArticle = {
  slug: 'macros-tags',
  title: 'Macros & Taggar',
  content: '<p>Macros (sparade svar) och taggar hjälper ditt team att arbeta snabbare och mer konsekvent i inboxen. Skapa återanvändbara svarsmallar och kategorisera konversationer med färgkodade taggar.</p>',
  sections: [
    {
      id: 'macros-overview',
      title: 'Macros — Sparade svar',
      content: `<p>Macros är <strong>förskrivna svarsmallar</strong> som agenter kan infoga med ett klick. Gå till <a href="/dashboard/settings/macros">Inställningar → Macros</a>.</p>
<h4>Skapa en macro</h4>
<ol>
<li>Klicka <strong>"Add Macro"</strong></li>
<li>Ange ett <strong>namn</strong> (t.ex. "Välkomstmeddelande" eller "Leveransstatus")</li>
<li>Skriv <strong>innehållet</strong> — hela svaret som agenten ska kunna använda</li>
<li>Klicka <strong>Spara</strong></li>
</ol>
<h4>Använda macros</h4>
<ul>
<li>I inboxen kan du välja bland sparade macros via snabbmenyn</li>
<li>Macros infogas som text och kan redigeras innan skickning</li>
<li>Användningsstatistik spåras per macro</li>
</ul>`
    },
    {
      id: 'tags-overview',
      title: 'Taggar — Kategorisering',
      content: `<p>Taggar låter dig <strong>färgkoda och kategorisera</strong> konversationer och ärenden. Gå till <a href="/dashboard/settings/tags">Inställningar → Tags</a>.</p>
<h4>Skapa en tagg</h4>
<ol>
<li>Klicka <strong>"Add Tag"</strong></li>
<li>Ange taggnamn (t.ex. "VIP", "Bug", "Feature Request")</li>
<li>Välj en <strong>färg</strong> bland sex tillgängliga alternativ</li>
<li>Klicka <strong>Spara</strong></li>
</ol>
<h4>Tillgängliga färger</h4>
<table><thead><tr><th>Färg</th><th>CSS-klass</th></tr></thead><tbody>
<tr><td>🔵 Blå</td><td>Standard/primär</td></tr>
<tr><td>🟢 Grön</td><td>Positiv/löst</td></tr>
<tr><td>🟡 Gul</td><td>Väntar/OBS</td></tr>
<tr><td>🔴 Röd</td><td>Brådskande/kritisk</td></tr>
<tr><td>🟣 Lila</td><td>Special/VIP</td></tr>
<tr><td>⚪ Grå</td><td>Övrigt/neutral</td></tr>
</tbody></table>`
    },
    {
      id: 'macros-tags-workflow',
      title: 'Best practices',
      content: `<p>Tips för effektiv användning:</p>
<ul>
<li><strong>Namnkonvention</strong> — Använd tydliga, beskrivande namn. Prefix med kategori: "Svar: Leverans", "Svar: Retur", etc.</li>
<li><strong>Taggstruktur</strong> — Skapa taggar baserat på affärslogik: produktkategori, ärendetyp, prioritet eller team</li>
<li><strong>Kombinera med automation</strong> — Använd <a href="/docs/team-management/automation-rules">automatiseringsregler</a> för att automatiskt tagga konversationer baserat på nyckelord</li>
<li><strong>Rapportering</strong> — Taggar syns i <a href="/docs/analytics/report-types">rapporter</a> och kan användas för att filtrera och analysera trender</li>
</ul>
<div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4"><strong>Tips:</strong> En bra taggstruktur gör det enklare att identifiera <a href="/docs/analytics/ai-insights">knowledge gaps</a> och förbättra AI-agentens träningsdata.</div>`
    }
  ]
};

// Add articles
const analyticsCat = data.find(c => c.slug === 'analytics');
const inboxCat = data.find(c => c.slug === 'inbox');

if (!analyticsCat || !inboxCat) {
  console.error('ERROR: Required categories not found');
  process.exit(1);
}

if (!analyticsCat.articles.some(a => a.slug === 'report-types')) {
  analyticsCat.articles.push(reportsArticle);
  console.log('✅ Added "Rapporttyper — Alla 19 rapporter" to analytics category');
} else {
  console.log('report-types already exists, skipping');
}

if (!inboxCat.articles.some(a => a.slug === 'macros-tags')) {
  inboxCat.articles.push(macrosTagsArticle);
  console.log('✅ Added "Macros & Taggar" to inbox category');
} else {
  console.log('macros-tags already exists, skipping');
}

fs.writeFileSync('src/config/docs-data.json', JSON.stringify(data, null, 2));
console.log('\nTotal categories:', data.length);
console.log('Total articles:', data.reduce((s, c) => s + c.articles.length, 0));
