'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DEPARTMENTS } from '../types';
import type { ChatMessage, ChatDepartment } from '../types';
import {
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  Search,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import Image from 'next/image';
import docsData from '@/config/docs-data.json';
import { formatRelativeTime } from './chat-widget-utils';

// ── Home Tab ──────────────────────────────────────────────────────────────
export function HomeTab({
  onStartChat,
  lastMessage,
  hasConversation,
  onResumeChat
}: {
  onStartChat: () => void;
  lastMessage: ChatMessage | null;
  hasConversation: boolean;
  onResumeChat: () => void;
}) {
  return (
    <div className='flex flex-col'>
      {/* Hero — 40% of widget height with image + dark overlay */}
      <div
        className='relative flex flex-col justify-end overflow-hidden px-6 pb-8'
        style={{
          height: '40%',
          minHeight: '200px',
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark overlay */}
        <div className='absolute inset-0 bg-black/55' />
        <p className='relative text-[28px] leading-tight font-bold text-white'>
          Hej
        </p>
        <p className='relative text-[28px] leading-tight font-bold text-white/70'>
          Hur kan vi hjälpa till?
        </p>
      </div>

      {/* "Ställ en fråga" card */}
      <div className='mt-4 px-4'>
        <button
          onClick={onStartChat}
          className={cn(
            'flex w-full items-center gap-3.5 rounded-xl p-4 text-left',
            'bg-background',
            'shadow-[0_1px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]',
            'transition-all duration-100',
            'hover:shadow-[0_2px_12px_rgba(0,0,0,0.12)]',
            'active:scale-[0.995]'
          )}
        >
          <div className='min-w-0 flex-1'>
            <span className='text-foreground text-[15px] font-semibold'>
              Ställ en fråga
            </span>
            <br />
            <span className='text-muted-foreground text-[13px]'>
              Vår bot och vårt team kan hjälpa dig
            </span>
          </div>
          <Image
            src='/logo_sweo.svg'
            alt='SWEO'
            width={100}
            height={36}
            className='shrink-0 dark:invert'
          />
          <ChevronRight className='text-muted-foreground/40 h-4 w-4 shrink-0' />
        </button>
      </div>

      {/* Senaste meddelande */}
      {hasConversation && lastMessage && (
        <div className='mt-3 px-4'>
          <div className='bg-background overflow-hidden rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]'>
            <div className='px-4 pt-3 pb-1'>
              <span className='text-foreground text-[13px] font-semibold'>
                Senaste meddelande
              </span>
            </div>
            <button
              onClick={onResumeChat}
              className='hover:bg-accent flex w-full items-center gap-3 px-4 py-3 text-left transition-colors'
            >
              <div className='flex shrink-0 -space-x-2'>
                <Image
                  src='/team-cornelia.png'
                  alt=''
                  width={32}
                  height={32}
                  className='border-background h-8 w-8 rounded-full border-2 object-cover'
                />
                <Image
                  src='/team-linnea.jpg'
                  alt=''
                  width={32}
                  height={32}
                  className='border-background h-8 w-8 rounded-full border-2 object-cover'
                />
                <Image
                  src='/team-member3.jpg'
                  alt=''
                  width={32}
                  height={32}
                  className='border-background h-8 w-8 rounded-full border-2 object-cover'
                />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-foreground text-[13px] font-medium'>
                  Chatta med oss
                </p>
                <p className='text-muted-foreground truncate text-[12px]'>
                  SWEO: {lastMessage.content.slice(0, 50) || '...'}
                </p>
              </div>
              <span className='text-muted-foreground shrink-0 text-[12px]'>
                {formatRelativeTime(lastMessage.timestamp)}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Messages Tab ──────────────────────────────────────────────────────────
export function MessagesTab({
  onSelectDepartment,
  hasConversation,
  lastMessage,
  onResume
}: {
  onSelectDepartment: (dept: ChatDepartment) => void;
  hasConversation: boolean;
  lastMessage: ChatMessage | null;
  onResume: () => void;
}) {
  return (
    <div className='flex flex-col'>
      <div className='flex items-center justify-between px-5 pt-5 pb-2'>
        <h2 className='text-foreground text-[17px] font-semibold'>
          Meddelanden
        </h2>
      </div>

      {/* Existing conversation */}
      {hasConversation && lastMessage && (
        <>
          <button
            onClick={onResume}
            className='hover:bg-accent flex items-center gap-3 px-5 py-3.5 text-left transition-colors'
          >
            <div className='bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
              <Image
                src='/logo-icon-light.svg'
                alt=''
                width={22}
                height={22}
                className='dark:hidden'
              />
              <Image
                src='/logo-icon-dark.svg'
                alt=''
                width={22}
                height={22}
                className='hidden dark:block'
              />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-foreground text-[14px] font-medium'>
                Chatta med SWEO
              </p>
              <p className='text-muted-foreground truncate text-[13px]'>
                SWEO: {lastMessage.content.slice(0, 50) || '...'}
              </p>
            </div>
            <span className='text-muted-foreground shrink-0 text-[12px]'>
              {formatRelativeTime(lastMessage.timestamp)}
            </span>
          </button>
          <div className='border-border mx-5 border-t' />
        </>
      )}

      {/* New conversation */}
      <div className='px-5 pt-4'>
        <p className='text-muted-foreground mb-3 text-[12px] font-medium tracking-wider uppercase'>
          Ny konversation
        </p>
        <div className='space-y-1'>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => onSelectDepartment(dept.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl p-3 text-left',
                'transition-colors duration-100',
                'hover:bg-accent active:bg-accent/80'
              )}
            >
              {dept.id === 'sales' ? (
                <Image
                  src='/team-member3.jpg'
                  alt=''
                  width={36}
                  height={36}
                  className='h-9 w-9 shrink-0 rounded-full object-cover'
                />
              ) : (
                <div className='flex shrink-0 -space-x-2.5'>
                  <Image
                    src='/team-cornelia.png'
                    alt=''
                    width={32}
                    height={32}
                    className='border-background h-8 w-8 rounded-full border-2 object-cover'
                  />
                  <Image
                    src='/team-linnea.jpg'
                    alt=''
                    width={32}
                    height={32}
                    className='border-background h-8 w-8 rounded-full border-2 object-cover'
                  />
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <p className='text-foreground text-[14px] font-medium'>
                  {dept.label}
                </p>
                <p className='text-muted-foreground text-[12px]'>
                  {dept.description}
                </p>
              </div>
              <ChevronRight className='text-muted-foreground/30 h-4 w-4 shrink-0' />
            </button>
          ))}
        </div>
      </div>

      {/* Floating CTA */}
      {!hasConversation && (
        <div className='mt-auto flex justify-center px-4 pt-8 pb-4'>
          <button
            onClick={() => onSelectDepartment('support')}
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-3',
              'bg-foreground text-background',
              'text-[14px] font-medium',
              'shadow-[0_2px_12px_rgba(0,0,0,0.12)]',
              'hover:shadow-[0_4px_16px_rgba(0,0,0,0.16)]',
              'transition-all duration-150 active:scale-[0.98]'
            )}
          >
            Ställ en fråga
            <HelpCircle className='h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Help Tab ──────────────────────────────────────────────────────────────

interface DocsCategory {
  slug: string;
  title: string;
  icon: string;
  description: string;
  articles: {
    slug: string;
    title: string;
    sections: { id: string; title: string; content: string }[];
  }[];
}

export function HelpTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocsCategory | null>(
    null
  );

  const categories = docsData as DocsCategory[];

  const filtered = searchQuery.trim()
    ? categories.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.articles.some((a) =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : categories;

  if (selectedCategory) {
    return (
      <div className='flex flex-col'>
        {/* Back + category title */}
        <div className='flex items-center gap-2 px-5 pt-5 pb-3'>
          <button
            onClick={() => setSelectedCategory(null)}
            className='text-muted-foreground hover:text-foreground -ml-1 flex h-7 w-7 items-center justify-center rounded-full transition-colors'
          >
            <ArrowLeft className='h-4 w-4' strokeWidth={2} />
          </button>
          <h2 className='text-foreground text-[17px] font-semibold'>
            {selectedCategory.title}
          </h2>
        </div>

        <p className='text-muted-foreground px-5 pb-3 text-[13px]'>
          {selectedCategory.description}
        </p>

        {/* Articles list */}
        <div className='divide-border divide-y'>
          {selectedCategory.articles.map((article) => (
            <a
              key={article.slug}
              href={`/docs/${selectedCategory.slug}/${article.slug}`}
              target='_blank'
              rel='noopener noreferrer'
              className={cn(
                'flex w-full items-center gap-3 px-5 py-3.5 text-left',
                'hover:bg-accent transition-colors'
              )}
            >
              <BookOpen className='text-muted-foreground h-4 w-4 shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-foreground text-[14px] font-medium'>
                  {article.title}
                </p>
                <p className='text-muted-foreground/60 mt-0.5 text-[12px]'>
                  {article.sections.length} avsnitt
                </p>
              </div>
              <ExternalLink className='text-muted-foreground/30 h-3.5 w-3.5 shrink-0' />
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      {/* Header */}
      <div className='px-5 pt-5 pb-3'>
        <h2 className='text-foreground text-[17px] font-semibold'>Hjälp</h2>
      </div>

      {/* Search */}
      <div className='px-5 pb-3'>
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-lg',
            'border-border bg-muted/40 border',
            'px-3 py-2',
            'focus-within:border-foreground/20 transition-colors'
          )}
        >
          <Search className='text-muted-foreground h-4 w-4 shrink-0' />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Sök efter hjälp'
            className={cn(
              'text-foreground flex-1 bg-transparent text-[14px]',
              'placeholder:text-muted-foreground/60',
              'border-0 outline-none'
            )}
          />
        </div>
      </div>

      {/* Collection count */}
      <div className='px-5 pb-2'>
        <span className='text-muted-foreground text-[13px] font-medium'>
          {filtered.length} samlingar
        </span>
      </div>

      {/* Collections */}
      <div className='divide-border divide-y'>
        {filtered.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'flex w-full items-center gap-3 px-5 py-4 text-left',
              'hover:bg-accent transition-colors'
            )}
          >
            <div className='min-w-0 flex-1'>
              <p className='text-foreground text-[15px] font-semibold'>
                {cat.title}
              </p>
              <p className='text-muted-foreground mt-0.5 text-[13px] leading-snug'>
                {cat.description}
              </p>
              <p className='text-muted-foreground/60 mt-1 text-[12px]'>
                {cat.articles.length} artiklar
              </p>
            </div>
            <ChevronRight className='text-muted-foreground/30 h-4 w-4 shrink-0' />
          </button>
        ))}

        {filtered.length === 0 && (
          <div className='px-5 py-8 text-center'>
            <p className='text-muted-foreground text-[14px]'>
              Inga resultat hittades
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── News Tab ──────────────────────────────────────────────────────────────
const NEWS_ITEMS = [
  {
    id: 'salesforce-integration',
    badge: 'Integration',
    badgeColor: 'bg-muted text-muted-foreground',
    title: 'Koppla vår AI-plattform till Salesforce',
    description:
      'Synka kunddata, ärenden och kontakter direkt mellan SWEO och Salesforce — automatisera workflows och ge agenten full kontext.',
    image: '/blog-salesforce.png',
    date: '14 feb',
    content: `## Koppla SWEO AI till Salesforce

Genom att integrera SWEO:s AI-plattform med Salesforce får du en sömlös koppling mellan kunddata och automatiserad support.

### Så fungerar det

**1. Anslut ditt Salesforce-konto**
Gå till Inställningar → Integrationer → Salesforce. Logga in med ditt Salesforce-konto och ge SWEO nödvändiga behörigheter.

**2. Synka kunddata automatiskt**
När integrationen är aktiv hämtar AI-agenten automatiskt relevant kundinformation — kontaktuppgifter, ärendehistorik och avtalsstatus — direkt från Salesforce.

**3. Skapa ärenden i realtid**
Om AI-agenten inte kan lösa en fråga skapas ett nytt ärende i Salesforce automatiskt, med hela konversationshistoriken bifogad.

**4. Tvåvägs-synk**
Uppdateringar i Salesforce speglas i SWEO och vice versa. Agenter ser alltid den senaste informationen oavsett vilken plattform de jobbar i.

### Fördelar

- **Full kundkontext** — AI-agenten vet vem kunden är innan de ens ställer sin fråga
- **Automatisk ärendehantering** — Slipp manuell registrering av ärenden
- **Snabbare svar** — Agenten kan referera till orderstatus, fakturor och avtal direkt
- **Bättre rapportering** — All data samlas i Salesforce för analys och uppföljning

### Krav

- Salesforce Enterprise Edition eller högre
- SWEO Pro- eller Enterprise-plan
- Admin-behörighet i båda systemen`
  },
  {
    id: 'multichannel',
    badge: 'Nytt',
    badgeColor: 'bg-muted text-muted-foreground',
    title: 'Multichannel-support tillgängligt',
    description:
      'Hantera konversationer från chatt, e-post, WhatsApp och mer — allt från samma inkorg.',
    date: '5 feb',
    content: `## Multichannel-support

Hantera alla dina kundkonversationer från ett och samma ställe — oavsett om kunden kontaktar er via chatt, e-post, WhatsApp, SMS eller sociala medier.

### Stödda kanaler

- **Webbchatt** — Inbäddad widget på din webbplats
- **E-post** — Automatisk import och svar
- **WhatsApp** — Via Twilio Business API
- **SMS** — Tvåvägskommunikation
- **Instagram & Facebook** — Direktmeddelanden

### Enhetlig inkorg

Alla meddelanden samlas i en gemensam inkorg där du kan filtrera, prioritera och tilldela ärenden till rätt team.`
  },
  {
    id: 'knowledge-base',
    badge: 'Förbättring',
    badgeColor: 'bg-muted text-muted-foreground',
    title: 'Kunskapsbas med AI-förslag',
    description:
      'AI hittar nu luckor i din kunskapsbas och föreslår nytt innehåll automatiskt.',
    date: '28 jan',
    content: `## Kunskapsbas med AI-förslag

Vår AI analyserar kontinuerligt dina kundkonversationer och identifierar frågor som saknar svar i kunskapsbasen.

### Så fungerar det

1. AI:n övervakar alla konversationer som eskaleras till mänskliga agenter
2. Liknande frågor grupperas automatiskt
3. AI:n genererar ett utkast till hjälpartikel
4. Du granskar och publicerar med ett klick

### Resultat

Företag som aktiverat funktionen ser i snitt **23% högre resolution rate** inom 30 dagar.`
  }
];

export function NewsTab() {
  const [selectedArticle, setSelectedArticle] = useState<
    (typeof NEWS_ITEMS)[number] | null
  >(null);

  if (selectedArticle) {
    return (
      <div className='flex flex-col'>
        {/* Article header */}
        <div className='border-border flex items-center gap-2 border-b px-4 py-3'>
          <button
            onClick={() => setSelectedArticle(null)}
            className='hover:bg-accent flex h-8 w-8 items-center justify-center rounded-full transition-colors'
          >
            <ArrowLeft
              className='text-muted-foreground h-[18px] w-[18px]'
              strokeWidth={2}
            />
          </button>
          <span className='text-foreground text-[14px] font-semibold'>
            Nyheter
          </span>
        </div>

        {/* Article image */}
        {'image' in selectedArticle && selectedArticle.image && (
          <div className='relative h-[180px] w-full overflow-hidden'>
            <Image
              src={selectedArticle.image}
              alt=''
              fill
              className='object-cover'
            />
          </div>
        )}

        {/* Article content */}
        <div className='px-5 py-5'>
          <div className='mb-3 flex items-center gap-2'>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                selectedArticle.badgeColor
              )}
            >
              {selectedArticle.badge}
            </span>
            <span className='text-muted-foreground text-[11px]'>
              {selectedArticle.date}
            </span>
          </div>

          <h2 className='text-foreground mb-4 text-[20px] leading-tight font-bold'>
            {selectedArticle.title}
          </h2>

          <div className='prose-sm text-foreground/80 text-[13.5px] leading-[1.7]'>
            {selectedArticle.content.split('\n\n').map((block, i) => {
              const trimmed = block.trim();
              if (trimmed.startsWith('### ')) {
                return (
                  <h4
                    key={i}
                    className='text-foreground mt-5 mb-2 text-[14px] font-bold'
                  >
                    {trimmed.slice(4)}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return null; // Skip top heading, already shown as title
              }
              if (trimmed.startsWith('- ')) {
                return (
                  <ul key={i} className='mb-3 space-y-1.5 pl-4'>
                    {trimmed.split('\n').map((line, j) => (
                      <li key={j} className='list-disc'>
                        {line
                          .replace(/^- /, '')
                          .split('**')
                          .map((part, k) =>
                            k % 2 === 1 ? (
                              <strong key={k} className='text-foreground'>
                                {part}
                              </strong>
                            ) : (
                              part
                            )
                          )}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (/^\d+\./.test(trimmed)) {
                return (
                  <ol key={i} className='mb-3 space-y-1.5 pl-4'>
                    {trimmed.split('\n').map((line, j) => (
                      <li key={j} className='list-decimal'>
                        {line.replace(/^\d+\.\s*/, '')}
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={i} className='mb-3'>
                  {trimmed.split('**').map((part, k) =>
                    k % 2 === 1 ? (
                      <strong key={k} className='text-foreground'>
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              );
            })}
          </div>

          {/* Author */}
          <div className='border-border mt-6 flex items-center gap-3 border-t pt-5'>
            <Image
              src='/team-member3.jpg'
              alt='Adam Hill'
              width={40}
              height={40}
              className='h-10 w-10 rounded-full object-cover'
            />
            <div>
              <p className='text-foreground text-[13px] font-semibold'>
                Adam Hill
              </p>
              <p className='text-muted-foreground text-[12px]'></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      {/* Header */}
      <div className='px-5 pt-5 pb-1'>
        <h2 className='text-foreground text-[17px] font-semibold'>Nyheter</h2>
      </div>

      {/* "Senaste" subheader */}
      <div className='flex items-center justify-between px-5 py-3'>
        <div>
          <p className='text-foreground text-[14px] font-semibold'>Senaste</p>
          <p className='text-muted-foreground text-[12px]'>Från teamet SWEO</p>
        </div>
        <div className='flex -space-x-2'>
          {['/team-cornelia.png', '/team-linnea.jpg', '/team-member3.jpg'].map(
            (src) => (
              <Image
                key={src}
                src={src}
                alt=''
                width={32}
                height={32}
                className='border-background h-8 w-8 rounded-full border-2 object-cover'
              />
            )
          )}
        </div>
      </div>

      {/* News cards */}
      <div className='space-y-4 px-5 pb-5'>
        {NEWS_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedArticle(item)}
            className={cn(
              'block w-full overflow-hidden rounded-xl text-left',
              'border-border border',
              'transition-all duration-100',
              'hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]',
              'active:scale-[0.995]'
            )}
          >
            {/* Image */}
            {'image' in item && item.image && (
              <div className='relative h-[160px] w-full overflow-hidden'>
                <Image src={item.image} alt='' fill className='object-cover' />
              </div>
            )}

            {/* Content */}
            <div className='px-4 py-3.5'>
              <div className='mb-2 flex items-center gap-2'>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
                <span className='text-muted-foreground text-[11px]'>
                  {item.date}
                </span>
              </div>

              <p className='text-foreground text-[15px] leading-snug font-semibold'>
                {item.title}
              </p>
              <div className='mt-1 flex items-start gap-2'>
                <p className='text-muted-foreground flex-1 text-[13px] leading-snug'>
                  {item.description}
                </p>
                <ChevronRight className='text-muted-foreground/30 mt-0.5 h-4 w-4 shrink-0' />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
