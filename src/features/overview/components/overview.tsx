import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import { RecentConversations } from './recent-sales';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OverViewPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='font-serif text-xl font-light tracking-tight md:text-2xl'>
            Hi, Welcome back 👋
          </h2>
          <div className='hidden items-center space-x-2 md:flex'>
            <Button variant='outline' size='sm'>Download</Button>
          </div>
        </div>
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='analytics' disabled>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value='overview' className='space-y-6'>
            {/* Section label for KPI grid */}
            <div className='flex items-center gap-3'>
              <p className='section-label'>KEY METRICS</p>
              <div className='dashed-line flex-1' />
            </div>
            <div className='grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
              <Card className='@container/card relative overflow-hidden'>
                <div className='pointer-events-none absolute inset-0 dot-pattern text-foreground opacity-40' />
                <CardHeader>
                  <CardDescription className='section-label text-muted-foreground'>Total Revenue</CardDescription>
                  <CardTitle className='font-mono text-2xl font-light tabular-nums tracking-tight @[250px]/card:text-3xl'>
                    $1,250.00
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='font-mono text-[10px]'>
                      <TrendingUp />
                      +12.5%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium'>
                    Trending up this month <TrendingUp className='size-4' />
                  </div>
                  <div className='text-muted-foreground'>
                    Visitors for the last 6 months
                  </div>
                </CardFooter>
              </Card>
              <Card className='@container/card relative overflow-hidden'>
                <div className='pointer-events-none absolute inset-0 dot-pattern text-foreground opacity-40' />
                <CardHeader>
                  <CardDescription className='section-label text-muted-foreground'>New Customers</CardDescription>
                  <CardTitle className='font-mono text-2xl font-light tabular-nums tracking-tight @[250px]/card:text-3xl'>
                    1,234
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='font-mono text-[10px]'>
                      <TrendingDown />
                      -20%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium'>
                    Down 20% this period <TrendingDown className='size-4' />
                  </div>
                  <div className='text-muted-foreground'>
                    Acquisition needs attention
                  </div>
                </CardFooter>
              </Card>
              <Card className='@container/card relative overflow-hidden'>
                <div className='pointer-events-none absolute inset-0 dot-pattern text-foreground opacity-40' />
                <CardHeader>
                  <CardDescription className='section-label text-muted-foreground'>Active Accounts</CardDescription>
                  <CardTitle className='font-mono text-2xl font-light tabular-nums tracking-tight @[250px]/card:text-3xl'>
                    45,678
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='font-mono text-[10px]'>
                      <TrendingUp />
                      +12.5%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium'>
                    Strong user retention <TrendingUp className='size-4' />
                  </div>
                  <div className='text-muted-foreground'>
                    Engagement exceed targets
                  </div>
                </CardFooter>
              </Card>
              <Card className='@container/card relative overflow-hidden'>
                <div className='pointer-events-none absolute inset-0 dot-pattern text-foreground opacity-40' />
                <CardHeader>
                  <CardDescription className='section-label text-muted-foreground'>Growth Rate</CardDescription>
                  <CardTitle className='font-mono text-2xl font-light tabular-nums tracking-tight @[250px]/card:text-3xl'>
                    4.5%
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline' className='font-mono text-[10px]'>
                      <TrendingUp />
                      +4.5%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium'>
                    Steady performance increase{' '}
                    <TrendingUp className='size-4' />
                  </div>
                  <div className='text-muted-foreground'>
                    Meets growth projections
                  </div>
                </CardFooter>
              </Card>
            </div>
            {/* Section label for charts */}
            <div className='flex items-center gap-3 pt-2'>
              <p className='section-label'>PERFORMANCE</p>
              <div className='dashed-line flex-1' />
            </div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
              <div className='col-span-4'>
                <BarGraph data={[]} />
              </div>
              <Card className='col-span-4 md:col-span-3'>
                <RecentConversations conversations={[]} />
              </Card>
              <div className='col-span-4'>
                <AreaGraph data={[]} />
              </div>
              <div className='col-span-4 md:col-span-3'>
                <PieGraph data={{}} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
