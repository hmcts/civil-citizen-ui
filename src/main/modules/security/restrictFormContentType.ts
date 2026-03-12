import { Request, Response, NextFunction } from 'express';

/**
 * Paths that must only accept form-encoded POSTs so that the Web Application Firewall (WAF)
 * can inspect all submitted content. Accepting application/json on these routes would allow
 * attackers to bypass WAF rules (e.g. XSS) by sending the same payload as JSON.
 */
const FORM_ONLY_PATH_PATTERNS = [
  /^\/case\/[^/]+\/general-application(\/|$)/,
  /^\/case\/[^/]+\/response\/general-application(\/|$)/,
];

const ALLOWED_CONTENT_TYPES = [
  'application/x-www-form-urlencoded',
  'multipart/form-data',
];

function isFormContentType(contentType: string | undefined): boolean {
  if (!contentType) {
    return false;
  }
  const base = contentType.split(';')[0].trim().toLowerCase();
  return ALLOWED_CONTENT_TYPES.some(allowed => base === allowed);
}

function isFormOnlyPath(path: string): boolean {
  return FORM_ONLY_PATH_PATTERNS.some(pattern => pattern.test(path));
}

/**
 * Middleware that returns 415 Unsupported Media Type for POST/PUT/PATCH requests to
 * general-application (and response general-application) routes when Content-Type
 * is not application/x-www-form-urlencoded or multipart/form-data.
 * This ensures the WAF can inspect all form submissions and prevents bypass via JSON.
 */
export function restrictFormContentType(req: Request, res: Response, next: NextFunction): void {
  const method = req.method.toUpperCase();
  if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') {
    return next();
  }
  if (!isFormOnlyPath(req.path)) {
    return next();
  }
  if (isFormContentType(req.get('Content-Type'))) {
    return next();
  }
  res.status(415).send('Unsupported Media Type');
}
