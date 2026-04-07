import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen flex-col bg-white'>
      {/* Top bar */}
      <header className='flex h-14 items-center justify-between px-6'>
        <Link href='/'>
          <Image
            src='/logo-icon-light.svg'
            alt='SWEO AI'
            width={44}
            height={44}
            className='h-11 w-11'
          />
        </Link>
        <Link
          href='/auth/sign-up'
          className='rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
        >
          Join SWEO AI
        </Link>
      </header>

      {/* Content */}
      <main className='flex flex-1 items-center justify-center px-4 pb-16'>
        <div className='w-full max-w-md'>{children}</div>
      </main>

      {/* Bottom */}
      <footer className='flex items-center justify-center px-6 pb-4'>
        <Link
          href='/legal/privacy/privacy-policy'
          className='text-xs text-gray-400 transition-colors hover:text-gray-600'
        >
          Your Privacy Choices
        </Link>
      </footer>
    </div>
  );
}
