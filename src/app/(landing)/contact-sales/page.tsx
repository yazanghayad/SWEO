import type { Metadata } from 'next';
import { ContactSalesContent } from '@/features/contact-sales/contact-sales-content';

export const metadata: Metadata = {
  title: 'Contact Sales | Sweo AI Agent',
  description:
    'Discover what Sweo can do for your customer support. Get in touch with our sales team to find out more about the number one AI Agent.',
  openGraph: {
    images: ['https://fin.ai/img/social/contact-sales.jpg'],
  },
};

export default function ContactSalesPage() {
  return <ContactSalesContent />;
}
