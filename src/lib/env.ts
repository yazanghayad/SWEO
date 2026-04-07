/**
 * Runtime environment validation.
 *
 * Validates that all required environment variables are set at startup.
 * Call `validateEnv()` early (e.g. in root layout or instrumentation).
 *
 * Uses Zod for schema validation so typos and missing vars are caught
 * immediately rather than causing mysterious runtime failures.
 */

import { z } from 'zod';
import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const serverEnvSchema = z.object({
  // Appwrite (required)
  NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().url('NEXT_PUBLIC_APPWRITE_ENDPOINT must be a valid URL'),
  NEXT_PUBLIC_APPWRITE_PROJECT: z.string().min(1, 'NEXT_PUBLIC_APPWRITE_PROJECT is required'),
  APPWRITE_API_KEY: z.string().min(1, 'APPWRITE_API_KEY is required'),

  // Database & storage
  APPWRITE_DATABASE_ID: z.string().min(1).default('main'),
  APPWRITE_BUCKET_ID: z.string().min(1).default('knowledge-files'),

  // Encryption (REQUIRED in production — connector credentials are stored encrypted)
  ENCRYPTION_KEY: z
    .string()
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== 'production' || (val && val.length >= 64),
      'ENCRYPTION_KEY is REQUIRED in production (64 hex chars = 32 bytes). Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    ),
  // Twilio (required in production for webhook verification)
  TWILIO_AUTH_TOKEN: z
    .string()
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== 'production' || !!val,
      'TWILIO_AUTH_TOKEN is required in production for webhook signature verification'
    ),

  // Sentry (optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DISABLED: z.enum(['true', 'false', '']).optional(),

  // Redis / rate-limiting (required in production)
  UPSTASH_REDIS_REST_URL: z
    .string()
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== 'production' || !!val,
      'UPSTASH_REDIS_REST_URL is required in production for rate-limiting'
    ),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== 'production' || !!val,
      'UPSTASH_REDIS_REST_TOKEN is required in production for rate-limiting'
    ),

  // MongoDB Atlas (required for vector search)
  MONGODB_URI: z
    .string()
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== 'production' || !!val,
      'MONGODB_URI is required in production for vector search'
    ),
  MONGODB_DB_NAME: z.string().optional().default('fin_ai'),

  // OpenAI (at least one AI provider required)
  OPENAI_API_KEY: z.string().optional(),
  NVIDIA_API_KEY: z.string().optional(),

  // Webhook secrets (required in production)
  WEBHOOK_EMAIL_SECRET: z
    .string()
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== 'production' || !!val,
      'WEBHOOK_EMAIL_SECRET is required in production'
    ),
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

let _validated = false;

export function validateEnv(): void {
  if (_validated) return;

  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
      .join('\n');

    const message = `Environment validation failed:\n${formatted}`;

    if (process.env.NODE_ENV === 'production') {
      // In production, fail hard — don't start with missing config
      logger.error(message);
      throw new Error(message);
    } else {
      // In development, warn but continue
      logger.warn(message);
    }
  }

  _validated = true;
}
