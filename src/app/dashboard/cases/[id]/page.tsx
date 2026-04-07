import CaseDetailClient from '@/features/cases/components/case-detail-client';

export const metadata = { title: 'Case Detail' };

export default async function CaseDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaseDetailClient caseId={id} />;
}
