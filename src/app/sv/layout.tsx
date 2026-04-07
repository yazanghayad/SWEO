import { LocaleProvider } from '@/lib/i18n';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SWEO AI',
  description: 'AI-driven kundtjänstplattform',
};

export default function SvLayout({ children }: { children: React.ReactNode }) {
  return <LocaleProvider locale='sv'>{children}</LocaleProvider>;
}
