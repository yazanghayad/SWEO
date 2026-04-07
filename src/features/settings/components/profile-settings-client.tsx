'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getProfileAction,
  updateProfileNameAction,
  updateProfilePrefsAction,
  uploadAvatarAction
} from '@/features/settings/actions/profile-actions';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from '@/lib/format';

import {
  Mail,
  MapPin,
  Clock,
  Pencil,
  Briefcase,
  Building,
  Phone,
  Quote,
  Calendar,
  User,
  Activity,
  UserX
} from 'lucide-react';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/* Channel display helpers                                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  prefs: Record<string, string>;
  createdAt?: string;
}

export default function ProfileSettingsClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<ProfileUser | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Editable fields
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    async function load() {
      const profileRes = await getProfileAction();
      if (profileRes.user) {
        const u = profileRes.user;
        setUser(u);
        setName(u.name || '');
        setJobTitle(u.prefs?.jobTitle || '');
        setDepartment(u.prefs?.department || '');
        setPhoneNumber(u.prefs?.phone || u.phone || '');
        setBio(u.prefs?.bio || '');
        setLocation(u.prefs?.location || '');
      }

      setLoading(false);
    }
    load();
  }, []);



  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    const result = await uploadAvatarAction(fd);
    if (result.success && result.avatarUrl) {
      setUser((prev) =>
        prev
          ? { ...prev, prefs: { ...prev.prefs, avatarUrl: result.avatarUrl! } }
          : prev
      );
      toast.success('Avatar updated');
    } else {
      toast.error(result.error ?? 'Upload failed');
    }
    setUploading(false);
    // Reset input so the same file can be re-selected
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSaveProfile() {
    try {
      const nameRes = await updateProfileNameAction(name);
      if (!nameRes.success) throw new Error(nameRes.error ?? 'Failed');

      const prefsRes = await updateProfilePrefsAction({
        jobTitle,
        department,
        phone: phoneNumber,
        bio,
        location
      });
      if (!prefsRes.success) throw new Error(prefsRes.error ?? 'Failed');

      setUser((prev) =>
        prev
          ? {
              ...prev,
              name,
              prefs: {
                ...prev.prefs,
                jobTitle,
                department,
                phone: phoneNumber,
                bio,
                location
              }
            }
          : prev
      );
      setEditMode(false);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    }
  }

  if (loading || !user) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = user.prefs?.avatarUrl;
  const now = new Date();
  const localTime = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: user.prefs?.timezone || 'Europe/Stockholm'
  });
  const displayLocation = location || user.prefs?.location || 'Sundbyberg, Sweden';



  return (
    <div className='flex min-h-full flex-1 flex-col overflow-y-auto'>
      {/* Hero Header with map background */}
      <div className='relative overflow-hidden border-b bg-[#1a1d2e]'>
        {/* Map background */}
        <div className='absolute inset-0 opacity-20'>
          <svg viewBox='0 0 800 200' className='h-full w-full' preserveAspectRatio='xMidYMid slice'>
            <defs>
              <radialGradient id='mapGlow' cx='60%' cy='50%' r='40%'>
                <stop offset='0%' stopColor='#3b82f6' stopOpacity='0.3' />
                <stop offset='100%' stopColor='transparent' stopOpacity='0' />
              </radialGradient>
            </defs>
            <rect fill='url(#mapGlow)' width='800' height='200' />
            {/* Dots representing a world map pattern */}
            {Array.from({ length: 60 }).map((_, i) => (
              <circle
                key={i}
                cx={100 + (i % 10) * 70 + Math.sin(i) * 20}
                cy={30 + Math.floor(i / 10) * 30 + Math.cos(i) * 10}
                r={1.5}
                fill='#4b6bfb'
                opacity={0.3 + Math.random() * 0.4}
              />
            ))}
            {/* Highlighted dot for location */}
            <circle cx='460' cy='60' r='4' fill='#3b82f6' opacity='0.9'>
              <animate attributeName='r' values='4;6;4' dur='2s' repeatCount='indefinite' />
            </circle>
          </svg>
        </div>

        <div className='relative flex items-center gap-4 px-6 py-6'>
          {/* Avatar with upload */}
          <div className='group relative'>
            <Avatar className='h-14 w-14 border-2 border-white/20'>
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={user.name} />
              )}
              <AvatarFallback className='bg-muted text-lg'>{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className='absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'
              disabled={uploading}
            >
              {uploading ? (
                <Icons.spinner className='h-5 w-5 animate-spin text-white' />
              ) : (
                <Pencil className='h-4 w-4 text-white' />
              )}
            </button>
            <input
              ref={fileRef}
              type='file'
              accept='image/jpeg,image/png,image/webp'
              className='hidden'
              onChange={handleAvatarUpload}
            />
          </div>

          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <h1 className='text-lg font-semibold text-white'>{user.name}</h1>
              <Badge className='bg-white/20 text-xs text-white hover:bg-white/30'>
                You
              </Badge>
            </div>
            <div className='mt-1 flex flex-wrap items-center gap-3 text-xs text-white/60'>
              <span className='flex items-center gap-1'>
                <MapPin className='h-3 w-3' />
                {displayLocation}
              </span>
              <span className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {localTime}
              </span>
              <span className='flex items-center gap-1'>
                <Activity className='h-3 w-3 text-green-400' />
                Active in the last hour
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Two columns */}
      <div className='flex flex-1 gap-0'>
        {/* LEFT COLUMN — You */}
        <div className='w-72 shrink-0 space-y-0 overflow-y-auto border-r px-5 py-5'>
          <h2 className='mb-4 text-sm font-semibold'>You</h2>

          {/* Public Profile Card */}
          <div className='rounded-lg border p-4'>
            <div className='mb-3 flex items-center justify-between'>
              <span className='text-xs font-semibold'>Public profile</span>
              <Button
                variant='outline'
                size='sm'
                className='h-6 text-[10px]'
                onClick={() => {
                  if (editMode) handleSaveProfile();
                  else setEditMode(true);
                }}
              >
                {editMode ? 'Save' : 'Edit'}
              </Button>
            </div>

            <div className='space-y-2 text-xs'>
              <div className='flex items-center gap-2'>
                <User className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                {editMode ? (
                  <input
                    className='border-b bg-transparent text-xs outline-none'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <span>{user.name}</span>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <Mail className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                <span className='truncate' title={user.email}>
                  {user.email}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Activity className='h-3.5 w-3.5 text-green-500' />
                <span>Active</span>
              </div>
              <div className='flex items-center gap-2'>
                <MapPin className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                {editMode ? (
                  <input
                    className='border-b bg-transparent text-xs outline-none'
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder='Add location'
                  />
                ) : (
                  <span>{displayLocation}</span>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                <span>{localTime}</span>
              </div>
              <div className='flex items-center gap-2'>
                <UserX className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                <span className='text-muted-foreground'>Alias Off</span>
              </div>

              <Separator className='my-2' />

              <div className='flex items-center gap-2'>
                <Briefcase className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                {editMode ? (
                  <input
                    className='border-b bg-transparent text-xs outline-none'
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder='Add job title'
                  />
                ) : (
                  <span className={jobTitle ? '' : 'text-muted-foreground'}>
                    {jobTitle || 'No job title yet'}
                  </span>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <Building className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                {editMode ? (
                  <input
                    className='border-b bg-transparent text-xs outline-none'
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder='Add department'
                  />
                ) : (
                  <span className={department ? '' : 'text-muted-foreground'}>
                    {department || 'No department yet'}
                  </span>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <Phone className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                {editMode ? (
                  <input
                    className='border-b bg-transparent text-xs outline-none'
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder='Add phone number'
                  />
                ) : (
                  <span className={phoneNumber ? '' : 'text-muted-foreground'}>
                    {phoneNumber || 'No phone number yet'}
                  </span>
                )}
              </div>

              <Separator className='my-2' />

              <div className='flex items-center gap-2'>
                <Quote className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                {editMode ? (
                  <input
                    className='border-b bg-transparent text-xs outline-none'
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder='Introduce yourself'
                  />
                ) : (
                  <span className={bio ? '' : 'text-muted-foreground'}>
                    {bio || 'Introduce yourself'}
                  </span>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <Calendar className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                <span className='text-muted-foreground'>
                  Add a link to your calendar
                </span>
              </div>
            </div>
          </div>

          {/* Your Account Card */}
          <div className='mt-4 rounded-lg border p-4'>
            <h3 className='mb-3 text-xs font-semibold'>Your account</h3>
            <div className='space-y-2 text-xs'>
              <div className='flex items-center gap-2'>
                <Clock className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                <span>
                  created at{' '}
                  <span className='font-medium'>
                    {user.createdAt
                      ? formatDistanceToNow(user.createdAt)
                      : 'Unknown'}
                  </span>
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Mail className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                <span>
                  email{' '}
                  <span className='font-medium'>{user.email}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Team Inboxes Card */}
          <div className='mt-4 rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xs font-semibold'>Team inboxes</h3>
              <Button variant='ghost' size='sm' className='h-5 w-5 p-0'>
                <Pencil className='h-3 w-3' />
              </Button>
            </div>
            <p className='text-muted-foreground mt-2 text-xs'>
              {user.name.split(' ')[0]} is not a member of any team inboxes
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN — Your channels */}
        <div className='flex-1 overflow-y-auto px-6 py-5'>
          <h2 className='mb-4 text-sm font-semibold'>Your channels</h2>

          <div className='space-y-3'>
            <ConversationPlaceholder
              letter='M'
              bg='bg-blue-600'
              label='Messenger'
              snippet='Install Messenger'
              href='/dashboard/settings/channels/messenger'
            />
            <ConversationPlaceholder
              letter='E'
              bg='bg-emerald-600'
              label='Email'
              snippet='Set up email channel'
              href='/dashboard/settings/channels/email'
            />
            <ConversationPlaceholder
              letter='W'
              bg='bg-teal-600'
              label='WhatsApp & Social'
              snippet='Set up WhatsApp or social channels'
              href='/dashboard/settings/channels/whatsapp'
            />
            <ConversationPlaceholder
              letter='P'
              bg='bg-purple-600'
              label='Phone & SMS'
              snippet='Set up phone or SMS'
              href='/dashboard/settings/channels/phone'
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Placeholder card                                                    */
/* ------------------------------------------------------------------ */

const channelRoutes: Record<string, string> = {
  Messenger: '/dashboard/settings/channels/messenger',
  Email: '/dashboard/settings/channels/email',
  'WhatsApp & Social': '/dashboard/settings/channels/whatsapp',
  'Phone & SMS': '/dashboard/settings/channels/phone'
};

function ConversationPlaceholder({
  letter,
  bg,
  label,
  snippet,
  href
}: {
  letter: string;
  bg: string;
  label: string;
  snippet: string;
  href: string;
}) {
  const router = useRouter();
  return (
    <div
      className='cursor-pointer rounded-lg border border-dashed p-4 transition-colors hover:bg-accent/50'
      onClick={() => router.push(href)}
    >
      <div className='flex items-start gap-3'>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${bg}`}
        >
          {letter}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-semibold'>{label}</p>
          <p className='text-muted-foreground mt-1 text-xs'>{snippet}</p>
        </div>
        <Pencil className='text-muted-foreground mt-1 h-4 w-4 shrink-0' />
      </div>
    </div>
  );
}
