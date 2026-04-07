import type { Metadata } from 'next';
import { ContactSalesContent } from '@/features/contact-sales/contact-sales-content';

export const metadata: Metadata = {
  title: 'Kontakta sälj | SWEO AI-agent',
  description:
    'Upptäck vad SWEO kan göra för din kundtjänst. Kontakta vårt säljteam för att lära dig mer om världens främsta AI-agent.',
  openGraph: {
    images: ['https://fin.ai/img/social/contact-sales.jpg'],
  },
};

export default function SvContactSalesPage() {
  return <ContactSalesContent />;
}

