import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Brand Logos (inline SVG)                                           */
/* ------------------------------------------------------------------ */

export function SweoLogo({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} viewBox='0 0 24 24' fill='currentColor'>
      <path d='M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2M7 14.5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 1 0zm3.5 2a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 1 0zm3.5 0a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 1 0zm3.5-2a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 1 0z' />
    </svg>
  );
}

export function ZendeskLogo({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} viewBox='0 0 24 24' fill='currentColor'>
      <path d='M11.2 2v14.6L2 22V7.4A5.4 5.4 0 0 1 7.4 2zm1.6 5.4a5.4 5.4 0 1 0 0 10.8 5.4 5.4 0 0 0 0-10.8M22 2l-9.2 14.6V2z' />
    </svg>
  );
}

export function GuruLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-4 w-4 items-center justify-center rounded bg-green-500 text-[8px] font-bold text-white', className)}>
      G
    </div>
  );
}

export function NotionLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-4 w-4 items-center justify-center rounded bg-white text-[10px] font-bold text-black', className)}>
      N
    </div>
  );
}

export function ConfluenceLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-4 w-4 items-center justify-center rounded bg-blue-500 text-[8px] font-bold text-white', className)}>
      C
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG Icons                                                          */
/* ------------------------------------------------------------------ */

export function ArticleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
      <path d='M14.5 2C14.5 2 14.48 2 14.47 2C12.1 2.12 9.9 2.85 8 4.01C6.1 2.85 3.89 2.13 1.53 2.01C1.53 2.01 1.51 2.01 1.5 2.01C1.23 2.01 1 2.24 1 2.52V13.25C1 13.52 1.21 13.73 1.48 13.74C3.86 13.86 6.08 14.58 8 15.75C9.92 14.58 12.14 13.85 14.52 13.74C14.79 13.73 15 13.52 15 13.25V2.51C15 2.23 14.77 2 14.5 2ZM13.3 12.14C11.45 12.37 9.65 12.93 8 13.8V6.02L8.89 5.48C10.24 4.65 11.75 4.1 13.3 3.85V12.15V12.14Z' />
    </svg>
  );
}

export function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
      <path d='M12 6V4.5C12 2.57 10.21 1 8 1C5.79 1 4 2.57 4 4.5V6C3.45 6 3 6.45 3 7V14C3 14.55 3.45 15 4 15H12C12.55 15 13 14.55 13 14V7C13 6.45 12.55 6 12 6ZM9.5 6H6.5V4.5C6.5 3.67 7.17 3 8 3C8.83 3 9.5 3.67 9.5 4.5V6Z' />
    </svg>
  );
}

export function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} width='16' height='16' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='currentColor'>
      <path d='M8 1.25C4.287 1.25 1.25 4.287 1.25 8S4.288 14.75 8 14.75c3.713 0 6.75-3.037 6.75-6.75S11.713 1.25 8 1.25zM6.038 12.862a5.242 5.242 0 0 1-3.257-4.553h1.32c.302 0 .548.245.548.548v1.392c0 .145.057.284.16.387l1.069 1.069c.103.103.16.242.16.387v.77zm5.77-1.27A5.223 5.223 0 0 1 8 13.25c-.269 0-.527-.039-.785-.079v-1.426c0-.303.245-.548.548-.548h.133a.548.548 0 0 0 .548-.548V8.86a.548.548 0 0 0-.548-.549h-1.87a.548.548 0 0 1-.549-.548v-.96c0-.275.11-.54.304-.734l1.37-1.37a1.04 1.04 0 0 0 .304-.734V2.805c.182-.019.359-.055.545-.055 1.386 0 2.64.55 3.58 1.43L9.698 6.062a.647.647 0 0 0-.19.458v1.035c0 .172.068.337.19.458l.424.424c.121.122.286.19.458.19h.58c.358 0 .648.29.648.648v2.318z' />
    </svg>
  );
}

export function DotsIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
      <path d='M3 6.5C2.17 6.5 1.5 7.17 1.5 8C1.5 8.83 2.17 9.5 3 9.5C3.83 9.5 4.5 8.83 4.5 8C4.5 7.17 3.83 6.5 3 6.5ZM8 6.5C7.17 6.5 6.5 7.17 6.5 8C6.5 8.83 7.17 9.5 8 9.5C8.83 9.5 9.5 8.83 9.5 8C9.5 7.17 8.83 6.5 8 6.5ZM13 6.5C12.17 6.5 11.5 7.17 11.5 8C11.5 8.83 12.17 9.5 13 9.5C13.83 9.5 14.5 8.83 14.5 8C14.5 7.17 13.83 6.5 13 6.5Z' />
    </svg>
  );
}

export function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
      <path d='M14 2H2C1.45 2 1 2.45 1 3V11C1 11.55 1.45 12 2 12H4V15L8 12H14C14.55 12 15 11.55 15 11V3C15 2.45 14.55 2 14 2Z' />
    </svg>
  );
}

export function MacroIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
      <path d='M13.5 2H2.5C2.22 2 2 2.22 2 2.5V13.5C2 13.78 2.22 14 2.5 14H13.5C13.78 14 14 13.78 14 13.5V2.5C14 2.22 13.78 2 13.5 2ZM12 4V6H4V4H12ZM4 12V8H12V12H4Z' />
    </svg>
  );
}

export function NoteIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
      <path d='M13.5 2H2.5C2.22 2 2 2.22 2 2.5V13.5C2 13.78 2.22 14 2.5 14H10.25L14 10.25V2.5C14 2.22 13.78 2 13.5 2ZM7.99 9.7H3.99V8H7.99V9.7ZM11.99 5.7H3.99V4H11.99V5.7Z' />
    </svg>
  );
}

export function AttachmentIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
      <path d='M5.02005 14.24C3.86005 14.24 2.77004 13.79 1.94004 12.97C1.11004 12.15 0.670044 11.06 0.670044 9.89C0.670044 8.72 1.12004 7.64 1.94004 6.81L6.74005 2.01C7.07005 1.68 7.61004 1.68 7.94004 2.01C8.27004 2.34 8.27004 2.88 7.94004 3.21L3.14005 8.01C2.64005 8.51 2.36005 9.18 2.36005 9.88C2.36005 10.58 2.64005 11.25 3.14005 11.75C4.14005 12.75 5.89005 12.75 6.89005 11.75L13.37 5.27C13.72 4.92 13.72 4.35 13.37 4C13.03 3.66 12.44 3.66 12.1 4L5.76004 10.34C5.43004 10.67 4.89005 10.67 4.56005 10.34C4.23005 10.01 4.23005 9.47 4.56005 9.14L10.9 2.8C11.91 1.79 13.56 1.78 14.58 2.8C15.07 3.29 15.34 3.94 15.34 4.64C15.34 5.34 15.07 5.99 14.58 6.48L8.10004 12.96C7.28004 13.78 6.19005 14.23 5.02005 14.23V14.24Z' />
    </svg>
  );
}

export function AIIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
      <path d='M6.35 7.13L5.75 9.06H7L6.4 7.13H6.35Z' />
      <path d='M14 3H2C1.45 3 1 3.45 1 4V13C1 13.55 1.45 14 2 14H14C14.55 14 15 13.55 15 13V4C15 3.45 14.55 3 14 3ZM7.68 11.21L7.32 10.06H5.44L5.08 11.21H3.66L5.5 5.76H7.25L9.09 11.21H7.67H7.68ZM11 11.21H9.68V5.76H11V11.21Z' />
    </svg>
  );
}

export function EmptyCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
      <path d='M8.04004 2.95001C10.82 2.95001 13.09 5.22 13.09 8C13.09 10.78 10.82 13.05 8.04004 13.05C5.26004 13.05 2.99004 10.78 2.99004 8C2.99004 5.22 5.26004 2.95001 8.04004 2.95001ZM8.04004 1.25C4.31004 1.25 1.29004 4.27 1.29004 8C1.29004 11.73 4.31004 14.75 8.04004 14.75C11.77 14.75 14.79 11.73 14.79 8C14.79 4.27 11.77 1.25 8.04004 1.25Z' />
    </svg>
  );
}

export function CheckedCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4 text-teal-400', className)} width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
      <path d='M8 1.25C4.27 1.25 1.25 4.27 1.25 8C1.25 11.73 4.27 14.75 8 14.75C11.73 14.75 14.75 11.73 14.75 8C14.75 4.27 11.73 1.25 8 1.25ZM11.72 6.33L6.54 11.51L4.1 9.07C3.77 8.74 3.77 8.2 4.1 7.87C4.43 7.54 4.97 7.54 5.3 7.87L6.54 9.11L10.52 5.13C10.85 4.8 11.39 4.8 11.72 5.13C12.05 5.46 12.05 6 11.72 6.33Z' />
    </svg>
  );
}

export function GreenCheckIcon({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-5 w-5 items-center justify-center rounded-full bg-teal-500', className)}>
      <svg className='h-3 w-3 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
      </svg>
    </div>
  );
}

export function ReferenceIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
      <path d='M5.5499 3C5.0799 3 4.6999 3.38001 4.6999 3.85001C4.6999 4.32001 5.0799 4.70001 5.5499 4.70001H10.0999L2.3999 12.4L3.5999 13.6L11.2999 5.89999V10.45C11.2999 10.92 11.6799 11.3 12.1499 11.3C12.6199 11.3 12.9999 10.92 12.9999 10.45V3H5.5499Z' />
    </svg>
  );
}
