'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Check,
  Pencil,
  Trash,
  X,
  Mail,
  Phone,
  MapPin,
  Building,
  Loader2,
  User,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import type { Contact } from '@/types/appwrite';
import { timeAgo, getInitial } from './contacts-sub-components';

/* ------------------------------------------------------------------ */
/*  Create Contact Modal                                                */
/* ------------------------------------------------------------------ */

export function CreateContactModal({
  open,
  onClose,
  onCreate
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    type?: 'user' | 'lead';
    city?: string;
  }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<'user' | 'lead'>('user');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    onCreate({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      company: company.trim() || undefined,
      type,
      city: city.trim() || undefined
    });
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setCity('');
    setType('user');
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>New contact</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-2'>
          {/* Type selector */}
          <div className='flex gap-2'>
            <Button
              type='button'
              variant={type === 'user' ? 'default' : 'outline'}
              size='sm'
              className='flex-1'
              onClick={() => setType('user')}
            >
              <User className='mr-1.5 h-3.5 w-3.5' />
              User
            </Button>
            <Button
              type='button'
              variant={type === 'lead' ? 'default' : 'outline'}
              size='sm'
              className='flex-1'
              onClick={() => setType('lead')}
            >
              <Users className='mr-1.5 h-3.5 w-3.5' />
              Lead
            </Button>
          </div>

          <div className='space-y-2'>
            <Label>
              Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Full name'
              required
              autoFocus
            />
          </div>

          <div className='space-y-2'>
            <Label>Email</Label>
            <Input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='email@example.com'
            />
          </div>

          <div className='space-y-2'>
            <Label>Phone</Label>
            <Input
              type='tel'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='+46 70 123 4567'
            />
          </div>

          <div className='space-y-2'>
            <Label>Company</Label>
            <Input
              type='text'
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder='Company name'
            />
          </div>

          <div className='space-y-2'>
            <Label>City</Label>
            <Input
              type='text'
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder='City'
            />
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={saving || !name.trim()}>
              {saving && (
                <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
              )}
              Create contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Tag Modal                                                       */
/* ------------------------------------------------------------------ */

export function AddTagModal({
  open,
  onClose,
  onAdd,
  selectedCount
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (tag: string) => void;
  selectedCount: number;
}) {
  const [tag, setTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag.trim()) return;
    onAdd(tag.trim());
    setTag('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>
            Add tag to {selectedCount} contact
            {selectedCount !== 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-2'>
          <Input
            type='text'
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder='Tag name'
            autoFocus
          />
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={!tag.trim()}>
              Add tag
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact Detail Panel                                                */
/* ------------------------------------------------------------------ */

function DetailField({
  icon,
  label,
  value,
  editing,
  editValue,
  onEditChange,
  placeholder
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  editing?: boolean;
  editValue?: string;
  onEditChange?: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className='flex items-start gap-2.5'>
      <span className='text-muted-foreground mt-0.5'>{icon}</span>
      <div className='flex-1'>
        <p className='text-muted-foreground text-[11px] font-medium'>
          {label}
        </p>
        {editing ? (
          <Input
            value={editValue ?? ''}
            onChange={(e) => onEditChange?.(e.target.value)}
            className='mt-0.5 h-7 text-sm'
            placeholder={placeholder}
          />
        ) : (
          <p className='mt-0.5 text-sm'>{value}</p>
        )}
      </div>
    </div>
  );
}

export function ContactDetailPanel({
  contact,
  onClose,
  onUpdate,
  onDelete
}: {
  contact: Contact;
  onClose: () => void;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(contact.name);
  const [editEmail, setEditEmail] = useState(contact.email || '');
  const [editPhone, setEditPhone] = useState(contact.phone || '');
  const [editCompany, setEditCompany] = useState(contact.company || '');
  const [editCity, setEditCity] = useState(contact.city || '');
  const [editNotes, setEditNotes] = useState(contact.notes || '');

  useEffect(() => {
    setEditName(contact.name);
    setEditEmail(contact.email || '');
    setEditPhone(contact.phone || '');
    setEditCompany(contact.company || '');
    setEditCity(contact.city || '');
    setEditNotes(contact.notes || '');
    setEditing(false);
  }, [contact]);

  const handleSave = () => {
    onUpdate(contact.$id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      company: editCompany,
      city: editCity,
      notes: editNotes
    });
    setEditing(false);
  };

  const tags: string[] = contact.tags
    ? typeof contact.tags === 'string'
      ? (() => {
          try {
            return JSON.parse(contact.tags);
          } catch {
            return [];
          }
        })()
      : (contact.tags as unknown as string[])
    : [];

  return (
    <div className='bg-sidebar flex h-full w-[360px] shrink-0 flex-col border-l'>
      {/* Header */}
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <h3 className='text-sm font-semibold'>Contact details</h3>
        <div className='flex items-center gap-1'>
          {editing ? (
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={handleSave}
            >
              <Check className='h-4 w-4 text-green-500' />
            </Button>
          ) : (
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={() => setEditing(true)}
            >
              <Pencil className='h-4 w-4' />
            </Button>
          )}
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7 hover:text-destructive'
            onClick={() => {
              if (confirm('Delete this contact?')) {
                onDelete(contact.$id);
              }
            }}
          >
            <Trash className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={onClose}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Body */}
      <ScrollArea className='flex-1'>
        <div className='p-4'>
          {/* Avatar + Name */}
          <div className='mb-6 flex items-center gap-3'>
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white',
                contact.avatarColor || 'bg-blue-500'
              )}
            >
              {getInitial(contact.name)}
            </div>
            <div>
              {editing ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className='h-8 text-sm'
                />
              ) : (
                <p className='font-semibold'>{contact.name}</p>
              )}
              <Badge
                variant={contact.type === 'lead' ? 'outline' : 'secondary'}
                className='mt-1'
              >
                {contact.type === 'lead' ? 'Lead' : 'User'}
              </Badge>
            </div>
          </div>

          {/* Fields */}
          <div className='space-y-4'>
            <DetailField
              icon={<Mail className='h-3.5 w-3.5' />}
              label='Email'
              value={editing ? undefined : contact.email || '—'}
              editing={editing}
              editValue={editEmail}
              onEditChange={setEditEmail}
              placeholder='email@example.com'
            />
            <DetailField
              icon={<Phone className='h-3.5 w-3.5' />}
              label='Phone'
              value={editing ? undefined : contact.phone || '—'}
              editing={editing}
              editValue={editPhone}
              onEditChange={setEditPhone}
              placeholder='+46 70 123 4567'
            />
            <DetailField
              icon={<Building className='h-3.5 w-3.5' />}
              label='Company'
              value={editing ? undefined : contact.company || '—'}
              editing={editing}
              editValue={editCompany}
              onEditChange={setEditCompany}
              placeholder='Company name'
            />
            <DetailField
              icon={<MapPin className='h-3.5 w-3.5' />}
              label='City'
              value={editing ? undefined : contact.city || '—'}
              editing={editing}
              editValue={editCity}
              onEditChange={setEditCity}
              placeholder='City'
            />

            {/* Read-only fields */}
            <Separator />
            <div className='space-y-2 text-[13px]'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Status</span>
                <Badge
                  variant={
                    contact.status === 'active'
                      ? 'secondary'
                      : contact.status === 'inactive'
                        ? 'outline'
                        : 'destructive'
                  }
                  className='text-[11px]'
                >
                  {contact.status}
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Last seen</span>
                <span className='text-muted-foreground'>
                  {timeAgo(contact.lastSeenAt)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>First seen</span>
                <span className='text-muted-foreground'>
                  {timeAgo(contact.firstSeenAt)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Signed up</span>
                <span className='text-muted-foreground'>
                  {timeAgo(contact.signedUpAt)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Web sessions</span>
                <span className='text-muted-foreground'>
                  {contact.webSessions ?? 0}
                </span>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className='text-muted-foreground mb-2 text-xs font-medium'>
                    Tags
                  </p>
                  <div className='flex flex-wrap gap-1.5'>
                    {tags.map((t: string, i: number) => (
                      <Badge
                        key={i}
                        variant='secondary'
                        className='text-[11px]'
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            <Separator />
            <div>
              <p className='text-muted-foreground mb-2 text-xs font-medium'>
                Notes
              </p>
              {editing ? (
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className='border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                  rows={3}
                  placeholder='Add notes...'
                />
              ) : (
                <p className='text-muted-foreground text-sm'>
                  {contact.notes || 'No notes'}
                </p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
