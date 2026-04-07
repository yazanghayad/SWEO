'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import {
  listTags,
  createTag as createTagAction,
  deleteTag as deleteTagAction
} from '@/features/settings/actions/list-data-actions';
import type { Tag } from '@/types/appwrite';
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

const TAG_COLORS = [
  { label: 'Blue', value: 'bg-blue-500' },
  { label: 'Green', value: 'bg-green-500' },
  { label: 'Red', value: 'bg-red-500' },
  { label: 'Yellow', value: 'bg-yellow-500' },
  { label: 'Purple', value: 'bg-purple-500' },
  { label: 'Gray', value: 'bg-gray-500' }
];

export default function TagsClient() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('bg-blue-500');
  const [search, setSearch] = useState('');

  useEffect(() => {
    listTags()
      .then(setTags)
      .catch(() => toast.error('Failed to load tags'))
      .finally(() => setLoading(false));
  }, []);

  function handleCreate() {
    if (!newName.trim()) return;
    startTransition(async () => {
      try {
        const tag = await createTagAction({ name: newName, color: newColor });
        setTags((prev) => [tag, ...prev]);
        setNewName('');
        setDialogOpen(false);
        toast.success(`Tag "${tag.name}" created`);
      } catch {
        toast.error('Failed to create tag');
      }
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      try {
        await deleteTagAction(id);
        setTags((prev) => prev.filter((t) => t.$id !== id));
        toast.success('Tag removed');
      } catch {
        toast.error('Failed to remove tag');
      }
    });
  }

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
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
          <h1 className='text-lg font-semibold'>Tags</h1>
          <p className='text-muted-foreground text-xs'>
            {tags.length} tag{tags.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size='sm'>Create tag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create tag</DialogTitle>
              <DialogDescription>
                Tags help you organize and categorize conversations.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder='Tag name'
              />
              <div>
                <p className='text-muted-foreground mb-2 text-xs font-medium'>
                  Color
                </p>
                <div className='flex gap-2'>
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setNewColor(c.value)}
                      className={`h-6 w-6 rounded-full ${c.value} ${
                        newColor === c.value
                          ? 'ring-primary ring-2 ring-offset-2'
                          : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || isPending}
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
            title='Conversation tags'
            description='Use tags to categorize and track conversations. Tags can be applied manually or through automation.'
          >
            <div className='space-y-3'>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search tags...'
                className='max-w-sm'
              />
              <div className='space-y-2'>
                {filtered.length === 0 ? (
                  <div className='text-muted-foreground py-8 text-center text-sm'>
                    No tags found.
                  </div>
                ) : (
                  filtered.map((tag) => (
                    <div
                      key={tag.$id}
                      className='flex items-center justify-between rounded-lg border p-3'
                    >
                      <div className='flex items-center gap-3'>
                        <span
                          className={`h-3 w-3 rounded-full ${tag.color}`}
                        />
                        <span className='text-sm font-medium'>{tag.name}</span>
                        <Badge variant='secondary' className='text-xs'>
                          {tag.usageCount} conversations
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
                          onClick={() => handleRemove(tag.$id)}
                        >
                          Remove
                        </Button>
                      </div>
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
