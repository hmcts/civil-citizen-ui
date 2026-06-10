import {Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {createUploadRateLimitGuard} from '../../../../main/routes/guards/uploadRateLimitGuard';

describe('uploadRateLimitGuard', () => {
  const createRedisClient = () => {
    let count = 0;
    let expireAt = 0;

    return {
      incr: jest.fn(async () => {
        if (expireAt && Date.now() >= expireAt) {
          count = 0;
          expireAt = 0;
        }
        count += 1;
        return count;
      }),
      expire: jest.fn(async (_key: string, seconds: number) => {
        expireAt = Date.now() + seconds * 1000;
        return 1;
      }),
      pttl: jest.fn(async () => expireAt - Date.now()),
    };
  };

  const createRequest = (redisClient: ReturnType<typeof createRedisClient>, method = 'POST') => ({
    method,
    session: {
      user: {
        id: 'user-123',
      },
    },
    sessionID: 'session-123',
    ip: '127.0.0.1',
    app: {
      locals: {
        draftStoreClient: redisClient,
      },
    },
  } as unknown as AppRequest);

  const createResponse = () => ({setHeader: jest.fn()} as unknown as Response);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should allow requests within limit', async () => {
    const redisClient = createRedisClient();
    const guard = createUploadRateLimitGuard(2, 60000);
    const req = createRequest(redisClient);
    const res = createResponse();
    const next = jest.fn();

    await guard(req, res, next);
    await guard(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenNthCalledWith(1);
    expect(next).toHaveBeenNthCalledWith(2);
    expect(res.setHeader).not.toHaveBeenCalled();
    expect(redisClient.incr).toHaveBeenCalledWith('upload-rate-limit:user-123');
    expect(redisClient.expire).toHaveBeenCalledTimes(1);
  });

  it('should reject requests above limit', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1000);
    const redisClient = createRedisClient();
    const guard = createUploadRateLimitGuard(1, 60000);
    const req = createRequest(redisClient);
    const res = createResponse();
    const next = jest.fn();

    await guard(req, res, next);
    await guard(req, res, next);

    const error = next.mock.calls[1][0] as {status: number; message: string};
    expect(next).toHaveBeenCalledTimes(2);
    expect(error.status).toBe(429);
    expect(error.message).toBe('Too many upload requests. Please wait and try again.');
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '60');
  });

  it('should reset limit after time window', async () => {
    const nowSpy = jest.spyOn(Date, 'now');
    const redisClient = createRedisClient();
    const guard = createUploadRateLimitGuard(1, 1000);
    const req = createRequest(redisClient);
    const res = createResponse();
    const next = jest.fn();

    nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1000);
    await guard(req, res, next);

    nowSpy.mockReturnValueOnce(1500).mockReturnValueOnce(1500);
    await guard(req, res, next);

    nowSpy.mockReturnValueOnce(2501).mockReturnValueOnce(2501);
    await guard(req, res, next);

    expect(next).toHaveBeenCalledTimes(3);
    expect((next.mock.calls[1][0] as {status: number}).status).toBe(429);
    expect(next.mock.calls[2][0]).toBeUndefined();
  });

  it('should bypass non-POST methods', async () => {
    const redisClient = createRedisClient();
    const guard = createUploadRateLimitGuard(1, 60000);
    const req = createRequest(redisClient, 'GET');
    const res = createResponse();
    const next = jest.fn();

    await guard(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.setHeader).not.toHaveBeenCalled();
    expect(redisClient.incr).not.toHaveBeenCalled();
  });

  it('should block concurrent upload bursts above the configured limit', async () => {
    const redisClient = createRedisClient();
    const guard = createUploadRateLimitGuard(20, 60000);
    const requests = Array.from({length: 50}, () => createRequest(redisClient));
    const responses = Array.from({length: 50}, () => createResponse());
    const nextHandlers = Array.from({length: 50}, () => jest.fn());

    await Promise.all(requests.map((req, index) => guard(req, responses[index], nextHandlers[index])));

    const errors = nextHandlers
      .map(next => next.mock.calls[0][0] as {status?: number} | undefined)
      .filter(error => error?.status === 429);
    const allowed = nextHandlers
      .map(next => next.mock.calls[0][0])
      .filter(error => error === undefined);

    expect(allowed).toHaveLength(20);
    expect(errors).toHaveLength(30);
    expect(responses.filter(response => (response.setHeader as jest.Mock).mock.calls.length > 0)).toHaveLength(30);
  });
});
