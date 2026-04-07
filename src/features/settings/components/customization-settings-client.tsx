'use client';

import { useEffect, useState, useRef } from 'react';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { useTenant } from '@/hooks/use-tenant';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Upload,
  Globe,
  Palette,
  Shield,
  CheckCircle2,
  AlertCircle,
  Copy
} from 'lucide-react';

/* ── Reusable sub-components ── */

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
          <p className='text-muted-foreground text-xs leading-relaxed'>{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
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

/* ── Main component ── */

export default function CustomizationSettingsClient() {
  const { config, loading, saving, save } = useTenantSettings();
  const { tenant } = useTenant();
  const [greeting, setGreeting] = useState('Hi there! How can we help?');
  const [botName, setBotName] = useState('SWEO');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [position, setPosition] = useState<'right' | 'left'>('right');
  const [universalLinks, setUniversalLinks] = useState(true);
  const [customDomain, setCustomDomain] = useState('');
  const [poweredBy, setPoweredBy] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [readReceipts, setReadReceipts] = useState(false);

  // White-label state
  const [whiteLabel, setWhiteLabel] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [brandColorSecondary, setBrandColorSecondary] = useState('#818cf8');
  const [emailSenderName, setEmailSenderName] = useState('');
  const [customCss, setCustomCss] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [emailLogoUrl, setEmailLogoUrl] = useState('');
  const [customDomainVerified, setCustomDomainVerified] = useState(false);
  const [customDomainToken, setCustomDomainToken] = useState('');
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);
  const emailLogoInputRef = useRef<HTMLInputElement | null>(null);

  const isPaidPlan = tenant?.plan === 'growth' || tenant?.plan === 'enterprise';

  useEffect(() => {
    if (!loading && config) {
      setGreeting(config.welcomeMessage ?? 'Hi there! How can we help?');
      setBotName(config.botName ?? 'SWEO');
      setPrimaryColor(config.brandColor ?? '#6366f1');
      setPosition(config.widgetPosition ?? 'right');
      setUniversalLinks(config.universalLinks ?? true);
      setCustomDomain(config.customDomain ?? '');
      setPoweredBy(config.poweredBy ?? true);
      setTypingIndicators(config.typingIndicators ?? true);
      setReadReceipts(config.readReceipts ?? false);

      // White-label fields
      setWhiteLabel(config.whiteLabel ?? false);
      setCompanyName(config.companyName ?? '');
      setSupportEmail(config.supportEmail ?? '');
      setBrandColorSecondary(config.brandColorSecondary ?? '#818cf8');
      setEmailSenderName(config.emailSenderName ?? '');
      setCustomCss(config.customCss ?? '');
      setLogoUrl(config.logoUrl ?? '');
      setFaviconUrl(config.faviconUrl ?? '');
      setEmailLogoUrl(config.emailLogoUrl ?? '');
      setCustomDomainVerified(config.customDomainVerified ?? false);
      setCustomDomainToken(config.customDomainToken ?? '');
    }
  }, [loading, config]);

  const generateDomainToken = () => {
    const token = `sweo-verify-${crypto.randomUUID().slice(0, 12)}`;
    setCustomDomainToken(token);
    toast.success('Verification token generated. Add it as a TXT record.');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSave = () => {
    save(
      {
        welcomeMessage: greeting,
        botName,
        brandColor: primaryColor,
        widgetPosition: position,
        universalLinks,
        customDomain,
        poweredBy,
        typingIndicators,
        readReceipts,
        // White-label fields
        whiteLabel,
        companyName,
        supportEmail,
        brandColorSecondary,
        emailSenderName,
        customCss,
        logoUrl,
        faviconUrl,
        emailLogoUrl,
        customDomainVerified,
        customDomainToken
      },
      'Customization saved'
    );
  };

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='bg-muted/30 flex flex-1 flex-col overflow-hidden rounded-lg shadow-sm'>
      {/* Header bar */}
      <div className='flex items-center justify-between border-b px-6 pt-4 pb-4'>
        <h1 className='text-lg font-semibold'>Brands & Customization</h1>
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
          {/* Messenger Appearance */}
          <SettingsSection
            title='Messenger appearance'
            description='Customize the look of your chat messenger.'
          >
            <div className='space-y-5'>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Bot Name
                </Label>
                <Input
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder='SWEO'
                  className='max-w-sm'
                />
              </div>

              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Welcome Message
                </Label>
                <Textarea
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  rows={3}
                  className='max-w-sm'
                />
              </div>

              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Brand Color
                </Label>
                <div className='flex items-center gap-3'>
                  <input
                    type='color'
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className='h-10 w-10 cursor-pointer rounded border'
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className='w-32'
                  />
                </div>
              </div>

              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Widget Position
                </Label>
                <Select
                  value={position}
                  onValueChange={(v) => setPosition(v as 'right' | 'left')}
                >
                  <SelectTrigger className='max-w-sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='right'>Bottom Right</SelectItem>
                    <SelectItem value='left'>Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Live Preview */}
              <div className='rounded-lg border p-4'>
                <p className='text-muted-foreground mb-3 text-xs font-medium'>
                  Preview
                </p>
                <div className='bg-muted relative h-24 rounded-lg'>
                  <div
                    className={`absolute bottom-4 ${position === 'right' ? 'right-4' : 'left-4'} flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg`}
                    style={{ backgroundColor: primaryColor }}
                  >
                    <svg
                      className='h-6 w-6'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z' />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>

          <Separator />

          {/* Message Settings */}
          <SettingsSection
            title='Message settings'
            description='Control messaging behavior in the chat widget.'
          >
            <div className='space-y-4'>
              <ToggleRow
                label='Show "Powered by" badge'
                description='Display branding in the messenger'
                checked={poweredBy}
                onCheckedChange={setPoweredBy}
              />
              <ToggleRow
                label='Typing indicators'
                description='Show when AI or agents are typing'
                checked={typingIndicators}
                onCheckedChange={setTypingIndicators}
              />
              <ToggleRow
                label='Read receipts'
                description='Show when messages have been read'
                checked={readReceipts}
                onCheckedChange={setReadReceipts}
              />
            </div>
          </SettingsSection>

          <Separator />

          {/* Domain Management */}
          <SettingsSection
            title='Domain management'
            description='Configure a custom domain for your help center.'
          >
            <div className='space-y-4'>
              <ToggleRow
                label='Universal Linking'
                description='Auto-link knowledge articles in responses'
                checked={universalLinks}
                onCheckedChange={setUniversalLinks}
              />
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Custom Domain
                </Label>
                <Input
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder='help.yourcompany.com'
                  className='max-w-sm'
                />
                <p className='text-muted-foreground mt-1 text-xs'>
                  Point a CNAME record to support.yourdomain.com
                </p>
              </div>

              {/* DNS Verification */}
              {customDomain && (
                <div className='rounded-lg border p-4 space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Globe className='text-muted-foreground h-4 w-4' />
                    <span className='text-sm font-medium'>DNS Verification</span>
                    {customDomainVerified ? (
                      <Badge variant='default' className='bg-green-600 text-xs'>
                        <CheckCircle2 className='mr-1 h-3 w-3' /> Verified
                      </Badge>
                    ) : (
                      <Badge variant='secondary' className='text-xs'>
                        <AlertCircle className='mr-1 h-3 w-3' /> Pending
                      </Badge>
                    )}
                  </div>

                  {!customDomainToken && (
                    <Button variant='outline' size='sm' onClick={generateDomainToken}>
                      Generate Verification Token
                    </Button>
                  )}

                  {customDomainToken && (
                    <div className='space-y-2'>
                      <p className='text-muted-foreground text-xs'>
                        Add this TXT record to your DNS:
                      </p>
                      <div className='bg-muted flex items-center gap-2 rounded-md px-3 py-2'>
                        <code className='flex-1 text-xs'>{customDomainToken}</code>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0'
                          onClick={() => copyToClipboard(customDomainToken)}
                        >
                          <Copy className='h-3 w-3' />
                        </Button>
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        Also add a CNAME record: <code>{customDomain}</code> → <code>cname.sweo.se</code>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </SettingsSection>

          <Separator />

          {/* White-label Branding */}
          <SettingsSection
            title='White-label branding'
            description='Customize branding for a fully white-labeled experience.'
          >
            <div className='space-y-5'>
              <ToggleRow
                label='Enable white-label mode'
                description='Remove all SWEO branding and use your own'
                checked={whiteLabel}
                onCheckedChange={setWhiteLabel}
              />

              {whiteLabel && (
                <>
                  <div>
                    <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                      Company Name
                    </Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder='Your Company'
                      className='max-w-sm'
                    />
                  </div>

                  <div>
                    <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                      Support Email
                    </Label>
                    <Input
                      type='email'
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder='support@yourcompany.com'
                      className='max-w-sm'
                    />
                  </div>

                  <div>
                    <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                      Company Logo
                    </Label>
                    <div className='flex items-center gap-4'>
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt='Logo'
                          className='h-12 w-12 rounded-lg border object-contain p-1'
                        />
                      ) : (
                        <div className='bg-muted flex h-12 w-12 items-center justify-center rounded-lg border'>
                          <Upload className='text-muted-foreground h-5 w-5' />
                        </div>
                      )}
                      <div>
                        <input
                          ref={logoInputRef}
                          type='file'
                          accept='image/*'
                          className='hidden'
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setLogoUrl(ev.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => logoInputRef.current?.click()}
                        >
                          <Upload className='mr-2 h-3 w-3' /> Upload Logo
                        </Button>
                        <p className='text-muted-foreground mt-1 text-xs'>
                          Recommended: 200×200px, PNG or SVG
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                      Favicon
                    </Label>
                    <div className='flex items-center gap-4'>
                      {faviconUrl ? (
                        <img
                          src={faviconUrl}
                          alt='Favicon'
                          className='h-8 w-8 rounded border object-contain'
                        />
                      ) : (
                        <div className='bg-muted flex h-8 w-8 items-center justify-center rounded border'>
                          <Globe className='text-muted-foreground h-4 w-4' />
                        </div>
                      )}
                      <div>
                        <input
                          ref={faviconInputRef}
                          type='file'
                          accept='image/png,image/x-icon,image/svg+xml'
                          className='hidden'
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setFaviconUrl(ev.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => faviconInputRef.current?.click()}
                        >
                          <Upload className='mr-2 h-3 w-3' /> Upload Favicon
                        </Button>
                        <p className='text-muted-foreground mt-1 text-xs'>
                          32×32px ICO, PNG, or SVG
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                      Secondary Brand Color
                    </Label>
                    <div className='flex items-center gap-3'>
                      <input
                        type='color'
                        value={brandColorSecondary}
                        onChange={(e) => setBrandColorSecondary(e.target.value)}
                        className='h-10 w-10 cursor-pointer rounded border'
                      />
                      <Input
                        value={brandColorSecondary}
                        onChange={(e) => setBrandColorSecondary(e.target.value)}
                        className='w-32'
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </SettingsSection>

          <Separator />

          {/* Email Branding */}
          <SettingsSection
            title='Email branding'
            description='Customize outgoing email appearance.'
          >
            <div className='space-y-5'>
              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Email Sender Name
                </Label>
                <Input
                  value={emailSenderName}
                  onChange={(e) => setEmailSenderName(e.target.value)}
                  placeholder={companyName || 'Your Company'}
                  className='max-w-sm'
                />
                <p className='text-muted-foreground mt-1 text-xs'>
                  Name shown in the &quot;From&quot; field of emails
                </p>
              </div>

              <div>
                <Label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
                  Email Logo
                </Label>
                <div className='flex items-center gap-4'>
                  {emailLogoUrl ? (
                    <img
                      src={emailLogoUrl}
                      alt='Email Logo'
                      className='h-10 w-auto max-w-[200px] rounded border object-contain p-1'
                    />
                  ) : (
                    <div className='bg-muted flex h-10 w-24 items-center justify-center rounded border'>
                      <Palette className='text-muted-foreground h-4 w-4' />
                    </div>
                  )}
                  <div>
                    <input
                      ref={emailLogoInputRef}
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setEmailLogoUrl(ev.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => emailLogoInputRef.current?.click()}
                    >
                      <Upload className='mr-2 h-3 w-3' /> Upload Email Logo
                    </Button>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      Wide format, max 600px width recommended
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Preview */}
              <div className='rounded-lg border p-4'>
                <p className='text-muted-foreground mb-3 text-xs font-medium'>
                  Email Preview
                </p>
                <div className='bg-background rounded-lg border p-4'>
                  <div className='mb-3 border-b pb-3'>
                    {emailLogoUrl ? (
                      <img
                        src={emailLogoUrl}
                        alt='Preview'
                        className='h-8 w-auto'
                      />
                    ) : (
                      <p className='text-sm font-semibold' style={{ color: primaryColor }}>
                        {companyName || botName}
                      </p>
                    )}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    From: {emailSenderName || companyName || 'Support'} &lt;{supportEmail || 'noreply@sweo.se'}&gt;
                  </p>
                </div>
              </div>
            </div>
          </SettingsSection>

          <Separator />

          {/* Custom CSS */}
          <SettingsSection
            title='Custom CSS'
            description='Inject custom CSS into the chat widget for advanced styling.'
          >
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Shield className='text-muted-foreground h-4 w-4' />
                <p className='text-muted-foreground text-xs'>
                  CSS is sandboxed to the widget iframe for security
                </p>
              </div>
              <Textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                rows={6}
                placeholder={`.fin-widget-header {\n  background: #1a1a2e;\n}\n.fin-message-bubble {\n  border-radius: 12px;\n}`}
                className='font-mono text-xs'
              />
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
