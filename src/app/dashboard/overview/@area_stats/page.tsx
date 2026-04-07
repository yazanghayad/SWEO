import { AreaGraph } from '@/features/overview/components/area-graph';
import { getOverviewDataAction } from '@/features/overview/actions/overview-actions';

export default async function AreaStats() {
  const result = await getOverviewDataAction();
  const timeseries = result.data?.metrics?.timeseries ?? [];
  return <AreaGraph data={timeseries} />;
}
