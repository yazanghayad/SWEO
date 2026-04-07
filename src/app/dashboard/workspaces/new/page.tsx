import { NewWorkspaceForm } from '@/features/workspace/components/new-workspace-form';

export const metadata = {
  title: 'Create Workspace'
};

export default function NewWorkspacePage() {
  return (
    <div className='mx-auto flex max-w-lg flex-col gap-6 px-4 py-12'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold tracking-tight'>
          Create a new workspace
        </h1>
        <p className='text-muted-foreground text-sm'>
          Set up a new workspace for your team or project.
        </p>
      </div>
      <NewWorkspaceForm />
    </div>
  );
}
