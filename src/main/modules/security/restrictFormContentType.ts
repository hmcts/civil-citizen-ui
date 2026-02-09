import { NextFunction, Request, Response } from 'express';

/**
 * Path patterns for General Application (and response) form submission routes.
 * These routes are designed to receive only application/x-www-form-urlencoded
 * from HTML forms. Accepting application/json allows WAF bypass (DTSCCI-2852).
 * Rejecting JSON on these routes ensures all form traffic uses the content type
 * that the WAF inspects.
 */
const FORM_ONLY_PATH_PATTERNS = [
  /\/case\/[^/]+\/general-application\//,
  /\/case\/[^/]+\/response\/general-application\//,
];

function isFormSubmissionRoute(path: string): boolean {
  return FORM_ONLY_PATH_PATTERNS.some(pattern => pattern.test(path));
}

function isJsonOrTextContentType(req: Request): boolean {
  const contentType = (req.headers['content-type'] || '').toLowerCase().split(';')[0].trim();
  return (
    contentType === 'application/json' ||
    contentType === 'text/plain' ||
    contentType === 'text/json'
  );
}

/**
 * Middleware to reject POST requests with application/json (or text/plain) on
 * form submission routes. Returns 415 Unsupported Media Type so the request
 * is not processed and WAF bypass via JSON is prevented.
 * Must be registered before express.json() / body-parser.
 */
export function restrictFormContentType(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== 'POST') {
    next();
    return;
  }
  if (!isFormSubmissionRoute(req.path)) {
    next();
    return;
  }
  if (isJsonOrTextContentType(req)) {
    res.status(415).type('text/plain').send('Unsupported Media Type');
    return;
  }
  next();
}
