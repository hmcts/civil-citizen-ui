import {NextFunction, Response} from 'express';
import {AppRequest} from 'models/AppRequest';

export const CASE_REFERENCE_COOKIE_NAME = 'caseReference';

type CookieOptions = {
  secure: boolean;
  maxAge: number;
};

let storedCookieOptions: CookieOptions;

const normaliseCaseReference = (caseReference: unknown): string | undefined => {
  if (caseReference === undefined || caseReference === null) {
    return undefined;
  }

  if (typeof caseReference === 'string' || typeof caseReference === 'number') {
    return caseReference.toString().replace(/\s/g, '');
  }

  return undefined;
};

const resolveCaseReference = (req: AppRequest): string => {
  const sessionCaseReference = req.session?.caseReference;
  const firstContactClaimId = req.session?.firstContact?.claimId;
  const firstContactReference = req.session?.firstContact?.claimReference;
  return sessionCaseReference || firstContactClaimId || firstContactReference;
};

const applyCookie = (req: AppRequest, res: Response, overrideReference?: unknown): void => {
  if (!storedCookieOptions) {
    return;
  }

  const rawReference = overrideReference !== undefined ? overrideReference : resolveCaseReference(req);

  const normalisedReference = normaliseCaseReference(rawReference);

  if (normalisedReference) {
    if (req.cookies?.[CASE_REFERENCE_COOKIE_NAME] !== normalisedReference) {
      res.cookie(CASE_REFERENCE_COOKIE_NAME, normalisedReference, {
        maxAge: storedCookieOptions.maxAge,
        httpOnly: false,
        secure: storedCookieOptions.secure,
        sameSite: 'lax',
        path: '/',
      });
    }
  } else if (req.cookies?.[CASE_REFERENCE_COOKIE_NAME]) {
    res.clearCookie(CASE_REFERENCE_COOKIE_NAME, {
      secure: storedCookieOptions.secure,
      sameSite: 'lax',
      path: '/',
    });
  }
};

export const setCaseReferenceCookie = ({secure, maxAge}: CookieOptions) => {
  storedCookieOptions = {secure, maxAge};
  return (req: AppRequest, res: Response, next: NextFunction): void => {
    try {
      applyCookie(req, res);
    } finally {
      next();
    }
  };
};

export const syncCaseReferenceCookie = (req: AppRequest, resOverride?: Response, overrideReference?: unknown): void => {
  if (!storedCookieOptions) {
    return;
  }
  const response = resOverride || (req.res as Response);
  if (!response) {
    return;
  }
  applyCookie(req, response, overrideReference);
};

export const clearCaseReferenceCookie = (req: AppRequest, resOverride?: Response): void => {
  syncCaseReferenceCookie(req, resOverride, null);
};
