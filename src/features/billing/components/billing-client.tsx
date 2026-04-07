'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Building2,
  Check,
  CreditCard,
  FileText,
  Landmark,
  Mail,
  Pencil,
  Receipt,
  Save,
  Smartphone,
  Wallet
} from 'lucide-react';
import {
  getBillingDataAction,
  saveBillingAddressAction,
  savePaymentMethodsAction,
  createCheckoutAction,
  createPortalAction,
  type BillingAddress,
  type SavedPaymentMethod,
  type BillingData
} from '@/features/billing/actions/billing-actions';

// ── Types ──────────────────────────────────────────────────

type PaymentMethod = 'e-invoice' | 'gdu' | 'letter' | 'card' | 'bank-transfer';

// ── Helpers ────────────────────────────────────────────────

const paymentMethodInfo: Record<
  PaymentMethod,
  { icon: typeof CreditCard; label: string; desc: string }
> = {
  'e-invoice': {
    icon: Smartphone,
    label: 'E-faktura',
    desc: 'Elektronisk faktura via Peppol / GLN-nummer'
  },
  gdu: {
    icon: Landmark,
    label: 'GDU (Godkänd för direktupphandling)',
    desc: 'Fakturering via statlig myndighet eller kommun'
  },
  letter: {
    icon: Mail,
    label: 'Brevfaktura',
    desc: 'Pappersfaktura skickas per post'
  },
  card: {
    icon: CreditCard,
    label: 'Kort',
    desc: 'Visa, Mastercard eller American Express'
  },
  'bank-transfer': {
    icon: Landmark,
    label: 'Bankgiro / Plusgiro',
    desc: 'Direktbetalning via bank'
  }
};

const emptyAddress: BillingAddress = {
  companyName: '',
  orgNumber: '',
  vatNumber: '',
  street: '',
  postalCode: '',
  city: '',
  country: 'Sverige',
  reference: '',
  email: ''
};

// ── Billing Address Card ───────────────────────────────────

function BillingAddressCard({
  address: initialAddress,
  tenantName
}: {
  address: BillingAddress | null;
  tenantName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState<BillingAddress>(
    initialAddress ?? { ...emptyAddress, companyName: tenantName }
  );
  const [draft, setDraft] = useState<BillingAddress>(
    initialAddress ?? { ...emptyAddress, companyName: tenantName }
  );

  const hasAddress = address.companyName.trim() !== '';

  const handleSave = async () => {
    setSaving(true);
    const result = await saveBillingAddressAction(draft);
    setSaving(false);
    if (result.success) {
      setAddress(draft);
      setEditing(false);
      toast.success('Fakturaadress uppdaterad');
    } else {
      toast.error(result.error ?? 'Kunde inte spara adressen');
    }
  };

  const handleCancel = () => {
    setDraft(address);
    setEditing(false);
  };

  const updateDraft = (field: keyof BillingAddress, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Building2 className='h-4 w-4' />
            <CardTitle className='text-base'>Fakturaadress</CardTitle>
          </div>
          {!editing && (
            <Button
              variant='ghost'
              size='sm'
              className='h-7 text-xs'
              onClick={() => setEditing(true)}
            >
              <Pencil className='mr-1 h-3 w-3' />
              {hasAddress ? 'Ändra' : 'Lägg till'}
            </Button>
          )}
        </div>
        <CardDescription>
          Adressen som visas på alla utgående fakturor
        </CardDescription>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className='grid grid-cols-2 gap-x-4 gap-y-3'>
            <div className='col-span-2 space-y-1.5'>
              <Label className='text-xs'>Företagsnamn</Label>
              <Input
                value={draft.companyName}
                onChange={(e) => updateDraft('companyName', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Organisationsnummer</Label>
              <Input
                value={draft.orgNumber}
                onChange={(e) => updateDraft('orgNumber', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>VAT-nummer</Label>
              <Input
                value={draft.vatNumber}
                onChange={(e) => updateDraft('vatNumber', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='col-span-2 space-y-1.5'>
              <Label className='text-xs'>Gatuadress</Label>
              <Input
                value={draft.street}
                onChange={(e) => updateDraft('street', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Postnummer</Label>
              <Input
                value={draft.postalCode}
                onChange={(e) => updateDraft('postalCode', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Stad</Label>
              <Input
                value={draft.city}
                onChange={(e) => updateDraft('city', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Land</Label>
              <Input
                value={draft.country}
                onChange={(e) => updateDraft('country', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Referens</Label>
              <Input
                value={draft.reference}
                onChange={(e) => updateDraft('reference', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='col-span-2 space-y-1.5'>
              <Label className='text-xs'>Faktura-email</Label>
              <Input
                type='email'
                value={draft.email}
                onChange={(e) => updateDraft('email', e.target.value)}
                className='h-8 text-sm'
              />
            </div>
          </div>
        ) : hasAddress ? (
          <div className='grid grid-cols-2 gap-x-6 gap-y-2.5'>
            <InfoRow label='Företagsnamn' value={address.companyName} />
            <InfoRow label='Org.nr' value={address.orgNumber || '–'} />
            <InfoRow label='VAT-nummer' value={address.vatNumber || '–'} />
            <InfoRow label='Referens' value={address.reference || '–'} />
            <InfoRow label='Gatuadress' value={address.street || '–'} />
            <InfoRow
              label='Postnummer & Stad'
              value={
                address.postalCode || address.city
                  ? `${address.postalCode} ${address.city}`.trim()
                  : '–'
              }
            />
            <InfoRow label='Land' value={address.country || '–'} />
            <InfoRow label='Faktura-email' value={address.email || '–'} />
          </div>
        ) : (
          <div className='text-muted-foreground flex flex-col items-center gap-2 py-8 text-center text-sm'>
            <Building2 className='h-8 w-8 opacity-20' />
            <p>Ingen fakturaadress tillagd</p>
            <p className='text-xs'>
              Lägg till er företagsinformation för att kunna ta emot fakturor
            </p>
            <Button
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={() => setEditing(true)}
            >
              Lägg till adress
            </Button>
          </div>
        )}
      </CardContent>
      {editing && (
        <CardFooter className='flex justify-end gap-2 border-t pt-4'>
          <Button variant='outline' size='sm' onClick={handleCancel}>
            Avbryt
          </Button>
          <Button size='sm' onClick={handleSave} disabled={saving}>
            {saving ? (
              <Icons.spinner className='mr-1.5 h-3.5 w-3.5 animate-spin' />
            ) : (
              <Save className='mr-1.5 h-3.5 w-3.5' />
            )}
            Spara adress
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
        {label}
      </p>
      <p className='text-sm'>{value}</p>
    </div>
  );
}

// ── Payment Methods Card ───────────────────────────────────

function PaymentMethodsCard({
  methods: initialMethods,
  address
}: {
  methods: SavedPaymentMethod[];
  address: BillingAddress | null;
}) {
  const [methods, setMethods] = useState<SavedPaymentMethod[]>(initialMethods);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newType, setNewType] = useState<PaymentMethod>('e-invoice');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardName, setCardName] = useState('');
  const [glnNumber, setGlnNumber] = useState('');
  const [bankgiro, setBankgiro] = useState('');

  const persistMethods = useCallback(async (updated: SavedPaymentMethod[]) => {
    setSaving(true);
    const result = await savePaymentMethodsAction(updated);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error ?? 'Kunde inte spara betalningsmetoder');
    }
  }, []);

  const setDefault = async (id: string) => {
    const updated = methods.map((m) => ({
      ...m,
      isDefault: m.id === id
    }));
    setMethods(updated);
    await persistMethods(updated);
    toast.success('Standardbetalningsmetod uppdaterad');
  };

  const removeMethod = async (id: string) => {
    const method = methods.find((m) => m.id === id);
    if (method?.isDefault) {
      toast.error('Du kan inte ta bort din standardbetalningsmetod');
      return;
    }
    const updated = methods.filter((m) => m.id !== id);
    setMethods(updated);
    await persistMethods(updated);
    toast.success('Betalningsmetod borttagen');
  };

  const addMethod = async () => {
    const info = paymentMethodInfo[newType];
    const companyName = address?.companyName ?? '';
    let details = '';
    switch (newType) {
      case 'card':
        details = `****${cardNumber.slice(-4)} — ${cardName}`;
        break;
      case 'e-invoice':
        details = `GLN: ${glnNumber} — ${companyName}`;
        break;
      case 'gdu':
        details = `Myndighet — ${companyName}`;
        break;
      case 'bank-transfer':
        details = `Bankgiro: ${bankgiro}`;
        break;
      case 'letter':
        details = address
          ? `${address.street}, ${address.postalCode} ${address.city}`
          : 'Brevfaktura';
        break;
    }
    const updated = [
      ...methods,
      {
        id: String(Date.now()),
        type: newType,
        label: info.label,
        details,
        isDefault: methods.length === 0,
        addedDate: new Date().toISOString().slice(0, 10)
      }
    ];
    setMethods(updated);
    await persistMethods(updated);
    toast.success(`${info.label} tillagd`);
    setAddOpen(false);
    setCardNumber('');
    setCardExpiry('');
    setCardName('');
    setGlnNumber('');
    setBankgiro('');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Wallet className='h-4 w-4' />
              <CardTitle className='text-base'>Betalningssätt</CardTitle>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='h-7 text-xs'
              onClick={() => setAddOpen(true)}
            >
              <CreditCard className='mr-1 h-3 w-3' />
              Lägg till
            </Button>
          </div>
          <CardDescription>
            Hantera hur du vill ta emot och betala fakturor
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {methods.map((method) => {
            const info = paymentMethodInfo[method.type as PaymentMethod];
            if (!info) return null;
            const Icon = info.icon;
            return (
              <div
                key={method.id}
                className={cn(
                  'flex items-center gap-4 rounded-lg border p-3.5 transition-colors',
                  method.isDefault && 'border-primary/50 bg-primary/5'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    method.isDefault
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className='h-5 w-5' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium'>{method.label}</p>
                    {method.isDefault && (
                      <Badge
                        variant='default'
                        className='h-4 px-1.5 text-[9px]'
                      >
                        Standard
                      </Badge>
                    )}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {method.details}
                  </p>
                </div>
                <div className='flex items-center gap-1'>
                  {!method.isDefault && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 text-[11px]'
                      onClick={() => setDefault(method.id)}
                      disabled={saving}
                    >
                      Gör standard
                    </Button>
                  )}
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 px-2 text-red-500 hover:text-red-600'
                    onClick={() => removeMethod(method.id)}
                    disabled={saving}
                  >
                    Ta bort
                  </Button>
                </div>
              </div>
            );
          })}
          {methods.length === 0 && (
            <div className='text-muted-foreground flex flex-col items-center gap-2 py-8 text-center text-sm'>
              <Wallet className='h-8 w-8 opacity-20' />
              <p>Inga betalningsmetoder tillagda</p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setAddOpen(true)}
              >
                Lägg till betalningssätt
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Method Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Lägg till betalningssätt</DialogTitle>
            <DialogDescription>
              Välj hur du vill ta emot fakturor och betala
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-xs font-medium'>Typ av betalning</Label>
              <div className='grid grid-cols-1 gap-2'>
                {(
                  Object.entries(paymentMethodInfo) as [
                    PaymentMethod,
                    (typeof paymentMethodInfo)[PaymentMethod]
                  ][]
                ).map(([key, info]) => {
                  const Icon = info.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setNewType(key)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-3 text-left transition-all',
                        newType === key
                          ? 'border-primary bg-primary/5 ring-primary/20 ring-1'
                          : 'hover:bg-accent/50'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-md',
                          newType === key
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Icon className='h-4 w-4' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>{info.label}</p>
                        <p className='text-muted-foreground text-xs'>
                          {info.desc}
                        </p>
                      </div>
                      {newType === key && (
                        <Check className='text-primary h-4 w-4 shrink-0' />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Conditional fields based on type */}
            {newType === 'card' && (
              <div className='space-y-3'>
                <div className='space-y-1.5'>
                  <Label className='text-xs'>Kortnummer</Label>
                  <Input
                    placeholder='1234 5678 9012 3456'
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className='h-8 text-sm'
                    maxLength={19}
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label className='text-xs'>Utgångsdatum</Label>
                    <Input
                      placeholder='MM/ÅÅ'
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className='h-8 text-sm'
                      maxLength={5}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label className='text-xs'>CVC</Label>
                    <Input
                      placeholder='123'
                      className='h-8 text-sm'
                      maxLength={4}
                      type='password'
                    />
                  </div>
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs'>Namn på kort</Label>
                  <Input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className='h-8 text-sm'
                  />
                </div>
              </div>
            )}

            {newType === 'e-invoice' && (
              <div className='space-y-3'>
                <div className='space-y-1.5'>
                  <Label className='text-xs'>GLN-nummer (Peppol)</Label>
                  <Input
                    placeholder='7312345678901'
                    value={glnNumber}
                    onChange={(e) => setGlnNumber(e.target.value)}
                    className='h-8 text-sm'
                    maxLength={13}
                  />
                </div>
                <p className='text-muted-foreground text-[11px]'>
                  E-fakturor skickas via Peppol-nätverket till ert
                  faktureringssystem. Kontakta ert bokföringssystem om ni inte
                  har ett GLN-nummer.
                </p>
              </div>
            )}

            {newType === 'gdu' && (
              <div className='space-y-3'>
                <p className='text-muted-foreground text-xs'>
                  GDU-fakturering kräver att er organisation är registrerad som
                  statlig myndighet eller kommun. Fakturorna skickas med
                  referensnummer till er organisation.
                </p>
                <div className='space-y-1.5'>
                  <Label className='text-xs'>Myndighetskod</Label>
                  <Input
                    placeholder='T.ex. 202100-1111'
                    className='h-8 text-sm'
                  />
                </div>
              </div>
            )}

            {newType === 'bank-transfer' && (
              <div className='space-y-3'>
                <div className='space-y-1.5'>
                  <Label className='text-xs'>Bankgiro / Plusgiro</Label>
                  <Input
                    placeholder='123-4567'
                    value={bankgiro}
                    onChange={(e) => setBankgiro(e.target.value)}
                    className='h-8 text-sm'
                  />
                </div>
              </div>
            )}

            {newType === 'letter' && (
              <div className='space-y-3'>
                <p className='text-muted-foreground text-xs'>
                  Brevfakturan skickas till er registrerade fakturaadress.
                  Kontrollera att adressen är uppdaterad innan ni lägger till
                  detta betalningssätt.
                </p>
                {address && address.street ? (
                  <div className='bg-muted/50 rounded-md p-3'>
                    <p className='text-xs font-medium'>
                      {address.companyName}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {address.street}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {address.postalCode} {address.city}
                    </p>
                  </div>
                ) : (
                  <p className='text-muted-foreground text-xs italic'>
                    Ingen fakturaadress har lagts till ännu. Lägg till en adress
                    först under Fakturaadress-sektionen.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setAddOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={addMethod} disabled={saving}>
              {saving ? (
                <Icons.spinner className='mr-1.5 h-3.5 w-3.5 animate-spin' />
              ) : (
                <Check className='mr-1.5 h-3.5 w-3.5' />
              )}
              Lägg till
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Invoice History Card (empty state – no payment provider) ─

function InvoiceHistory() {
  const [portalLoading, setPortalLoading] = useState(false);

  async function openPortal() {
    setPortalLoading(true);
    const res = await createPortalAction();
    setPortalLoading(false);
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      toast.error(res.error ?? 'Kunde inte öppna fakturaportal');
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Receipt className='h-4 w-4' />
            <CardTitle className='text-base'>Fakturor</CardTitle>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={openPortal}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <Icons.spinner className='mr-2 h-3 w-3 animate-spin' />
            ) : (
              <FileText className='mr-2 h-3 w-3' />
            )}
            Öppna Stripe-portal
          </Button>
        </div>
        <CardDescription>
          Hantera fakturor, betalningsmetoder och prenumeration via Stripe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm'>
          <FileText className='h-10 w-10 opacity-20' />
          <p className='font-medium'>Fakturor hanteras via Stripe</p>
          <p className='text-muted-foreground max-w-sm text-xs'>
            Klicka på &quot;Öppna Stripe-portal&quot; för att se fakturor, uppdatera
            betalningsmetod eller hantera din prenumeration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Plan Upgrade Card ──────────────────────────────────────

function PlanUpgradeCard({ currentPlan }: { currentPlan: string }) {
  const [upgrading, setUpgrading] = useState<string | null>(null);

  async function handleUpgrade(plan: 'growth' | 'enterprise') {
    setUpgrading(plan);
    const res = await createCheckoutAction(plan);
    setUpgrading(null);
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      toast.error(res.error ?? 'Kunde inte starta betalning');
    }
  }

  async function handleManage() {
    setUpgrading('portal');
    const res = await createPortalAction();
    setUpgrading(null);
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      toast.error(res.error ?? 'Kunde inte öppna kundportal');
    }
  }

  const plans = [
    {
      id: 'growth' as const,
      name: 'Growth',
      price: '990 kr',
      period: '/månad',
      features: [
        'Obegränsade konversationer',
        'Alla kanaler',
        '10 teammedlemmar',
        'Knowledge base',
        'Procedures'
      ]
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      price: '2 990 kr',
      period: '/månad',
      features: [
        'Allt i Growth',
        'Obegränsade teammedlemmar',
        'Custom-integrationer',
        'SLA-support',
        'SOC2-compliance'
      ]
    }
  ];

  // If already on a paid plan, show manage button
  if (currentPlan !== 'trial') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Prenumeration</CardTitle>
          <CardDescription>
            Du har en aktiv {currentPlan === 'growth' ? 'Growth' : 'Enterprise'}-plan
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant='outline'
            onClick={handleManage}
            disabled={upgrading === 'portal'}
          >
            {upgrading === 'portal' ? (
              <Icons.spinner className='mr-2 h-3 w-3 animate-spin' />
            ) : (
              <CreditCard className='mr-2 h-3 w-3' />
            )}
            Hantera prenumeration
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Uppgradera din plan</CardTitle>
        <CardDescription>
          Du använder testperioden. Uppgradera för full funktionalitet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4 md:grid-cols-2'>
          {plans.map((p) => (
            <div
              key={p.id}
              className='flex flex-col rounded-lg border p-4'
            >
              <h3 className='text-base font-semibold'>{p.name}</h3>
              <div className='mt-1 flex items-baseline gap-1'>
                <span className='text-2xl font-bold'>{p.price}</span>
                <span className='text-muted-foreground text-sm'>
                  {p.period}
                </span>
              </div>
              <ul className='mt-3 flex-1 space-y-1.5 text-sm'>
                {p.features.map((f) => (
                  <li key={f} className='flex items-center gap-2'>
                    <Check className='h-3.5 w-3.5 text-green-500' />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className='mt-4'
                variant={p.id === 'growth' ? 'default' : 'outline'}
                disabled={upgrading !== null}
                onClick={() => handleUpgrade(p.id)}
              >
                {upgrading === p.id ? (
                  <Icons.spinner className='mr-2 h-3 w-3 animate-spin' />
                ) : null}
                Välj {p.name}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main ───────────────────────────────────────────────────

export default function BillingClient() {
  const { loading: tenantLoading } = useTenant();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantLoading) return;
    async function load() {
      const result = await getBillingDataAction();
      if (result.success && result.data) {
        setBillingData(result.data);
      }
      setLoading(false);
    }
    load();
  }, [tenantLoading]);

  if (tenantLoading || loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Icons.spinner className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  const address = billingData?.address ?? null;
  const methods = billingData?.paymentMethods ?? [];
  const plan = billingData?.plan ?? 'trial';
  const tenantName = billingData?.tenantName ?? '';
  const defaultMethod = methods.find((m) => m.isDefault);

  const planLabel: Record<string, string> = {
    trial: 'Testperiod',
    growth: 'Growth',
    enterprise: 'Enterprise'
  };

  return (
    <div className='bg-muted/30 flex flex-1 flex-col overflow-hidden rounded-lg shadow-sm'>
      {/* Fixed header */}
      <div className='flex items-center justify-between border-b px-6 pt-4 pb-4'>
        <div>
          <h1 className='text-lg font-semibold'>Fakturering</h1>
          <p className='text-muted-foreground text-xs'>
            Hantera fakturaadress, betalningssätt och tidigare fakturor
          </p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className='overflow-auto p-6'>
        <div className='max-w-5xl space-y-6'>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview' className='text-xs'>
            <Building2 className='mr-1.5 h-3.5 w-3.5' />
            Översikt
          </TabsTrigger>
          <TabsTrigger value='invoices' className='text-xs'>
            <Receipt className='mr-1.5 h-3.5 w-3.5' />
            Fakturor
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          {/* Quick summary */}
          <div className='grid gap-4 md:grid-cols-3'>
            <Card>
              <CardContent className='flex items-center gap-3 pt-6'>
                <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                  <Receipt className='text-primary h-5 w-5' />
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>Plan</p>
                  <p className='text-lg font-bold'>
                    {planLabel[plan] ?? plan}
                  </p>
                  <p className='text-muted-foreground text-[11px]'>
                    {plan === 'trial'
                      ? 'Uppgradera för fler funktioner'
                      : 'Aktiv prenumeration'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-3 pt-6'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10'>
                  <Check className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>
                    Betalningsstatus
                  </p>
                  <p className='text-lg font-bold text-green-600'>
                    Inga utestående
                  </p>
                  <p className='text-muted-foreground text-[11px]'>
                    Inga utestående fakturor
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-3 pt-6'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10'>
                  <Wallet className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>
                    Betalningssätt
                  </p>
                  <p className='text-lg font-bold'>
                    {defaultMethod
                      ? defaultMethod.label
                      : 'Ej konfigurerat'}
                  </p>
                  <p className='text-muted-foreground text-[11px]'>
                    {defaultMethod
                      ? defaultMethod.details
                      : 'Lägg till under betalningssätt'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <BillingAddressCard address={address} tenantName={tenantName} />
          <PaymentMethodsCard methods={methods} address={address} />
          <PlanUpgradeCard currentPlan={plan} />
        </TabsContent>

        <TabsContent value='invoices'>
          <InvoiceHistory />
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}
