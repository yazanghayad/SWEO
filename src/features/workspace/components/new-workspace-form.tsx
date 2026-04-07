'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { createWorkspace } from '@/features/workspace/actions/create-workspace';
import { useActionState } from 'react';

export function NewWorkspaceForm() {
  const router = useRouter();
  const [error, formAction, isPending] = useActionState(
    async (_prevState: string | null, formData: FormData) => {
      try {
        await createWorkspace(formData);
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : 'Failed to create workspace';
      }
    },
    null
  );

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle className='text-base'>Workspace details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='workspace-name'>Workspace name</Label>
            <Input
              id='workspace-name'
              name='name'
              placeholder='e.g. My Company'
              required
              minLength={2}
              maxLength={100}
            />
            {error && (
              <p className='text-sm text-destructive'>{error}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isPending}>
            {isPending ? 'Creating…' : 'Create workspace'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
