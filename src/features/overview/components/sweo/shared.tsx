'use client';

import Link from 'next/link';

/* ─── SWEO Logo SVG (vertical bars with smile curve) ─── */
export function SweoLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M13.25 1H2.75C1.78312 1 1 1.78312 1 2.75V13.25C1 14.2169 1.78312 15 2.75 15H13.25C14.2169 15 15 14.2169 15 13.25V2.75C15 1.78312 14.2169 1 13.25 1ZM9.86637 3.6425C9.86637 3.38613 10.0764 3.17875 10.3336 3.17875C10.5909 3.17875 10.8 3.38613 10.8 3.6425V9.86725C10.8 10.1245 10.59 10.3336 10.3336 10.3336C10.0755 10.3336 9.86637 10.1236 9.86637 9.86725V3.6425ZM7.53363 3.338C7.53363 3.07812 7.74188 2.8655 8 2.8655C8.25725 2.8655 8.46637 3.07812 8.46637 3.338V10.1735C8.46637 10.4334 8.25637 10.6442 8 10.6442C7.74188 10.6442 7.53363 10.4342 7.53363 10.1735V3.338ZM5.2 3.64425C5.2 3.38613 5.41 3.17788 5.66638 3.17788C5.9245 3.17788 6.13363 3.38525 6.13363 3.64162V9.86637C6.13363 10.1236 5.92362 10.3328 5.66638 10.3328C5.40913 10.3328 5.2 10.1228 5.2 9.86637V3.6425V3.64425ZM2.86637 4.577C2.86637 4.318 3.07638 4.10975 3.33363 4.10975C3.59088 4.10975 3.8 4.318 3.8 4.57612V8.77612C3.8 9.0325 3.59 9.24162 3.33363 9.24162C3.0755 9.24162 2.86637 9.03162 2.86637 8.77525V4.57525V4.577ZM12.97 11.619C12.8983 11.6803 11.1692 13.1328 8 13.1328C4.83075 13.1328 3.10175 11.6803 3.03 11.619C2.834 11.4527 2.81125 11.157 2.97925 10.961C3.1455 10.7659 3.44038 10.7423 3.6355 10.9085C3.6635 10.9356 5.207 12.2 8 12.2C10.828 12.2 12.3488 10.9251 12.3628 10.912C12.5579 10.7458 12.8527 10.7676 13.0208 10.9627C13.1888 11.1587 13.166 11.4527 12.97 11.6207V11.619ZM13.1336 8.77525C13.1336 9.03337 12.9236 9.2425 12.6664 9.2425C12.4091 9.2425 12.2 9.0325 12.2 8.77612V4.57612C12.2 4.31712 12.41 4.10888 12.6664 4.10888C12.9245 4.10888 13.1336 4.31713 13.1336 4.57525V8.77525Z" />
    </svg>
  );
}

/* ─── Nav Chevron Icon ─── */
export function NavChevron({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M15.48 10a.25.25 0 0 1 .195.406l-3.48 4.35a.25.25 0 0 1-.39 0l-3.48-4.35A.25.25 0 0 1 8.52 10z" />
    </svg>
  );
}

/* ─── External Link Arrow Icon ─── */
export function ExternalArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 8" className="ml-1 inline-block size-1.5 -translate-y-0.5" aria-hidden="true">
      <path fill="currentColor" d="M1.54 0H8v6.46L6.46 8V3.785c0-.51.04-.94.078-1.292l-.013-.013c-.378.417-.848.887-1.305 1.33L1.24 7.792.209 6.761l3.98-3.981c.444-.457.914-.927 1.331-1.305l-.013-.013c-.352.039-.783.078-1.292.078H0z" />
    </svg>
  );
}

/* ─── Nav Dropdown Item ─── */
export function NavDropdownItem({
  href,
  title,
  description,
  external = false,
}: {
  href: string;
  title: string;
  description?: string;
  external?: boolean;
}) {
  const Tag = external ? 'a' : Link;
  const extraProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <li role="menuitem">
      <Tag
        href={href}
        className="sweo-nav-dropdown-link"
        {...extraProps}
      >
        <strong className="sweo-nav-dropdown-title">
          {title}
          {external && <ExternalArrow />}
        </strong>
        {description && (
          <span className="sweo-nav-dropdown-desc">{description}</span>
        )}
      </Tag>
    </li>
  );
}

/* ─── Nav Dropdown Section Title ─── */
export function NavDropdownSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li role="menuitem" className="mb-2 w-full break-inside-avoid">
      <p className="sweo-nav-dropdown-section-title">{title}</p>
      <ul>{children}</ul>
    </li>
  );
}

/* ─── Nav Dropdown Sub-Section Title ─── */
export function NavDropdownSubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="pt-2">
      <p className="sweo-nav-dropdown-subsection-title">{title}</p>
      <ul>{children}</ul>
    </li>
  );
}

/* ─── Integration Logo Components ─── */
export function ZohoDeskLogo() {
  return (
    <svg viewBox="0 0 80 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Zoho Desk</text>
    </svg>
  );
}
export function WhatsAppLogo() {
  return (
    <svg viewBox="0 0 90 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">WhatsApp</text>
    </svg>
  );
}
export function GorgiasLogo() {
  return (
    <svg viewBox="0 0 65 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Gorgias</text>
    </svg>
  );
}
export function ZendeskLogo() {
  return (
    <svg viewBox="0 0 75 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Zendesk</text>
    </svg>
  );
}
export function SalesforceLogo() {
  return (
    <svg viewBox="0 0 95 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Salesforce</text>
    </svg>
  );
}
export function SprinklrLogo() {
  return (
    <svg viewBox="0 0 72 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Sprinklr</text>
    </svg>
  );
}
export function FrontLogo() {
  return (
    <svg viewBox="0 0 50 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Front</text>
    </svg>
  );
}
export function JiraLogo() {
  return (
    <svg viewBox="0 0 35 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Jira</text>
    </svg>
  );
}
export function FreshdeskLogo() {
  return (
    <svg viewBox="0 0 85 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">Freshdesk</text>
    </svg>
  );
}
export function HubSpotLogo() {
  return (
    <svg viewBox="0 0 75 18" fill="currentColor" className="h-4 w-auto opacity-70">
      <text x="0" y="14" fontSize="14" fontFamily="sans-serif" fontWeight="600">HubSpot</text>
    </svg>
  );
}
