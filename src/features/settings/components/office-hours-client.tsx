'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Icons } from '@/components/icons';

/* ── Sub-components ── */

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

function ToggleRow({
  checked,
  onCheckedChange,
  label,
  description
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className='flex items-center justify-between py-1'>
      <div>
        <p className='text-sm'>{label}</p>
        {description && (
          <p className='text-muted-foreground text-xs'>{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

const defaultSchedule: Record<string, DaySchedule> = {
  Monday: { enabled: true, start: '09:00', end: '17:00' },
  Tuesday: { enabled: true, start: '09:00', end: '17:00' },
  Wednesday: { enabled: true, start: '09:00', end: '17:00' },
  Thursday: { enabled: true, start: '09:00', end: '17:00' },
  Friday: { enabled: true, start: '09:00', end: '17:00' },
  Saturday: { enabled: false, start: '10:00', end: '14:00' },
  Sunday: { enabled: false, start: '10:00', end: '14:00' }
};

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
    .toString()
    .padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

export default function OfficeHoursClient() {
  const { config, loading, saving, save } = useTenantSettings();
  const [officeHoursEnabled, setOfficeHoursEnabled] = useState(true);
  const [schedule, setSchedule] =
    useState<Record<string, DaySchedule>>(defaultSchedule);
  const [autoReply, setAutoReply] = useState(true);
  const [timezone, setTimezone] = useState('Europe/Stockholm');

  useEffect(() => {
    if (!config) return;
    setOfficeHoursEnabled(config.officeHoursEnabled ?? true);
    setSchedule(config.officeHoursSchedule ?? defaultSchedule);
    setAutoReply(config.officeHoursAutoReply ?? true);
    setTimezone(config.timezone ?? 'Europe/Stockholm');
  }, [config]);

  function handleSave() {
    save(
      {
        officeHoursEnabled,
        officeHoursSchedule: schedule,
        officeHoursAutoReply: autoReply,
        timezone
      },
      'Office hours saved'
    );
  }

  function toggleDay(day: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  }

  function updateTime(day: string, field: 'start' | 'end', value: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  }

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
        <h1 className='text-lg font-semibold'>Office hours</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          size='sm'
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Content */}
      <div className='overflow-auto p-6'>
        <div className='max-w-3xl space-y-0'>
          {/* Enable */}
          <SettingsSection
            title='Office hours'
            description='Set the hours when your team is available to respond. Outside of these hours, customers will see an out-of-office message.'
          >
            <ToggleRow
              checked={officeHoursEnabled}
              onCheckedChange={setOfficeHoursEnabled}
              label='Enable office hours'
            />
          </SettingsSection>

          <Separator />

          {/* Timezone */}
          <SettingsSection
            title='Timezone'
            description='All office hours will be based on this timezone.'
          >
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className='max-w-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='UTC'>UTC</SelectItem>
                <SelectItem value='Europe/Stockholm'>
                  Europe/Stockholm
                </SelectItem>
                <SelectItem value='Europe/London'>Europe/London</SelectItem>
                <SelectItem value='Europe/Berlin'>Europe/Berlin</SelectItem>
                <SelectItem value='America/New_York'>
                  America/New_York
                </SelectItem>
                <SelectItem value='America/Los_Angeles'>
                  America/Los_Angeles
                </SelectItem>
                <SelectItem value='Asia/Tokyo'>Asia/Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </SettingsSection>

          <Separator />

          {/* Schedule */}
          <SettingsSection
            title='Weekly schedule'
            description='Configure availability for each day of the week.'
          >
            <div className='space-y-2'>
              {DAYS.map((day) => {
                const daySchedule = schedule[day];
                return (
                  <div
                    key={day}
                    className='flex items-center gap-4 rounded-lg border p-3'
                  >
                    <Switch
                      checked={daySchedule.enabled}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    <span className='w-28 text-sm font-medium'>{day}</span>
                    {daySchedule.enabled ? (
                      <div className='flex items-center gap-2'>
                        <Select
                          value={daySchedule.start}
                          onValueChange={(v) => updateTime(day, 'start', v)}
                        >
                          <SelectTrigger className='w-24'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className='text-muted-foreground text-xs'>
                          to
                        </span>
                        <Select
                          value={daySchedule.end}
                          onValueChange={(v) => updateTime(day, 'end', v)}
                        >
                          <SelectTrigger className='w-24'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <Badge variant='secondary' className='text-xs'>
                        Closed
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </SettingsSection>

          <Separator />

          {/* Auto-reply */}
          <SettingsSection
            title='Out-of-office auto-reply'
            description='Automatically respond to customers when your team is unavailable.'
          >
            <ToggleRow
              checked={autoReply}
              onCheckedChange={setAutoReply}
              label='Send auto-reply outside office hours'
              description='Customers will receive a message explaining when the team will be available.'
            />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
