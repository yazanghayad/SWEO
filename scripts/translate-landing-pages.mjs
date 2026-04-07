#!/usr/bin/env node
/**
 * Generate Swedish landing page files from English source pages.
 *
 * Usage:  node scripts/translate-landing-pages.mjs
 *
 * For each page listed in PAGE_ORDER, the script:
 *   1. Reads the English page from src/app/(landing)/<slug>/page.tsx
 *   2. Applies common + page-specific string replacements
 *   3. Writes the Swedish page to src/app/sv/(landing)/<slug>/page.tsx
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const ROOT = process.cwd();
const EN_BASE = join(ROOT, 'src/app/(landing)');
const SV_BASE = join(ROOT, 'src/app/sv/(landing)');

// ─── Common translations (shared across all pages) ──────────────
const COMMON = [
  // CTAs & buttons
  ['Start free trial', 'Starta gratis provperiod'],
  ['View demo', 'Se demo'],
  ['View demos', 'Se demos'],
  ['Learn more', 'Läs mer'],
  ['Read more', 'Läs mer'],
  ['Contact sales', 'Kontakta sälj'],
  ['Get started', 'Kom igång'],
  ['Watch video', 'Se video'],
  ['Sign up', 'Registrera dig'],
  ['Log in', 'Logga in'],
  ['See all', 'Se alla'],
  ['Book a demo', 'Boka en demo'],
  ['Try for free', 'Prova gratis'],
  ['Get a demo', 'Få en demo'],
  ['Request demo', 'Begär demo'],
  ['Talk to sales', 'Prata med sälj'],
  ['Talk to an expert', 'Prata med en expert'],
  ['See pricing', 'Se priser'],
  ['Explore', 'Utforska'],
  ['Download', 'Ladda ner'],
  ['Subscribe', 'Prenumerera'],

  // Section labels
  ['Specification', 'Specifikation'],
  ['Customers', 'Kunder'],
  ['Use Cases', 'Användningsfall'],
  ['Overview', 'Översikt'],
  ['Features', 'Funktioner'],
  ['Benefits', 'Fördelar'],
  ['How it works', 'Hur det fungerar'],
  ['Why choose', 'Varför välja'],
  ['Customer stories', 'Kundberättelser'],
  ['Resources', 'Resurser'],
  ['Integrations', 'Integrationer'],
  ['Pricing', 'Priser'],
  ['Enterprise', 'Företag'],
  ['Security', 'Säkerhet'],
  ['Privacy', 'Integritet'],
  ['Compliance', 'Efterlevnad'],

  // AI Engine phases
  ['Phase 1', 'Fas 1'],
  ['Phase 2', 'Fas 2'],
  ['Phase 3', 'Fas 3'],
  ['Phase 4', 'Fas 4'],
  ['Phase 5', 'Fas 5'],
  ['always-on', 'alltid aktiv'],
  ['safeguarding', 'skyddande'],

  // Common product terms (keep brand names)
  ['Powered by fin-cx models', 'Drivs av fin-cx-modeller'],
  ['resolution rate', 'lösningsgrad'],
  ['customer service', 'kundtjänst'],
  ['customer support', 'kundsupport'],
  ['customer experience', 'kundupplevelse'],
  ['human agent', 'mänsklig agent'],
  ['human agents', 'mänskliga agenter'],
  ['AI Agent', 'AI-agent'],
  ['AI agent', 'AI-agent'],
  ['knowledge base', 'kunskapsbas'],
  ['help center', 'hjälpcenter'],

  // Common words/phrases in content
  ['trusted by', 'betrodd av'],
  ['Built for', 'Byggd för'],
  ['Designed for', 'Designad för'],
  ['Available on', 'Tillgänglig på'],
  ['Coming soon', 'Kommer snart'],
  ['New', 'Nytt'],
  ['Popular', 'Populär'],
  ['Recommended', 'Rekommenderad'],
  ['Most popular', 'Mest populär'],
  ['Best value', 'Bäst värde'],
  ['per month', 'per månad'],
  ['per year', 'per år'],
  ['per seat', 'per plats'],
  ['/mo', '/mån'],
  ['Free', 'Gratis'],
  ['Custom', 'Anpassad'],
  ['included', 'inkluderat'],
  ['Everything in', 'Allt i'],
  ['plus', 'plus'],

  // Footer/legal
  ['Terms of Service', 'Användarvillkor'],
  ['Privacy Policy', 'Integritetspolicy'],
  ['Cookie Policy', 'Cookie-policy'],
  ['All rights reserved', 'Alla rättigheter förbehållna'],
];

// ─── Page-specific translations ─────────────────────────────────
const PAGE_TRANSLATIONS = {
  'ai-engine': [
    // Metadata
    ["title: 'The Fin AI Engine™: Powering Next-Gen AI Support'", "title: 'SWEO AI Engine™: Nästa generations AI-support'"],
    ["description: 'Discover how the patented Fin AI Engine™ powers Fin to answer the most complex queries with the highest quality answers across any customer service channel.'", "description: 'Upptäck hur den patenterade SWEO AI Engine™ driver SWEO att besvara de mest komplexa frågorna med högsta kvalitet på svar över alla kundtjänstkanaler.'"],

    // Hero
    ['AI engineered for precision, speed, and reliability.', 'AI utvecklad för precision, snabbhet och tillförlitlighet.'],
    ['The patented <span className="text-white">Fin AI Engine™</span> allows Fin to refine every query, optimize every response and validate the quality of each answer.', 'Den patenterade <span className="text-white">SWEO AI Engine™</span> förfinar varje fråga, optimerar varje svar och validerar kvaliteten på varje svar.'],
    ["That's why Fin is the only AI Agent that can balance industry-high resolutions with industry-low hallucinations, making it the highest-performing and safest AI Agent in customer service.", 'Därför är SWEO den enda AI-agenten som kan balansera branschledande lösningsgrad med branschens lägsta hallucinationer, vilket gör den till den högst presterande och säkraste AI-agenten inom kundtjänst.'],

    // Engine sections
    ['Refine the query', 'Förfina frågan'],
    ['In order to optimize the accuracy of an answer that an LLM generates, the inputs the LLM receives must be refined for comprehension. The clearer and more understandable the query, the better the output.', 'För att optimera noggrannheten hos ett svar som en LLM genererar måste indata förfinas för förståelse. Ju tydligare och mer begriplig frågan är, desto bättre blir resultatet.'],
    ['Check for safety and relevance', 'Kontrollera säkerhet och relevans'],
    ['Optimize query comprehension', 'Optimera frågeförståelse'],
    ['Check for Workflows automation', 'Kontrollera arbetsflödesautomatisering'],
    ['Check for Custom Answer', 'Kontrollera anpassat svar'],

    ['Retrieve relevant content', 'Hämta relevant innehåll'],
    ['retrieval process, powered by our proprietary custom fin-cx-retrieval model, searches across all available knowledge sources', 'hämtningsprocess, driven av vår egenutvecklade fin-cx-retrieval-modell, söker igenom alla tillgängliga kunskapskällor'],
    ['help center articles, resolved conversations, structured snippets, integrated systems etc', 'hjälpcenterartiklar, lösta konversationer, strukturerade utdrag, integrerade system etc'],
    ['and selects the most relevant information to be used to answer accurately.', 'och väljer den mest relevanta informationen för att svara korrekt.'],
    ['Understand intent behind the question', 'Förstå avsikten bakom frågan'],
    ['Search across all available content sources', 'Sök igenom alla tillgängliga innehållskällor'],
    ['Match on semantics, not just keywords', 'Matcha på semantik, inte bara nyckelord'],

    ['Rerank for precision', 'Omrangordna för precision'],
    ['reranking process, powered by our proprietary custom fin-cx-reranker model, takes the retrieved content and scores each piece for relevance, accuracy, and usefulness in context.', 'omrangordningsprocess, driven av vår egenutvecklade fin-cx-reranker-modell, tar det hämtade innehållet och poängsätter varje del för relevans, noggrannhet och användbarhet i sammanhanget.'],
    ['It then selects the final piece(s) for the LLM to use.', 'Den väljer sedan de slutliga delarna för LLM:en att använda.'],
    ['Score relevance with respect to query', 'Poängsätt relevans i förhållande till frågan'],
    ['Evaluate context match and resolution fit', 'Utvärdera kontextmatchning och lösningspassning'],
    ['Downrank outdated or low-confidence sources', 'Nedrangordna föråldrade eller lågkonfidens-källor'],
    ['Output: final selected content for generation', 'Resultat: slutligt valt innehåll för generering'],

    ['Generate a response', 'Generera ett svar'],
    ['Once a query has been checked and optimized, the next stage is to generate a response using the LLM.', 'När en fråga har kontrollerats och optimerats är nästa steg att generera ett svar med hjälp av LLM:en.'],
    ['bespoke and enhanced generative process, hand-engineered and tested at scale to generate answers with the highest chance of resolving customer questions.', 'skräddarsydd och förbättrad generativ process, handkonstruerad och testad i stor skala för att generera svar med högst sannolikhet att lösa kundfrågor.'],
    ['At this point, any custom Guidance provided by the user to control the generated answer is also applied.', 'Vid denna punkt tillämpas även eventuell anpassad vägledning som tillhandahålls av användaren för att styra det genererade svaret.'],
    ['This is the final step of our Retrieval Augmented Generation system (RAG for short).', 'Detta är det sista steget i vårt Retrieval Augmented Generation-system (RAG).'],
    ['Integrate and augment', 'Integrera och förstärk'],
    ['Interpret and apply Guidance', 'Tolka och tillämpa vägledning'],
    ['Generate response', 'Generera svar'],

    ['Validate accuracy', 'Validera noggrannhet'],
    ['In the final step of the process, the Fin AI Engine™ performs checks to understand whether the output from the LLM meets the necessary response accuracy and safety standards.', 'I det sista steget av processen utför SWEO AI Engine™ kontroller för att förstå om LLM:ens resultat uppfyller nödvändiga krav på svarsnoggrannhet och säkerhetsstandarder.'],
    ['Validate the response', 'Validera svaret'],
    ['Respond to customer', 'Svara kunden'],

    ['Engine optimization', 'Motoroptimering'],
    ['To calibrate and enhance engine performance, the Fin AI Engine™ has advanced integrated tools that help optimize answer generation, efficiency, precision, and coverage.', 'För att kalibrera och förbättra motorns prestanda har SWEO AI Engine™ avancerade integrerade verktyg som hjälper till att optimera svarsgenerering, effektivitet, precision och täckning.'],
    ['Fin customization and control', 'Anpassning och kontroll'],
    ['AI analytics and reporting', 'AI-analys och rapportering'],
    ['AI recommendations', 'AI-rekommendationer'],

    ['AI Trust & Security', 'AI-tillit & säkerhet'],
    ['Intercom has implemented state-of-the-art security measures to protect Fin against a wide range of LLM threats', 'SWEO har implementerat toppmoderna säkerhetsåtgärder för att skydda mot ett brett spektrum av LLM-hot'],
    ['including those identified by the OWASP LLM Top 10.', 'inklusive de som identifierats av OWASP LLM Top 10.'],
    ['By consistently testing a variety of high-end LLMs, and deploying rigorous internal controls, security protocols, and safeguards', 'Genom att konsekvent testa en mängd avancerade LLM:er och implementera rigorösa interna kontroller, säkerhetsprotokoll och skyddsåtgärder'],
    ['Fin is able to achieve the highest level of security and reliability while avoiding potential limitations and threats.', 'kan SWEO uppnå högsta nivå av säkerhet och tillförlitlighet samtidigt som potentiella begränsningar och hot undviks.'],
    ['Fin AI Security', 'SWEO AI-säkerhet'],
    ['Regional hosting', 'Regional hosting'],
    ['Compliance: International Standards', 'Efterlevnad: Internationella standarder'],
    ['Third-party AI Providers', 'Tredjeparts AI-leverantörer'],

    // FAQ section
    ["How does Fin's AI Engine work?", 'Hur fungerar SWEOs AI Engine?'],
    ["Fin's AI Engine™ is a patented architecture purpose-built for customer service.", 'SWEOs AI Engine™ är en patenterad arkitektur specialbyggd för kundtjänst.'],
    ['Every layer is optimized for accuracy, speed, safety and reliability', 'Varje lager är optimerat för noggrannhet, snabbhet, säkerhet och tillförlitlighet'],
    ['so Fin resolves more queries and delivers higher-quality experiences than any other AI agent.', 'så att SWEO löser fler frågor och levererar upplevelser av högre kvalitet än någon annan AI-agent.'],
    ['What makes the Fin AI Engine the highest performing?', 'Vad gör SWEO AI Engine till den högst presterande?'],
    ["The Fin AI Engine™ is a patented architecture purpose-built for customer service.", 'SWEO AI Engine™ är en patenterad arkitektur specialbyggd för kundtjänst.'],
    ['Is the Fin AI Engine ready for enterprise scale?', 'Är SWEO AI Engine redo för företagsskala?'],
    ['Absolutely. Fin is proven across millions of customer conversations', 'Absolut. SWEO är bevisad genom miljontals kundkonversationer'],
    ['delivering 99.97% uptime, enterprise-grade reliability, and compliance with SOC 2, ISO 42001, and HIPAA standards.', 'med 99,97% drifttid, företagsklassad tillförlitlighet och efterlevnad av SOC 2, ISO 42001 och HIPAA-standarder.'],

    // CTA
    ['Get the <span className="text-content-primary">highest-</span>', 'Få den <span className="text-content-primary">högst</span>'],
    ['<span className="text-content-primary">performing</span> <span className="text-content-tertiary">AI Agent</span>', '<span className="text-content-primary">presterande</span> <span className="text-content-tertiary">AI-agenten</span>'],

    // Engine description paragraphs
    ["Fin&#39;s AI Engine™ is engineered for precision, speed, and reliability—powering the highest-performing and safest AI Agent in customer service.", 'SWEOs AI Engine™ är utvecklad för precision, snabbhet och tillförlitlighet—och driver den högst presterande och säkraste AI-agenten inom kundtjänst.'],
    ['It starts by refining each query—the inputs received must be refined for comprehension.', 'Den börjar med att förfina varje fråga—indata måste förfinas för förståelse.'],
    ['This ensures every customer message is optimized for meaning and context.', 'Detta säkerställer att varje kundmeddelande optimeras för innebörd och kontext.'],
    ['then retrieves relevant content with our proprietary fin-cx-retrieval model', 'hämtar sedan relevant innehåll med vår egenutvecklade fin-cx-retrieval-modell'],
    ['and scores it for relevance, accuracy, and usefulness', 'och poängsätter det för relevans, noggrannhet och användbarhet'],
    ['selecting the best information to use.', 'och väljer den bästa informationen att använda.'],
    ['Next, it generates a response through a process tested at scale to generate answers with the highest chance of resolving customer questions.', 'Därefter genereras ett svar genom en process som testats i stor skala för att skapa svar med högst sannolikhet att lösa kundfrågor.'],
    ['Finally, it performs checks to ensure the output meets the necessary accuracy and safety standards.', 'Slutligen utförs kontroller för att säkerställa att resultatet uppfyller nödvändiga krav på noggrannhet och säkerhet.'],
    ["Fin's AI Engine™ continuously optimizes itself with integrated tools that improve efficiency, precision, and coverage.", 'SWEOs AI Engine™ optimerar sig kontinuerligt med integrerade verktyg som förbättrar effektivitet, precision och täckning.'],
  ],

  'procedures': [
    // Metadata
    ["title: 'Fin. The #1 AI Agent for resolving complex queries.'", "title: 'SWEO. Den #1 AI-agenten för att lösa komplexa frågor.'"],
    ["description: 'Fin automates the most complex customer queries", "description: 'SWEO automatiserar de mest komplexa kundfrågorna"],
    ['like refunds, transaction disputes, and technical troubleshooting—with speed and reliability.', 'som återbetalningar, transaktionstvister och teknisk felsökning—med snabbhet och tillförlitlighet.'],
    ['Give Fin detailed, step-by-step instructions, and it will follow them exactly as expected', 'Ge SWEO detaljerade steg-för-steg-instruktioner och den kommer följa dem precis som förväntat'],
    ['reducing time to resolution and improving the customer experience.', 'vilket minskar lösningstiden och förbättrar kundupplevelsen.'],

    // Hero
    ['Powerful AI automation.', 'Kraftfull AI-automatisering.'],
    ['Built for complex queries.', 'Byggd för komplexa frågor.'],
    ['Controlled by you.', 'Kontrollerad av dig.'],
    ['<strong>Procedures let you train Fin</strong>', '<strong>Procedurer låter dig träna SWEO</strong>'],
    ['to handle queries with multiple steps, business logic and third-party systems from start to finish.', 'att hantera frågor med flera steg, affärslogik och tredjepartssystem från början till slut.'],

    // Build section
    ['Build', 'Bygga'],
    ['Built to be written', 'Skapad för att skrivas'],
    ['and managed by you', 'och hanteras av dig'],
    ['Procedures are designed so support teams can create, update, and improve them independently—no engineering or custom builds required.', 'Procedurer är utformade så att supportteam kan skapa, uppdatera och förbättra dem självständigt—ingen teknik eller specialanpassade lösningar krävs.'],
    ['Get started with AI', 'Kom igång med AI'],
    ['Share an outline of your process, and Fin combines this with your content and customer conversations to draft a Procedure you can refine and improve.', 'Dela en översikt av din process, och SWEO kombinerar detta med ditt innehåll och kundkonversationer för att utforma en Procedur som du kan förfina och förbättra.'],
    ['Write in natural language', 'Skriv på naturligt språk'],
    ['Describe your processes in natural language, just like writing a document. Easy for anyone to create, edit, and understand.', 'Beskriv dina processer på naturligt språk, precis som att skriva ett dokument. Enkelt för alla att skapa, redigera och förstå.'],
    ['Fin adapts as context changes', 'SWEO anpassar sig efter kontextförändringar'],
    ["Procedures are linear, but conversations aren't. Fin intelligently reasons at every turn — responding to anything a customer says, skipping to the right step, or switching Procedures when needed.", 'Procedurer är linjära, men konversationer är det inte. SWEO resonerar intelligent vid varje steg — svarar på allt en kund säger, hoppar till rätt steg eller byter Procedur vid behov.'],

    // Control section
    ['Control', 'Kontroll'],
    ['Precision where it', 'Precision där det'],
    ['matters most', 'betyder mest'],
    ['Fin combines agentic behavior with deterministic control so you can automate even your complex queries while maintaining full control over decisions, data, and outcomes.', 'SWEO kombinerar agentiskt beteende med deterministisk kontroll så att du kan automatisera även dina komplexa frågor samtidigt som du behåller full kontroll över beslut, data och resultat.'],
    ['Turn written rules into enforced logic', 'Omvandla skrivna regler till genomförd logik'],
    ['Ensure Fin follows the right path with if/else logic, and use code to enforce rules like verifying eligibility, calculating dates, or updating records accurately.', 'Säkerställ att SWEO följer rätt väg med if/else-logik, och använd kod för att genomföra regler som att verifiera behörighet, beräkna datum eller uppdatera poster korrekt.'],
    ['Connect Fin to your systems', 'Anslut SWEO till dina system'],
    ['Connect Fin to tools like Stripe, Shopify, or your internal systems using Data Connectors or MCPs — and control exactly what data it can access and how it uses it.', 'Anslut SWEO till verktyg som Stripe, Shopify eller dina interna system med Data Connectors eller MCPs — och kontrollera exakt vilken data den kan komma åt och hur den använder den.'],
    ['Seamless handoffs', 'Sömlösa överlämningar'],
    ['Decide when Fin should complete a Procedure and when it should escalate to a teammate so customers always get the right support.', 'Bestäm när SWEO ska slutföra en Procedur och när den ska eskalera till en kollega så att kunder alltid får rätt support.'],

    // Test section
    ['Test', 'Testa'],
    ['Launch and iterate Procedures', 'Lansera och iterera Procedurer'],
    ['with confidence', 'med tillförsikt'],
    ['Simulations let you automate and scale real-world testing for Fin, validating performance, uncovering edge cases, and catching regressions.', 'Simuleringar låter dig automatisera och skala verklighetstestning för SWEO, validera prestanda, upptäcka gränsfall och fånga regressioner.'],
    ['Simulate full conversations', 'Simulera fullständiga konversationer'],
    ['Run fully simulated customer conversations from start to finish to test how Fin will respond, how it is reasoning, and where it passes or fails.', 'Kör helt simulerade kundkonversationer från början till slut för att testa hur SWEO kommer svara, hur den resonerar och var den klarar sig eller misslyckas.'],
    ['AI-assisted test writing', 'AI-assisterad testskrivning'],
    ['Skip manual test writing. Use AI to write new tests, fix failing ones, and iterate based on feedback. Fin even suggests more Simulations to create.', 'Hoppa över manuell testskrivning. Använd AI för att skriva nya tester, fixa misslyckade och iterera baserat på feedback. SWEO föreslår även fler Simuleringar att skapa.'],
    ['Full regression testing', 'Fullständig regressionstestning'],
    ['When Procedures are updated, rerun saved Simulations from one central library to catch regressions and go live with confidence.', 'När Procedurer uppdateras, kör om sparade Simuleringar från ett centralt bibliotek för att fånga regressioner och gå live med tillförsikt.'],

    // Use Cases section
    ['Solving complex queries', 'Lösa komplexa frågor'],
    ['for every industry', 'för alla branscher'],
    ['Fintech', 'Fintech'],
    ['SAAS', 'SaaS'],
    ['Ecommerce', 'E-handel'],
    ['Gaming', 'Gaming'],
    ['Fin handles workflows like managing subscriptions, processing chargebacks, or verifying account information securely and compliantly.', 'SWEO hanterar arbetsflöden som att hantera prenumerationer, behandla återkrav eller verifiera kontoinformation säkert och i enlighet med regler.'],
    ['Fin collects the right information, verifies it, and uses live system data like transaction history or account status to take the right action—either resolving the issue without human agent involvement, or handing-off at the right time.', 'SWEO samlar rätt information, verifierar den och använder live-systemdata som transaktionshistorik eller kontostatus för att vidta rätt åtgärd—antingen lösa problemet utan mänsklig agentinblandning eller överlämna vid rätt tillfälle.'],
    ['Fin automates complex SaaS workflows like managing subscriptions, handling invoice requests, and updating account settings.', 'SWEO automatiserar komplexa SaaS-arbetsflöden som att hantera prenumerationer, faktureringsförfrågningar och uppdatera kontoinställningar.'],
    ['Fin collects the necessary context, confirms intent, and uses system data to take action instantly—resolving Tasks without manual routing, delays, or agent involvement.', 'SWEO samlar nödvändig kontext, bekräftar avsikt och använder systemdata för att agera direkt—löser uppgifter utan manuell routing, fördröjningar eller agentinblandning.'],
    ['Fin resolves queries like order cancellations, shipping updates, returns, and abandoned carts.', 'SWEO löser frågor som orderannulleringar, fraktuppdateringar, returer och övergivna varukorgar.'],
    ['Fin checks order status in real time, confirms what the customer wants to change, issues refunds instantly, and re-engages shoppers with timely, personalized prompts—improving the customer experience while freeing up human agents.', 'SWEO kontrollerar orderstatus i realtid, bekräftar vad kunden vill ändra, utfärdar återbetalningar direkt och återengagerar kunder med tidsenliga, personliga meddelanden—förbättrar kundupplevelsen samtidigt som mänskliga agenter frigörs.'],
    ['Fin supports players with fast, reliable help for issues like account recovery, in-game refunds, and ban appeals.', 'SWEO hjälper spelare med snabb, pålitlig hjälp för problem som kontoåterställning, återbetalningar i spelet och banöverklaganden.'],
    ['Fin collects the right context, validates requests using system data, and escalates complex cases with full history—so players stay engaged and human agents can focus where it counts.', 'SWEO samlar rätt kontext, validerar förfrågningar med systemdata och eskalerar komplexa ärenden med fullständig historik—så att spelare förblir engagerade och mänskliga agenter kan fokusera där det behövs.'],

    // Customers section
    ['How customers use Fin', 'Hur kunder använder SWEO'],
    ['for complex queries', 'för komplexa frågor'],

    // FAQ section
    ['What are Fin Procedures?', 'Vad är SWEO Procedurer?'],
    ['Fin Procedures are a powerful way to help Fin handle complex, multi-step customer support processes.', 'SWEO Procedurer är ett kraftfullt sätt att hjälpa SWEO hantera komplexa kundtjänstprocesser med flera steg.'],
    ['You write them in natural language—just like training a teammate—or let AI draft them for you based on your outline.', 'Du skriver dem på naturligt språk—precis som att utbilda en kollega—eller låter AI göra utkast åt dig baserat på din översikt.'],
    ["They're designed to be flexible and smart.", 'De är utformade för att vara flexibla och smarta.'],
    ['If a customer interrupts or changes their mind mid-conversation, Fin adapts naturally and moves to the right step without rigid scripts.', 'Om en kund avbryter eller ändrar sig mitt i konversationen anpassar sig SWEO naturligt och går till rätt steg utan stela skript.'],
    ['You can also add branching logic, code for precision, and connect Fin to your systems like Stripe or Shopify to resolve issues from start to finish.', 'Du kan även lägga till förgreningslogik, kod för precision och ansluta SWEO till dina system som Stripe eller Shopify för att lösa problem från början till slut.'],

    ['How do Procedures stay safe and accurate?', 'Hur förblir Procedurer säkra och korrekta?'],
    ["Procedures stay safe and accurate through Simulations—a built-in testing system that lets you validate Fin's performance", 'Procedurer förblir säkra och korrekta genom Simuleringar—ett inbyggt testsystem som låter dig validera SWEOs prestanda'],
    ['across real-world scenarios before anything reaches your customers.', 'över verkliga scenarier innan något når dina kunder.'],
    ['AI acts as a simulated customer and has full conversations with Fin, then judges the results based on success criteria you set.', 'AI agerar som en simulerad kund och har fullständiga konversationer med SWEO, sedan bedömer resultaten baserat på framgångskriterier du sätter.'],
    ['You get complete visibility into why tests pass or fail, making it easy to catch and fix issues.', 'Du får fullständig insyn i varför tester lyckas eller misslyckas, vilket gör det enkelt att fånga och åtgärda problem.'],
    ['You can rerun saved Simulations whenever you update a Procedure to catch issues early and ensure changes go live confidently.', 'Du kan köra om sparade Simuleringar när du uppdaterar en Procedur för att fånga problem tidigt och säkerställa att ändringar lanseras med tillförsikt.'],
    ['Plus, AI can help generate new tests and expand your coverage faster', 'Dessutom kan AI hjälpa till att generera nya tester och utöka din täckning snabbare'],
    ["so you're continuously refining Fin's behavior.", 'så att du kontinuerligt förfinar SWEOs beteende.'],
    ["Beyond Procedures specifically, Fin has strict safety controls built into the AI Engine at every stage", 'Utöver Procedurer specifikt har SWEO strikta säkerhetskontroller inbyggda i AI Engine vid varje steg'],
    ["—if safety parameters aren't met, Fin won't answer and will escalate to human support instead.", '—om säkerhetsparametrar inte uppfylls svarar SWEO inte utan eskalerar till mänsklig support istället.'],
    ['Intercom uses state-of-the-art security measures to protect against LLM threats and avoid hallucinations.', 'SWEO använder toppmoderna säkerhetsåtgärder för att skydda mot LLM-hot och undvika hallucinationer.'],

    ['How are Procedures created?', 'Hur skapas Procedurer?'],
    ['Creating Procedures is designed to be really straightforward.', 'Att skapa Procedurer är utformat för att vara riktigt enkelt.'],
    ['You write them in natural language—just like you would when training a teammate—using a simple document-style editor.', 'Du skriver dem på naturligt språk—precis som du skulle utbilda en kollega—med en enkel dokumentliknande editor.'],
    ['Anyone can create, update, and understand them without needing technical expertise.', 'Vem som helst kan skapa, uppdatera och förstå dem utan teknisk expertis.'],
    ['Even easier, you can let AI draft Procedures for you.', 'Ännu enklare, du kan låta AI göra utkast av Procedurer åt dig.'],
    ['Just share an outline of your process, and Fin combines this with your content and customer conversations to create a draft that you can refine and improve.', 'Dela bara en översikt av din process, och SWEO kombinerar detta med ditt innehåll och kundkonversationer för att skapa ett utkast som du kan förfina och förbättra.'],
    ['Within the steps, you can add branching logic (if/else conditions) for reliability', 'Inom stegen kan du lägga till förgreningslogik (if/else-villkor) för tillförlitlighet'],
    ['use code when you need strict rules, and connect to your systems using data connectors.', 'använda kod när du behöver strikta regler och ansluta till dina system med data connectors.'],
    ['This makes them faster to set up and easier to maintain than the previous Fin Tasks approach.', 'Detta gör dem snabbare att konfigurera och enklare att underhålla än det tidigare tillvägagångssättet med uppgifter.'],

    // CTA
    ['Perfect customer experiences,', 'Perfekta kundupplevelser,'],
    ['even for complex queries.', 'även för komplexa frågor.'],
  ],

  'train': [
    // Metadata
    ["title: 'Fin. Train Fin to be an expert on your business'", "title: 'SWEO. Träna SWEO att bli expert på ditt företag'"],
    ["title: 'Train Fin to be an expert on your business'", "title: 'Träna SWEO att bli expert på ditt företag'"],

    // Hero
    ['Train Fin on your', 'Träna SWEO på ditt'],
    ['business knowledge', 'företagskunnande'],
    ['Train your AI Agent', 'Träna din AI-agent'],

    // Common section text
    ['Knowledge', 'Kunskap'],
    ['Guidance', 'Vägledning'],
    ['Procedures', 'Procedurer'],
    ['Tone of voice', 'Tonalitet'],
    ['brand voice', 'varumärkesröst'],
  ],

  'voice': [
    // Metadata
    ["title: 'Fin Voice", "title: 'SWEO Röst"],

    // Hero
    ['Resolve phone calls', 'Lös telefonsamtal'],
    ['with AI', 'med AI'],
    ['Voice support', 'Röststöd'],
    ['Phone support', 'Telefonsupport'],
    ['answer phone calls', 'besvara telefonsamtal'],
    ['phone channel', 'telefonkanal'],
    ['voice AI', 'röst-AI'],
    ['Natural conversation', 'Naturlig konversation'],
    ['speaks naturally', 'talar naturligt'],
  ],

  'channels': [
    // Metadata
    ["title: 'Meet customers where they are", "title: 'Möt kunder där de är"],

    // Hero & sections
    ['Meet customers where they are', 'Möt kunder där de är'],
    ['Deliver AI-first support across every channel', 'Leverera AI-först-support över alla kanaler'],
    ['every channel', 'alla kanaler'],
    ['Live Chat', 'Livechatt'],
    ['Email', 'E-post'],
    ['Phone', 'Telefon'],
    ['Social media', 'Sociala medier'],
    ['WhatsApp', 'WhatsApp'],
    ['Messenger', 'Messenger'],
    ['SMS', 'SMS'],
  ],

  'channels/live-chat': [
    ["title: 'Live Chat", "title: 'Livechatt"],
    ['Live Chat', 'Livechatt'],
    ['real-time', 'realtid'],
    ['instant answers', 'omedelbara svar'],
    ['live conversation', 'livekonversation'],
  ],

  'channels/email': [
    ["title: 'Email", "title: 'E-post"],
    ['email support', 'e-postsupport'],
    ['email channel', 'e-postkanal'],
    ['inbox', 'inkorg'],
  ],

  'insights': [
    ["title: 'AI Insights", "title: 'AI-insikter"],
    ['AI Insights', 'AI-insikter'],
    ['analytics', 'analys'],
    ['reporting', 'rapportering'],
    ['performance metrics', 'prestandamått'],
    ['resolution rate', 'lösningsgrad'],
    ['customer satisfaction', 'kundnöjdhet'],
  ],

  'testing': [
    ["title: 'Test", "title: 'Testa"],
    ['Simulations', 'Simuleringar'],
    ['Test before you deploy', 'Testa innan du distribuerar'],
    ['simulation', 'simulering'],
  ],

  'trust-reliability': [
    ["title: 'Trust", "title: 'Tillit"],
    ['Trust & Reliability', 'Tillit & Pålitlighet'],
    ['enterprise-grade', 'företagsklassad'],
    ['SOC 2', 'SOC 2'],
    ['GDPR', 'GDPR'],
    ['HIPAA', 'HIPAA'],
    ['data privacy', 'dataintegritet'],
    ['data security', 'datasäkerhet'],
  ],

  'customer-agent': [
    ["title: 'Customer", "title: 'Kund"],
    ['human agent', 'mänsklig agent'],
    ['Customer Agent', 'Kundagent'],
    ['agent workspace', 'agentarbetsyta'],
    ['AI copilot', 'AI-kopilot'],
  ],

  'cx-models': [
    ["title: 'CX Models", "title: 'CX-modeller"],
    ['CX Models', 'CX-modeller'],
    ['purpose-built', 'specialbyggd'],
    ['customer experience', 'kundupplevelse'],
  ],

  'fin3': [
    ["title: 'Fin 3", "title: 'SWEO 3"],
    ['Fin 3', 'SWEO 3'],
  ],

  'fin-sales-agent': [
    ["title: 'Fin Sales", "title: 'SWEO Försäljnings"],
    ['Sales Agent', 'Försäljningsagent'],
    ['sales conversations', 'försäljningskonversationer'],
    ['lead qualification', 'leadkvalificering'],
    ['convert visitors', 'konvertera besökare'],
  ],

  'learn': [
    ["title: 'Learn", "title: 'Lär dig"],
    ['courses', 'kurser'],
    ['training', 'utbildning'],
    ['certification', 'certifiering'],
    ['academy', 'akademi'],
  ],

  'roi-calculator': [
    ["title: 'ROI Calculator", "title: 'ROI-kalkylator"],
    ['ROI Calculator', 'ROI-kalkylator'],
    ['Calculate your ROI', 'Beräkna din ROI'],
    ['monthly conversations', 'månatliga konversationer'],
    ['average handle time', 'genomsnittlig hanteringstid'],
    ['cost per conversation', 'kostnad per konversation'],
    ['potential savings', 'potentiella besparingar'],
    ['estimated savings', 'beräknade besparingar'],
  ],
};

// Pages to translate (in priority order)
const PAGE_ORDER = [
  'ai-engine',
  'procedures',
  'train',
  'voice',
  'channels',
  'channels/live-chat',
  'channels/email',
  'insights',
  'testing',
  'trust-reliability',
  'customer-agent',
  'cx-models',
  'fin3',
  'fin-sales-agent',
  'learn',
  'roi-calculator',
];

// Rename the function export to indicate it's the Swedish version
function renameFunctionExport(content, slug) {
  const camelSlug = slug
    .replace(/[/-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/ /g, '');
  
  // Match: export default function SomethingPage
  const funcMatch = content.match(/export default function (\w+)\(/);
  if (funcMatch) {
    const originalName = funcMatch[1];
    const svName = `Sv${camelSlug}Page`;
    content = content.replace(
      `export default function ${originalName}(`,
      `export default function ${svName}(`
    );
  }
  return content;
}

function translatePage(slug) {
  const enPath = join(EN_BASE, slug, 'page.tsx');
  const svPath = join(SV_BASE, slug, 'page.tsx');

  if (!existsSync(enPath)) {
    console.log(`  ⚠ Skipping ${slug} — English page not found`);
    return false;
  }

  let content = readFileSync(enPath, 'utf-8');
  let replacementCount = 0;

  // Apply page-specific translations first (more specific = higher priority)
  const pageSpecific = PAGE_TRANSLATIONS[slug] || [];
  for (const [en, sv] of pageSpecific) {
    if (content.includes(en)) {
      content = content.replaceAll(en, sv);
      replacementCount++;
    }
  }

  // Apply common translations
  for (const [en, sv] of COMMON) {
    if (content.includes(en)) {
      content = content.replaceAll(en, sv);
      replacementCount++;
    }
  }

  // Rename function export
  content = renameFunctionExport(content, slug);

  // Ensure output directory exists
  mkdirSync(dirname(svPath), { recursive: true });
  writeFileSync(svPath, content, 'utf-8');

  console.log(`  ✓ ${slug} — ${replacementCount} translation rules applied`);
  return true;
}

// ─── Main ────────────────────────────────────────────────────────
console.log('\n🌐 Generating Swedish landing pages...\n');

let successCount = 0;
for (const slug of PAGE_ORDER) {
  if (translatePage(slug)) successCount++;
}

console.log(`\n✅ Generated ${successCount}/${PAGE_ORDER.length} Swedish pages in ${SV_BASE}\n`);
