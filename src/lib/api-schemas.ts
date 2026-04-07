/**
 * Zod validation schemas for API route inputs.
 *
 * Centralised so that routes only need to import and `safeParse`.
 * Each schema mirrors the expected request body or query params
 * of the corresponding API endpoint.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// /api/analytics
// ---------------------------------------------------------------------------

export const analyticsQuerySchema = z.object({
  tenantId: z.string().min(1, 'tenantId is required'),
  days: z.coerce
    .number()
    .int()
    .min(1, 'days must be at least 1')
    .max(365, 'days must be at most 365')
    .default(30)
});

// ---------------------------------------------------------------------------
// /api/embeddings
// ---------------------------------------------------------------------------

export const embeddingJobSchema = z
  .object({
    sourceId: z.string().min(1, 'sourceId is required'),
    tenantId: z.string().min(1, 'tenantId is required'),
    type: z.enum(['file', 'url'], {
      error: "type must be 'file' or 'url'"
    }),
    fileId: z.string().optional(),
    fileName: z.string().optional(),
    url: z.string().url('url must be a valid URL').optional()
  })
  .refine(
    (data) => {
      if (data.type === 'file') return !!data.fileId;
      if (data.type === 'url') return !!data.url;
      return true;
    },
    {
      message: 'fileId is required for type=file; url is required for type=url'
    }
  );

// ---------------------------------------------------------------------------
// /api/chatbot
// ---------------------------------------------------------------------------

export const chatbotBodySchema = z.object({
  message: z
    .string()
    .min(1, 'message is required')
    .max(4000, 'message exceeds 4000 character limit'),
  department: z.enum(['sales', 'support']).default('support'),
  conversationId: z.string().nullish(),
  userName: z.string().max(200).optional(),
  userEmail: z.string().email().optional()
});

// ---------------------------------------------------------------------------
// /api/contact
// ---------------------------------------------------------------------------

export const contactBodySchema = z.object({
  name: z.string().min(1, 'name is required').max(200),
  email: z.string().email('Invalid email address'),
  subject: z.string().max(500).optional(),
  message: z.string().min(1, 'message is required').max(10000)
});

// ---------------------------------------------------------------------------
// /api/conversations/csat
// ---------------------------------------------------------------------------

export const csatBodySchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
  score: z
    .number()
    .int('Score must be an integer')
    .min(1, 'Score must be at least 1')
    .max(5, 'Score must be at most 5'),
  feedback: z.string().max(5000).optional()
});

export const csatQuerySchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required')
});

// ---------------------------------------------------------------------------
// /api/chat/stream
// ---------------------------------------------------------------------------

export const chatStreamBodySchema = z.object({
  message: z
    .string()
    .min(1, 'message is required')
    .max(4000, 'message exceeds 4000 character limit'),
  conversationId: z.string().nullish(),
  userId: z.string().optional(),
  channel: z.string().default('web')
});

// ---------------------------------------------------------------------------
// /api/chat/handoff
// ---------------------------------------------------------------------------

export const chatHandoffBodySchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
  reason: z.string().max(500).optional()
});

// ---------------------------------------------------------------------------
// /api/chat/queue-status
// ---------------------------------------------------------------------------

export const chatQueueStatusQuerySchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required')
});

// ---------------------------------------------------------------------------
// /api/simulate
// ---------------------------------------------------------------------------

export const simulateBodySchema = z.object({
  tenantId: z.string().min(1, 'tenantId is required'),
  messages: z
    .array(z.string().min(1))
    .min(1, 'At least one message is required')
    .max(20, 'Maximum 20 messages per simulation'),
  testProcedures: z.boolean().optional()
});

// ---------------------------------------------------------------------------
// /api/auth/resend-verification
// ---------------------------------------------------------------------------

export const resendVerificationSchema = z.object({
  email: z.string().email('A valid email is required')
});

// ---------------------------------------------------------------------------
// /api/chat/messages (GET query params)
// ---------------------------------------------------------------------------

export const chatMessagesQuerySchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
  after: z.string().min(1).optional()
});

// ---------------------------------------------------------------------------
// /api/tenant/subdomain-check (GET query params)
// ---------------------------------------------------------------------------

export const subdomainCheckSchema = z.object({
  slug: z.string().min(1, 'slug is required')
});

// ---------------------------------------------------------------------------
// /api/knowledge/import
// ---------------------------------------------------------------------------

export const knowledgeImportManifestSchema = z.object({
  version: z.literal(1, {
    error: 'Invalid manifest format. Expected version: 1'
  }),
  exportedAt: z.string().optional(),
  tenantId: z.string().optional(),
  tenantName: z.string().optional(),
  sourceCount: z.number().optional(),
  sources: z.array(z.record(z.string(), z.unknown())).min(1, 'sources array is required')
});

// ---------------------------------------------------------------------------
// Helper: format Zod errors for API responses
// ---------------------------------------------------------------------------

/**
 * Flatten Zod issues into a single user-friendly error string.
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((i: { message: string }) => i.message).join('; ');
}
