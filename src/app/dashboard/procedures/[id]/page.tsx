import ProcedureBuilderClient from '@/features/procedures/components/procedure-builder-client';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Edit Procedure · ${id}` };
}

export default async function ProcedureDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProcedureBuilderClient procedureId={id} />;
}
