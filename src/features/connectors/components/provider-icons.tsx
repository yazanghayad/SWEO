import Image from 'next/image';
import { cn } from '@/lib/utils';

const providerIcons: Record<
  string,
  { src: string; alt: string }
> = {
  shopify: { src: '/icons/providers/shopify.svg', alt: 'Shopify' },
  stripe: { src: '/icons/providers/stripe.svg', alt: 'Stripe' },
  linear: { src: '/icons/providers/linear.svg', alt: 'Linear' },
  zendesk: { src: '/icons/providers/zendesk.svg', alt: 'Zendesk' },
  salesforce: { src: '/icons/providers/salesforce.svg', alt: 'Salesforce' },
  intercom: { src: '/icons/providers/intercom.svg', alt: 'Intercom' }
};

interface ProviderIconProps {
  provider: string;
  className?: string;
}

export function ProviderIcon({ provider, className }: ProviderIconProps) {
  const icon = providerIcons[provider];

  if (!icon) {
    // Fallback: simple API/hub icon for "custom"
    return (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        className={cn('h-5 w-5', className)}
      >
        <path
          d='M12 2v4m0 12v4M2 12h4m12 0h4'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
        />
        <circle cx='12' cy='12' r='4' stroke='currentColor' strokeWidth='2' />
      </svg>
    );
  }

  return (
    <Image
      src={icon.src}
      alt={icon.alt}
      width={20}
      height={20}
      className={cn('h-5 w-5 object-contain', className)}
      unoptimized
    />
  );
}
