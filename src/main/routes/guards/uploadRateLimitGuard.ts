import {NextFunction, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {HTTPError} from '../../HttpError';

export const createUploadRateLimitGuard = (maxRequests: number, windowMs: number) => {
  return (req: AppRequest, res: Response, next: NextFunction) => {
    if (req.method !== 'POST') {
      return next();
    }

    const now = Date.now();
    const rateLimitState = req.session.uploadRateLimit;

    if (!rateLimitState || now - rateLimitState.windowStartMs >= windowMs) {
      req.session.uploadRateLimit = {
        windowStartMs: now,
        requestCount: 1,
      };
      return next();
    }

    if (rateLimitState.requestCount >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - rateLimitState.windowStartMs)) / 1000));
      res.setHeader('Retry-After', retryAfterSeconds.toString());

      const error = new HTTPError();
      error.status = 429;
      error.message = 'Too many upload requests. Please wait and try again.';
      return next(error);
    }

    rateLimitState.requestCount += 1;
    req.session.uploadRateLimit = rateLimitState;
    return next();
  };
};
