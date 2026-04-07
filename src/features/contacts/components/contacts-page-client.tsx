'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import {
  Plus,
  ChevronDown,
  Info,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Contact } from '@/types/appwrite';
import {
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  addTagToContacts,
  getContactCounts
} from '@/features/contacts/actions/contact-crud';
import {
  ContactsSidebar,
  HeroBanner,
  InfoBanner,
  FilterBar,
  Toolbar,
  UsersTable
} from './contacts-sub-components';
import type { SegmentInfo } from './contacts-sub-components';
import {
  CreateContactModal,
  AddTagModal,
  ContactDetailPanel
} from './contacts-detail-modals';

/* ================================================================
   Contacts page – theme-aware, using shadcn/ui components
   ================================================================ */

// ── Sidebar Toggle Icon ────────────────────────────────────

function SidebarToggleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='currentColor'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M2 3h12v1H2V3zm0 4h8v1H2V7zm0 4h12v1H2v-1z' />
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────

export default function ContactsPageClient() {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeSegment, setActiveSegment] = useState('all');
  const [showHero, setShowHero] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [search, setSearch] = useState('');
  const [_sidebarSearch, setSidebarSearch] = useState(false);

  // Data state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    all: 0,
    users: 0,
    leads: 0,
    active: 0,
    new: 0
  });

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);

  // ── Load data ──────────────────────────────────────────

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const typeFilter =
        activeSegment === 'users'
          ? 'user'
          : activeSegment === 'leads'
            ? 'lead'
            : undefined;
      const statusFilter = activeSegment === 'active' ? 'active' : undefined;

      const result = await listContacts({
        type: typeFilter as 'user' | 'lead' | undefined,
        status: statusFilter as 'active' | undefined,
        search: search || undefined,
        limit: 100
      });

      if (result.success && result.data) {
        if (activeSegment === 'new') {
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          setContacts(
            result.data.filter(
              (c) => new Date(c.$createdAt).getTime() > sevenDaysAgo
            )
          );
        } else {
          setContacts(result.data);
        }
      }
    } catch (err) {
      logger.error('Failed to load contacts', { err });
    }
    setLoading(false);
  }, [activeSegment, search]);

  const loadCounts = useCallback(async () => {
    try {
      const result = await getContactCounts();
      if (result.success && result.data) {
        setCounts(result.data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  // ── Handlers ───────────────────────────────────────────

  const handleCreateContact = async (data: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    type?: 'user' | 'lead';
    city?: string;
  }) => {
    const result = await createContact(data);
    if (result.success) {
      toast.success(`Contact "${data.name}" created`);
      setShowCreateModal(false);
      loadContacts();
      loadCounts();
    } else {
      toast.error(result.error || 'Failed to create contact');
    }
  };

  const handleUpdateContact = async (
    id: string,
    data: Record<string, unknown>
  ) => {
    const result = await updateContact(
      id,
      data as Parameters<typeof updateContact>[1]
    );
    if (result.success) {
      toast.success('Contact updated');
      loadContacts();
    } else {
      toast.error(result.error || 'Failed to update');
    }
  };

  const handleDeleteContact = async (id: string) => {
    const result = await deleteContact(id);
    if (result.success) {
      toast.success('Contact deleted');
      if (activeRowId === id) {
        setActiveRowId(null);
        setShowDetailPanel(false);
      }
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      loadContacts();
      loadCounts();
    } else {
      toast.error(result.error || 'Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} contact(s)?`)) return;

    const result = await bulkDeleteContacts(selectedIds);
    if (result.success) {
      toast.success(`${result.deleted} contact(s) deleted`);
      setSelectedIds([]);
      if (activeRowId && selectedIds.includes(activeRowId)) {
        setActiveRowId(null);
        setShowDetailPanel(false);
      }
      loadContacts();
      loadCounts();
    } else {
      toast.error(result.error || 'Failed to delete');
    }
  };

  const handleAddTag = async (tag: string) => {
    const ids =
      selectedIds.length > 0
        ? selectedIds
        : activeRowId
          ? [activeRowId]
          : [];
    if (ids.length === 0) return;

    const result = await addTagToContacts(ids, tag);
    if (result.success) {
      toast.success(`Tag "${tag}" added to ${result.updated} contact(s)`);
      setShowTagModal(false);
      loadContacts();
    } else {
      toast.error(result.error || 'Failed to add tag');
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map((c) => c.$id));
    }
  };

  const handleRowClick = (id: string) => {
    setActiveRowId(id);
    setShowDetailPanel(true);
  };

  // ── Segments ───────────────────────────────────────────

  const segments: SegmentInfo[] = [
    { label: 'All contacts', key: 'all', count: counts.all },
    { label: 'All users', key: 'users', count: counts.users },
    { label: 'All leads', key: 'leads', count: counts.leads },
    { label: 'Active', key: 'active', count: counts.active },
    { label: 'New', key: 'new', count: counts.new }
  ];

  const activeContact = contacts.find((c) => c.$id === activeRowId);

  return (
    <div className='flex h-[calc(100dvh-44px)] overflow-hidden'>
      {/* Contacts Sidebar */}
      <ContactsSidebar
        activeSegment={activeSegment}
        onSegmentChange={setActiveSegment}
        collapsed={!sidebarVisible}
        segments={segments}
        onSearch={() => {
          setSidebarSearch((v) => !v);
          toast.info('Use the search bar in the main area to filter contacts');
        }}
      />

      {/* Main Content */}
      <div className='flex flex-1 overflow-hidden'>
        <div className='flex flex-1 flex-col overflow-y-auto'>
          {/* Header */}
          <div className='flex items-center gap-3 border-b px-6 py-3'>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={() => setSidebarVisible((v) => !v)}
            >
              <SidebarToggleIcon className='h-4 w-4' />
            </Button>

            <h1 className='text-lg font-semibold'>
              {segments.find((s) => s.key === activeSegment)?.label ||
                'Contacts'}
            </h1>

            <div className='flex-1' />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-1.5 text-[13px]'
                >
                  <FileText className='h-3.5 w-3.5' />
                  Learn
                  <ChevronDown className='h-3 w-3' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => router.push('/dashboard/content')}>
                  <FileText className='mr-2 h-3.5 w-3.5' />
                  Knowledge base
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/guidance')}>
                  <Info className='mr-2 h-3.5 w-3.5' />
                  Getting started guide
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <ExternalLink className='mr-2 h-3.5 w-3.5' />
                  Settings &amp; integrations
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* New contact button */}
            <Button
              size='sm'
              className='gap-1.5 text-[13px]'
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className='h-3.5 w-3.5' />
              New contact
            </Button>
          </div>

          {/* Page body */}
          <div className='pb-8'>
            {showHero && <HeroBanner onDismiss={() => setShowHero(false)} />}

            <FilterBar search={search} onSearchChange={setSearch} />

            <InfoBanner />

            <Toolbar
              userCount={contacts.length}
              selectedIds={selectedIds}
              onNewMessage={() => toast.info('Messaging coming soon')}
              onAddTag={() => {
                if (selectedIds.length === 0) {
                  toast.info('Select contacts first to add a tag');
                  return;
                }
                setShowTagModal(true);
              }}
              onBulkDelete={handleBulkDelete}
              loading={loading}
            />

            <UsersTable
              users={contacts}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onRowClick={handleRowClick}
              activeRowId={activeRowId}
              loading={loading}
            />
          </div>
        </div>

        {/* Detail Panel */}
        {showDetailPanel && activeContact && (
          <ContactDetailPanel
            contact={activeContact}
            onClose={() => {
              setShowDetailPanel(false);
              setActiveRowId(null);
            }}
            onUpdate={handleUpdateContact}
            onDelete={handleDeleteContact}
          />
        )}
      </div>

      {/* Create Contact Modal */}
      <CreateContactModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateContact}
      />

      {/* Add Tag Modal */}
      <AddTagModal
        open={showTagModal}
        onClose={() => setShowTagModal(false)}
        onAdd={handleAddTag}
        selectedCount={selectedIds.length}
      />
    </div>
  );
}
