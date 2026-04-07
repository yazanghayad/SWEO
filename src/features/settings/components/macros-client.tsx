'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import {
  listMacros,
  createMacro as createMacroAction,
  deleteMacro as deleteMacroAction
} from '@/features/settings/actions/list-data-actions';
import type { Macro } from '@/types/appwrite';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

function SettingsSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='py-5'>
      <div className='mb-4'>
        <p className='mb-1 text-sm font-semibold'>{title}</p>
        {description && (
          <p className='text-muted-foreground text-xs leading-relaxed'>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function MacrosClient() {
  const [macros, setMacros] = useState<Macro[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    listMacros()
      .then(setMacros)
      .catch(() => toast.error('Failed to load macros'))
      .finally(() => setLoading(false));
  }, []);

  function handleCreate() {
    if (!newName.trim() || !newContent.trim()) return;
    startTransition(async () => {
      try {
        const macro = await createMacroAction({
          name: newName,
          content: newContent
        });
        setMacros((prev) => [macro, ...prev]);
        setNewName('');
        setNewContent('');
        setDialogOpen(false);
        toast.success(`Macro "${macro.name}" created`);
      } catch {
        toast.error('Failed to create macro');
      }
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      try {
        await deleteMacroAction(id);
        setMacros((prev) => prev.filter((m) => m.$id !== id));
        toast.success('Macro removed');
      } catch {
        toast.error('Failed to remove macro');
      }
    });
  }

  const filtered = macros.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='bg-muted/30 flex flex-1 flex-col overflow-hidden rounded-lg shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between border-b px-6 pt-4 pb-4'>
        <div>
          <h1 className='text-lg font-semibold'>Macros</h1>
          <p className='text-muted-foreground text-xs'>
            {macros.length} macro{macros.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size='sm'>Create macro</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create macro</DialogTitle>
              <DialogDescription>
                Create a saved reply template that teammates can use in
                conversations.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder='Macro name'
              />
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder='Type your macro content... Use {{customer.name}} for variables.'
                rows={4}
              />
              <p className='text-muted-foreground text-xs'>
                Available variables: {'{{customer.name}}'},{' '}
                {'{{customer.email}}'}, {'{{agent.name}}'}
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || !newContent.trim() || isPending}
              >
                {isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='max-w-3xl space-y-0'>
          <SettingsSection
            title='Saved replies'
            description='Use macros to quickly respond to common customer questions. Teammates can insert these in any conversation.'
          >
            <div className='space-y-3'>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search macros...'
                className='max-w-sm'
              />
              <div className='space-y-2'>
                {filtered.length === 0 ? (
                  <div className='text-muted-foreground py-8 text-center text-sm'>
                    No macros found.
                  </div>
                ) : (
                  filtered.map((macro) => (
                    <div
                      key={macro.$id}
                      className='rounded-lg border p-4'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <p className='text-sm font-medium'>{macro.name}</p>
                          <Badge variant='secondary' className='text-xs'>
                            Used {macro.usageCount}x
                          </Badge>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button variant='outline' size='sm'>
                            Edit
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            disabled={isPending}
                            onClick={() => handleRemove(macro.$id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <p className='text-muted-foreground mt-2 text-xs leading-relaxed'>
                        {macro.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
