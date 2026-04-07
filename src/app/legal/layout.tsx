import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Policies – SWEO AI',
  description:
    'Legal documents, terms of service, privacy policies, and compliance information for SWEO AI.'
};

export default function LegalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='bg-background min-h-screen'>
      {children}
    </div>
  );
}
