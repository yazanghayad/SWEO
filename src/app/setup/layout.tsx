import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Set Up Your Workspace — SWEO',
  description: 'Configure your SWEO workspace'
};

export default function SetupLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
