import { SweoLayout } from '@/features/overview/components/sweo-layout';

export default function ConnectorsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SweoLayout>{children}</SweoLayout>;
}
