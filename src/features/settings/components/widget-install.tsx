'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface WidgetInstallProps {
  apiKey: string;
  apiUrl: string;
}

export function WidgetInstall({ apiKey, apiUrl }: WidgetInstallProps) {
  const scriptSnippet = `<script
  src="${apiUrl}/api/widget/chat-widget.js"
  data-api-key="${apiKey}"
  data-api-url="${apiUrl}"
></script>`;

  const npmInstall = `npm install @sweo/widget`;

  const jsUsage = `import { init } from '@sweo/widget';

const widget = await init({
  apiKey: '${apiKey}',
  apiUrl: '${apiUrl}',
});

// Programmatic control
widget.open();
widget.on('close', () => console.log('Widget closed'));`;

  const reactUsage = `import { SweoWidget } from '@sweo/widget/react';

function App() {
  return (
    <SweoWidget
      apiKey="${apiKey}"
      apiUrl="${apiUrl}"
    />
  );
}`;

  const reactHookUsage = `import { useSweoWidget } from '@sweo/widget/react';

function ChatButton() {
  const { isReady, isOpen, toggle } = useSweoWidget({
    apiKey: '${apiKey}',
    apiUrl: '${apiUrl}',
  });

  return (
    <button onClick={toggle} disabled={!isReady}>
      {isOpen ? 'Close Chat' : 'Open Chat'}
    </button>
  );
}`;

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <CardTitle className='text-base'>Chat Widget</CardTitle>
          <Badge variant='outline' className='text-xs'>
            Embed
          </Badge>
        </div>
        <CardDescription>
          Install the chat widget on your website using a script tag or npm
          package.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='script'>
          <TabsList>
            <TabsTrigger value='script'>Script Tag</TabsTrigger>
            <TabsTrigger value='npm'>npm Package</TabsTrigger>
          </TabsList>

          {/* Script Tag tab */}
          <TabsContent value='script' className='space-y-4'>
            <div className='relative'>
              <pre className='bg-muted overflow-x-auto rounded-lg p-4 text-xs'>
                <code>{scriptSnippet}</code>
              </pre>
              <Button
                size='sm'
                variant='secondary'
                className='absolute top-2 right-2'
                onClick={() => copy(scriptSnippet)}
              >
                Copy
              </Button>
            </div>
            <p className='text-muted-foreground text-xs'>
              Paste before the closing{' '}
              <code className='bg-muted rounded px-1'>&lt;/body&gt;</code> tag.
            </p>
          </TabsContent>

          {/* npm Package tab */}
          <TabsContent value='npm' className='space-y-5'>
            {/* Install */}
            <div>
              <p className='mb-2 text-xs font-medium'>Install</p>
              <div className='relative'>
                <pre className='bg-muted overflow-x-auto rounded-lg p-4 text-xs'>
                  <code>{npmInstall}</code>
                </pre>
                <Button
                  size='sm'
                  variant='secondary'
                  className='absolute top-2 right-2'
                  onClick={() => copy(npmInstall)}
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* Vanilla JS */}
            <div>
              <p className='mb-2 text-xs font-medium'>JavaScript / TypeScript</p>
              <div className='relative'>
                <pre className='bg-muted overflow-x-auto rounded-lg p-4 text-xs'>
                  <code>{jsUsage}</code>
                </pre>
                <Button
                  size='sm'
                  variant='secondary'
                  className='absolute top-2 right-2'
                  onClick={() => copy(jsUsage)}
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* React component */}
            <div>
              <p className='mb-2 text-xs font-medium'>React — Component</p>
              <div className='relative'>
                <pre className='bg-muted overflow-x-auto rounded-lg p-4 text-xs'>
                  <code>{reactUsage}</code>
                </pre>
                <Button
                  size='sm'
                  variant='secondary'
                  className='absolute top-2 right-2'
                  onClick={() => copy(reactUsage)}
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* React hook */}
            <div>
              <p className='mb-2 text-xs font-medium'>React — Hook</p>
              <div className='relative'>
                <pre className='bg-muted overflow-x-auto rounded-lg p-4 text-xs'>
                  <code>{reactHookUsage}</code>
                </pre>
                <Button
                  size='sm'
                  variant='secondary'
                  className='absolute top-2 right-2'
                  onClick={() => copy(reactHookUsage)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className='bg-muted/50 mt-4 space-y-2 rounded-lg border p-3'>
          <p className='text-xs font-medium'>What loads dynamically:</p>
          <ul className='text-muted-foreground list-inside list-disc space-y-1 text-xs'>
            <li>Bot name, welcome message &amp; brand color</li>
            <li>Widget position (left/right)</li>
            <li>Email verification requirement</li>
            <li>Typing indicators &amp; CSAT feedback</li>
            <li>Guidance rules &amp; topic suggestions</li>
            <li>Office hours awareness</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
