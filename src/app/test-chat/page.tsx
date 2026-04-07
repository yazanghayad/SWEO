'use client';

import { useEffect } from 'react';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export default function TestChatPage() {
  if (IS_PRODUCTION) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-gray-500'>Page not available.</p>
      </div>
    );
  }

  return <TestChatContent />;
}

function TestChatContent() {
  useEffect(() => {
    // Set global config so the widget can read it
    // (document.currentScript is null for dynamically created scripts)
    (window as any).__CHAT_WIDGET_CONFIG = {
      apiKey: process.env.NEXT_PUBLIC_TEST_CHAT_API_KEY || '',
      apiUrl: window.location.origin,
      title: 'Support Chat',
      color: '#6366f1',
      position: 'right'
    };

    // Inject the widget script
    const script = document.createElement('script');
    script.src = '/widget/chat-widget.js';
    document.body.appendChild(script);

    return () => {
      // Cleanup widget on unmount
      script.remove();
      document.getElementById('cw-root')?.remove();
      delete (window as any).__CHAT_WIDGET_CONFIG;
    };
  }, []);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 p-8'>
      <div className='max-w-xl rounded-2xl bg-white p-10 shadow-lg'>
        <h1 className='mb-4 text-3xl font-bold text-gray-900'>
          External Chatbot Test
        </h1>
        <p className='mb-6 text-gray-600'>
          Use the chat widget in the bottom-right corner to start a
          conversation. Try asking a question, then request to be connected to
          customer service to trigger an escalation.
        </p>

        <div className='space-y-4 rounded-lg bg-indigo-50 p-6'>
          <h2 className='text-lg font-semibold text-indigo-900'>
            How to test the escalation flow:
          </h2>
          <ol className='list-inside list-decimal space-y-2 text-sm text-indigo-800'>
            <li>Click the chat bubble in the bottom-right corner</li>
            <li>Send a regular message (e.g. &quot;Hello&quot;)</li>
            <li>
              Ask to be connected to a human: &quot;Jag vill prata med en
              människa&quot; or &quot;Connect me to customer service&quot;
            </li>
            <li>
              The bot should escalate the conversation and you&apos;ll see a
              notification
            </li>
            <li>
              Open the{' '}
              <a
                href='/dashboard/inbox'
                target='_blank'
                className='font-medium text-indigo-600 underline hover:text-indigo-800'
              >
                Inbox
              </a>{' '}
              and check the &quot;Escalated &amp; Handoff&quot; view
            </li>
          </ol>
        </div>

        <div className='mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4'>
          <p className='text-sm text-amber-800'>
            <strong>Tip:</strong> You can also open the{' '}
            <a
              href='/dashboard/inbox'
              target='_blank'
              className='font-medium underline'
            >
              Inbox
            </a>{' '}
            in another tab to watch conversations appear in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
