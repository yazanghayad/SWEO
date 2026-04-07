/* ─── Data constants for SWEO landing page charts ─── */

/* 01a Knowledge chart data */
export const knowledgeSourceData = [
  { month: 'JAN', urls: 12, files: 8, manual: 5 },
  { month: 'FEB', urls: 18, files: 12, manual: 7 },
  { month: 'MAR', urls: 28, files: 15, manual: 9 },
  { month: 'APR', urls: 35, files: 22, manual: 11 },
  { month: 'MAY', urls: 42, files: 28, manual: 14 },
  { month: 'JUN', urls: 51, files: 34, manual: 16 },
  { month: 'JUL', urls: 60, files: 39, manual: 19 },
  { month: 'AUG', urls: 72, files: 45, manual: 21 },
  { month: 'SEP', urls: 85, files: 52, manual: 24 },
  { month: 'OCT', urls: 96, files: 58, manual: 27 },
  { month: 'NOV', urls: 110, files: 64, manual: 30 },
  { month: 'DEC', urls: 124, files: 71, manual: 34 },
];

export const sourceTypeBreakdown = [
  { type: 'URL Crawling', count: 124, pct: 54 },
  { type: 'File Upload', count: 71, pct: 31 },
  { type: 'Manual Entry', count: 34, pct: 15 },
];

export const knowledgeTargets = [
  { target: 'AI Agent', sources: 189, active: true },
  { target: 'Copilot', sources: 145, active: true },
  { target: 'Help Center', sources: 98, active: true },
];

/* 01b Procedures chart data */
export const procedureStepData = [
  { step: 'Message', count: 156, color: '#FF5600' },
  { step: 'API Call', count: 89, color: '#FF5600' },
  { step: 'Data Lookup', count: 72, color: '#FF5600' },
  { step: 'Conditional', count: 64, color: '#FF5600' },
  { step: 'Approval', count: 28, color: '#FF5600' },
];

export const procedureMetrics = [
  { name: 'Active Procedures', value: '47', change: '+8' },
  { name: 'Avg. Steps/Procedure', value: '4.2', change: '+0.3' },
  { name: 'Auto-resolved', value: '73%', change: '+5%' },
  { name: 'Avg. Execution Time', value: '1.8s', change: '-0.4s' },
];

export const procedureFlowSteps = [
  { id: 'trigger', label: 'Intent Match', type: 'trigger', color: '#FF5600' },
  { id: 'lookup', label: 'Data Lookup', type: 'data_lookup', color: '#E8E7E0' },
  { id: 'condition', label: 'Conditional', type: 'conditional', color: '#E8E7E0' },
  { id: 'approval', label: 'Approval Gate', type: 'approval', color: '#E8E7E0' },
  { id: 'api', label: 'API Call', type: 'api_call', color: '#E8E7E0' },
  { id: 'message', label: 'Send Message', type: 'message', color: '#FF5600' },
];

/* 01c Channels chart data */
export const channelVolumeData = [
  { channel: 'WEB', volume: 4520, resolved: 3842, rate: 85 },
  { channel: 'EMAIL', volume: 2180, resolved: 1744, rate: 80 },
  { channel: 'WHATSAPP', volume: 1340, resolved: 1139, rate: 85 },
  { channel: 'SMS', volume: 680, resolved: 544, rate: 80 },
  { channel: 'VOICE', volume: 420, resolved: 315, rate: 75 },
];

export const channelTimeData = [
  { month: 'JAN', web: 320, email: 180, whatsapp: 80, sms: 40, voice: 25 },
  { month: 'FEB', web: 380, email: 195, whatsapp: 95, sms: 48, voice: 28 },
  { month: 'MAR', web: 420, email: 210, whatsapp: 110, sms: 55, voice: 32 },
  { month: 'APR', web: 460, email: 220, whatsapp: 125, sms: 60, voice: 35 },
  { month: 'MAY', web: 510, email: 230, whatsapp: 140, sms: 68, voice: 38 },
  { month: 'JUN', web: 540, email: 240, whatsapp: 155, sms: 72, voice: 40 },
  { month: 'JUL', web: 580, email: 250, whatsapp: 170, sms: 78, voice: 42 },
  { month: 'AUG', web: 620, email: 260, whatsapp: 180, sms: 82, voice: 44 },
  { month: 'SEP', web: 660, email: 270, whatsapp: 195, sms: 88, voice: 46 },
  { month: 'OCT', web: 700, email: 280, whatsapp: 210, sms: 92, voice: 48 },
  { month: 'NOV', web: 740, email: 290, whatsapp: 225, sms: 96, voice: 50 },
  { month: 'DEC', web: 780, email: 300, whatsapp: 240, sms: 100, voice: 52 },
];

export const inboxViews = [
  { view: 'Your Inbox', count: 12 },
  { view: 'Unassigned', count: 8 },
  { view: 'SWEO Resolved', count: 342 },
  { view: 'SWEO Escalated', count: 18 },
  { view: 'All', count: 1247 },
];

/* Performance Section data */
export const resolutionTimeData = [
  { month: 'MAY 2023', rate: 23 },
  { month: 'JUN 2023', rate: 29 },
  { month: 'JUL 2023', rate: 34 },
  { month: 'AUG 2023', rate: 35 },
  { month: 'SEP 2023', rate: 36 },
  { month: 'OCT 2023', rate: 37 },
  { month: 'NOV 2023', rate: 41 },
  { month: 'DEC 2023', rate: 41 },
  { month: 'JAN 2024', rate: 43 },
  { month: 'FEB 2024', rate: 43 },
  { month: 'MAR 2024', rate: 41 },
  { month: 'APR 2024', rate: 45 },
  { month: 'MAY 2024', rate: 46 },
  { month: 'JUN 2024', rate: 46 },
  { month: 'JUL 2024', rate: 48 },
  { month: 'AUG 2024', rate: 49 },
  { month: 'SEP 2024', rate: 50 },
  { month: 'OCT 2024', rate: 52 },
  { month: 'NOV 2024', rate: 52 },
  { month: 'DEC 2024', rate: 53 },
  { month: 'JAN 2025', rate: 54 },
  { month: 'FEB 2025', rate: 55 },
  { month: 'MAR 2025', rate: 55 },
  { month: 'APR 2025', rate: 56 },
  { month: 'MAY 2025', rate: 59 },
  { month: 'JUN 2025', rate: 62 },
  { month: 'JUL 2025', rate: 65 },
  { month: 'AUG 2025', rate: 65 },
  { month: 'SEP 2025', rate: 66 },
  { month: 'OCT 2025', rate: 66 },
  { month: 'NOV 2025', rate: 67 },
  { month: 'DEC 2025', rate: 67 },
];

export const competitorData = [
  { name: 'DECAGON', rate: 49 },
  { name: 'FORETHOUGHT', rate: 50 },
  { name: 'SWEO', rate: 73 },
];

export const videoTestimonials = [
  {
    id: 'anthropic',
    title: 'Build vs. buy: Why Anthropic chose SWEO',
    thumbnail: '/fin/images/image_10.webp',
  },
  {
    id: 'lightspeed',
    title: 'AI at enterprise scale: Why Lightspeed chose SWEO',
    thumbnail: '/fin/images/image_6.webp',
  },
  {
    id: 'rocket',
    title: 'How Rocket Money operationalized AI',
    thumbnail: '/fin/images/image_7.webp',
  },
];

/* Chapter Navigation data */
export const chapters = [
  { number: '01', label: 'capabilities', href: '#capabilities' },
  { number: '02', label: 'performance', href: '#performance' },
  { number: '03', label: 'integrations', href: '#integrations' },
  { number: '04', label: 'technology', href: '#technology' },
  { number: '05', label: 'our platform', href: '#platform' },
];

/* Technology Section data */
export const engineSteps = [
  {
    number: 1,
    label: 'Refine the query',
    title: '[4.a.1] Refine the query',
    description:
      'In order to optimize the accuracy of an answer that an LLM generates, the inputs the LLM receives must be refined for comprehension.',
    model: null,
    image: '/fin/images/ai-engine-1.svg',
  },
  {
    number: 2,
    label: 'Retrieve relevant content',
    title: '[4.a.2] Retrieve relevant content',
    description:
      'The retrieval process, powered by our proprietary sweo-cx-retrieval model, searches across all knowledge sources and selects the most relevant information for accurate answers.',
    model: 'sweo-cx',
    image: '/fin/images/ai-engine-2.svg',
  },
  {
    number: 3,
    label: 'Rerank for precision',
    title: '[4.a.3] Rerank for precision',
    description:
      'The reranking process, powered by our proprietary sweo-cx-reranker model, scores retrieved content for relevance and accuracy, then selects the optimal pieces for the LLM to use.',
    model: 'sweo-cx',
    image: '/fin/images/ai-engine-3.svg',
  },
  {
    number: 4,
    label: 'Generate a response',
    title: '[4.a.4] Generate a response',
    description:
      'Using a bespoke generative process, it creates answers with the highest resolution potential. Custom Guidance controls tone and behavior, ensuring responses align with your brand.',
    model: null,
    image: '/fin/images/ai-engine-4.svg',
  },
  {
    number: 5,
    label: 'Validate accuracy',
    title: '[4.a.5] Validate accuracy',
    description:
      'In the final step, the SWEO AI Engine checks whether the LLM output meets response accuracy and safety standards.',
    model: null,
    image: '/fin/images/ai-engine-5.svg',
  },
  {
    number: 6,
    label: 'Engine optimization',
    title: '[4.a.6] Engine optimization',
    description:
      'To calibrate performance, the SWEO AI Engine uses integrated tools that optimize answer generation, efficiency, precision, and coverage.',
    model: null,
    image: '/fin/images/ai-engine-6.svg',
  },
];

export const STEP_DURATION = 6000; // 6 seconds per step

/* Trust Section data */
export const complianceBadges = [
  'GDPR Compliant',
  'ISO 27001',
  'EU Data Residency',
  'SOC 2 Type II',
  'CCPA Compliant',
];

/* Platform Section data */
export const flywheelPhases = [
  {
    phase: 'Analyze',
    description: 'AI-powered insights detect content gaps and surface opportunities to improve.',
    icon: '',
  },
  {
    phase: 'Train',
    description: 'Knowledge base, procedures, policies, and data connectors — teach SWEO your business.',
    icon: '',
  },
  {
    phase: 'Test',
    description: 'Simulate conversations before launch to validate accuracy and coverage.',
    icon: '',
  },
  {
    phase: 'Deploy',
    description: 'Go live across chat, email, WhatsApp, SMS, and voice with one click.',
    icon: '',
  },
];

/* Footer Section data */
export const footerSections = [
  {
    title: 'Product',
    links: [
      { text: 'Home', href: '/' },
      { text: 'Knowledge Base', href: '/dashboard/knowledge' },
      { text: 'Procedures', href: '/dashboard/overview' },
      { text: 'Channels', href: '/dashboard/settings' },
      { text: 'Inbox', href: '/dashboard/inbox' },
      { text: 'Reports', href: '/dashboard/reports' },
    ],
  },
  {
    title: 'AI Technology',
    links: [
      { text: 'SWEO AI Engine', href: '/docs' },
      { text: 'RAG Pipeline', href: '/docs' },
      { text: 'Policy Engine', href: '/docs' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { text: 'Software & Technology', href: '/solutions/technology' },
      { text: 'eCommerce', href: '/solutions/ecommerce' },
      { text: 'Financial Services', href: '/solutions/financial-services' },
      { text: 'Gaming', href: '/solutions/gaming' },
      { text: 'Enterprise', href: '/solutions/enterprise' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { text: 'Documentation', href: '/docs' },
      { text: 'API Reference', href: '/docs' },
      { text: 'Help Center', href: '/docs' },
    ],
  },
  {
    title: 'Get Started',
    links: [
      { text: 'Free trial', href: '/auth/sign-up' },
      { text: 'Sign in', href: '/auth/sign-in' },
      { text: 'Contact us', href: '/contact-sales' },
    ],
  },
  {
    title: 'Company',
    links: [
      { text: 'About', href: '/' },
      { text: 'Privacy Policy', href: '/privacy-policy' },
      { text: 'Terms of Service', href: '/terms-of-service' },
    ],
  },
];
