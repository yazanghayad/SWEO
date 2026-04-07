# Design Plan — SWEO/Fin.ai-inspirerad Dashboard

> Baserad på 10 screenshots från SWEO's faktiska produktionsgränssnitt (februari 2026).

---

## 1. Övergripande Design System

### 1.1 Färgschema (Dark Theme)

| Element | Färg | Användning |
|---|---|---|
| **Bakgrund (huvudyta)** | `#1B1B2F` / mörk navy-indigo | Alla sidor |
| **Sidebar bakgrund** | `#13132B` / mörkare navy | Vänster-sidebar |
| **Ikon-rail bakgrund** | `#0D0D24` / nästan svart | Vertikal ikonremsa längst till vänster |
| **Kort/Card bakgrund** | `#252547` / lättare lila-navy | Alla card-komponenter |
| **Kort hover** | `#2E2E5A` | Hover-state på cards |
| **Input-fält** | `#1E1E3F` med `#3A3A6A` border | Formulär-inputs |
| **Primär text** | `#FFFFFF` | Rubriker |
| **Sekundär text** | `#A0A0C0` / ljusgrå-lila | Beskrivningar, labels |
| **Accent blå** | `#4F7CFF` | Länkar, aktiva states |
| **Accent grön** | `#34C759` | Framgång, toggles ON |
| **Accent orange** | `#FF9F0A` | Varningar (⚠️ ikoner) |
| **Accent röd** | `#FF453A` | Fel, destructive actions |
| **Divider/border** | `#2A2A4A` | Separatorer |

### 1.2 Typografi

| Element | Stil |
|---|---|
| Sidtitel (h1) | 20px, semibold, vit |
| Sektionsrubrik (h2) | 16px, semibold, vit |
| Korttitel | 14px, medium, vit |
| Kortbeskrivning | 13px, regular, `#A0A0C0` |
| Sidebar-item | 14px, regular/medium, vit |
| Sidebar-grupp-label | 12px, uppercase, `#6B6B8D` |
| Body text | 14px, regular |
| Small/caption | 12px, regular, `#8888AA` |

### 1.3 Ikonbibliotek

- **Lucide React** (som vi redan har)
- Varje settings-kategori har en **färgad cirkulär ikon** (32x32px, rundad rektangel med bakgrundsfärg)
- Ikon-färger per kategori:
  - Workspace: Grön
  - Subscription: Grön
  - Channels: Blå/teal
  - Inbox: Lila/grön
  - AI & Automation: Blå
  - Integrations: Blå
  - Data: Grön/lila
  - Help Center: Grön
  - Outbound: Orange/röd
  - Personal: Blå/grön

---

## 2. Layout-arkitektur

### 2.1 Tre-lagers layout

```
┌──────┬────────────┬─────────────────────────────────────┐
│ IKON │  SIDEBAR   │         MAIN CONTENT                │
│ RAIL │            │                                     │
│ 48px │   240px    │         Resterande bredd             │
│      │ (collapsible)│                                   │
│      │            │                                     │
│      │            │                                     │
│      │            │                                     │
│      │            │                                     │
│ ──── │            │                                     │
│ Sök  │            │                                     │
│ Inst.│            │                                     │
│ User │            │                                     │
└──────┴────────────┴─────────────────────────────────────┘
```

### 2.2 Ikon-rail (vänsterkant, alltid synlig)

Vertikal remsa med ikoner — varje ikon representerar en huvudsektion:

| Position | Ikon | Sektion | Route |
|---|---|---|---|
| 1 (topp) | Grid/meny | Hem/workspace | `/dashboard` |
| 2 | Sparkle/AI | AI & Automation | `/dashboard/ai` |
| 3 | Chat-bubbla | Inbox | `/dashboard/inbox` |
| 4 | Stapeldiagram | Reports | `/dashboard/reports` |
| 5 | Play/automation | Automations | `/dashboard/automations` |
| 6 | Människor | Contacts/People | `/dashboard/contacts` |
| --- | --- | --- | --- |
| Botten-1 | Sök | Global sökning | Cmd+K |
| Botten-2 | Kugghjul | Settings | `/dashboard/settings` |
| Botten-3 | Avatar | Profil | `/dashboard/profile` |

**Beteende:**
- Ikon = 48x48px klickyta, 24x24px ikon
- Aktiv ikon: vit med vänster-border accent
- Inaktiv ikon: `#6B6B8D`
- Tooltip vid hover

### 2.3 Sidebar (kontextberoende, per sektion)

Sidebaren ändrar innehåll baserat på vilken ikon-rail-sektion som är aktiv:

- **Inbox**: Visar inboxar, filter, vyer (Messenger, Email, WhatsApp, Phone, Tickets)
- **Reports**: Visar rapportlista, favoriter, conversation topics
- **Settings**: Visar alla inställningskategorier med expanderbara grupper
- **Collapsible**: Kan minimeras så att bara ikon-railen syns

### 2.4 Top Banner

```
┌──────────────────────────────────────────────────────────┐
│ ⚠ You have 10 days left...  │ Talk to specialist │ Buy  │
└──────────────────────────────────────────────────────────┘
```

- Bakgrund: `#2A2A4A` (mörkare)
- Alltid synlig överst
- Vänster: Info-text
- Höger: CTA-knappar

### 2.5 Bottom-left: Onboarding Widget

```
┌──────────────────┐
│ ○ Get set up   ▲ │
│ Set up channels  │
│ to connect with  │
│ your customers   │
└──────────────────┘
```

- Collapsible card i sidebar-botten
- Visar setup-progress (cirkel-progress)
- Expanderbar med steg-lista

---

## 3. Settings Hub (Huvudsidan)

### 3.1 Settings Home — Card Grid Layout

**Route:** `/dashboard/settings`

**Layout:** Sektioner med rubrik → 3-kolumners card-grid

```
┌─────────────────────────────────────────────────────┐
│ ⊞ Settings > Home                      Learn ▾     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Workspace                                           │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ 🟢 General│ │ 🟣 Team  │ │ 🔵 Office│            │
│ │ Set your  │ │ Manage or│ │ Choose   │            │
│ │ workspace │ │ invite   │ │ your     │            │
│ │ name...   │ │ teammates│ │ office   │            │
│ └──────────┘ └──────────┘ └──────────┘            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ 🟢 Brands│ │ 🟢 Sec.⚠│ │ ⬜ Refer.│            │
│ └──────────┘ └──────────┘ └──────────┘            │
│ ┌──────────┐                                       │
│ │ 🟣 Multi │                                       │
│ └──────────┘                                       │
│                                                     │
│ Subscription                                        │
│ ┌──────────┐ ┌──────────┐                          │
│ │ 🟢 Billing│ │ ⬜ Usage │                          │
│ └──────────┘ └──────────┘                          │
│                                                     │
│ Channels                                            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ 🟢 Messngr│ │ 🟢 Email │ │ 🔵 Phone│            │
│ │ Install & │ │ Manage   │ │ Set up & │            │
│ │ customize │ │ forward. │ │ manage   │            │
│ └──────────┘ └──────────┘ └──────────┘            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ 🟢 WhatsA│ │ 🟢 Switch│ │ 🟣 Slack │            │
│ └──────────┘ └──────────┘ └──────────┘            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ 🟢 SMS   │ │ 🟢 Social│ │ 🟢 All ch│            │
│ └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│ ... (fler sektioner scrollar nedåt)                 │
└─────────────────────────────────────────────────────┘
```

### 3.2 Alla Settings-sektioner & kort

**Workspace:**
| Kort | Ikon | Färg | Beskrivning |
|---|---|---|---|
| General | `Settings` | Grön | Workspace-namn, tidszon, språk |
| Teammates | `Users` | Lila | Hantera/bjud in teammedlemmar |
| Office hours | `Clock` | Blå | Kontorsschema |
| Brands | `Palette` | Grön | Hantera varumärken |
| Security ⚠️ | `Shield` | Grön | Säkerhetsinställningar |
| Multilingual | `Languages` | Lila | Flerspråksinställningar |

**Subscription:**
| Kort | Ikon | Färg | Beskrivning |
|---|---|---|---|
| Billing | `CreditCard` | Grön | Prenumeration & betalning |
| Usage | `BarChart` | Grå | Användning & limits |

**Channels:**
| Kort | Ikon | Färg | Beskrivning |
|---|---|---|---|
| Messenger | `MessageCircle` | Grön | Web messenger installation |
| Email | `Mail` | Grön | Email-vidarebefordring & domäner |
| Phone | `Phone` | Blå | Telefonsamtal |
| WhatsApp | `MessageSquare` | Grön | WhatsApp Business |
| SMS | `Smartphone` | Grön | SMS-konversationer |
| Social channels | `Share2` | Grön | Instagram & Facebook |
| All channels | `Grid` | Grön | Överblick alla kanaler |

**Inbox:**
| Kort | Ikon | Färg | Beskrivning |
|---|---|---|---|
| Team inboxes | `Inbox` | Blå | Skapa team-inboxar |
| Assignments | `UserCheck` | Grön | Tilldela konversationer |
| Macros | `BookmarkCheck` | Brun | Skapa & hantera macros |
| Tickets | `Ticket` | Lila | Customer & Tracker tickets |
| SLAs | `Timer` | Blå | Service Level Agreements |

**AI & Automation:**
| Kort | Ikon | Färg | Beskrivning |
|---|---|---|---|
| Fin AI Agent | `Bot` | Blå | Hantera & anpassa Fin |
| Inbox AI | `Sparkles` | Lila | AI Autofill, Articles, Compose |
| Automation | `Zap` | Gul | Bot-identitet & automation |

**Integrations:**
| Kort | Ikon | Färg | Beskrivning |
|---|---|---|---|
| App Store | `Grid` | Blå | Hantera appar & integrationer |
| Data connectors | `Link` | Blå | Extern data till SWEO |
| Authentication | `Key` | Blå | Tokens & API-nycklar |
| Developer Hub ↗ | `Code` | Lila | Extern länk till dev portal |

**Data:**
| Kort | Ikon | Färg | Beskrivning |
|---|---|---|---|
| Tags | `Tag` | Grön | Grupperade användare med taggar |
| People | `Users` | Grön | Attribut, segment, events |
| Companies | `Building` | Grön | Företag & segment |
| Conversations | `MessageSquare` | Grön | Konversationsattribut |
| Custom Objects | `Layers` | Blå | Egna dataobjekt |
| Imports & exports | `ArrowUpDown` | Grön | Importera/exportera data |

**Help Center:**
| Kort | Ikon | Färg | Beskrivning |
|---|---|---|---|
| [Tenant] Help Center | `BookOpen` | Grön | Redigera Help Center |
| All Help Centers | `Grid` | Grön | Hantera alla Help Centers |
| New Help Center ✨ | `Plus` | — | Skapa nytt Help Center |

**Outbound:**
| Kort | Ikon | Färg | Beskrivning |
|---|---|---|---|
| Subscriptions | `Bell` | Orange | Kundprenumerationer |
| Newsfeeds | `Rss` | Röd | Nyhetsflöden |
| News Labels | `Tag` | Grön | Kategorisera nyheter |
| Customization | `Paintbrush` | Lila | Meddelandeinställningar |

**Personal:**
| Kort | Ikon | Färg | Beskrivning |
|---|---|---|---|
| Details | `User` | Blå | Profil, e-post, språk, tema |
| Account security ⚠️ | `ShieldAlert` | Grön | Kontosäkerhet |
| Notifications | `Bell` | Blå | Notifikationsinställningar |

---

## 4. Settings Detail Pages

### 4.1 Layout-mönster

Alla settings-undersidor använder samma layout:

```
┌─────────────────────────────────────────────────────────┐
│ ⊞ Security                        Learn more ▾  Save   │
├─────────────────────────────────────────────────────────┤
│ [Workspace] [Data] [Messenger] [Attachments] [Links]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Authentication methods        │ 🟢 Email & password│ │
│ │ Require secure authentication │ ☐ Require 2FA      │ │
│ │ methods like 2FA or SAML SSO. │ 🟢 Google sign in  │ │
│ │                               │ ⬜ SAML SSO        │ │
│ │ 📖 Learn more                 │                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Security contact              │ Email               │ │
│ │ Enter an email address we can │ [placeholder input] │ │
│ │ contact if there's a security │ Recommendation text │ │
│ │ incident.                     │                     │ │
│ │ 📖 Learn more                 │                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Workspace access restrictions │ ⬜ Enable IP allow  │ │
│ │ Only allow access from        │ Allowed IPs         │ │
│ │ specific IP addresses.        │ [textarea]          │ │
│ │ 📖 Learn more                 │ Helper text         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Mönster per sektion:**
- **Vänster kolumn (40%):** Titel (bold), beskrivning (grå), "Learn more" länk (blå med ikon)
- **Höger kolumn (60%):** Kontroller (toggles, inputs, textareas, checkboxes)
- **Separerade med card-bakgrund och mellanrum**
- **Top:** Horisontella tabs för undersektioner
- **Top-right:** "Learn more" dropdown + "Save" knapp

### 4.2 Customization Page

**Route:** `/dashboard/settings/customization`

- **Message settings:** Text-input med Handlebars-syntax (`{{first_name | fallback: "there"}}`)
- **Universal linking:** Domänlista + "Add domain" knapp
- Notering om wildcards/subdomäner

---

## 5. Inbox (Konversationsvy)

### 5.1 Tre-panel layout

**Route:** `/dashboard/inbox`

```
┌──────────────┬───────────────┬─────────────────┬──────────────┐
│   INBOX NAV  │  CONV. LIST   │  CONVERSATION   │   DETAILS    │
│    240px     │    280px      │    Flex          │    320px     │
│              │               │                  │              │
│ Yazan Ghayad │ 4 Open  Sort▾│  Messenger  ⭐ ⋯│ Details|Copil│
│ + 🔍        │               │                  │              │
│              │ M Messenger   │  [avatar]        │ Assignee:    │
│ Your inbox 4 │   Install..3d│                  │ Team Inbox:  │
│ Mentions   0 │               │  "This is a      │              │
│ Created    0 │ E Email       │   demo message   │ 🔗 Links    │
│ All        4 │   This is..3d │   from the      │ Tracker tick │
│ Unassigned 0 │               │   Messenger..."  │ Back-office  │
│ Spam       0 │ W WhatsApp    │                  │ Side convs   │
│ Dashboard  0 │   Set up..3d │                  │              │
│              │               │                  │ 💬 Conv attr │
│ Fin AI Agent │ P Phone       │                  │ AI Title:    │
│  All convs   │   Set up..3d │                  │ ID:          │
│  Resolved    │               │                  │ Company:     │
│  Escalated   │               │                  │ Brand:       │
│  Pending     │               │                  │              │
│              │               │                  │ Topics:      │
│ Team inboxes │               │  ┌────────────┐ │              │
│ Teammates    │               │  │ Reply ▾    │ │ 👤 User data │
│              │               │  │ Ctrl+K     │ │ 💬 Recent    │
│ Views        │               │  │      Send ▾│ │ 📝 Notes     │
│  Messenger 1 │               │  └────────────┘ │ 🏷 Tags      │
│  Email     1 │               │                  │ 👥 Segments  │
│  WhatsApp  1 │               │                  │ 🌐 Page views│
│  Phone     1 │               │                  │ 🔍 Similar   │
│  Tickets   0 │               │                  │              │
└──────────────┴───────────────┴─────────────────┴──────────────┘
```

### 5.2 Inbox Navigation (vänster)

**Sektioner:**

1. **Personligt** (user header med avatar + namn)
   - Your inbox (badge: antal)
   - Mentions
   - Created by you
   - All
   - Unassigned
   - Spam
   - Dashboard

2. **Fin AI Agent** (med + och ▾)
   - All conversations
   - Resolved
   - Escalated & Handoff
   - Pending

3. **Team inboxes** (med + knapp)
   - Dynamisk lista

4. **Teammates** (sektion)

5. **Views** (med ▾)
   - Messenger (badge: antal)
   - Email (badge)
   - WhatsApp & Social (badge)
   - Phone & SMS (badge)
   - Tickets (badge)

### 5.3 Conversation List (mitten-vänster)

- **Header:** Antal öppna + sorteringsval ("Last activity")
- **Varje rad:**
  - Kanal-ikon (färgkodad cirkel: M=lila, E=grön, W=grön, P=blå)
  - Titel (bold)
  - Preview-text (grå, trunkerad)
  - Tidsindikator (3d, 2h, etc.)
  - Tre-punkt meny (⋯)
- **Aktiv rad:** Bakgrundsfärg markering
- **Hover:** Lätt bakgrundsskiftning

### 5.4 Conversation Detail (center)

- **Header:** Kanal-namn + ⭐ favorit + ⋯ meny + snoozeklocka + mörkt läge-ikon + expand-ikon
- **Meddelandetråd:** Chat-bubblor med avatarer
- **Reply-box (botten):**
  - "Reply ▾" dropdown (Reply, Note, etc.)
  - Rich text editor
  - "Use Ctrl+K for shortcuts"
  - Verktygsfält: emoji, attachment, etc.
  - "Send ▾" knapp (med dropdown för alternativ)
  - Mediakontroller: ⏸ ⏭

### 5.5 Details Sidebar (höger)

**Tabs:** Details | Copilot

**Details-tab:**

1. **Assignee** — Dropdown välj agent
2. **Team Inbox** — Dropdown välj inbox

3. **Links** (collapsible)
   - Tracker ticket (+)
   - Back-office tickets (+)
   - Side conversations (+)

4. **Conversation attributes** (collapsible)
   - AI Title
   - ID
   - Company
   - Brand
   - Subject
   - CX Score rating
   - CX Score explanation
   - Topics (+)

5. **Collapsible sektioner:**
   - 👤 User data
   - 💬 Recent conversations
   - 📝 User notes
   - 🏷 User tags
   - 👥 User segments
   - 🌐 Recent page views
   - 🔍 Similar conversations
   - ⚙ Edit apps

---

## 6. Reports Dashboard

### 6.1 Layout

**Route:** `/dashboard/reports`

```
┌─────────────────────────────────────────────────────────┐
│ Reports                                    Learn ▾  📥  │
├─────────────────────────────────────────────────────────┤
│ 📅 Nov 25, 2025 - Feb 16, 2026  + Add filter   🕐 TZ  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ℹ How you're handling conversations                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │  ████                                               │ │
│ │  ████                                               │ │
│ │  ████                                               │ │
│ │  ████                                               │ │
│ │  ████  (100%)                                       │ │
│ │  4 Conversations                                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ℹ Overall volume growth                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  4                                                  │ │
│ │  (linje/area chart)                                 │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Reports Sidebar

- Overview (aktiv)
- All reports (21)
- Your reports (0)
- Your favorites ▾ (tomt)
- Conversation topics ▸
- Dataset export
- Manage schedules

**Under sidebar-sektioner:**
- AI & Automation ▸
- Human support ▸
- Proactive ▸

### 6.3 Reports-komponenter

- **Datumväljare:** Range picker med presets
- **Filter:** "+ Add filter" knapp
- **Tidszon:** Dropdown (Stockholm GMT+1)
- **Charts:** Recharts — bar chart + area/line chart
- **Metrics:** Nummer + procent + trend

---

## 7. Komponentbibliotek att bygga

### 7.1 Nya komponenter

| Komponent | Beskrivning | Prioritet |
|---|---|---|
| `IconRail` | Vertikal ikon-navigering (48px bred) | 🔴 Kritisk |
| `ContextSidebar` | Kontextberoende sidebar per sektion | 🔴 Kritisk |
| `SettingsCard` | Card med ikon + titel + beskrivning (för Settings Home) | 🔴 Kritisk |
| `SettingsSection` | Grupp-rubrik + grid av SettingsCards | 🔴 Kritisk |
| `SettingsDetailRow` | Två-kolumn rad (label+desc | kontroller) | 🔴 Kritisk |
| `ConversationList` | Kanal-ikon + titel + preview + tid | 🔴 Kritisk |
| `ConversationDetail` | Meddelandetråd + reply-box | 🔴 Kritisk |
| `DetailsSidebar` | Höger-sidebar med collapsible sektioner | 🔴 Kritisk |
| `MetricCard` | KPI-kort med värde + trend + change | 🟡 Hög |
| `DateRangePicker` | Datumintervallväljare | 🟡 Hög |
| `ChannelBadge` | Färgad cirkel med kanal-ikon | 🟡 Hög |
| `OnboardingWidget` | "Get set up" progress-widget | 🟢 Medium |
| `TrialBanner` | Top-banner med CTA | 🟢 Medium |

### 7.2 Befintliga shadcn-komponenter vi använder

- `Card`, `CardHeader`, `CardContent` — för alla kort
- `Sidebar`, `SidebarMenu` — bas för ContextSidebar
- `Tabs`, `TabsList`, `TabsTrigger` — för settings sub-tabs
- `Switch` — för toggles
- `Input`, `Textarea` — för formulär
- `Badge` — för räknare
- `Separator` — för dividers
- `ScrollArea` — för scrollbara paneler
- `Sheet` — för mobile sidebar
- `Tooltip` — för ikon-rail tooltips
- `Avatar` — för användare
- `DropdownMenu` — för kontextmenyer
- `Collapsible` — för expanderbara sektioner

---

## 8. Sidstruktur & Routes

### 8.1 Route-plan

```
/dashboard
├── /overview                    ← Nuvarande (behåll)
├── /inbox                       ← NY: Konversations-inbox
│   └── /inbox/[conversationId]  ← Enskild konversation
├── /reports                     ← NY: Reports dashboard
│   ├── /reports/conversations   ← Conversation topics
│   └── /reports/ai              ← AI & Automation reports
├── /knowledge                   ← Befintlig (utöka)
│   ├── /knowledge/sources       ← Knowledge sources
│   └── /knowledge/versions      ← Version history
├── /ai                          ← NY: AI & Automation
│   ├── /ai/agent                ← Fin AI Agent settings
│   ├── /ai/procedures           ← Procedure builder
│   └── /ai/policies             ← Policy management
├── /contacts                    ← NY: Customer data
├── /settings                    ← NY: Settings hub
│   ├── /settings/general        ← Workspace general
│   ├── /settings/teammates      ← Team management
│   ├── /settings/security       ← Security settings
│   ├── /settings/channels       ← Channels overview
│   ├── /settings/connectors     ← Data connectors
│   └── /settings/customization  ← Message customization
└── /profile                     ← Befintlig (utöka)
```

### 8.2 Navigationsikon-mapping

| Ikon-rail ikon | Sidebar-kontext | Primär route |
|---|---|---|
| `LayoutGrid` | Workspace overview | `/dashboard/overview` |
| `Sparkles` | AI features navigation | `/dashboard/ai` |
| `MessageSquare` | Inbox navigation | `/dashboard/inbox` |
| `BarChart3` | Reports navigation | `/dashboard/reports` |
| `BookOpen` | Knowledge navigation | `/dashboard/knowledge` |
| `Users` | Contacts navigation | `/dashboard/contacts` |
| `Search` | Cmd+K global search | — |
| `Settings` | Settings navigation | `/dashboard/settings` |
| `UserCircle` | Profile | `/dashboard/profile` |

---

## 9. Implementationsordning

### Fas 1: Layout Foundation (kritisk)
1. **IconRail** komponent — vertikal ikon-navigation
2. **ContextSidebar** — kontextberoende sidebar
3. **Uppdatera dashboard layout** — integrera IconRail + ContextSidebar
4. **Dark theme** — CSS custom properties för SWEO-likt färgschema

### Fas 2: Settings Hub
5. **SettingsCard** + **SettingsSection** komponenter
6. **Settings Home** sida (`/dashboard/settings`)
7. **Settings General** sida (workspace-namn, tidszon)
8. **Settings Security** sida (auth methods, IP allowlist, sessions)
9. **Settings Teammates** sida (team management)
10. **Settings Channels** översikt
11. **Settings Customization** sida

### Fas 3: Inbox
12. **ConversationList** komponent
13. **ConversationDetail** komponent (meddelandetråd + reply)
14. **DetailsSidebar** komponent (attribut + user data)
15. **Inbox page** med tre-panel layout
16. **Inbox navigation** (filter, vyer, AI agent sektioner)

### Fas 4: Reports & Analytics
17. **MetricCard** + **DateRangePicker** komponenter
18. **Reports overview** sida (charts)
19. **Reports sidebar** (rapportlista, favoriter)
20. **AI reports** (resolution rate, confidence)

### Fas 5: AI & Automation
21. **AI Agent settings** sida
22. **Procedures list + detail** sidor
23. **Policies list + detail** sidor
24. **Connectors management** sida

### Fas 6: Polish
25. **OnboardingWidget** (Get set up)
26. **TrialBanner** (top banner)
27. **Responsive/mobile** anpassning
28. **Animationer & transitions**

---

## 10. Design Principer (från SWEO)

1. **Konsekvent card-baserad design** — Allt är kort med rubrik + beskrivning
2. **Progressiv disclosure** — Collapsed sektioner, expanderbara grupper, "Learn more" länkar
3. **Två-kolumn settings** — Vänster = förklaring, höger = kontroller
4. **Färgkodade ikoner** — Varje kategori har sin färg för snabb igenkänning
5. **Kontextberoende sidebar** — Sidebaren anpassas till aktuell sektion
6. **Badge-räknare överallt** — Visar antal i inbox, rapporter, vyer
7. **Inline onboarding** — "Get set up" widget guidar nya användare
8. **Global sökning** — Cmd+K nåbar från alla sidor
9. **Save-knapp synlig** — Alltid top-right när formulär ändras
10. **Dark-first** — Designen är byggd för mörkt tema primärt
