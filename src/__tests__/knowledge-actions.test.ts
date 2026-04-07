import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────

const mockListDocuments = vi.fn();
const mockGetDocument = vi.fn();
const mockCreateDocument = vi.fn();
const mockDeleteDocument = vi.fn();

vi.mock('@/lib/appwrite/server', () => ({
  createAdminClient: vi.fn(() => ({
    databases: {
      listDocuments: mockListDocuments,
      getDocument: mockGetDocument,
      createDocument: mockCreateDocument,
      deleteDocument: mockDeleteDocument
    },
    client: {}
  })),
  createSessionClient: vi.fn(() => Promise.resolve({
    account: {
      get: vi.fn().mockResolvedValue({ $id: 'user-1' })
    },
    databases: {
      listDocuments: mockListDocuments
    },
    client: {}
  }))
}));

vi.mock('@/lib/ai/retrieval', () => ({
  deleteVectorsBySource: vi.fn().mockResolvedValue(undefined)
}));

const mockGetAuthenticatedTenantId = vi.fn();
vi.mock('@/lib/appwrite/get-authenticated-tenant', () => ({
  getAuthenticatedTenantId: (...args: unknown[]) =>
    mockGetAuthenticatedTenantId(...args)
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn()
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

// ── Tests ────────────────────────────────────────────────────────────────

describe('listSourcesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated user owns tenant-1
    mockGetAuthenticatedTenantId.mockResolvedValue('tenant-1');
  });

  it('returns sources for a given tenant', async () => {
    const mockSources = [
      {
        $id: 'src-1',
        tenantId: 'tenant-1',
        type: 'url',
        url: 'https://example.com/help',
        status: 'ready',
        version: 1,
        $createdAt: '2026-02-20T10:00:00Z'
      },
      {
        $id: 'src-2',
        tenantId: 'tenant-1',
        type: 'file',
        fileId: 'file-abc',
        status: 'processing',
        version: 1,
        $createdAt: '2026-02-21T10:00:00Z'
      }
    ];

    mockListDocuments.mockResolvedValue({
      documents: mockSources,
      total: 2
    });

    const { listSourcesAction } = await import(
      '@/features/knowledge/actions/list-sources'
    );
    const result = await listSourcesAction('tenant-1');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data![0].$id).toBe('src-1');
    expect(result.data![1].type).toBe('file');
  });

  it('returns empty array when tenant has no sources', async () => {
    mockGetAuthenticatedTenantId.mockResolvedValue('tenant-empty');
    mockListDocuments.mockResolvedValue({ documents: [], total: 0 });

    const { listSourcesAction } = await import(
      '@/features/knowledge/actions/list-sources'
    );
    const result = await listSourcesAction('tenant-empty');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it('returns error when session is invalid', async () => {
    mockGetAuthenticatedTenantId.mockRejectedValueOnce(
      new Error('No session')
    );

    const { listSourcesAction } = await import(
      '@/features/knowledge/actions/list-sources'
    );
    const result = await listSourcesAction('tenant-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('No session');
  });
});

describe('deleteSourceAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated user owns tenant-1
    mockGetAuthenticatedTenantId.mockResolvedValue('tenant-1');
  });

  it('deletes a source owned by the tenant', async () => {
    mockGetDocument.mockResolvedValue({
      $id: 'src-1',
      tenantId: 'tenant-1',
      type: 'url',
      fileId: null
    });
    mockDeleteDocument.mockResolvedValue({});

    const { deleteSourceAction } = await import(
      '@/features/knowledge/actions/list-sources'
    );
    const result = await deleteSourceAction('src-1', 'tenant-1');

    expect(result.success).toBe(true);
    expect(mockDeleteDocument).toHaveBeenCalled();
  });

  it('denies deletion cross-tenant', async () => {
    // Authenticated user owns tenant-2, but tries to delete from tenant-1
    mockGetAuthenticatedTenantId.mockResolvedValue('tenant-2');

    mockGetDocument.mockResolvedValue({
      $id: 'src-1',
      tenantId: 'tenant-1',
      type: 'url',
      fileId: null
    });

    const { deleteSourceAction } = await import(
      '@/features/knowledge/actions/list-sources'
    );
    const result = await deleteSourceAction('src-1', 'tenant-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Forbidden');
    expect(mockDeleteDocument).not.toHaveBeenCalled();
  });

  it('returns error on delete failure', async () => {
    mockGetAuthenticatedTenantId.mockRejectedValueOnce(
      new Error('Session invalid')
    );

    const { deleteSourceAction } = await import(
      '@/features/knowledge/actions/list-sources'
    );
    const result = await deleteSourceAction('src-1', 'tenant-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Session invalid');
  });
});

describe('uploadFileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects files without a valid file', async () => {
    const { uploadFileAction } = await import(
      '@/features/knowledge/actions/upload-file'
    );
    const formData = new FormData();
    // No file

    const result = await uploadFileAction('tenant-1', formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe('No file provided');
  });

  it('rejects unsupported file types', async () => {
    const { uploadFileAction } = await import(
      '@/features/knowledge/actions/upload-file'
    );
    const formData = new FormData();
    const badFile = new File(['<script>alert(1)</script>'], 'evil.js', {
      type: 'application/javascript'
    });
    formData.set('file', badFile);

    const result = await uploadFileAction('tenant-1', formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unsupported file type');
  });

  it('rejects files exceeding 20 MB', async () => {
    const { uploadFileAction } = await import(
      '@/features/knowledge/actions/upload-file'
    );
    const formData = new FormData();

    // Create a file stub > 20MB
    const bigFile = new File(['x'], 'big.pdf', { type: 'application/pdf' });
    Object.defineProperty(bigFile, 'size', { value: 21 * 1024 * 1024 });
    formData.set('file', bigFile);

    const result = await uploadFileAction('tenant-1', formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain('File too large');
  });
});
