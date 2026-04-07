import { redirect } from 'next/navigation';
import OnboardingWizard from '@/features/auth/components/onboarding-wizard';
import { checkOnboardingStatusAction } from '@/features/auth/actions/onboarding';

export const metadata = {
  title: 'Set Up Your Workspace — SWEO'
};

export default async function SetupPage() {
  const { onboarded } = await checkOnboardingStatusAction();
  if (onboarded) redirect('/dashboard/overview');

  return <OnboardingWizard />;
}
