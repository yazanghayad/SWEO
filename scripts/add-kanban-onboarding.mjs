import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/config/docs-data.json', 'utf8'));

// --- ARTICLE 1: Kanban (add new category "productivity") ---
const kanbanArticle = {
  slug: 'kanban-board',
  title: 'Kanban-tavla',
  content: '<p>Kanban-tavlan i SWEO AI ger ditt team en visuell översikt av uppgifter och arbetsflöden. Dra och släpp kort mellan kolumner för att organisera arbetet — helt utan backend, allt sparas lokalt i din webbläsare.</p>',
  sections: [
    {
      id: 'kanban-overview',
      title: 'Översikt',
      content: `<p>Gå till <a href="/dashboard/kanban">Kanban</a> i sidomenyn. Tavlan visar uppgifter organiserade i kolumner:</p>
<ul>
<li><strong>Kolumner</strong> — Representerar stadier i arbetsflödet (t.ex. Todo, In Progress, Done)</li>
<li><strong>Kort</strong> — Varje uppgift visas som ett kort med titel och beskrivning</li>
<li><strong>Drag-and-drop</strong> — Flytta kort mellan kolumner eller ändra ordning inom en kolumn</li>
</ul>
<p>Du startar med en <strong>TODO</strong>-kolumn och kan lägga till fler kolumner efter behov.</p>`
    },
    {
      id: 'create-tasks',
      title: 'Skapa uppgifter',
      content: `<p>Klicka på <strong>"Add New Todo"</strong>-knappen i sidhuvudet. En dialog öppnas där du fyller i:</p>
<table><thead><tr><th>Fält</th><th>Beskrivning</th></tr></thead><tbody>
<tr><td><strong>Titel</strong></td><td>Kort sammanfattning av uppgiften (obligatoriskt)</td></tr>
<tr><td><strong>Beskrivning</strong></td><td>Mer detaljerad information (valfritt)</td></tr>
</tbody></table>
<p>Nya uppgifter läggs automatiskt i <strong>TODO</strong>-kolumnen.</p>`
    },
    {
      id: 'manage-columns',
      title: 'Hantera kolumner',
      content: `<p>Kolumner representerar steg i ditt arbetsflöde. Du kan:</p>
<ul>
<li><strong>Lägga till kolumn</strong> — Klicka på <strong>"+ Add Section"</strong>-knappen längst till höger på tavlan</li>
<li><strong>Byta namn</strong> — Klicka på menyikonen (⋯) på kolumnen och välj <em>Rename</em></li>
<li><strong>Ta bort kolumn</strong> — Klicka på menyikonen och välj <em>Delete Section</em>. En bekräftelsedialog visas innan borttagning.</li>
<li><strong>Flytta kolumn</strong> — Dra kolumnen via draghandtaget och släpp den på ny position</li>
</ul>
<div class="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4"><strong>OBS:</strong> Att ta bort en kolumn tar inte bort uppgifterna i den — de försvinner dock från vyn. Skapa kolumner utifrån ditt teams faktiska arbetsflöde.</div>`
    },
    {
      id: 'drag-and-drop',
      title: 'Drag-and-drop',
      content: `<p>Tavlan stödjer avancerad drag-and-drop med mus och pekskärm:</p>
<ul>
<li><strong>Flytta kort till annan kolumn</strong> — Dra kortet och släpp det i målkolumnen för att ändra status</li>
<li><strong>Sortera kort</strong> — Dra ett kort uppåt eller nedåt inom samma kolumn för att ändra ordning</li>
<li><strong>Sortera kolumner</strong> — Dra en hel kolumn till ny position på tavlan</li>
</ul>
<p>Under drag visas en <strong>förhandsgranskning</strong> (overlay) av det element du drar, och tillgänglighetsinformation tillhandahålls via ARIA-meddelanden.</p>`
    },
    {
      id: 'kanban-persistence',
      title: 'Datalagring',
      content: `<p>Kanban-tavlan sparar all data <strong>lokalt i webbläsaren</strong> (localStorage). Det betyder:</p>
<ul>
<li>Data behålls mellan sidladdningar och sessioner i samma webbläsare</li>
<li>Data delas <strong>inte</strong> mellan enheter eller teammedlemmar</li>
<li>Att rensa webbläsarens data nollställer tavlan</li>
</ul>
<div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4"><strong>Tips:</strong> Kanban-tavlan är perfekt för personlig arbetsorganisering. För team-övergripande ärendehantering, använd <a href="/docs/inbox/cases">Cases</a>.</div>`
    }
  ]
};

// --- ARTICLE 2: Onboarding (add to getting-started category) ---
const onboardingArticle = {
  slug: 'onboarding',
  title: 'Onboarding-guiden',
  content: '<p>När du skapar ett nytt workspace i SWEO AI leds du genom en kort onboarding-guide som samlar in grundläggande information om ditt företag och konfigurerar din arbetsyta.</p>',
  sections: [
    {
      id: 'onboarding-flow',
      title: 'Steg-för-steg',
      content: `<p>Onboarding-guiden körs automatiskt när du loggar in för första gången. Den består av <strong>två steg</strong>:</p>
<h4>Steg 1: Företagsnamn</h4>
<ul>
<li>Ange ditt <strong>företagsnamn</strong> — detta blir namnet på din workspace</li>
<li>Klicka <strong>Continue</strong> eller tryck <kbd>Enter</kbd> för att gå vidare</li>
</ul>
<h4>Steg 2: Företagsstorlek</h4>
<p>Välj den storlek som bäst beskriver din organisation:</p>
<table><thead><tr><th>Alternativ</th><th>Beskrivning</th></tr></thead><tbody>
<tr><td><strong>1–15</strong></td><td>Litet team / startup</td></tr>
<tr><td><strong>16–49</strong></td><td>Växande företag</td></tr>
<tr><td><strong>50–199</strong></td><td>Medelstort företag</td></tr>
<tr><td><strong>200–1 999</strong></td><td>Stort företag</td></tr>
<tr><td><strong>2 000+</strong></td><td>Enterprise</td></tr>
</tbody></table>
<p>Klicka <strong>Start free trial</strong> för att slutföra konfigurationen.</p>`
    },
    {
      id: 'what-gets-configured',
      title: 'Vad konfigureras?',
      content: `<p>Baserat på dina svar sätts följande upp automatiskt:</p>
<ul>
<li><strong>Workspace-namn</strong> — Sätts till ditt företagsnamn</li>
<li><strong>Företagsstorlek</strong> — Används för att anpassa rekommendationer och planer</li>
<li><strong>Standardkanal</strong> — Web-chatten aktiveras automatiskt</li>
<li><strong>AI-agent</strong> — En AI-agent skapas med professionell ton och standardinställningar</li>
<li><strong>Tidszon & språk</strong> — Sätts till UTC och engelska som standard (kan ändras i <a href="/dashboard/settings">Inställningar</a>)</li>
</ul>
<p>När onboarding är klar markeras din workspace som konfigurerad och du omdirigeras till <a href="/dashboard/overview">Dashboard</a>.</p>`
    },
    {
      id: 'after-onboarding',
      title: 'Nästa steg efter onboarding',
      content: `<p>Efter att du slutfört onboarding rekommenderar vi att du:</p>
<ol>
<li><strong>Lägg till kunskapskällor</strong> — Gå till <a href="/docs/knowledge/knowledge-sources">Knowledge</a> och ladda upp artiklar, FAQ:er eller hjälpcenter-innehåll</li>
<li><strong>Konfigurera din AI-agent</strong> — Gå till <a href="/docs/ai-automation/ai-settings">AI-inställningar</a> och finjustera ton och beteende</li>
<li><strong>Installera chat-widgeten</strong> — Följ guiden i <a href="/docs/channels/web-messenger">Web Messenger</a> för att bädda in chatten på din webbplats</li>
<li><strong>Bjud in teammedlemmar</strong> — Gå till <a href="/docs/team-management/team-roles">Team & Roller</a> för att lägga till agenter</li>
<li><strong>Ställ in Guidance</strong> — Gå till <a href="/docs/ai-automation/guidance">Guidance</a> för att anpassa hur AI:n kommunicerar</li>
</ol>
<div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4"><strong>Tips:</strong> Du kan alltid komma åt onboarding-liknande inställningar via <a href="/dashboard/settings">Workspace-inställningar</a> efter att guiden slutförts.</div>`
    }
  ]
};

// Add Kanban to a new "productivity" category OR to an existing one
// Let's check if there's a good fit... team-management seems closest, but let's add as new category
const existingProductivity = data.find(c => c.slug === 'productivity');
if (!existingProductivity) {
  data.push({
    slug: 'productivity',
    title: 'Produktivitet',
    icon: 'layout',
    description: 'Verktyg för att organisera arbete och hålla koll på teamets uppgifter.',
    articles: [kanbanArticle]
  });
  console.log('✅ Added new "Produktivitet" category with "Kanban-tavla" article');
} else {
  if (!existingProductivity.articles.some(a => a.slug === 'kanban-board')) {
    existingProductivity.articles.push(kanbanArticle);
    console.log('✅ Added "Kanban-tavla" to productivity category');
  } else {
    console.log('kanban-board already exists, skipping');
  }
}

// Add Onboarding to getting-started category
const gsCat = data.find(c => c.slug === 'getting-started');
if (!gsCat) {
  console.error('ERROR: getting-started category not found');
  process.exit(1);
}
if (gsCat.articles.some(a => a.slug === 'onboarding')) {
  console.log('onboarding article already exists, skipping');
} else {
  // Insert as 2nd article (after introduction)
  gsCat.articles.splice(1, 0, onboardingArticle);
  console.log('✅ Added "Onboarding-guiden" to getting-started category (position 2)');
}

fs.writeFileSync('src/config/docs-data.json', JSON.stringify(data, null, 2));
console.log('\nTotal categories:', data.length);
console.log('Total articles:', data.reduce((s, c) => s + c.articles.length, 0));
