import { BarGraph } from '@/features/overview/components/bar-graph';
import { getOverviewDataAction } from '@/features/overview/actions/overview-actions';

export default async function BarStats() {
  const result = await getOverviewDataAction();
  const timeseries = result.data?.metrics?.timeseries ?? [];
  return <BarGraph data={timeseries} />;
}
