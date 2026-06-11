import {Response} from 'express';
import {ipKeyGenerator, rateLimit} from 'express-rate-limit';
import {RedisStore} from 'rate-limit-redis';
import {AppRequest} from 'models/AppRequest';
import {createUploadRateLimitGuard} from '../../../../main/routes/guards/uploadRateLimitGuard';

jest.mock('express-rate-limit', () => ({
  ipKeyGenerator: jest.fn((ip: string) => `normalised:${ip}`),
  rateLimit: jest.fn(options => options),
}));

jest.mock('rate-limit-redis', () => ({
  RedisStore: jest.fn().mockImplementation(options => ({options})),
}));

describe('uploadRateLimitGuard', () => {
  const redisClient = {
    call: jest.fn(),
  };

  const createRequest = (options: { userId?: string; sessionID?: string; ip?: string; resetTime?: Date; used?: number } = {}) => {
    const userId = Object.prototype.hasOwnProperty.call(options, 'userId') ? options.userId : 'user-123';
    const sessionID = Object.prototype.hasOwnProperty.call(options, 'sessionID') ? options.sessionID : 'session-123';
    const ip = Object.prototype.hasOwnProperty.call(options, 'ip') ? options.ip : '127.0.0.1';

    return {
      method: 'POST',
      session: {
        user: userId ? {
          id: userId,
        } : undefined,
      },
      sessionID,
      ip,
      rateLimit: {
        used: options.used,
        resetTime: options.resetTime,
      },
    } as unknown as AppRequest;
  };

  const createResponse = () => ({
    setHeader: jest.fn(),
  } as unknown as Response);

  const createGuardOptions = () => {
    createUploadRateLimitGuard(2, 60000, redisClient);
    return (rateLimit as jest.Mock).mock.calls[0][0];
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should configure express rate limit with a Redis store', () => {
    const options = createGuardOptions();

    expect(rateLimit).toHaveBeenCalledWith(expect.objectContaining({
      windowMs: 60000,
      limit: 2,
      standardHeaders: true,
      legacyHeaders: false,
      passOnStoreError: false,
    }));
    expect(RedisStore).toHaveBeenCalledWith(expect.objectContaining({
      prefix: 'upload-rate-limit:',
    }));
    expect(options.store).toEqual({options: expect.any(Object)});
  });

  it('should send Redis store commands through the existing draft store client', async () => {
    redisClient.call.mockResolvedValue('OK');
    createGuardOptions();
    const redisStoreOptions = (RedisStore as unknown as jest.Mock).mock.calls[0][0];

    await expect(redisStoreOptions.sendCommand('INCR', 'upload-rate-limit:user:user-123')).resolves.toBe('OK');

    expect(redisClient.call).toHaveBeenCalledWith('INCR', 'upload-rate-limit:user:user-123');
  });

  it('should only count POST requests', () => {
    const options = createGuardOptions();

    expect(options.skip({method: 'GET'})).toBe(true);
    expect(options.skip({method: 'POST'})).toBe(false);
  });

  it('should rate limit by user id first', () => {
    const options = createGuardOptions();

    expect(options.keyGenerator(createRequest())).toBe('user:user-123');
  });

  it('should rate limit by session id when user id is unavailable', () => {
    const options = createGuardOptions();

    expect(options.keyGenerator(createRequest({userId: undefined}))).toBe('session:session-123');
  });

  it('should rate limit by normalised ip address when user and session ids are unavailable', () => {
    const options = createGuardOptions();

    expect(options.keyGenerator(createRequest({userId: undefined, sessionID: undefined, ip: '2001:db8::1'}))).toBe('ip:normalised:2001:db8::1');
    expect(ipKeyGenerator).toHaveBeenCalledWith('2001:db8::1');
  });

  it('should use unknown identity when no user, session, or ip is available', () => {
    const options = createGuardOptions();

    expect(options.keyGenerator(createRequest({userId: undefined, sessionID: undefined, ip: undefined}))).toBe('unknown');
  });

  it('should pass a 429 HTTPError to error handling middleware when the limit is exceeded', () => {
    const options = createGuardOptions();
    const req = createRequest({
      resetTime: new Date(Date.now() + 60000),
      used: 3,
    });
    const res = createResponse();
    const next = jest.fn();

    options.handler(req, res, next, options);

    const error = next.mock.calls[0][0] as {status: number; message: string};
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '60');
    expect(error.status).toBe(429);
    expect(error.message).toBe('Too many upload requests. Please wait and try again.');
  });

  it('should fall back to the configured window when the store does not provide reset time', () => {
    const options = createGuardOptions();
    const res = createResponse();
    const next = jest.fn();

    options.handler(createRequest({used: 3}), res, next, options);

    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '60');
    expect((next.mock.calls[0][0] as {status: number}).status).toBe(429);
  });

  it('should route library validation logs through the application logger', () => {
    const options = createGuardOptions();

    expect(() => options.logger.warn('warning')).not.toThrow();
    expect(() => options.logger.error('error')).not.toThrow();
  });
});
