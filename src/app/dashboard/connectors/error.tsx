'use client';

import { DashboardError } from '@/components/dashboard-error';

export default function ConnectorsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DashboardError error={error} reset={reset} section='Connectors' />;
}
