import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────

// Mock redirect to capture calls instead of throwing
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args);
    throw new Error('NEXT_REDIRECT');
  }
}));

// Mock cookies and headers
const mockCookieSet = vi.fn();
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: vi.fn(() => ({ value: 'mock-session' })),
    set: mockCookieSet,
    delete: vi.fn()
  })),
  headers: vi.fn(() => Promise.resolve(new Map([
    ['x-forwarded-for', '127.0.0.1'],
    ['user-agent', 'vitest']
  ])))
}));

// Mock Appwrite
const mockCreateEmailPasswordSession = vi.fn();
const mockCreateDocument = vi.fn();
const mockListDocuments = vi.fn();
const mockGetAccount = vi.fn();
const mockUsersCreate = vi.fn();

vi.mock('@/lib/appwrite/server', () => ({
  createAdminClient: vi.fn(() => ({
    account: {
      createEmailPasswordSession: mockCreateEmailPasswordSession
    },
    databases: {
      createDocument: mockCreateDocument,
      listDocuments: mockListDocuments,
      getDocument: vi.fn()
    },
    users: {
      create: mockUsersCreate,
      updatePrefs: vi.fn().mockResolvedValue({})
    },
    client: {}
  })),
  createSessionClient: vi.fn(() => Promise.resolve({
    account: { get: mockGetAccount },
    databases: { listDocuments: mockListDocuments },
    client: {}
  }))
}));

vi.mock('@/lib/appwrite/teams', () => ({
  createTeam: vi.fn().mockResolvedValue('mock-team-id')
}));

vi.mock('@/lib/tenant/subdomain', () => ({
  validateSubdomain: vi.fn().mockReturnValue(null),
  normalizeSubdomain: vi.fn((s: string) => s.toLowerCase()),
  isSubdomainAvailable: vi.fn().mockResolvedValue(true)
}));

vi.mock('@/lib/rate-limit', () => ({
  checkIpRateLimit: vi.fn().mockResolvedValue({ success: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1')
}));

vi.mock('@/lib/mail/send', () => ({
  sendMail: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@/lib/mail/verification', () => ({
  generateVerificationCode: vi.fn().mockReturnValue('123456'),
  createVerificationPayload: vi.fn().mockReturnValue({ code: '123456', expiresAt: Date.now() + 600000 })
}));

vi.mock('@/lib/mail/templates', () => ({
  welcomeVerificationEmail: vi.fn().mockReturnValue({
    subject: 'Welcome',
    html: '<p>Welcome</p>',
    text: 'Welcome'
  })
}));

// ── Tests ────────────────────────────────────────────────────────────────

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateEmailPasswordSession.mockResolvedValue({
      secret: 'session-secret',
      expire: new Date(Date.now() + 86400000).toISOString()
    });
  });

  it('returns error if email is missing', async () => {
    const { loginAction } = await import('@/features/auth/actions/login');
    const formData = new FormData();
    formData.set('password', 'secret123');

    const result = await loginAction(null, formData);
    expect(result.error).toBe('Email and password are required.');
  });

  it('returns error if password is missing', async () => {
    const { loginAction } = await import('@/features/auth/actions/login');
    const formData = new FormData();
    formData.set('email', 'test@example.com');

    const result = await loginAction(null, formData);
    expect(result.error).toBe('Email and password are required.');
  });

  it('sets session cookie and redirects on success', async () => {
    const { loginAction } = await import('@/features/auth/actions/login');
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'password123');

    await expect(loginAction(null, formData)).rejects.toThrow('NEXT_REDIRECT');
    expect(mockCreateEmailPasswordSession).toHaveBeenCalledWith(
      'test@example.com',
      'password123'
    );
    expect(mockCookieSet).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/overview');
  });

  it('returns generic error on invalid credentials', async () => {
    mockCreateEmailPasswordSession.mockRejectedValue(
      new Error('Invalid credentials')
    );

    const { loginAction } = await import('@/features/auth/actions/login');
    const formData = new FormData();
    formData.set('email', 'bad@example.com');
    formData.set('password', 'wrong');

    const result = await loginAction(null, formData);
    expect(result.error).toBe('Login failed. Check your credentials.');
  });
});

describe('signupAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsersCreate.mockResolvedValue({ $id: 'new-user-id' });
    mockCreateEmailPasswordSession.mockResolvedValue({
      secret: 'session-secret',
      expire: new Date(Date.now() + 86400000).toISOString()
    });
    mockCreateDocument.mockResolvedValue({ $id: 'tenant-id' });
  });

  it('returns error if name is missing', async () => {
    const { signupAction } = await import('@/features/auth/actions/signup');
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'password123');
    formData.set('subdomain', 'test');

    const result = await signupAction(null, formData);
    expect(result.error).toBe('Name, email, and password are required.');
  });

  it('returns error if subdomain is empty', async () => {
    const { signupAction } = await import('@/features/auth/actions/signup');
    const formData = new FormData();
    formData.set('name', 'Test User');
    formData.set('email', 'test@example.com');
    formData.set('password', 'password123');
    // no subdomain

    const result = await signupAction(null, formData);
    expect(result.error).toBe('A subdomain is required for your workspace.');
  });

  it('creates user, session, tenant, and redirects on success', async () => {
    const { signupAction } = await import('@/features/auth/actions/signup');
    const formData = new FormData();
    formData.set('name', 'Test User');
    formData.set('email', 'test@example.com');
    formData.set('password', 'password123');
    formData.set('subdomain', 'mycompany');

    await expect(signupAction(null, formData)).rejects.toThrow('NEXT_REDIRECT');
    expect(mockUsersCreate).toHaveBeenCalled();
    expect(mockCreateEmailPasswordSession).toHaveBeenCalledWith(
      'test@example.com',
      'password123'
    );
    expect(mockCookieSet).toHaveBeenCalled();
    expect(mockCreateDocument).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/auth/verify-email')
    );
  });
});

describe('getCurrentTenantAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccount.mockResolvedValue({
      $id: 'user-1',
      name: 'Test User',
      email: 'test@example.com'
    });
  });

  it('returns existing tenant if found', async () => {
    const mockTenant = {
      $id: 'tenant-1',
      name: 'My Company',
      plan: 'pro',
      userId: 'user-1',
      config: '{}',
      apiKey: 'abc123',
      subdomain: 'mycompany'
    };
    mockListDocuments.mockResolvedValue({
      documents: [mockTenant],
      total: 1
    });

    const { getCurrentTenantAction } = await import(
      '@/features/auth/actions/get-tenant'
    );
    const result = await getCurrentTenantAction();

    expect(result.tenant).toBeTruthy();
    expect(result.tenant?.name).toBe('My Company');
    expect(result.error).toBeNull();
  });

  it('auto-creates tenant if none found', async () => {
    mockListDocuments.mockResolvedValue({ documents: [], total: 0 });
    mockCreateDocument.mockResolvedValue({
      $id: 'auto-tenant',
      name: 'Test User',
      plan: 'trial',
      userId: 'user-1',
      config: '{}',
      apiKey: 'xxx',
      subdomain: 'test-user'
    });

    const { getCurrentTenantAction } = await import(
      '@/features/auth/actions/get-tenant'
    );
    const result = await getCurrentTenantAction();

    expect(result.tenant).toBeTruthy();
    expect(mockCreateDocument).toHaveBeenCalled();
  });

  it('returns error if session is invalid', async () => {
    const { createSessionClient } = await import('@/lib/appwrite/server');
    vi.mocked(createSessionClient).mockRejectedValueOnce(
      new Error('Session expired')
    );

    const { getCurrentTenantAction } = await import(
      '@/features/auth/actions/get-tenant'
    );
    const result = await getCurrentTenantAction();

    expect(result.tenant).toBeNull();
    expect(result.error).toBe('Session expired');
  });
});
