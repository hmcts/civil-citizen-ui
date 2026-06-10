import {NextFunction, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {HTTPError} from '../../HttpError';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('uploadRateLimitGuard');

interface RedisRateLimitClient {
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  pttl: (key: string) => Promise<number>;
}

const buildRateLimitKey = (req: AppRequest): string => {
  const userId = req.session?.user?.id;
  const sessionId = req.sessionID;
  const ipAddress = req.ip;
  const identity = userId || sessionId || ipAddress || 'unknown';

  return `upload-rate-limit:${identity.replace(/[^a-zA-Z0-9:_-]/g, '_')}`;
};

const getIdentityType = (req: AppRequest): string => {
  if (req.session?.user?.id) {
    return 'user';
  }
  if (req.sessionID) {
    return 'session';
  }
  if (req.ip) {
    return 'ip';
  }
  return 'unknown';
};

const buildRateLimitError = (): HTTPError => {
  const error = new HTTPError();
  error.status = 429;
  error.message = 'Too many upload requests. Please wait and try again.';
  return error;
};

export const createUploadRateLimitGuard = (maxRequests: number, windowMs: number) => {
  return async (req: AppRequest, res: Response, next: NextFunction) => {
    if (req.method !== 'POST') {
      return next();
    }

    try {
      const redisClient = req.app.locals.draftStoreClient as RedisRateLimitClient;
      const key = buildRateLimitKey(req);
      const requestCount = await redisClient.incr(key);

      if (requestCount === 1) {
        await redisClient.expire(key, Math.ceil(windowMs / 1000));
      }

      if (requestCount > maxRequests) {
        let ttlMs = await redisClient.pttl(key);
        if (ttlMs < 0) {
          ttlMs = windowMs;
          await redisClient.expire(key, Math.ceil(windowMs / 1000));
        }

        const retryAfterSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
        res.setHeader('Retry-After', retryAfterSeconds.toString());
        logger.warn(`Upload rate limit exceeded for ${getIdentityType(req)}, count ${requestCount}, retry after ${retryAfterSeconds}s`);
        return next(buildRateLimitError());
      }

      return next();
    } catch (error) {
      logger.error('Upload rate limit check failed', error);
      return next(error);
    }
  };
};
