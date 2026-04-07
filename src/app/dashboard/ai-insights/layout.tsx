import { SweoLayout } from '@/features/overview/components/sweo-layout';

export default function AIInsightsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SweoLayout>{children}</SweoLayout>;
}
