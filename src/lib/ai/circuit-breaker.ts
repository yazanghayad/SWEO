/**
 * Minimal circuit breaker for external API calls (e.g. LLM providers).
 *
 * States:
 *   CLOSED  – requests flow through normally
 *   OPEN    – requests are immediately rejected (fast-fail)
 *   HALF_OPEN – a single probe request is allowed to test recovery
 *
 * Transitions:
 *   CLOSED → OPEN when `failureThreshold` consecutive failures occur
 *   OPEN → HALF_OPEN after `resetTimeoutMs` passes
 *   HALF_OPEN → CLOSED on success, HALF_OPEN → OPEN on failure
 */

import { logger } from '@/lib/logger';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  /** Number of consecutive failures before opening the circuit. Default: 5 */
  failureThreshold?: number;
  /** Time in ms before moving from OPEN → HALF_OPEN. Default: 30_000 (30s) */
  resetTimeoutMs?: number;
  /** Name for logging. Default: 'circuit-breaker' */
  name?: string;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private consecutiveFailures = 0;
  private lastFailureTime = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly name: string;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 30_000;
    this.name = options.name ?? 'circuit-breaker';
  }

  /**
   * Execute `fn` through the circuit breaker.
   * Throws `CircuitOpenError` if the circuit is open.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      // Check if enough time has passed to try a probe request
      if (Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        logger.info('Circuit half-open, allowing probe request', { module: this.name });
      } else {
        throw new CircuitOpenError(
          `[${this.name}] Circuit is OPEN — fast-failing to protect downstream service`
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      logger.info('Probe succeeded — circuit CLOSED', { module: this.name });
    }
    this.consecutiveFailures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    if (
      this.state === 'HALF_OPEN' ||
      this.consecutiveFailures >= this.failureThreshold
    ) {
      this.state = 'OPEN';
      logger.error(
        `Circuit OPEN after ${this.consecutiveFailures} consecutive failures. ` +
        `Will retry after ${this.resetTimeoutMs}ms.`,
        { module: this.name }
      );
    }
  }

  /** Current circuit state (useful for health checks / metrics). */
  getState(): CircuitState {
    return this.state;
  }

  /** Reset the breaker to closed (e.g. for testing). */
  reset(): void {
    this.state = 'CLOSED';
    this.consecutiveFailures = 0;
    this.lastFailureTime = 0;
  }
}

/**
 * Error thrown when the circuit breaker is in OPEN state.
 * Callers can check `instanceof CircuitOpenError` to distinguish
 * from actual LLM API errors.
 */
export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}
