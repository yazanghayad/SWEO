'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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

interface Language {
  code: string;
  name: string;
  enabled: boolean;
  isDefault: boolean;
}

const defaultLanguages: Language[] = [
  { code: 'en', name: 'English', enabled: true, isDefault: true },
  { code: 'sv', name: 'Swedish', enabled: true, isDefault: false },
  { code: 'de', name: 'German', enabled: false, isDefault: false },
  { code: 'fr', name: 'French', enabled: false, isDefault: false },
  { code: 'es', name: 'Spanish', enabled: false, isDefault: false },
  { code: 'pt', name: 'Portuguese', enabled: false, isDefault: false },
  { code: 'nl', name: 'Dutch', enabled: false, isDefault: false },
  { code: 'da', name: 'Danish', enabled: false, isDefault: false },
  { code: 'no', name: 'Norwegian', enabled: false, isDefault: false },
  { code: 'fi', name: 'Finnish', enabled: false, isDefault: false },
  { code: 'ja', name: 'Japanese', enabled: false, isDefault: false },
  { code: 'zh', name: 'Chinese', enabled: false, isDefault: false },
  { code: 'ko', name: 'Korean', enabled: false, isDefault: false },
  { code: 'ar', name: 'Arabic', enabled: false, isDefault: false },
  { code: 'it', name: 'Italian', enabled: false, isDefault: false },
  { code: 'pl', name: 'Polish', enabled: false, isDefault: false }
];

export default function MultilingualClient() {
  const { config, loading, saving, save } = useTenantSettings();
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [detectLanguage, setDetectLanguage] = useState(true);
  const [languages, setLanguages] = useState<Language[]>(defaultLanguages);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!config) return;
    setAutoTranslate(config.autoTranslate ?? true);
    setDetectLanguage(config.detectLanguage ?? true);
    setLanguages(config.languages ?? defaultLanguages);
  }, [config]);

  function handleSave() {
    save(
      { autoTranslate, detectLanguage, languages },
      'Language settings saved'
    );
  }

  function toggleLanguage(code: string) {
    setLanguages((prev) =>
      prev.map((l) =>
        l.code === code && !l.isDefault ? { ...l, enabled: !l.enabled } : l
      )
    );
  }

  function setDefault(code: string) {
    setLanguages((prev) =>
      prev.map((l) => ({
        ...l,
        isDefault: l.code === code,
        enabled: l.code === code ? true : l.enabled
      }))
    );
  }

  const filtered = languages.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const enabledCount = languages.filter((l) => l.enabled).length;

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
        <div className='flex items-center gap-2'>
          <h1 className='text-lg font-semibold'>Multilingual</h1>
          <Badge variant='secondary' className='text-xs'>
            {enabledCount} active
          </Badge>
        </div>
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
          {/* Auto-translate */}
          <SettingsSection
            title="Automatic translation"
            description="Automatically translate AI responses and help articles to the customer's language."
          >
            <div className='space-y-4'>
              <ToggleRow
                checked={autoTranslate}
                onCheckedChange={setAutoTranslate}
                label="Enable automatic translation"
                description="AI responses will be translated to the detected customer language."
              />
              <ToggleRow
                checked={detectLanguage}
                onCheckedChange={setDetectLanguage}
                label="Auto-detect customer language"
                description="Automatically detect the language of incoming messages."
              />
            </div>
          </SettingsSection>

          <Separator />

          {/* Languages list */}
          <SettingsSection
            title='Supported languages'
            description="Enable the languages you want to support. The default language will be used when the customer's language cannot be detected."
          >
            <div className='space-y-3'>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search languages...'
                className='max-w-sm'
              />
              <div className='space-y-1'>
                {filtered.map((lang) => (
                  <div
                    key={lang.code}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div className='flex items-center gap-3'>
                      <Switch
                        checked={lang.enabled}
                        onCheckedChange={() => toggleLanguage(lang.code)}
                        disabled={lang.isDefault}
                      />
                      <span className='text-sm font-medium'>{lang.name}</span>
                      <span className='text-muted-foreground text-xs'>
                        ({lang.code})
                      </span>
                      {lang.isDefault && (
                        <Badge
                          variant='outline'
                          className='text-xs text-green-600 dark:text-green-400'
                        >
                          Default
                        </Badge>
                      )}
                    </div>
                    {!lang.isDefault && lang.enabled && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-xs'
                        onClick={() => setDefault(lang.code)}
                      >
                        Set as default
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
