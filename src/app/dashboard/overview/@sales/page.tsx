import { RecentConversations } from '@/features/overview/components/recent-sales';
import { getOverviewDataAction } from '@/features/overview/actions/overview-actions';

export default async function Sales() {
  const result = await getOverviewDataAction();
  const conversations = result.data?.recentConversations ?? [];
  return <RecentConversations conversations={conversations} />;
}
