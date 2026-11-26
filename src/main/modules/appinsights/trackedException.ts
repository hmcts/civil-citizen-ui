const TRACKED_PROPERTY = 'appInsightsExceptionTracked';

/**
 * Remember that this error was already sent with trackException. Callers sometimes
 * rewrite the status (a 404 becomes a 500) and pass the same object to the global
 * error handler, which would otherwise record it a second time.
 */
export const markAppInsightsExceptionTracked = (err: unknown): void => {
  if (err === null || typeof err !== 'object') {
    return;
  }
  try {
    Object.defineProperty(err, TRACKED_PROPERTY, {
      value: true,
      enumerable: false,
      configurable: true,
    });
  } catch {
    // A sealed error can still be tracked once. Failing the request is worse than a duplicate.
  }
};

export const isAppInsightsExceptionTracked = (err: unknown): boolean =>
  err !== null
  && typeof err === 'object'
  && (err as Record<string, unknown>)[TRACKED_PROPERTY] === true;
