// Serialises async calls and enforces a minimum spacing between them.
//
// Nominatim's usage policy allows at most 1 request/second. We chain calls
// through a single promise so concurrent tool invocations queue up, and each
// runs at least `minIntervalMs` after the previous one started.
export class RateLimiter {
  private last = 0;
  private tail: Promise<void> = Promise.resolve();

  constructor(private readonly minIntervalMs: number) {}

  schedule<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.tail.then(async () => {
      const wait = this.last + this.minIntervalMs - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      this.last = Date.now();
      return fn();
    });
    // Keep the chain alive regardless of success/failure of this task.
    this.tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }
}
