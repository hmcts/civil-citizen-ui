import {NextFunction, RequestHandler, Response} from 'express';
import {ipKeyGenerator, rateLimit} from 'express-rate-limit';
import {RedisStore} from 'rate-limit-redis';
import type {RedisReply} from 'rate-limit-redis';
import {AppRequest} from 'models/AppRequest';
import {HTTPError} from '../../HttpError';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('uploadRateLimitGuard');

interface RedisRateLimitClient {
  call: (command: string, ...args: string[]) => Promise<RedisReply>;
}

const buildRateLimitKey = (req: AppRequest): string => {
  if (req.session?.user?.id) {
    return `user:${req.session.user.id}`;
  }

  if (req.sessionID) {
    return `session:${req.sessionID}`;
  }

  if (req.ip) {
    return `ip:${ipKeyGenerator(req.ip)}`;
  }

  return 'unknown';
};

const buildRateLimitError = (): HTTPError => {
  const error = new HTTPError();
  error.status = 429;
  error.message = 'Too many upload requests. Please wait and try again.';
  return error;
};

export const createUploadRateLimitGuard = (
  maxRequests: number,
  windowMs: number,
  redisClient: RedisRateLimitClient,
): RequestHandler => rateLimit({
  windowMs,
  limit: maxRequests,
  skip: req => req.method !== 'POST',
  keyGenerator: req => buildRateLimitKey(req as AppRequest),
  store: new RedisStore({
    prefix: 'upload-rate-limit:',
    sendCommand: (command: string, ...args: string[]) => redisClient.call(command, ...args),
  }),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res: Response, next: NextFunction) => {
    const rateLimit = (req as typeof req & { rateLimit?: { used: number; resetTime?: Date } }).rateLimit;
    const retryAfterSeconds = rateLimit?.resetTime
      ? Math.max(1, Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000))
      : Math.max(1, Math.ceil(windowMs / 1000));

    res.setHeader('Retry-After', retryAfterSeconds.toString());
    logger.warn(`Upload rate limit exceeded for ${buildRateLimitKey(req as AppRequest)}, count ${rateLimit?.used || maxRequests + 1}, retry after ${retryAfterSeconds}s`);
    next(buildRateLimitError());
  },
  passOnStoreError: false,
  logger: {
    warn: (error: unknown, message?: string) => logger.warn(message || error),
    error: (error: unknown, message?: string) => logger.error(message || 'Upload rate limit check failed', error),
  },
});
