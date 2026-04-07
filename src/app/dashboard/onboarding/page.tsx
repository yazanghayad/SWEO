import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Setup Your Workspace'
};

export default function OnboardingPage() {
  redirect('/setup');
}
