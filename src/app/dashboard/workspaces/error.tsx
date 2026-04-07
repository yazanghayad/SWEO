'use client';

import { DashboardError } from '@/components/dashboard-error';

export default function WorkspacesError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DashboardError error={error} reset={reset} section='Workspaces' />;
}
