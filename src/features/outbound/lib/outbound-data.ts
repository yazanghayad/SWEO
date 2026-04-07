import {
  MessageSquare,
  Mail,
  Flag,
  FileText,
  Smartphone,
  Bell,
  Map,
  CheckSquare,
  MessageCircle,
  ClipboardList,
  GitBranch,
  Newspaper,
  Radio,
  CircleDot
} from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';
import type { ChannelContent } from './channel-content-types';

/* ── Types ────────────────────────────────────────────────────── */

export type OutboundViewType = 'messages' | 'series';

export interface ChannelType {
  slug: string;
  label: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  color: string;
}

export interface TemplateRule {
  field: string;
  operator: string;
  value: string;
}

export interface SeriesTemplate {
  id: string;
  title: string;
  description: string;
  category: 'onboarding' | 'engagement' | 'lead-gen' | 'feedback' | 'activation';
}

export interface QuickStarter {
  id: string;
  channel: string;
  title: string;
  description: string;
  aboutText: string;
  rules: TemplateRule[];
  defaultContent?: Partial<ChannelContent>;
}

/* ── Channels ─────────────────────────────────────────────────── */

export const CHANNEL_TYPES: ChannelType[] = [
  { slug: 'chat', label: 'Chat', icon: MessageSquare, color: '#3b82f6' },
  { slug: 'email', label: 'Email', icon: Mail, color: '#8b5cf6' },
  { slug: 'banner', label: 'Banner', icon: Flag, color: '#f59e0b' },
  { slug: 'post', label: 'Post', icon: FileText, color: '#10b981' },
  { slug: 'sms', label: 'SMS', icon: MessageCircle, color: '#06b6d4' },
  { slug: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: '#22c55e' },
  { slug: 'mobile-push', label: 'Mobile Push', icon: Bell, color: '#f43f5e' },
  { slug: 'tooltip', label: 'Tooltip', icon: CircleDot, color: '#6366f1' },
  { slug: 'product-tour', label: 'Product Tour', icon: Map, color: '#ec4899' },
  { slug: 'checklist', label: 'Checklist', icon: CheckSquare, color: '#14b8a6' },
  { slug: 'survey', label: 'Survey', icon: ClipboardList, color: '#a855f7' },
  { slug: 'mobile-carousel', label: 'Mobile Carousel', icon: Smartphone, color: '#f97316' },
  { slug: 'workflow', label: 'Workflow', icon: GitBranch, color: '#64748b' },
  { slug: 'news', label: 'News', icon: Newspaper, color: '#0ea5e9' },
  { slug: 'broadcast', label: 'Broadcast', icon: Radio, color: '#ef4444' }
];

/* ── Series templates ─────────────────────────────────────────── */

export const SERIES_TEMPLATES: SeriesTemplate[] = [
  {
    id: 'onboard-new-users',
    title: 'Onboard new users to drive adoption',
    description: 'Guide new users through your product with a multi-step onboarding series.',
    category: 'onboarding'
  },
  {
    id: 'announce-feature',
    title: 'Announce a new feature to boost adoption',
    description: 'Let users know about new features with targeted in-app and email messages.',
    category: 'engagement'
  },
  {
    id: 're-engage-inactive',
    title: 'Encourage inactive users to re-engage',
    description: 'Bring back users who have gone quiet with personalized re-engagement campaigns.',
    category: 'engagement'
  },
  {
    id: 'onboard-mobile',
    title: 'Onboard new mobile users',
    description: 'Create a seamless onboarding flow for new mobile app users.',
    category: 'onboarding'
  },
  {
    id: 'encourage-upgrades',
    title: 'Encourage upgrades to boost engagement',
    description: 'Nudge free users toward paid plans with value-driven messaging.',
    category: 'engagement'
  },
  {
    id: 'send-updates',
    title: 'Send updates to reduce inbound support',
    description: 'Proactively inform users about changes to reduce support tickets.',
    category: 'engagement'
  },
  {
    id: 'announce-mobile-features',
    title: 'Announce mobile features to drive engagement',
    description: 'Highlight new mobile features with push notifications and carousels.',
    category: 'engagement'
  },
  {
    id: 're-engage-mobile',
    title: 'Re-engage your mobile users',
    description: 'Win back dormant mobile users with push notifications and in-app messages.',
    category: 'engagement'
  },
  {
    id: 'capture-leads',
    title: 'Capture leads from new and returning visitors',
    description: 'Turn website visitors into leads with smart chat prompts and forms.',
    category: 'lead-gen'
  },
  {
    id: 'engage-pricing',
    title: 'Engage visitors on your pricing page',
    description: 'Help pricing page visitors make decisions with targeted chat messages.',
    category: 'lead-gen'
  },
  {
    id: 'gated-content',
    title: 'Attract visitors with gated content',
    description: 'Offer valuable content in exchange for contact information.',
    category: 'lead-gen'
  },
  {
    id: 'measure-nps',
    title: 'Measure NPS\u00ae and send personalized follow-ups',
    description: 'Collect NPS scores and trigger follow-up sequences based on responses.',
    category: 'feedback'
  },
  {
    id: 'survey-new-users',
    title: 'Survey new users to tailor their experience',
    description: 'Ask new users about their goals to personalize their journey.',
    category: 'feedback'
  },
  {
    id: 'survey-content',
    title: 'Survey users to evaluate your content',
    description: 'Gather feedback on help articles and docs to improve content quality.',
    category: 'feedback'
  },
  {
    id: 'mobile-feedback',
    title: 'Ask mobile users for feedback',
    description: 'Collect in-app feedback from mobile users at the right moment.',
    category: 'feedback'
  },
  {
    id: 'activate-checklist',
    title: 'Activate new users with a checklist',
    description: 'Guide users through key activation steps with an interactive checklist.',
    category: 'activation'
  }
];

/* ── Quick starters ───────────────────────────────────────────── */

export const QUICK_STARTERS: QuickStarter[] = [
  // Post
  { id: 'post-1', channel: 'post', title: 'Announce a new feature to drive adoption', description: 'Share exciting feature updates with your users.', aboutText: 'Use this template to announce new features and drive adoption among your active users.', rules: [{ field: 'User role', operator: 'is', value: 'User' }, { field: 'Last seen', operator: 'within', value: '30 days' }], defaultContent: { channelGroup: 'post-news', title: 'Introducing: Advanced Analytics', body: 'We just launched a powerful new analytics dashboard. Track performance, spot trends, and make data-driven decisions — all in one place.', ctaText: 'Try it now', ctaUrl: '/features/analytics' } },
  { id: 'post-2', channel: 'post', title: 'Offer a discount to boost sales', description: 'Promote limited-time offers to increase conversions.', aboutText: 'Send a targeted discount offer to users on trial or free plans to boost conversions.', rules: [{ field: 'Plan', operator: 'is', value: 'Trial' }, { field: 'Signed up', operator: 'more than', value: '7 days ago' }], defaultContent: { channelGroup: 'post-news', title: 'Exclusive 30% off — limited time', body: 'You\'ve been exploring our product and we want to make it even easier to get started. Enjoy 30% off any paid plan for the next 48 hours.', ctaText: 'Claim offer', ctaUrl: '/upgrade' } },
  { id: 'post-3', channel: 'post', title: 'Promote webinars to drive engagement', description: 'Invite users to upcoming webinars and events.', aboutText: 'Promote webinars and events to active users who are likely to attend.', rules: [{ field: 'User role', operator: 'is', value: 'User' }, { field: 'Last seen', operator: 'within', value: '14 days' }], defaultContent: { channelGroup: 'post-news', title: 'Join our live webinar', body: 'Learn expert tips and tricks in our upcoming live webinar. Reserve your spot now — seats are limited!', ctaText: 'Register now', ctaUrl: '/webinars' } },
  { id: 'post-4', channel: 'post', title: 'Follow up after orders to ensure satisfaction', description: 'Check in with customers after their purchase.', aboutText: 'Send a friendly follow-up message after a purchase to ensure customer satisfaction.', rules: [{ field: 'Last order', operator: 'within', value: '3 days' }], defaultContent: { channelGroup: 'post-news', title: 'How was your experience?', body: 'We hope you\'re enjoying your recent purchase! If you have any questions or feedback, we\'d love to hear from you.', ctaText: 'Share feedback', ctaUrl: '/feedback' } },

  // Chat — featured template
  { id: 'chat-1', channel: 'chat', title: 'Say hi to welcome new visitors', description: 'Greet first-time visitors with a friendly message.', aboutText: 'This chat message automatically greets new visitors on your website. It triggers after they have been on the page for 10 seconds, targeting visitors who have not been contacted before.', rules: [{ field: 'Time on current page', operator: 'is', value: '10 seconds' }, { field: 'User type', operator: 'is', value: 'Visitors' }, { field: 'Last contacted', operator: 'is', value: 'unknown' }, { field: 'Last heard from', operator: 'is', value: 'unknown' }], defaultContent: { channelGroup: 'text', body: 'Hey there! Welcome to our site. Take a look around — if you have any questions, just reply to this message.', ctaText: 'Start chatting' } },
  { id: 'chat-2', channel: 'chat', title: 'Ask new users if they need any help', description: 'Proactively offer assistance to new signups.', aboutText: 'Reach out to new users shortly after signup to offer help and reduce time to value.', rules: [{ field: 'Signed up', operator: 'within', value: '1 day' }, { field: 'User role', operator: 'is', value: 'User' }], defaultContent: { channelGroup: 'text', body: 'Hi! Thanks for signing up. Need any help getting started? I\'m here to help you make the most of your account.', ctaText: 'Yes, help me!' } },
  { id: 'chat-3', channel: 'chat', title: 'Help visitors on your pricing page', description: 'Assist users who are evaluating your plans.', aboutText: 'Show a helpful chat message to visitors browsing your pricing page.', rules: [{ field: 'Current page URL', operator: 'contains', value: '/pricing' }, { field: 'Time on current page', operator: 'is', value: '5 seconds' }], defaultContent: { channelGroup: 'text', body: 'Looking for the right plan? I can help you find the best option for your needs. Just ask!', ctaText: 'Compare plans' } },
  { id: 'chat-4', channel: 'chat', title: 'Encourage more newsletter sign-ups', description: 'Prompt visitors to subscribe to your newsletter.', aboutText: 'Encourage blog visitors to subscribe to your newsletter for regular updates.', rules: [{ field: 'Current page URL', operator: 'contains', value: '/blog' }, { field: 'Visit count', operator: 'greater than', value: '2' }], defaultContent: { channelGroup: 'text', body: 'Enjoying our content? Subscribe to our newsletter and never miss an update.', ctaText: 'Subscribe' } },
  { id: 'chat-5', channel: 'chat', title: 'Ask Spanish speakers if they need any help', description: 'Offer multilingual support to Spanish-speaking visitors.', aboutText: 'Detect Spanish-speaking visitors and offer help in their language.', rules: [{ field: 'Browser language', operator: 'is', value: 'Spanish' }, { field: 'Last contacted', operator: 'is', value: 'unknown' }], defaultContent: { channelGroup: 'text', body: '¡Hola! ¿Necesitas ayuda? Estamos aquí para ayudarte en español.', ctaText: 'Sí, ayúdame' } },

  // Email — featured template
  { id: 'email-1', channel: 'email', title: 'Nurture leads to build relationships', description: 'Send a drip campaign to warm up new leads.', aboutText: 'Automatically nurture new leads with a series of helpful emails over their first 30 days.', rules: [{ field: 'User type', operator: 'is', value: 'Lead' }, { field: 'Signed up', operator: 'within', value: '30 days' }], defaultContent: { channelGroup: 'email', subject: 'Welcome! Here\'s how to get started', body: 'Thanks for signing up! We\'re excited to have you on board. Here are three quick tips to help you get the most out of our platform...', ctaText: 'Get started', ctaUrl: '/getting-started' } },
  { id: 'email-2', channel: 'email', title: 'Reconnect to keep users close', description: 'Re-engage users who haven\u2019t been active recently.', aboutText: 'This email reconnects with users who have gone inactive. It sends a personalized message encouraging them to come back and highlights what they\u2019ve been missing.', rules: [{ field: 'Last seen', operator: 'more than', value: '30 days ago' }, { field: 'User role', operator: 'is', value: 'User' }, { field: 'Email subscription', operator: 'is', value: 'subscribed' }], defaultContent: { channelGroup: 'email', subject: 'We miss you! Here\'s what\'s new', body: 'It\'s been a while since we last saw you. We\'ve been busy shipping new features and improvements — here\'s a quick summary of what you\'ve missed.', ctaText: 'See what\'s new', ctaUrl: '/changelog' } },
  { id: 'email-3', channel: 'email', title: 'Remind users to complete their purchase', description: 'Send abandoned cart reminders to boost conversions.', aboutText: 'Recover lost revenue by reminding users about items left in their cart.', rules: [{ field: 'Cart status', operator: 'is', value: 'abandoned' }, { field: 'Last seen', operator: 'within', value: '3 days' }], defaultContent: { channelGroup: 'email', subject: 'You left something behind!', body: 'Looks like you left some items in your cart. Complete your purchase before they sell out!', ctaText: 'Complete purchase', ctaUrl: '/cart' } },
  { id: 'email-4', channel: 'email', title: 'Confirm an order has been placed', description: 'Send transactional order confirmation emails.', aboutText: 'Automatically confirm orders with a professional receipt email.', rules: [{ field: 'Event', operator: 'is', value: 'order.completed' }], defaultContent: { channelGroup: 'email', subject: 'Order confirmed! Here are your details', body: 'Thank you for your order. We\'re processing it now and you\'ll receive a shipping notification once it\'s on its way.', ctaText: 'View order', ctaUrl: '/orders' } },
  { id: 'email-5', channel: 'email', title: 'Remind users their subscription will renew', description: 'Notify users before their subscription renews.', aboutText: 'Give users advance notice before their subscription auto-renews.', rules: [{ field: 'Subscription renewal', operator: 'within', value: '7 days' }], defaultContent: { channelGroup: 'email', subject: 'Your subscription renews in 7 days', body: 'Just a heads up — your subscription will automatically renew soon. If you need to make any changes, you can manage your plan in settings.', ctaText: 'Manage plan', ctaUrl: '/settings/billing' } },
  { id: 'email-6', channel: 'email', title: 'Treat customers on their birthday', description: 'Send personalized birthday messages with special offers.', aboutText: 'Delight customers with a birthday greeting and an exclusive discount.', rules: [{ field: 'Birthday', operator: 'is', value: 'today' }], defaultContent: { channelGroup: 'email', subject: 'Happy birthday! Here\'s a gift for you', body: 'Wishing you an amazing birthday! As a thank-you for being a valued customer, here\'s a special 20% discount just for you.', ctaText: 'Claim your gift', ctaUrl: '/birthday-offer' } },
  { id: 'email-7', channel: 'email', title: 'Verify a new user\u2019s email address', description: 'Send verification emails to confirm new accounts.', aboutText: 'Ensure new users verify their email address for account security.', rules: [{ field: 'Email verified', operator: 'is', value: 'false' }, { field: 'Signed up', operator: 'within', value: '1 day' }], defaultContent: { channelGroup: 'email', subject: 'Please verify your email address', body: 'Thanks for creating an account! Please verify your email address to activate all features and secure your account.', ctaText: 'Verify email', ctaUrl: '/verify' } },

  // Banner
  { id: 'banner-1', channel: 'banner', title: 'Promote an upcoming event', description: 'Announce events with a prominent in-app banner.', aboutText: 'Display a banner to promote your upcoming event to all active users.', rules: [{ field: 'User role', operator: 'is', value: 'User' }], defaultContent: { channelGroup: 'banner', title: 'Join us live!', body: 'Our annual conference is coming up. Register now to save your spot.', position: 'top', style: 'info', dismissible: true, ctaText: 'Register', ctaUrl: '/events' } },
  { id: 'banner-2', channel: 'banner', title: 'Offer a discount or promotion', description: 'Highlight deals with an attention-grabbing banner.', aboutText: 'Show a promotional banner to users who may be interested in upgrading.', rules: [{ field: 'Plan', operator: 'is', value: 'Free' }], defaultContent: { channelGroup: 'banner', title: 'Limited time offer', body: 'Upgrade today and get 25% off your first 3 months.', position: 'top', style: 'success', dismissible: true, ctaText: 'Upgrade now', ctaUrl: '/upgrade' } },
  { id: 'banner-3', channel: 'banner', title: 'Announce downtimes or maintenance', description: 'Inform users about scheduled maintenance.', aboutText: 'Display a maintenance notice banner to all logged-in users.', rules: [{ field: 'User role', operator: 'is not', value: 'Visitor' }], defaultContent: { channelGroup: 'banner', title: 'Scheduled maintenance', body: 'We\'ll be performing maintenance on Saturday from 2-4 AM UTC. Some features may be temporarily unavailable.', position: 'top', style: 'warning', dismissible: true } },
  { id: 'banner-4', channel: 'banner', title: 'Share helpful tips and tricks', description: 'Surface useful tips to improve user experience.', aboutText: 'Show contextual tips based on the feature users are currently using.', rules: [{ field: 'Session count', operator: 'less than', value: '5' }], defaultContent: { channelGroup: 'banner', title: 'Pro tip', body: 'Use keyboard shortcuts to speed up your workflow. Press ? to see all available shortcuts.', position: 'bottom', style: 'info', dismissible: true } },
  { id: 'banner-5', channel: 'banner', title: 'Remind users their trial is ending', description: 'Nudge trial users to convert before expiry.', aboutText: 'Show a trial ending reminder to users whose trial expires soon.', rules: [{ field: 'Plan', operator: 'is', value: 'Trial' }, { field: 'Trial ends', operator: 'within', value: '3 days' }], defaultContent: { channelGroup: 'banner', title: 'Your trial ends soon', body: 'You have 3 days left on your trial. Upgrade now to keep access to all features.', position: 'top', style: 'warning', dismissible: true, ctaText: 'Upgrade', ctaUrl: '/upgrade' } },
  { id: 'banner-6', channel: 'banner', title: 'Promote a feature to drive action', description: 'Draw attention to underused features.', aboutText: 'Highlight an underused feature to increase adoption.', rules: [{ field: 'Feature used', operator: 'is', value: 'false' }], defaultContent: { channelGroup: 'banner', title: 'Have you tried Reports?', body: 'Get detailed insights into your team\'s performance with our new Reports feature.', position: 'top', style: 'info', dismissible: true, ctaText: 'Explore Reports', ctaUrl: '/reports' } },
  { id: 'banner-7', channel: 'banner', title: 'Ask for visitor details to generate leads', description: 'Collect contact info with a subtle banner prompt.', aboutText: 'Capture visitor contact details with a non-intrusive banner form.', rules: [{ field: 'User type', operator: 'is', value: 'Visitors' }, { field: 'Visit count', operator: 'greater than', value: '1' }], defaultContent: { channelGroup: 'banner', title: 'Stay in the loop', body: 'Sign up for updates and be the first to know about new features.', position: 'bottom', style: 'info', dismissible: true, ctaText: 'Sign up', ctaUrl: '/subscribe' } },
  { id: 'banner-8', channel: 'banner', title: 'Alert users to an expired credit card', description: 'Notify users about payment issues immediately.', aboutText: 'Urgently notify users when their payment method needs updating.', rules: [{ field: 'Payment status', operator: 'is', value: 'failed' }], defaultContent: { channelGroup: 'banner', title: 'Payment failed', body: 'Your credit card on file has expired. Please update your payment method to avoid service interruption.', position: 'top', style: 'error', dismissible: false, ctaText: 'Update payment', ctaUrl: '/settings/billing' } },

  // Mobile Carousel
  { id: 'carousel-1', channel: 'mobile-carousel', title: 'Onboard new users to drive adoption', description: 'Walk new users through your app with swipeable cards.', aboutText: 'Create a swipeable onboarding experience for new mobile users.', rules: [{ field: 'Signed up', operator: 'within', value: '1 day' }, { field: 'Platform', operator: 'is', value: 'mobile' }], defaultContent: { channelGroup: 'mobile-carousel', title: 'Welcome aboard!', slides: [{ id: '1', title: 'Track your progress', body: 'See your daily stats and achievements at a glance.' }, { id: '2', title: 'Connect with your team', body: 'Collaborate in real-time with built-in messaging.' }, { id: '3', title: 'Stay organized', body: 'Keep everything in one place with smart folders.' }] } },
  { id: 'carousel-2', channel: 'mobile-carousel', title: 'Welcome new users so they feel at home', description: 'Create a warm first impression in your mobile app.', aboutText: 'Welcome new users with a friendly carousel introduction.', rules: [{ field: 'Session count', operator: 'is', value: '1' }, { field: 'Platform', operator: 'is', value: 'mobile' }], defaultContent: { channelGroup: 'mobile-carousel', title: 'Welcome!', slides: [{ id: '1', title: 'We\'re glad you\'re here', body: 'Let us show you around.' }, { id: '2', title: 'Personalize your experience', body: 'Set up your profile and preferences.' }] } },
  { id: 'carousel-3', channel: 'mobile-carousel', title: 'Offer support before users ask', description: 'Proactively surface help options in-app.', aboutText: 'Show help options to users who appear to be struggling.', rules: [{ field: 'Rage clicks', operator: 'greater than', value: '3' }, { field: 'Platform', operator: 'is', value: 'mobile' }], defaultContent: { channelGroup: 'mobile-carousel', title: 'Need help?', slides: [{ id: '1', title: 'Browse our help center', body: 'Find answers to common questions.' }, { id: '2', title: 'Chat with us', body: 'Our support team is here 24/7.' }] } },
  { id: 'carousel-4', channel: 'mobile-carousel', title: 'Announce a feature to boost engagement', description: 'Showcase new features with rich mobile carousels.', aboutText: 'Announce new mobile features with an interactive carousel.', rules: [{ field: 'App version', operator: 'is', value: 'latest' }, { field: 'Platform', operator: 'is', value: 'mobile' }], defaultContent: { channelGroup: 'mobile-carousel', title: 'What\'s new', slides: [{ id: '1', title: 'Dark mode', body: 'Easy on the eyes — switch to dark mode in settings.' }, { id: '2', title: 'Quick actions', body: 'Swipe right on any item for quick actions.' }] } },
  { id: 'carousel-5', channel: 'mobile-carousel', title: 'Offer promotions to convert customers', description: 'Display promotional offers in a swipeable format.', aboutText: 'Show exclusive mobile-only promotions to drive conversions.', rules: [{ field: 'Plan', operator: 'is', value: 'Free' }, { field: 'Platform', operator: 'is', value: 'mobile' }], defaultContent: { channelGroup: 'mobile-carousel', title: 'Special offers', slides: [{ id: '1', title: '50% off Pro', body: 'Unlock all features at half the price.' }, { id: '2', title: 'Free trial', body: 'Try Pro free for 14 days.' }] } },
  { id: 'carousel-6', channel: 'mobile-carousel', title: 'Share activity summaries to engage users', description: 'Show personalized activity recaps.', aboutText: 'Display weekly activity summaries to keep users engaged.', rules: [{ field: 'Last seen', operator: 'within', value: '7 days' }, { field: 'Platform', operator: 'is', value: 'mobile' }], defaultContent: { channelGroup: 'mobile-carousel', title: 'Your weekly recap', slides: [{ id: '1', title: 'This week\'s highlights', body: 'You completed 12 tasks and hit 3 goals.' }, { id: '2', title: 'Keep it up!', body: 'You\'re on a 5-week streak.' }] } },

  // Mobile Push
  { id: 'push-1', channel: 'mobile-push', title: 'Remind users their subscription will renew', description: 'Send renewal reminders via push notification.', aboutText: 'Notify mobile users about upcoming subscription renewals.', rules: [{ field: 'Subscription renewal', operator: 'within', value: '7 days' }, { field: 'Push enabled', operator: 'is', value: 'true' }], defaultContent: { channelGroup: 'mobile-push', title: 'Subscription renewal', body: 'Your subscription renews in 7 days. Tap to manage your plan.' } },
  { id: 'push-2', channel: 'mobile-push', title: 'Promote new offers to re-engage users', description: 'Win users back with exclusive push offers.', aboutText: 'Send promotional push notifications to inactive users.', rules: [{ field: 'Last seen', operator: 'more than', value: '14 days ago' }, { field: 'Push enabled', operator: 'is', value: 'true' }], defaultContent: { channelGroup: 'mobile-push', title: 'We miss you!', body: 'Come back and check out what\'s new. Plus, enjoy 20% off this week.', deepLinkUrl: '/offers' } },
  { id: 'push-3', channel: 'mobile-push', title: 'Send promotions to drive new purchases', description: 'Boost sales with timely push notifications.', aboutText: 'Drive sales with time-sensitive push notification offers.', rules: [{ field: 'Push enabled', operator: 'is', value: 'true' }, { field: 'Last purchase', operator: 'more than', value: '30 days ago' }], defaultContent: { channelGroup: 'mobile-push', title: 'Flash sale!', body: 'Up to 40% off — today only. Don\'t miss out!', deepLinkUrl: '/sale' } },

  // Workflow
  { id: 'workflow-1', channel: 'workflow', title: 'Convert trial users into paying customers', description: 'Automate the trial-to-paid conversion journey.', aboutText: 'Set up an automated workflow to convert trial users into paying customers through a multi-step journey.', rules: [{ field: 'Plan', operator: 'is', value: 'Trial' }, { field: 'Trial days remaining', operator: 'less than', value: '7' }], defaultContent: { channelGroup: 'generic', body: 'Your free trial ends soon! Upgrade now to keep access to all the features you love.', ctaText: 'Upgrade now', ctaUrl: '/upgrade' } },

  // Product Tour — featured template
  { id: 'tour-1', channel: 'product-tour', title: 'Show customers how to adopt new features', description: 'Create step-by-step walkthroughs for new features.', aboutText: 'Guide users through newly released features with an interactive step-by-step product tour.', rules: [{ field: 'Feature used', operator: 'is', value: 'false' }, { field: 'User role', operator: 'is', value: 'User' }], defaultContent: { channelGroup: 'product-tour', title: 'Discover our new feature', steps: [{ id: '1', selector: '[data-tour="feature-btn"]', title: 'Click here to get started', body: 'This new button opens our powerful feature panel.', position: 'bottom' }, { id: '2', selector: '[data-tour="feature-panel"]', title: 'Explore the panel', body: 'Here you can configure settings and view results.', position: 'right' }, { id: '3', selector: '[data-tour="feature-save"]', title: 'Save your changes', body: 'Click save to apply your configuration.', position: 'bottom' }] } },
  { id: 'tour-2', channel: 'product-tour', title: 'Take new users on a tour to get onboarded', description: 'Guide first-time users through your product.', aboutText: 'This product tour guides new users through the key areas of your product. It activates on their first login and walks them through the most important features to help them get started quickly.', rules: [{ field: 'Session count', operator: 'is', value: '1' }, { field: 'User role', operator: 'is', value: 'User' }, { field: 'Completed onboarding', operator: 'is', value: 'false' }], defaultContent: { channelGroup: 'product-tour', title: 'Welcome! Let us show you around', steps: [{ id: '1', selector: '[data-tour="dashboard"]', title: 'Your dashboard', body: 'This is your home base. See an overview of everything happening in your account.', position: 'bottom' }, { id: '2', selector: '[data-tour="sidebar"]', title: 'Navigation', body: 'Use the sidebar to access all features — messages, contacts, reports and more.', position: 'right' }, { id: '3', selector: '[data-tour="settings"]', title: 'Settings', body: 'Customize your workspace, invite team members, and set up integrations.', position: 'left' }, { id: '4', selector: '[data-tour="help"]', title: 'Need help?', body: 'Click here anytime to chat with our support team or browse help articles.', position: 'top' }] } },

  // Survey
  { id: 'survey-1', channel: 'survey', title: 'Measure NPS\u00ae to understand user loyalty', description: 'Collect NPS scores to gauge customer satisfaction.', aboutText: 'Measure Net Promoter Score to understand customer loyalty and satisfaction.', rules: [{ field: 'Last surveyed', operator: 'more than', value: '90 days ago' }, { field: 'User role', operator: 'is', value: 'User' }], defaultContent: { channelGroup: 'survey', title: 'NPS Survey', question: 'How likely are you to recommend us to a friend or colleague?', questionType: 'rating' } },
  { id: 'survey-2', channel: 'survey', title: 'Learn about users to personalize experiences', description: 'Gather preferences to tailor the user journey.', aboutText: 'Collect user preferences and goals to deliver personalized experiences.', rules: [{ field: 'Signed up', operator: 'within', value: '3 days' }], defaultContent: { channelGroup: 'survey', title: 'Help us personalize your experience', question: 'What is your primary goal with our product?', questionType: 'multiple-choice', choices: ['Increase sales', 'Improve support', 'Reduce churn', 'Other'] } },
  { id: 'survey-3', channel: 'survey', title: 'Capture feature requests to help you grow', description: 'Collect feedback on what users want next.', aboutText: 'Invite power users to share feature requests and ideas for improvement.', rules: [{ field: 'Session count', operator: 'greater than', value: '20' }], defaultContent: { channelGroup: 'survey', title: 'Feature request', question: 'What feature would you most like to see us build next?', questionType: 'text' } },
  { id: 'survey-4', channel: 'survey', title: 'Measure satisfaction to improve features', description: 'Understand how users feel about specific features.', aboutText: 'Survey users about specific features to guide product improvements.', rules: [{ field: 'Feature used', operator: 'is', value: 'true' }, { field: 'Usage count', operator: 'greater than', value: '5' }], defaultContent: { channelGroup: 'survey', title: 'Feature feedback', question: 'How satisfied are you with this feature?', questionType: 'rating' } },
  { id: 'survey-5', channel: 'survey', title: 'Capture visitor intent to generate leads', description: 'Learn what visitors are looking for.', aboutText: 'Ask visitors about their intent to qualify and capture leads.', rules: [{ field: 'User type', operator: 'is', value: 'Visitors' }, { field: 'Visit count', operator: 'greater than', value: '2' }], defaultContent: { channelGroup: 'survey', title: 'Quick question', question: 'What brings you here today?', questionType: 'multiple-choice', choices: ['Evaluating the product', 'Looking for pricing', 'Need support', 'Just browsing'] } },
  { id: 'survey-6', channel: 'survey', title: 'Learn why users leave, to boost retention', description: 'Run exit surveys to understand churn reasons.', aboutText: 'Understand why users cancel by presenting an exit survey during the cancellation flow.', rules: [{ field: 'Event', operator: 'is', value: 'subscription.cancelled' }], defaultContent: { channelGroup: 'survey', title: 'We\'re sorry to see you go', question: 'What was the main reason for cancelling?', questionType: 'multiple-choice', choices: ['Too expensive', 'Missing features', 'Switched to a competitor', 'No longer needed', 'Other'] } },
  { id: 'survey-7', channel: 'survey', title: 'Measure product/market fit to meet user needs', description: 'Ask the key PMF question to gauge fit.', aboutText: 'Measure product/market fit by asking users how they would feel without your product.', rules: [{ field: 'Signed up', operator: 'more than', value: '14 days ago' }, { field: 'Session count', operator: 'greater than', value: '5' }], defaultContent: { channelGroup: 'survey', title: 'Product feedback', question: 'How would you feel if you could no longer use our product?', questionType: 'multiple-choice', choices: ['Very disappointed', 'Somewhat disappointed', 'Not disappointed'] } },

  // SMS
  { id: 'sms-1', channel: 'sms', title: 'Welcome new customers to drive activation', description: 'Send a warm welcome SMS to new signups.', aboutText: 'Send a personalized welcome SMS right after signup to drive early activation.', rules: [{ field: 'Signed up', operator: 'within', value: '1 hour' }, { field: 'Phone', operator: 'is not', value: 'empty' }], defaultContent: { channelGroup: 'text', body: 'Welcome to our platform! Get started at app.example.com. Reply HELP for support.' } },
  { id: 'sms-2', channel: 'sms', title: 'Notify users about an order or update', description: 'Keep customers informed about order status.', aboutText: 'Send SMS notifications for order status changes.', rules: [{ field: 'Event', operator: 'is', value: 'order.updated' }], defaultContent: { channelGroup: 'text', body: 'Your order #{{orderNumber}} has been updated. Track it here: app.example.com/orders' } },
  { id: 'sms-3', channel: 'sms', title: 'Remind customers about appointments', description: 'Reduce no-shows with timely SMS reminders.', aboutText: 'Send appointment reminders to reduce no-shows.', rules: [{ field: 'Appointment', operator: 'within', value: '24 hours' }], defaultContent: { channelGroup: 'text', body: 'Reminder: You have an appointment tomorrow at {{time}}. Reply YES to confirm or CHANGE to reschedule.' } },
  { id: 'sms-4', channel: 'sms', title: 'Send account updates to keep customers aware', description: 'Notify users about important account changes.', aboutText: 'Alert users about important account changes via SMS.', rules: [{ field: 'Event', operator: 'is', value: 'account.updated' }], defaultContent: { channelGroup: 'text', body: 'Account update: Your settings have been changed. If this wasn\'t you, contact support immediately.' } },
  { id: 'sms-5', channel: 'sms', title: 'Reconnect with inactive customers', description: 'Win back customers with a personal SMS.', aboutText: 'Re-engage inactive customers with a personal SMS message.', rules: [{ field: 'Last seen', operator: 'more than', value: '60 days ago' }, { field: 'Phone', operator: 'is not', value: 'empty' }], defaultContent: { channelGroup: 'text', body: 'We miss you! Come back and see what\'s new. Enjoy 15% off with code WELCOME15.' } },
  { id: 'sms-6', channel: 'sms', title: 'Offer discounts to drive more purchases', description: 'Send exclusive SMS-only deals.', aboutText: 'Send SMS-exclusive discount codes to drive purchases.', rules: [{ field: 'SMS opt-in', operator: 'is', value: 'true' }], defaultContent: { channelGroup: 'text', body: 'Exclusive SMS deal: Use code SAVE20 for 20% off your next order. Valid 48 hours only!' } },

  // News
  { id: 'news-1', channel: 'news', title: 'Announce a new product to raise awareness', description: 'Share product launches via the news feed.', aboutText: 'Announce new products to all users via the in-app news feed.', rules: [{ field: 'User role', operator: 'is', value: 'User' }], defaultContent: { channelGroup: 'post-news', title: 'Introducing our new product', body: 'We\'re thrilled to announce our latest product. Designed to make your workflow faster and easier than ever.', ctaText: 'Learn more', ctaUrl: '/products/new' } },
  { id: 'news-2', channel: 'news', title: 'Share a feature update to boost adoption', description: 'Keep users informed about improvements.', aboutText: 'Share feature updates to drive awareness and adoption.', rules: [{ field: 'User role', operator: 'is', value: 'User' }], defaultContent: { channelGroup: 'post-news', title: 'Feature update: Improved search', body: 'Search just got a whole lot smarter. Find what you need instantly with our new AI-powered search.', ctaText: 'Try it', ctaUrl: '/search' } },
  { id: 'news-3', channel: 'news', title: 'Promote events to increase sign-ups', description: 'Advertise upcoming events in the news feed.', aboutText: 'Promote events through the news feed to maximize attendance.', rules: [{ field: 'User role', operator: 'is', value: 'User' }], defaultContent: { channelGroup: 'post-news', title: 'Upcoming event', body: 'Join us for our quarterly product demo. See new features in action and ask your questions live.', ctaText: 'RSVP now', ctaUrl: '/events' } },
  { id: 'news-4', channel: 'news', title: 'Share company news to keep customers informed', description: 'Build trust with transparent company updates.', aboutText: 'Share important company updates with your user base.', rules: [{ field: 'User role', operator: 'is', value: 'User' }], defaultContent: { channelGroup: 'post-news', title: 'Company update', body: 'We\'re growing! Meet our new leadership team and learn about our vision for the future.', ctaText: 'Read more', ctaUrl: '/blog/company-update' } },

  // Checklist
  { id: 'checklist-1', channel: 'checklist', title: 'Onboard new users with key steps', description: 'Help users complete essential setup tasks.', aboutText: 'Guide new users through key onboarding steps with a progress checklist.', rules: [{ field: 'Signed up', operator: 'within', value: '7 days' }, { field: 'Onboarding completed', operator: 'is', value: 'false' }], defaultContent: { channelGroup: 'checklist', title: 'Get started', items: [{ id: '1', label: 'Complete your profile' }, { id: '2', label: 'Connect your first integration' }, { id: '3', label: 'Invite a team member' }, { id: '4', label: 'Send your first message' }] } },
  { id: 'checklist-2', channel: 'checklist', title: 'Guide users through a new feature', description: 'Walk users through feature adoption step by step.', aboutText: 'Help users adopt a new feature with a step-by-step checklist.', rules: [{ field: 'Feature used', operator: 'is', value: 'false' }, { field: 'User role', operator: 'is', value: 'User' }], defaultContent: { channelGroup: 'checklist', title: 'Try our new feature', items: [{ id: '1', label: 'Open the feature panel' }, { id: '2', label: 'Configure your settings' }, { id: '3', label: 'Run your first report' }] } },

  // Tooltip Group
  { id: 'tooltip-1', channel: 'tooltip', title: 'Add links to deepen engagement', description: 'Surface contextual links within your product.', aboutText: 'Add contextual links as tooltips to help users discover more content.', rules: [{ field: 'User role', operator: 'is', value: 'User' }], defaultContent: { channelGroup: 'tooltip', title: 'Did you know?', body: 'Click here to access advanced settings and customize your experience.', cssSelector: '[data-tooltip="settings"]', ctaText: 'Go to settings', ctaUrl: '/settings' } },
  { id: 'tooltip-2', channel: 'tooltip', title: 'Get attention with an animated beacon', description: 'Draw the eye to important UI elements.', aboutText: 'Use an animated beacon to draw attention to specific UI elements.', rules: [{ field: 'Feature used', operator: 'is', value: 'false' }], defaultContent: { channelGroup: 'tooltip', title: 'New!', body: 'We\'ve added a new feature here. Click to try it out!', cssSelector: '[data-tooltip="new-feature"]' } },
  { id: 'tooltip-3', channel: 'tooltip', title: 'Add labels to boost visibility', description: 'Highlight key interface elements with labels.', aboutText: 'Add visible labels to highlight important interface elements.', rules: [{ field: 'Session count', operator: 'less than', value: '3' }], defaultContent: { channelGroup: 'tooltip', title: 'Quick tip', body: 'This button helps you quickly create new entries. Try it!', cssSelector: '[data-tooltip="create-btn"]' } },
  { id: 'tooltip-4', channel: 'tooltip', title: 'Add a tooltip to give extra details', description: 'Provide helpful context on hover.', aboutText: 'Display helpful tooltips with additional context for complex features.', rules: [{ field: 'User role', operator: 'is', value: 'User' }], defaultContent: { channelGroup: 'tooltip', title: 'About this feature', body: 'This section shows your real-time performance metrics. Data updates every 5 minutes.', cssSelector: '[data-tooltip="metrics"]' } }
];
