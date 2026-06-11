import {Response} from 'express';
import {createUploadRateLimitGuard} from '../../../../main/routes/guards/uploadRateLimitGuard';

describe('uploadRateLimitGuard', () => {
  const next = jest.fn();
  const res = {setHeader: jest.fn()} as unknown as Response;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow requests within limit', () => {
    const guard = createUploadRateLimitGuard(2, 60000);
    const req = {
      method: 'POST',
      session: {},
    } as any;

    guard(req, res, next);
    guard(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenNthCalledWith(1);
    expect(next).toHaveBeenNthCalledWith(2);
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  it('should reject requests above limit', () => {
    const guard = createUploadRateLimitGuard(1, 60000);
    const req = {
      method: 'POST',
      session: {},
    } as any;

    guard(req, res, next);
    guard(req, res, next);

    const error = next.mock.calls[1][0] as {status: number; message: string};
    expect(next).toHaveBeenCalledTimes(2);
    expect(error.status).toBe(429);
    expect(error.message).toBe('Too many upload requests. Please wait and try again.');
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '60');
  });

  it('should reset limit after time window', () => {
    const guard = createUploadRateLimitGuard(1, 1000);
    const req = {
      method: 'POST',
      session: {},
    } as any;

    const nowSpy = jest.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(1000);
    nowSpy.mockReturnValueOnce(1500);
    nowSpy.mockReturnValueOnce(2501);

    guard(req, res, next);
    guard(req, res, next);
    guard(req, res, next);

    expect(next).toHaveBeenCalledTimes(3);
    expect((next.mock.calls[1][0] as {status: number}).status).toBe(429);
    expect(next.mock.calls[2][0]).toBeUndefined();
    nowSpy.mockRestore();
  });

  it('should bypass non-POST methods', () => {
    const guard = createUploadRateLimitGuard(1, 60000);
    const req = {
      method: 'GET',
      session: {},
    } as any;

    guard(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.setHeader).not.toHaveBeenCalled();
  });
});
