import { SweoLayout } from '@/features/overview/components/sweo-layout';

export default function TestingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SweoLayout>{children}</SweoLayout>;
}
