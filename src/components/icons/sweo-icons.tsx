/* eslint-disable @next/next/no-img-element */
/**
 * SWEO-style SVG icons for the platform design system.
 * All icons use a 16x16 viewBox and accept className for sizing/coloring.
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
}

/** SWEO logo icon – renders the company logo with dark/light mode support */
export function SweoLogoIcon({ className }: IconProps) {
  return (
    <>
      {/* Light mode logo */}
      <img
        src="/logo-icon-light.svg"
        alt="SWEO"
        className={cn(className, 'dark:hidden block')}
        draggable={false}
      />
      {/* Dark mode logo */}
      <img
        src="/logo-icon-dark.svg"
        alt="SWEO"
        className={cn(className, 'dark:block hidden')}
        draggable={false}
      />
    </>
  );
}

// ─── Navigation Icons ────────────────────────────────────────────────────────

/** SWEO logo – vertical bars with smile curve */
export function SweoIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.25 1H2.75C1.78312 1 1 1.78312 1 2.75V13.25C1 14.2169 1.78312 15 2.75 15H13.25C14.2169 15 15 14.2169 15 13.25V2.75C15 1.78312 14.2169 1 13.25 1ZM9.86637 3.6425C9.86637 3.38613 10.0764 3.17875 10.3336 3.17875C10.5909 3.17875 10.8 3.38613 10.8 3.6425V9.86725C10.8 10.1245 10.59 10.3336 10.3336 10.3336C10.0755 10.3336 9.86637 10.1236 9.86637 9.86725V3.6425ZM7.53363 3.338C7.53363 3.07812 7.74188 2.8655 8 2.8655C8.25725 2.8655 8.46637 3.07812 8.46637 3.338V10.1735C8.46637 10.4334 8.25637 10.6442 8 10.6442C7.74188 10.6442 7.53363 10.4342 7.53363 10.1735V3.338ZM5.2 3.64425C5.2 3.38613 5.41 3.17788 5.66638 3.17788C5.9245 3.17788 6.13363 3.38525 6.13363 3.64162V9.86637C6.13363 10.1236 5.92362 10.3328 5.66638 10.3328C5.40913 10.3328 5.2 10.1228 5.2 9.86637V3.6425V3.64425ZM2.86637 4.577C2.86637 4.318 3.07638 4.10975 3.33363 4.10975C3.59088 4.10975 3.8 4.318 3.8 4.57612V8.77612C3.8 9.0325 3.59 9.24162 3.33363 9.24162C3.0755 9.24162 2.86637 9.03162 2.86637 8.77525V4.57525V4.577ZM12.97 11.619C12.8983 11.6803 11.1692 13.1328 8 13.1328C4.83075 13.1328 3.10175 11.6803 3.03 11.619C2.834 11.4527 2.81125 11.157 2.97925 10.961C3.1455 10.7659 3.44038 10.7423 3.6355 10.9085C3.6635 10.9356 5.207 12.2 8 12.2C10.828 12.2 12.3488 10.9251 12.3628 10.912C12.5579 10.7458 12.8527 10.7676 13.0208 10.9627C13.1888 11.1587 13.166 11.4527 12.97 11.6207V11.619ZM13.1336 8.77525C13.1336 9.03337 12.9236 9.2425 12.6664 9.2425C12.4091 9.2425 12.2 9.0325 12.2 8.77612V4.57612C12.2 4.31712 12.41 4.10888 12.6664 4.10888C12.9245 4.10888 13.1336 4.31713 13.1336 4.57525V8.77525Z" />
    </svg>
  );
}

/** Inbox icon – tray with angled sides */
export function InboxIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.14 3H4.86C4.61 3 4.38 3.13 4.25 3.35L1.2 8.64C1.07 8.87 1 9.13 1 9.39V13C1 13.55 1.45 14 2 14H14C14.55 14 15 13.55 15 13V9.39C15 9.13 14.93 8.87 14.8 8.64L11.75 3.35C11.62 3.13 11.39 3 11.14 3ZM10 9V11H6V9H2.72L5.32 4.5H10.68L13.28 9H10Z" />
    </svg>
  );
}

/** SWEO AI Agent icon – four-pointed compass/star */
export function SweoAgentIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.125 1.02c.08 0 .158.032.215.088L5.763 4.53c.146.146.391.005.338-.195L5.314 1.4a.303.303 0 0 1 .293-.38H6.81c.137 0 .257.091.293.224l.604 2.25a.814.814 0 0 1 0 .418l-.434 1.615a2.49 2.49 0 0 1-1.76 1.76l-1.617.433a.817.817 0 0 1-.418 0l-2.251-.603A.3.3 0 0 1 1 6.825V5.622c0-.199.189-.344.38-.293l2.938.787c.2.053.34-.192.194-.338L1.09 2.358A.306.306 0 0 1 1 2.142c0-.62.504-1.124 1.125-1.124zM13.875 1a.305.305 0 0 0-.214.089l-3.424 3.42c-.146.147-.391.005-.337-.194l.786-2.934A.303.303 0 0 0 10.393 1H9.19a.304.304 0 0 0-.293.224l-.603 2.25a.814.814 0 0 0 0 .418l.433 1.615c.23.86.901 1.53 1.76 1.76l1.617.433c.137.036.28.036.418 0l2.252-.603A.3.3 0 0 0 15 6.806V5.602a.303.303 0 0 0-.38-.292l-2.938.787c-.2.053-.34-.192-.194-.338l3.423-3.42a.306.306 0 0 0 .09-.215C15 1.504 14.495 1 13.874 1zM13.875 15a.306.306 0 0 1-.214-.089l-3.424-3.42c-.146-.147-.391-.005-.337.194l.786 2.934a.303.303 0 0 1-.293.381H9.19a.304.304 0 0 1-.293-.224l-.603-2.25a.814.814 0 0 1 0-.418l.433-1.615c.23-.86.901-1.53 1.76-1.76l1.617-.433a.817.817 0 0 1 .418 0l2.252.603a.3.3 0 0 1 .226.291v1.204a.302.302 0 0 1-.38.292l-2.938-.787c-.2-.053-.34.192-.194.338l3.423 3.42a.306.306 0 0 1 .09.215c0 .62-.505 1.124-1.126 1.124zM2.125 15c.08 0 .158-.032.215-.089l3.423-3.42c.146-.147.391-.005.338.194l-.787 2.934a.303.303 0 0 0 .293.381H6.81a.304.304 0 0 0 .293-.224l.604-2.25a.814.814 0 0 0 0-.418l-.434-1.615a2.489 2.489 0 0 0-1.76-1.76L3.895 8.3a.817.817 0 0 0-.418 0l-2.251.603A.3.3 0 0 0 1 9.194v1.204c0 .198.189.344.38.292l2.938-.787c.2-.053.34.192.194.338l-3.423 3.42a.306.306 0 0 0-.09.215C1 14.496 1.505 15 2.126 15z" />
    </svg>
  );
}

/** Knowledge/Article icon – open book */
export function ArticleIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.5 2C14.5 2 14.48 2 14.47 2C12.1 2.12 9.9 2.85 8 4.01C6.1 2.85 3.89 2.13 1.53 2.01C1.53 2.01 1.51 2.01 1.5 2.01C1.23 2.01 1 2.24 1 2.52V13.25C1 13.52 1.21 13.73 1.48 13.74C3.86 13.86 6.08 14.58 8 15.75C9.92 14.58 12.14 13.85 14.52 13.74C14.79 13.73 15 13.52 15 13.25V2.51C15 2.23 14.77 2 14.5 2ZM13.3 12.14C11.45 12.37 9.65 12.93 8 13.8V6.02L8.89 5.48C10.24 4.65 11.75 4.1 13.3 3.85V12.15V12.14Z" />
    </svg>
  );
}

/** Reports/Column chart icon – bar chart */
export function ColumnChartIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 6H2V12H5V6ZM9.5 1H6.5V12H9.5V1ZM14 4H11V12H14V4ZM2 13.5V15H14V13.5H2Z" />
    </svg>
  );
}

/** Outbound/Send icon – arrow pointing right with diamond */
export function OutboundIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3.59 14.74L14.5 8.43999C14.67 8.33999 14.76 8.16999 14.76 7.98999C14.76 7.80999 14.67 7.63999 14.5 7.53999L3.59 1.25999C3.18 1.01999 2.69 1.41999 2.84 1.86999L3.88 4.94999L1.55 7.26999C1.35 7.46999 1.25 7.73999 1.25 7.99999C1.25 8.25999 1.35 8.52999 1.55 8.72999L3.88 11.05L2.84 14.13C2.69 14.58 3.17 14.98 3.59 14.74ZM10.25 7.99999L5.28 10.04L3.24 7.99999L5.28 5.95999L10.25 7.99999Z" />
    </svg>
  );
}

/** Contacts/Multiple people icon */
export function MultiplePeopleIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11 6.88C9.79 6.88 8.7 7.32999 7.83 8.03999C9.44 8.82999 10.69 10.26 11.22 12H16V11.88C16 9.12 13.76 6.88 11 6.88ZM5 8.88C2.24 8.88 0 11.12 0 13.88V14H10V13.88C10 11.12 7.76 8.88 5 8.88ZM5 7.75C6.1 7.75 7 6.85 7 5.75C7 4.65 6.1 3.75 5 3.75C3.9 3.75 3 4.65 3 5.75C3 6.85 3.9 7.75 5 7.75ZM11 5.75C12.1 5.75 13 4.85 13 3.75C13 2.65 12.1 1.75 11 1.75C9.9 1.75 9 2.65 9 3.75C9 4.85 9.9 5.75 11 5.75Z" />
    </svg>
  );
}

/** Search icon – magnifying glass */
export function SearchIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.5 13.3L11.87 10.67C12.81 9.4 13.25 7.74 12.86 5.97C12.39 3.84 10.68 2.11 8.54999 1.65C4.36999 0.74 0.729987 4.38 1.64999 8.56C2.11999 10.69 3.83999 12.41 5.97999 12.87C7.74999 13.26 9.40998 12.82 10.68 11.88L13.31 14.51C13.64 14.84 14.18 14.84 14.51 14.51C14.84 14.18 14.84 13.64 14.51 13.31L14.5 13.3ZM3.19998 7.25C3.19998 5.02 5.01999 3.2 7.24999 3.2C9.47999 3.2 11.3 5.02 11.3 7.25C11.3 9.48 9.47999 11.3 7.24999 11.3C5.01999 11.3 3.19998 9.48 3.19998 7.25Z" />
    </svg>
  );
}

/** Settings icon – gear/cog */
export function SettingsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.9 8.49001L14.11 8.06C13.24 7.58 12.98 6.45001 13.56 5.63L14.08 4.89999C14.21 4.70999 14.21 4.46 14.06 4.28L13.15 3.14C13.01 2.96 12.76 2.9 12.55 2.98L11.72 3.32001C10.8 3.70001 9.74997 3.20001 9.47997 2.24001L9.22997 1.38C9.16997 1.16 8.95997 1.00999 8.72997 1.00999H7.26997C7.03997 1.00999 6.83997 1.16 6.76997 1.38L6.51997 2.24001C6.23997 3.20001 5.19997 3.70001 4.27997 3.32001L3.44997 2.98C3.23997 2.89 2.98997 2.95 2.84997 3.14L1.93997 4.28C1.79997 4.46 1.78997 4.70999 1.91997 4.89999L2.43997 5.63C3.01997 6.44 2.75997 7.58 1.88997 8.06L1.09997 8.49001C0.89997 8.60001 0.78997 8.83 0.84997 9.06L1.17997 10.49C1.22997 10.71 1.42997 10.88 1.65997 10.89L2.55997 10.94C3.54997 11 4.27997 11.9 4.10997 12.89L3.95997 13.78C3.91997 14.01 4.03997 14.23 4.24997 14.33L5.56997 14.96C5.77997 15.06 6.02997 15.01 6.17997 14.84L6.77997 14.17C7.43997 13.43 8.60997 13.43 9.26997 14.17L9.86997 14.84C10.02 15.01 10.27 15.06 10.48 14.96L11.8 14.33C12.01 14.23 12.12 14 12.09 13.78L11.94 12.89C11.77 11.91 12.5 11 13.49 10.94L14.39 10.89C14.62 10.88 14.81 10.71 14.87 10.49L15.2 9.06C15.25 8.84 15.15 8.60001 14.95 8.49001H14.9ZM7.99997 10.85C6.51997 10.85 5.31997 9.65 5.31997 8.17C5.31997 6.69 6.51997 5.49001 7.99997 5.49001C9.47997 5.49001 10.68 6.69 10.68 8.17C10.68 9.65 9.47997 10.85 7.99997 10.85Z"
      />
    </svg>
  );
}

// ─── Messaging / Channel Icons ───────────────────────────────────────────────

/** Messenger icon – chat bubble with smile */
export function MessengerIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13 1H3C2.45 1 2 1.45 2 2V11C2 11.55 2.45 12 3 12H10.25L13.14 14.89C13.46 15.2 13.99 14.98 13.99 14.54V11V2C13.99 1.45 13.54 1 12.99 1H13ZM11.55 7.85C10.56 8.68 9.3 9.14 8 9.14C6.7 9.14 5.45 8.68 4.45 7.85C4.09 7.55 4.04 7.01 4.34 6.65C4.64 6.29 5.17999 6.24 5.53999 6.54C6.91999 7.69 9.08 7.69 10.45 6.54C10.81 6.24 11.35 6.28 11.65 6.65C11.95 7.01 11.9 7.55 11.54 7.85H11.55Z" />
    </svg>
  );
}

/** Email icon */
export function EmailIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 3H2C1.45 3 1 3.45 1 4V13C1 13.55 1.45 14 2 14H14C14.55 14 15 13.55 15 13V4C15 3.45 14.55 3 14 3ZM13.5 6.91L8 10.09L2.5 6.91V4.95L8 8.13L13.5 4.95V6.91Z" />
    </svg>
  );
}

/** Phone icon */
export function PhoneIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.77 11.23C6.63 13.09 8.93001 14.25 11.33 14.71C11.99 14.84 12.67 14.63 13.15 14.16L14.56 12.75C14.83 12.48 14.83 12.03 14.56 11.76L12.01 9.21001C11.74 8.94001 11.29 8.94001 11.02 9.21001L9.73001 10.5C9.51001 10.72 9.17 10.78 8.89 10.62C8.17 10.21 7.5 9.71001 6.88 9.10001C6.26 8.49001 5.77 7.81 5.36 7.09C5.21 6.82 5.26001 6.47 5.48001 6.25L6.77 4.96C7.04 4.69 7.04 4.24 6.77 3.97L4.22001 1.42C3.95001 1.15 3.50001 1.15 3.23001 1.42L1.82 2.83C1.34 3.31 1.14 3.99 1.27 4.65C1.73 7.05 2.89 9.35001 4.75 11.21L4.77 11.23Z" />
    </svg>
  );
}

/** SMS icon */
export function SmsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.5 8.3V3.4H2C1.45 3.4 1 3.85 1 4.4V14C1 14.55 1.45 15 2 15H6C6.55 15 7 14.55 7 14V10.5H6.7C5.49 10.5 4.5 9.51 4.5 8.3ZM4 13.65C3.45 13.65 3 13.2 3 12.65C3 12.1 3.45 11.65 4 11.65C4.55 11.65 5 12.1 5 12.65C5 13.2 4.55 13.65 4 13.65Z" />
      <path d="M15.3 0H6.7C6.32 0 6 0.32 6 0.7V8.3C6 8.68 6.32 9 6.7 9H12.75L15.14 11.39C15.45 11.71 15.99 11.48 15.99 11.04V0.7C15.99 0.31 15.68 0 15.29 0H15.3ZM13.94 4.79H8.06V3.09H13.94V4.79Z" />
    </svg>
  );
}

/** WhatsApp icon */
export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.04199 15L2.02462 11.4055C1.41719 10.3506 1.09821 9.15431 1.09974 7.937C1.10149 4.11238 4.20949 1 8.02974 1C9.88299 1 11.6225 1.72363 12.9297 3.03437C13.5752 3.6781 14.0868 4.44331 14.4349 5.28584C14.7831 6.12837 14.9608 7.03151 14.958 7.94312C14.9562 11.7669 11.8474 14.8801 8.02887 14.8801H8.02624C6.86931 14.8801 5.73089 14.5898 4.71524 14.0357L1.04199 15ZM5.90699 4.73625C6.03124 4.74062 6.16774 4.74675 6.29724 5.0355C6.38649 5.23413 6.53787 5.606 6.65599 5.90088C6.74349 6.1135 6.81349 6.28588 6.83099 6.32263C6.87474 6.41013 6.90274 6.51075 6.84499 6.62625L6.82137 6.67525C6.77762 6.7645 6.74612 6.82925 6.67262 6.915L6.58424 7.02087C6.53012 7.08965 6.47289 7.15593 6.41274 7.2195C6.32524 7.30525 6.23512 7.39975 6.33662 7.573C6.43724 7.74625 6.78462 8.31413 7.29912 8.7735C7.676 9.11352 8.108 9.38692 8.57662 9.582C8.62474 9.603 8.66412 9.61963 8.69212 9.6345C8.86449 9.72112 8.96599 9.70625 9.06662 9.59075C9.16812 9.47525 9.49974 9.08413 9.61524 8.91088C9.73074 8.73763 9.84624 8.7665 10.0046 8.82425C10.163 8.882 11.0144 9.30113 11.1876 9.38775L11.2839 9.435C11.4037 9.49363 11.4851 9.53212 11.5201 9.59075C11.563 9.66337 11.563 10.0107 11.4186 10.415C11.2742 10.8201 10.5672 11.2104 10.2496 11.2393L10.1577 11.2489C9.86462 11.2839 9.49362 11.3276 8.17149 10.8053C6.54749 10.1639 5.47562 8.574 5.25249 8.24325C5.24028 8.22465 5.22774 8.20627 5.21487 8.18813L5.21224 8.1855C5.11862 8.05862 4.50787 7.2405 4.50787 6.39437C4.50787 5.5955 4.89987 5.17637 5.08012 4.98475L5.11337 4.94887C5.17125 4.88281 5.24218 4.82942 5.32168 4.79208C5.40119 4.75473 5.48756 4.73424 5.57537 4.73187H5.59812C5.70662 4.73187 5.81337 4.73187 5.90787 4.73537L5.90699 4.73625Z"
      />
    </svg>
  );
}

/** Instagram icon */
export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 1.44c2.136 0 2.389.009 3.233.047.78.036 1.203.166 1.485.276.373.145.64.318.92.598.28.28.453.546.598.92.11.282.24.705.276 1.485.038.844.047 1.097.047 3.233s-.009 2.389-.047 3.233c-.036.78-.166 1.203-.276 1.485-.145.373-.318.64-.598.92-.28.28-.546.453-.92.598-.282.11-.705.24-1.485.276-.844.038-1.097.047-3.233.047s-2.389-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.478 2.478 0 0 1-.598-.92c-.11-.282-.24-.705-.276-1.485C1.45 10.389 1.44 10.136 1.44 8s.009-2.389.047-3.233c.036-.78.166-1.203.276-1.485.145-.373.318-.64.598-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276C5.61 1.45 5.864 1.44 8 1.44ZM8 0C5.827 0 5.555.01 4.702.048 3.85.087 3.27.222 2.76.42a3.917 3.917 0 0 0-1.417.922A3.917 3.917 0 0 0 .42 2.76c-.198.51-.333 1.09-.372 1.942C.01 5.555 0 5.827 0 8s.01 2.445.048 3.298c.039.852.174 1.433.372 1.942.205.526.478.973.922 1.417.444.444.89.717 1.417.922.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.445-.01 3.298-.048c.852-.039 1.433-.174 1.942-.372a3.917 3.917 0 0 0 1.417-.922c.444-.444.717-.89.922-1.417.198-.51.333-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.298c-.039-.852-.174-1.433-.372-1.942a3.917 3.917 0 0 0-.922-1.417A3.917 3.917 0 0 0 13.24.42c-.51-.198-1.09-.333-1.942-.372C10.445.01 10.173 0 8 0Zm0 3.892a4.108 4.108 0 1 0 0 8.216 4.108 4.108 0 0 0 0-8.216Zm0 6.775a2.667 2.667 0 1 1 0-5.334 2.667 2.667 0 0 1 0 5.334Zm4.27-6.937a.96.96 0 1 1 0-1.92.96.96 0 0 1 0 1.92Z" />
    </svg>
  );
}

/** Slack icon */
export function SlackIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3.362 10.175a1.681 1.681 0 1 1-1.681-1.681h1.681v1.681Zm.849 0a1.681 1.681 0 1 1 3.362 0v4.144a1.681 1.681 0 1 1-3.362 0v-4.144ZM5.892 3.362a1.681 1.681 0 1 1 1.681-1.681v1.681H5.892Zm0 .849a1.681 1.681 0 1 1 0 3.362H1.681a1.681 1.681 0 0 1 0-3.362h4.211ZM12.638 5.892a1.681 1.681 0 1 1 1.681 1.681h-1.681V5.892Zm-.849 0a1.681 1.681 0 0 1-3.362 0V1.681a1.681 1.681 0 1 1 3.362 0v4.211ZM10.108 12.638a1.681 1.681 0 1 1-1.681 1.681v-1.681h1.681Zm0-.849a1.681 1.681 0 0 1 0-3.362h4.211a1.681 1.681 0 0 1 0 3.362h-4.211Z" />
    </svg>
  );
}

// ─── Action / Status Icons ───────────────────────────────────────────────────

/** Conversation/Chat icon – filled chat bubble */
export function ConversationIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 2H2C1.45 2 1 2.45 1 3V14.54C1 14.99 1.54 15.21 1.85 14.89L4.74 12H13.99C14.54 12 14.99 11.55 14.99 11V3C14.99 2.45 14.54 2 13.99 2H14ZM8 9.7H4V8H8V9.7ZM12 6H4V4.3H12V6Z" />
    </svg>
  );
}

/** Compose/Edit icon */
export function ComposeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.5 12.5H2.5V3.5H7.18L8.68 2H2C1.45 2 1 2.45 1 3V13C1 13.55 1.45 14 2 14H12C12.55 14 13 13.55 13 13V6.76001L11.5 8.26001V12.5ZM14.64 2.54999L12.67 0.579987C12.61 0.519987 12.53 0.48999 12.44 0.48999C12.35 0.48999 12.28 0.519987 12.21 0.579987L5.53 7.26001C5.27 7.52001 5.09 7.84 4.99 8.19L4.43 10.27C4.36 10.54 4.57 10.79 4.82 10.79C4.86 10.79 4.89 10.79 4.93 10.78L7.01 10.22C7.36 10.13 7.68 9.93999 7.94 9.67999L14.62 3C14.74 2.88 14.74 2.66999 14.62 2.54999H14.64Z" />
    </svg>
  );
}

/** Globe icon – for multilingual/web */
export function GlobeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 1.25C4.287 1.25 1.25 4.287 1.25 8S4.288 14.75 8 14.75c3.713 0 6.75-3.037 6.75-6.75S11.713 1.25 8 1.25zM6.038 12.862a5.242 5.242 0 0 1-3.257-4.553h1.32c.302 0 .548.245.548.548v1.392c0 .145.057.284.16.387l1.069 1.069c.103.103.16.242.16.387v.77zm5.77-1.27A5.223 5.223 0 0 1 8 13.25c-.269 0-.527-.039-.785-.079v-1.426c0-.303.245-.548.548-.548h.133a.548.548 0 0 0 .548-.548V8.86a.548.548 0 0 0-.548-.549h-1.87a.548.548 0 0 1-.549-.548v-.96c0-.275.11-.54.304-.734l1.37-1.37a1.04 1.04 0 0 0 .304-.734V2.805c.182-.019.359-.055.545-.055 1.386 0 2.64.55 3.58 1.43L9.698 6.062a.647.647 0 0 0-.19.458v1.035c0 .172.068.337.19.458l.424.424c.121.122.286.19.458.19h.58c.358 0 .648.29.648.648v2.318z" />
    </svg>
  );
}

/** Folder icon */
export function FolderIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.5 4H7.07L6.12 2.35001C5.99 2.13001 5.76 2 5.51 2H1.5C1.22 2 1 2.22 1 2.5V13.5C1 13.78 1.22 14 1.5 14H14.5C14.78 14 15 13.78 15 13.5V4.5C15 4.22 14.78 4 14.5 4Z" />
    </svg>
  );
}

/** Cases/Briefcase icon */
export function CasesIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 4H11V3C11 2.17 10.33 1.5 9.5 1.5H6.5C5.67 1.5 5 2.17 5 3V4H2C1.45 4 1 4.45 1 5V13C1 13.55 1.45 14 2 14H14C14.55 14 15 13.55 15 13V5C15 4.45 14.55 4 14 4ZM6.5 3H9.5V4H6.5V3ZM14 13H2V9H5V10H11V9H14V13ZM14 8H11V7H5V8H2V5H14V8Z" />
    </svg>
  );
}

/** Brands icon – star + shapes */
export function BrandsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.785 5.02l-.776 2.388a.3.3 0 0 0 .462.335l2.032-1.477 2.032 1.477a.3.3 0 0 0 .462-.335l-.776-2.389 2.032-1.477A.3.3 0 0 0 12.077 3H9.565L8.789.61a.3.3 0 0 0-.571 0L7.442 3H4.93a.3.3 0 0 0-.176.542L6.785 5.02zM11.75 8.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zM6.3 9H1.7a.7.7 0 0 0-.7.7v4.6a.7.7 0 0 0 .7.7h4.6a.7.7 0 0 0 .7-.7V9.7a.7.7 0 0 0-.7-.7zm-.8 4.5h-3v-3h3v3z" />
    </svg>
  );
}

/** Insights icon – lightbulb/brain */
export function InsightsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.51999 11H11.47L12.31 10.16C13.2 9.15 13.74 7.81999 13.74 6.37C13.74 3.19 11.17 0.619995 7.98999 0.619995C4.80999 0.619995 2.23999 3.19 2.23999 6.37C2.23999 7.81999 2.77999 9.15 3.66999 10.16L4.50999 11H4.51999ZM7.99999 2.32001C8.87999 2.32001 9.69999 2.61 10.36 3.09C10.86 3.45 10.83 4.20999 10.29 4.51999C10.01 4.67999 9.64999 4.68001 9.38999 4.48001C8.99999 4.20001 8.51999 4.01999 7.99999 4.01999C6.67999 4.01999 5.60999 5.09 5.60999 6.41C5.60999 6.66 5.65999 6.91001 5.72999 7.14001L4.24999 8C4.03999 7.5 3.90999 6.96 3.90999 6.41C3.90999 4.15 5.74999 2.32001 7.99999 2.32001Z" />
      <path d="M5 12.5V14.15C5 14.28 5.05 14.41 5.15 14.5L6.5 15.85C6.59 15.94 6.72 16 6.85 16H9.16C9.29 16 9.42 15.95 9.51 15.85L10.86 14.5C10.95 14.41 11.01 14.28 11.01 14.15V12.5H5.01H5Z" />
    </svg>
  );
}

/** Workflows icon – branching path */
export function WorkflowsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10.65 3C10.65 1.9 9.75 1 8.65 1H3C1.9 1 1 1.9 1 3C1 4.1 1.9 5 3 5H8.65C9.75 5 10.65 4.1 10.65 3ZM11.84 7.54999C11.51 7.21999 10.97 7.21999 10.64 7.54999C10.31 7.87999 10.31 8.42 10.64 8.75L12.19 10.3H7.85C7.22 10.3 6.7 9.77999 6.7 9.14999V7H5V9.14999C5 10.72 6.28 12 7.85 12H12.19L10.64 13.55C10.31 13.88 10.31 14.42 10.64 14.75C10.81 14.92 11.02 15 11.24 15C11.46 15 11.68 14.92 11.84 14.75L15.44 11.15L11.84 7.54999Z" />
    </svg>
  );
}

/** Rocket ship icon */
export function RocketShipIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1.41 11.74C1.17 11.98 1.02 12.26 0.92 12.56L0 16L3.44 15.07C3.74 14.98 4.02 14.82 4.26 14.58C5.04 13.8 5.04 12.52 4.26 11.74C3.48 10.96 2.2 10.96 1.42 11.74H1.41ZM14.79 1.21002C12.95 0.580026 10.82 0.850026 9.32 2.04002C9.17 2.15002 9.02 2.27002 8.89 2.41002L6.06 5.24002H3.28C2.98 5.24002 2.69 5.36002 2.47 5.57002L0.38 7.67002C0.19 7.86002 0.28 8.17002 0.53 8.24002L3.95 9.16002L6.84 12.05L7.76 15.47C7.83 15.72 8.15 15.81 8.33 15.62L10.43 13.52C10.64 13.31 10.76 13.02 10.76 12.71V9.93003L13.59 7.10002C13.72 6.97002 13.84 6.82002 13.96 6.67002C15.15 5.17002 15.42 3.05002 14.79 1.20002V1.21002ZM11.89 5.88002C11.4 6.37002 10.61 6.37002 10.12 5.88002C9.63 5.39002 9.63 4.60002 10.12 4.11002C10.61 3.62002 11.4 3.62002 11.89 4.11002C12.38 4.60002 12.38 5.39002 11.89 5.88002Z" />
    </svg>
  );
}

/** AI icon – "AI" text in box */
export function AiIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.35 7.13L5.75 9.06H7L6.4 7.13H6.35Z" />
      <path d="M14 3H2C1.45 3 1 3.45 1 4V13C1 13.55 1.45 14 2 14H14C14.55 14 15 13.55 15 13V4C15 3.45 14.55 3 14 3ZM7.68 11.21L7.32 10.06H5.44L5.08 11.21H3.66L5.5 5.76H7.25L9.09 11.21H7.67H7.68ZM11 11.21H9.68V5.76H11V11.21Z" />
    </svg>
  );
}

/** Note icon – note pad with lines */
export function NoteIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.5 2H2.5C2.22 2 2 2.22 2 2.5V13.5C2 13.78 2.22 14 2.5 14H10.25L14 10.25V2.5C14 2.22 13.78 2 13.5 2ZM7.99 9.7H3.99V8H7.99V9.7ZM11.99 5.7H3.99V4H11.99V5.7Z" />
    </svg>
  );
}

/** Billing/Credit Card icon – dollar/cash */
export function CashIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 3H0V13H16V3ZM3 9C2.45 9 2 8.55 2 8C2 7.45 2.45 7 3 7C3.55 7 4 7.45 4 8C4 8.55 3.55 9 3 9ZM8 10.5C6.9 10.5 6 9.38 6 8C6 6.62 6.9 5.5 8 5.5C9.1 5.5 10 6.62 10 8C10 9.38 9.1 10.5 8 10.5ZM13 9C12.45 9 12 8.55 12 8C12 7.45 12.45 7 13 7C13.55 7 14 7.45 14 8C14 8.55 13.55 9 13 9Z" />
    </svg>
  );
}

/** Company/Building icon */
export function CompanyIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 9H13V2C13 1.45 12.55 1 12 1H4C3.45 1 3 1.45 3 2V9H2C1.45 9 1 9.45 1 10V15H15V10C15 9.45 14.55 9 14 9ZM7 11H5V8H7V11ZM7 6H5V3H7V6ZM11 6H9V3H11V6Z" />
    </svg>
  );
}

/** Lock/Security icon */
export function LockedIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.3 6H12V4.5C12 2.29 10.21 0.5 8 0.5C5.79 0.5 4 2.29 4 4.5V6H2.7C2.31 6 2 6.31 2 6.7V13.3C2 13.69 2.31 14 2.7 14H13.3C13.69 14 14 13.69 14 13.3V6.7C14 6.31 13.69 6 13.3 6ZM5.5 4.5C5.5 3.12 6.62 2 8 2C9.38 2 10.5 3.12 10.5 4.5V6H5.5V4.5Z" />
    </svg>
  );
}

/** Close/X icon */
export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.25 3.95L12.05 2.75L8 6.8L3.95 2.75L2.75 3.95L6.8 8L2.75 12.05L3.95 13.25L8 9.2L12.05 13.25L13.25 12.05L9.2 8L13.25 3.95Z" />
    </svg>
  );
}

/** Filter icon */
export function FilterIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 12.7h6V11H5v1.7zM0 3v1.7h16V3H0zm3 5.7h10V7H3v1.7z" />
    </svg>
  );
}

/** New/Plus icon */
export function NewIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 7.15H8.85V2H7.15V7.15H2V8.85H7.15V14H8.85V8.85H14V7.15Z" />
    </svg>
  );
}

/** Info icon – circle with i */
export function InfoIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM7.25 7.00488V12.0049H8.75V7.00488H7.25ZM9.10002 4.90488C9.10002 4.29737 8.60754 3.80488 8.00002 3.80488C7.39251 3.80488 6.90002 4.29737 6.90002 4.90488C6.90002 5.5124 7.39251 6.00488 8.00002 6.00488C8.60754 6.00488 9.10002 5.5124 9.10002 4.90488Z"
      />
    </svg>
  );
}

/** Alert/Warning icon – triangle */
export function AlertIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15.3898 12.95L8.5998 1.19C8.3298 0.719998 7.6598 0.719998 7.3898 1.19L0.609798 12.95C0.339798 13.42 0.679798 14 1.2198 14H14.7898C15.3298 14 15.6698 13.42 15.3998 12.95H15.3898ZM7.1498 4.98H8.8498V8.98H7.1498V4.98ZM7.9998 12.52C7.3598 12.52 6.8498 12.01 6.8498 11.37C6.8498 10.73 7.3598 10.22 7.9998 10.22C8.6398 10.22 9.1498 10.73 9.1498 11.37C9.1498 12.01 8.6398 12.52 7.9998 12.52Z" />
    </svg>
  );
}

/** Multiplatform icon – laptop + mobile */
export function MultiplatformIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.5 10.5H14V3C14 2.45 13.55 2 13 2H3C2.45 2 2 2.45 2 3V4.5H4.3C5.51 4.5 6.5 5.49001 6.5 6.70001V10.5ZM4.3 6H0.700001C0.310001 6 0 6.32001 0 6.70001V13.3C0 13.69 0.310001 14 0.700001 14H4.3C4.68 14 5 13.68 5 13.3V6.70001C5 6.31001 4.68 6 4.3 6ZM2.5 12.87C1.95 12.87 1.5 12.42 1.5 11.87C1.5 11.32 1.95 10.87 2.5 10.87C3.05 10.87 3.5 11.32 3.5 11.87C3.5 12.42 3.05 12.87 2.5 12.87ZM6.5 12V13.3C6.5 13.55 6.45 13.78 6.38 14H14.5C15.33 14 16 13.33 16 12.5V12H6.5Z" />
    </svg>
  );
}

/** Tag icon */
export function TagIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.59 7.41L8.59 1.41C8.21 1.03 7.7 0.81 7.17 0.81H2.5C1.4 0.81 0.5 1.71 0.5 2.81V7.48C0.5 8.01 0.72 8.52 1.1 8.9L7.1 14.9C7.49 15.29 8.12 15.29 8.51 14.9L14.59 8.82C14.98 8.43 14.98 7.8 14.59 7.41ZM4 5.31C3.45 5.31 3 4.86 3 4.31C3 3.76 3.45 3.31 4 3.31C4.55 3.31 5 3.76 5 4.31C5 4.86 4.55 5.31 4 5.31Z" />
    </svg>
  );
}

/** Sparkles / AI star icon */
export function SparklesIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8.09 2.006a.318.318 0 0 0-.606 0L6.42 5.31a.847.847 0 0 1-.491.491L2.625 6.865a.318.318 0 0 0 0 .606l3.304 1.063c.23.074.417.26.491.491l1.064 3.304a.318.318 0 0 0 .606 0l1.063-3.304a.847.847 0 0 1 .491-.491l3.304-1.063a.318.318 0 0 0 0-.606L9.644 5.8a.847.847 0 0 1-.491-.491L8.09 2.006z" />
      <path d="M12.724 10.492a.192.192 0 0 0-.366 0l-.642 1.995a.511.511 0 0 1-.296.296l-1.995.643a.192.192 0 0 0 0 .366l1.995.642c.139.045.252.157.296.296l.642 1.995a.192.192 0 0 0 .366 0l.643-1.995a.511.511 0 0 1 .296-.296l1.995-.642a.192.192 0 0 0 0-.366l-1.995-.643a.511.511 0 0 1-.296-.296l-.643-1.995z" />
    </svg>
  );
}

/** Gallery/Grid icon – 4 squares */
export function GalleryIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.3 2H9.7C9.31 2 9 2.32 9 2.7V6.3C9 6.69 9.31 7 9.7 7H13.3C13.68 7 14 6.68 14 6.3V2.7C14 2.31 13.68 2 13.3 2ZM6.3 2H2.7C2.31 2 2 2.32 2 2.7V6.3C2 6.69 2.31 7 2.7 7H6.3C6.68 7 7 6.68 7 6.3V2.7C7 2.31 6.68 2 6.3 2ZM13.3 9H9.7C9.31 9 9 9.32 9 9.7V13.3C9 13.69 9.31 14 9.7 14H13.3C13.68 14 14 13.68 14 13.3V9.7C14 9.31 13.68 9 13.3 9ZM6.3 9H2.7C2.31 9 2 9.32 2 9.7V13.3C2 13.69 2.31 14 2.7 14H6.3C6.68 14 7 13.68 7 13.3V9.7C7 9.31 6.68 9 6.3 9Z" />
    </svg>
  );
}

/** Person icon – single person in square */
export function PersonIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.5 2H3.5C2.67 2 2 2.67 2 3.5V12.5C2 13.33 2.67 14 3.5 14H12.5C13.33 14 14 13.33 14 12.5V3.5C14 2.67 13.33 2 12.5 2ZM8 4.78C8.82 4.78 9.48 5.44001 9.48 6.26001C9.48 7.08001 8.82 7.73999 8 7.73999C7.18 7.73999 6.52 7.08001 6.52 6.26001C6.52 5.44001 7.18 4.78 8 4.78ZM4.48 12C4.71 10.25 6.19 8.89999 8 8.89999C9.81 8.89999 11.29 10.25 11.52 12H4.49H4.48Z" />
    </svg>
  );
}

/** Long text icon – horizontal lines (General settings) */
export function LongTextIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 12.7H10V11H2V12.7ZM14 7.15H2V8.85H14V7.15ZM2 3.3V5H14V3.3H2Z" />
    </svg>
  );
}

/** Clock filled icon – office hours */
export function ClockFilledIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 1.25C4.27 1.25 1.25 4.27 1.25 8C1.25 11.73 4.27 14.75 8 14.75C11.73 14.75 14.75 11.73 14.75 8C14.75 4.27 11.73 1.25 8 1.25ZM11 8.85001H7.15V3.5C7.15 3.03 7.53 2.64999 8 2.64999C8.47 2.64999 8.85 3.03 8.85 3.5V7.14999H11C11.47 7.14999 11.85 7.53 11.85 8C11.85 8.47 11.47 8.85001 11 8.85001Z" />
    </svg>
  );
}

/** Shield/security icon – qual-identify */
export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.75 4.53L8 0.630005L1.25 4.53C1.25 4.53 1.25 4.53999 1.25 4.54999C1.25 9.12999 4.03 13.06 8 14.74C11.97 13.06 14.75 9.12999 14.75 4.54999C14.75 4.54999 14.75 4.54 14.75 4.53ZM11.47 6.23999L6.78 10.93L4.54 8.67999C4.21 8.34999 4.21 7.81001 4.54 7.48001C4.87 7.15001 5.41 7.15001 5.74 7.48001L6.78 8.51999L10.27 5.03C10.6 4.7 11.14 4.7 11.47 5.03C11.8 5.36 11.8 5.90001 11.47 6.23001V6.23999Z" />
    </svg>
  );
}

/** Language/multilingual icon */
export function LanguageIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.75014 9.07999C6.59014 8.87999 6.43014 8.68 6.28014 8.47C7.01014 7.24 7.57014 5.86999 7.92014 4.39999C8.18014 4.42999 8.44014 4.47 8.69014 4.5C9.16014 4.57 9.61014 4.24999 9.68014 3.76999C9.75014 3.29999 9.42014 2.86001 8.95014 2.79001C8.41014 2.71001 7.86014 2.64001 7.30014 2.60001C6.91014 2.57001 6.51014 2.54 6.11014 2.53V1.79999C6.11014 1.31999 5.72014 0.929993 5.24014 0.929993C4.76014 0.929993 4.37014 1.31999 4.37014 1.79999V2.53C3.42014 2.56 2.48014 2.65001 1.54014 2.79001C1.07014 2.86001 0.740136 3.29999 0.810136 3.76999C0.880136 4.24999 1.32014 4.57 1.80014 4.5C2.94014 4.34 4.10014 4.25 5.25014 4.25C5.56014 4.25 5.86014 4.25999 6.17014 4.26999C5.94014 5.13999 5.63014 5.96999 5.25014 6.73999C5.02014 6.26999 4.81014 5.77001 4.63014 5.26001C4.47014 4.81001 3.98013 4.57 3.52013 4.72C3.07013 4.88 2.83014 5.36999 2.98014 5.82999C3.30014 6.75999 3.71014 7.64 4.20014 8.47C3.36014 9.63 2.35014 10.58 1.21014 11.28C0.800137 11.53 0.670137 12.06 0.920137 12.47C1.17014 12.88 1.70014 13.01 2.11014 12.76C3.29014 12.04 4.34014 11.09 5.23014 9.97C5.29014 10.05 5.34014 10.12 5.40014 10.19C5.71014 10.56 6.25014 10.61 6.62014 10.3C6.99014 9.98999 7.04014 9.43999 6.73014 9.07999H6.75014ZM11.4801 5.5H9.88014L6.16014 14H8.07014L8.84013 12.23H12.5201L13.2901 14H15.2001L11.4801 5.5ZM9.61014 10.48L10.6901 8.01999L11.7701 10.48H9.62014H9.61014Z" />
    </svg>
  );
}

/** Sidebar open/collapse icon */
export function SidebarOpenIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 2H14C14.55 2 15 2.45 15 3V13C15 13.55 14.55 14 14 14H2C1.45 14 1 13.55 1 13V3C1 2.45 1.45 2 2 2ZM13.3 3.7H6V12.3H13.3V3.7Z" />
    </svg>
  );
}

/** Chevron right arrow – for collapsible sections */
export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z"
      />
    </svg>
  );
}

/** Home icon */
export function HomeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 8.39L8 2.5L2 8.39V14H6V10.5C6 10.22 6.22 10 6.5 10H9.5C9.78 10 10 10.22 10 10.5V14H14V8.39Z" />
    </svg>
  );
}

/** Database icon – for Data section */
export function DatabaseIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 1C4.69 1 2 2.12 2 3.5V12.5C2 13.88 4.69 15 8 15C11.31 15 14 13.88 14 12.5V3.5C14 2.12 11.31 1 8 1ZM8 2.5C10.76 2.5 12.5 3.38 12.5 3.5C12.5 3.62 10.76 4.5 8 4.5C5.24 4.5 3.5 3.62 3.5 3.5C3.5 3.38 5.24 2.5 8 2.5Z" />
    </svg>
  );
}

/** Webhook/link icon */
export function WebhookIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 3C6.34 3 5 4.34 5 6C5 6.55 5.45 7 6 7C6.55 7 7 6.55 7 6C7 5.45 7.45 5 8 5C8.55 5 9 5.45 9 6C9 6.36 8.81 6.68 8.53 6.86L7.14 7.79C6.44 8.26 6 9.04 6 9.87V10C6 10.55 6.45 11 7 11C7.55 11 8 10.55 8 10V9.87C8 9.61 8.14 9.37 8.36 9.22L9.75 8.29C10.52 7.78 11 6.93 11 6C11 4.34 9.66 3 8 3ZM8 12C7.45 12 7 12.45 7 13C7 13.55 7.45 14 8 14C8.55 14 9 13.55 9 13C9 12.45 8.55 12 8 12Z" />
    </svg>
  );
}

/** Key/token icon */
export function KeyIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10.5 1C8.02 1 6 3.02 6 5.5C6 6.03 6.09 6.54 6.24 7.02L1.29 11.97C1.1 12.16 1 12.41 1 12.68V14C1 14.55 1.45 15 2 15H4.5C5.05 15 5.5 14.55 5.5 14V13H6.5C7.05 13 7.5 12.55 7.5 12V11H8.5C8.77 11 9.02 10.89 9.21 10.71L8.98 10.76C9.46 10.91 9.97 11 10.5 11C12.98 11 15 8.98 15 6.5C15 4.02 12.98 1 10.5 1ZM11.5 5C10.95 5 10.5 4.55 10.5 4C10.5 3.45 10.95 3 11.5 3C12.05 3 12.5 3.45 12.5 4C12.5 4.55 12.05 5 11.5 5Z" />
    </svg>
  );
}

/** Bell/notification icon */
export function BellIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.58 11.3L12.25 8.63V6C12.25 3.65 10.35 1.75 8 1.75C5.65 1.75 3.75 3.65 3.75 6V8.63L2.42 11.3C2.15 11.84 2.54 12.5 3.14 12.5H6.5C6.5 13.33 7.17 14 8 14C8.83 14 9.5 13.33 9.5 12.5H12.86C13.46 12.5 13.85 11.84 13.58 11.3Z" />
    </svg>
  );
}

// ─── Additional Icons for Get Started Page ───────────────────────────────────

/** Test/Beaker icon – flask/beaker */
export function TestBeakerIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.931 13.222l-3.93-5.033V1.974H5V8.19l-3.932 5.033a.5.5 0 0 0 .432.752h12.998a.5.5 0 0 0 .432-.752zM6.7 3.674h2.6v5.099l.979 1.254H5.72l.98-1.254V6.012L6.7 3.674z" />
    </svg>
  );
}

/** Lightning bolt icon – simple automations */
export function LightningBoltIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.4301 7H10.0001V0.779998C10.0001 0.509998 9.66011 0.370001 9.48011 0.580001L2.35011 8.5C2.18011 8.69 2.31011 9 2.57011 9H7.00011V15.22C7.00011 15.49 7.34011 15.63 7.52011 15.42L14.6501 7.5C14.8201 7.31 14.6901 7 14.4301 7Z" />
    </svg>
  );
}

/** Changelog/History icon – clock with arrow */
export function ChangelogIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8.996 10V6.207a.779.779 0 1 0-1.559 0v2.234h-1.24a.779.779 0 1 0 0 1.559h2.799z" />
      <path d="M7.995 1.508c-2.137 0-4.098 1.07-5.297 2.762V2.85a.849.849 0 1 0-1.7 0V7h4.156a.849.849 0 1 0 0-1.7H4.047a4.81 4.81 0 0 1 3.948-2.094 4.798 4.798 0 0 1 4.796 4.79c0 2.64-2.152 4.788-4.796 4.788a4.75 4.75 0 0 1-2.984-1.04l-1.06 1.33a6.518 6.518 0 0 0 4.044 1.41c3.582 0 6.495-2.91 6.495-6.489 0-3.578-2.913-6.488-6.495-6.488z" />
    </svg>
  );
}

/** Shopping cart icon – eCommerce */
export function ShoppingCartIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.79 12.03L14.75 1H13.2L12.4 4H0.969971L2.36997 9.26C2.48997 9.7 2.87997 10 3.33997 10H10.8L10.26 12H3.01997C2.18997 12 1.51997 12.67 1.51997 13.5C1.51997 14.33 2.18997 15 3.01997 15C3.84997 15 4.51997 14.33 4.51997 13.5H10.02C10.02 14.33 10.69 15 11.52 15C12.35 15 13.02 14.33 13.02 13.5C13.02 12.77 12.5 12.16 11.81 12.03H11.79Z" />
    </svg>
  );
}

/** Click element icon – Gaming & Gambling */
export function ClickElementIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.85003 6.45001L11.19 7.67999C11.32 7.30999 11.41 6.92 11.41 6.5C11.41 4.57 9.84003 3 7.91003 3C5.98003 3 4.41003 4.57 4.41003 6.5C4.41003 7.93 5.27003 9.16001 6.50003 9.70001V7.92001C6.50003 6.82001 7.40003 5.92001 8.50003 5.92001C9.00003 5.92001 9.48003 6.11001 9.85003 6.45001ZM7.91003 0C4.32003 0 1.41003 2.91 1.41003 6.5C1.41003 9.61 3.59003 12.2 6.50003 12.84V11.27C4.43003 10.66 2.91003 8.76 2.91003 6.5C2.91003 3.74 5.15003 1.5 7.91003 1.5C10.67 1.5 12.91 3.74 12.91 6.5C12.91 7.31 12.7 8.06999 12.35 8.73999L13.5 9.79999C14.07 8.82999 14.41 7.71 14.41 6.5C14.41 2.91 11.5 0 7.91003 0ZM8.84003 7.54999C8.74003 7.45999 8.62003 7.42001 8.50003 7.42001C8.24003 7.42001 8.00003 7.62001 8.00003 7.92001V13.67C8.00003 13.96 8.24003 14.17 8.50003 14.17C8.57003 14.17 8.64003 14.16 8.70003 14.13L10.13 13.5L11.04 15.56C11.16 15.84 11.44 16.01 11.73 16.01C11.83 16.01 11.94 15.99 12.03 15.95C12.41 15.78 12.58 15.34 12.41 14.96L11.5 12.9L12.92 12.27C13.25 12.12 13.32 11.69 13.06 11.44L8.84003 7.56V7.54999Z" />
    </svg>
  );
}

/** Play button icon */
export function PlayButtonIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.05 13.89L13.21 8.6C13.68 8.33 13.68 7.65999 13.21 7.38999L4.05 2.1C3.58 1.83 3 2.17 3 2.71V13.29C3 13.83 3.58 14.17 4.05 13.9V13.89Z" />
    </svg>
  );
}

/** External link icon – arrow pointing up-right */
export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5.5499 3C5.0799 3 4.6999 3.38001 4.6999 3.85001C4.6999 4.32001 5.0799 4.70001 5.5499 4.70001H10.0999L2.3999 12.4L3.5999 13.6L11.2999 5.89999V10.45C11.2999 10.92 11.6799 11.3 12.1499 11.3C12.6199 11.3 12.9999 10.92 12.9999 10.45V3H5.5499Z" />
    </svg>
  );
}

/** Right arrow icon */
export function RightArrowIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.79 12.8501L14.64 8.00009L9.79 3.15009C9.46 2.82009 8.92 2.82009 8.59 3.15009C8.26 3.48009 8.26 4.02009 8.59 4.35009L11.39 7.15009H2V8.85009H11.39L8.59 11.6501C8.42 11.8201 8.34 12.0301 8.34 12.2501C8.34 12.4701 8.42 12.6901 8.59 12.8501C8.92 13.1801 9.46 13.1801 9.79 12.8501Z" />
    </svg>
  );
}

/** Plug/connectors icon */
export function ConnectorsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.25 5.5H11.5V2.75C11.5 2.34 11.16 2 10.75 2C10.34 2 10 2.34 10 2.75V5.5H6V2.75C6 2.34 5.66 2 5.25 2C4.84 2 4.5 2.34 4.5 2.75V5.5H2.75C2.34 5.5 2 5.84 2 6.25C2 6.66 2.34 7 2.75 7H4.5V9.5C4.5 11.43 6.07 13 8 13V14.25C8 14.66 8.34 15 8.75 15C9.16 15 9.5 14.66 9.5 14.25V13C11.43 13 13 11.43 13 9.5V7H13.25C13.66 7 14 6.66 14 6.25C14 5.84 13.66 5.5 13.25 5.5ZM11.5 9.5C11.5 10.6 10.6 11.5 9.5 11.5H8H6.5C5.4 11.5 4.5 10.6 4.5 9.5V7H11.5V9.5Z" />
    </svg>
  );
}
