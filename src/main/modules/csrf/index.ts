import type {Application, NextFunction, Response} from 'express';
import {randomBytes, timingSafeEqual} from 'crypto';
import {isTestingSupportDraftUrl} from 'modules/oidc';
import {AppRequest, AppSession} from 'models/AppRequest';
import {HTTPError} from '../../HttpError';

const SAFE_HTTP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);
const HEADER_TOKEN_NAMES = ['csrf-token', 'x-csrf-token', 'xsrf-token', 'x-xsrf-token'];
const CSRF_TOKEN_BYTES = 32;

export class CSRFToken {
  public enableFor(app: Application): void {
    app.use((req: AppRequest, _res: Response, next: NextFunction) => {
      if (shouldSkipCsrf(req)) {
        return next();
      }

      const session = req.session as AppSession | undefined;
      if (!session) {
        return next(new Error('Session is required for CSRF protection'));
      }

      const currentToken = ensureSessionToken(session);

      if (SAFE_HTTP_METHODS.has((req.method || '').toUpperCase())) {
        attachTokenAccessor(req, session);
        return next();
      }

      const providedToken = extractToken(req);
      if (providedToken && tokensMatch(currentToken, providedToken)) {
        rotateSessionToken(session);
        attachTokenAccessor(req, session);
        return next();
      }

      const error = new HTTPError('Invalid CSRF token');
      error.status = 403;
      return next(error);
    });

    app.use((req: AppRequest, res: Response, next: NextFunction) => {
      if (shouldSkipCsrf(req)) {
        return next();
      }

      if (typeof req.csrfToken === 'function') {
        res.locals.csrf = req.csrfToken();
      }

      next();
    });
  }
}

function shouldSkipCsrf(req: AppRequest): boolean {
  return req.path.startsWith('/eligibility') ||
    req.path.startsWith('/first-contact') ||
    isTestingSupportDraftUrl(req.originalUrl);
}

function ensureSessionToken(session: AppSession): string {
  if (!session.csrfToken) {
    session.csrfToken = generateToken();
  }
  return session.csrfToken;
}

function rotateSessionToken(session: AppSession): string {
  session.csrfToken = generateToken();
  return session.csrfToken;
}

function attachTokenAccessor(req: AppRequest, session: AppSession): void {
  req.csrfToken = () => ensureSessionToken(session);
}

function generateToken(): string {
  return randomBytes(CSRF_TOKEN_BYTES).toString('hex');
}

function extractToken(req: AppRequest): string | undefined {
  const body = req.body as Record<string, unknown> | undefined;
  const bodyToken = body && typeof body._csrf === 'string' ? body._csrf : undefined;
  if (bodyToken) {
    return bodyToken;
  }

  for (const headerName of HEADER_TOKEN_NAMES) {
    const headerValue = req.headers?.[headerName];
    if (typeof headerValue === 'string') {
      return headerValue;
    }
    if (Array.isArray(headerValue) && headerValue.length > 0) {
      return headerValue[0];
    }
  }

  const query = req.query as Record<string, unknown>;
  const queryValue = query?._csrf;
  if (typeof queryValue === 'string') {
    return queryValue;
  }
  if (Array.isArray(queryValue) && queryValue.length > 0) {
    return queryValue[0];
  }

  return undefined;
}

function tokensMatch(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const providedBuffer = Buffer.from(provided, 'utf8');

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
