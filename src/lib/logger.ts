/**
 * Structured application logger.
 *
 * Centralises all server-side logging so that:
 *  1. Every log line is JSON (easy to parse in Datadog / Axiom / Vercel Logs).
 *  2. Context (module, tenantId, etc.) is always attached.
 *  3. In production, `debug` logs are silenced.
 *  4. Swapping to a real provider (pino, winston) later is a one-file change.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.error('Embedding job failed', { sourceId, err });
 *   logger.warn('Rate limit near threshold', { ip });
 *   logger.info('Cron job completed', { tenants: 5 });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function shouldLog(level: LogLevel): boolean {
  if (process.env.NODE_ENV === 'production' && level === 'debug') {
    return false;
  }
  return true;
}

function formatError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      errorName: err.name,
      errorMessage: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    };
  }
  return { errorMessage: String(err) };
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (!shouldLog(level)) return;

  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta
  };

  // Extract error objects for proper serialisation
  if (meta?.err || meta?.error) {
    const errObj = meta.err ?? meta.error;
    Object.assign(payload, formatError(errObj));
    delete payload.err;
    delete payload.error;
  }

  const serialised = JSON.stringify(payload);

  switch (level) {
    case 'error':
      // eslint-disable-next-line no-console
      console.error(serialised);
      break;
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(serialised);
      break;
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(serialised);
      break;
    default:
      // eslint-disable-next-line no-console
      console.info(serialised);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) =>
    log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) =>
    log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) =>
    log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) =>
    log('error', message, meta)
};

/**
 * Create a module-scoped logger that automatically attaches `{ module }` to
 * every log entry.  This replaces the ad-hoc `[prefix]` convention in message
 * strings and keeps the metadata structured / filterable.
 *
 * Usage:
 *   const log = createModuleLogger('email-adapter');
 *   log.error('Send failed', { status: 500 });
 *   // → {"level":"error","message":"Send failed","module":"email-adapter","status":500,...}
 */
export function createModuleLogger(module: string) {
  return {
    debug: (message: string, meta?: Record<string, unknown>) =>
      log('debug', message, { module, ...meta }),
    info: (message: string, meta?: Record<string, unknown>) =>
      log('info', message, { module, ...meta }),
    warn: (message: string, meta?: Record<string, unknown>) =>
      log('warn', message, { module, ...meta }),
    error: (message: string, meta?: Record<string, unknown>) =>
      log('error', message, { module, ...meta })
  };
}
