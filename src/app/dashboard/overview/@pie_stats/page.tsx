import { PieGraph } from '@/features/overview/components/pie-graph';
import { getOverviewDataAction } from '@/features/overview/actions/overview-actions';

export default async function Stats() {
  const result = await getOverviewDataAction();
  const channelBreakdown = result.data?.metrics?.channelBreakdown ?? {};
  return <PieGraph data={channelBreakdown} />;
}
