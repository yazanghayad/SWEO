import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RecentConversation } from '@/features/overview/actions/overview-actions';

interface RecentConversationsProps {
  conversations: RecentConversation[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'resolved':
      return 'default' as const;
    case 'escalated':
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function RecentConversations({
  conversations
}: RecentConversationsProps) {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Conversations</CardTitle>
        <CardDescription>
          {conversations.length > 0
            ? `${conversations.length} latest conversations`
            : 'No conversations yet'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {conversations.length === 0 && (
            <p className='text-muted-foreground text-sm text-center py-4'>
              Conversations will appear here once customers start chatting.
            </p>
          )}
          {conversations.map((conv) => (
            <div key={conv.id} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarFallback>{getInitials(conv.visitorName)}</AvatarFallback>
              </Avatar>
              <div className='ml-4 min-w-0 flex-1 space-y-1'>
                <p className='text-sm leading-none font-medium'>
                  {conv.visitorName}
                </p>
                <p className='text-muted-foreground truncate text-xs'>
                  {conv.firstMessage || 'No message'}
                </p>
              </div>
              <div className='ml-2 flex flex-col items-end gap-1'>
                <Badge variant={getStatusVariant(conv.status)} className='text-[10px]'>
                  {conv.status}
                </Badge>
                <span className='text-muted-foreground text-[10px]'>
                  {timeAgo(conv.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Keep backward compat export
export { RecentConversations as RecentSales };
