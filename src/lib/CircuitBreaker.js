export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.recoveryTimeout = options.recoveryTimeout || 10000;
    this.requestTimeout = options.requestTimeout || 5000;
    this.maxConcurrency = options.maxConcurrency || 5;
    
    this.state = 'CLOSED';
    this.failures = 0;
    this.nextAttempt = null;
    this.activeRequests = 0;
  }

  async execute(action, fallback) {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        return fallback('Circuit is OPEN. Fast-failing.');
      }
    }

    if (this.activeRequests >= this.maxConcurrency) {
      return fallback('Max concurrency reached. Fast-failing.');
    }

    this.activeRequests++;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      const result = await action(controller.signal);
      clearTimeout(timeoutId);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      return fallback(error.message || 'Request failed');
    } finally {
      this.activeRequests--;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.recoveryTimeout;
      console.warn(`Circuit Breaker tripped! Opening for ${this.recoveryTimeout}ms`);
    }
  }
}

export const apiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  recoveryTimeout: 10000,
  requestTimeout: 8000,
  maxConcurrency: 10
});
