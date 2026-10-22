import csurf from '@dr.pogodin/csurf';
import {Request, Response, NextFunction} from 'express';
import {CSRFToken} from 'modules/csrf';
import {isTestingSupportDraftUrl} from 'modules/oidc';

jest.mock('modules/oidc', () => ({
  isTestingSupportDraftUrl: jest.fn(),
}));

jest.mock('@dr.pogodin/csurf', () => jest.fn());

const mockIsTestingSupportDraftUrl = isTestingSupportDraftUrl as jest.Mock;
const csrfMiddleware = jest.fn<void, [Request, Response, NextFunction]>();

describe('CSRFToken', () => {
  let middlewares: Array<(req: Request, res: Response, next: NextFunction) => void>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    csrfMiddleware.mockReset().mockImplementation((_req, _res, next) => next());
    jest.mocked(csurf).mockReset().mockReturnValue(csrfMiddleware);
    middlewares = [];
    const app = {
      use: (mw: (req: Request, res: Response, next: NextFunction) => void) => {
        middlewares.push(mw);
      },
    };
    new CSRFToken().enableFor(app as never);
    next = jest.fn();
    res = {locals: {}};
    mockIsTestingSupportDraftUrl.mockReturnValue(false);
  });

  it('skips csurf for eligibility paths', () => {
    req = {path: '/eligibility/claim-value', originalUrl: '/eligibility/claim-value'};
    middlewares[0](req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(csurf).not.toHaveBeenCalled();
    expect(csrfMiddleware).not.toHaveBeenCalled();
  });

  it('skips csurf for first-contact paths', () => {
    req = {path: '/first-contact/claim-reference', originalUrl: '/first-contact/claim-reference'};
    middlewares[0](req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(csurf).not.toHaveBeenCalled();
    expect(csrfMiddleware).not.toHaveBeenCalled();
  });

  it('skips csurf for testing-support draft URLs', () => {
    mockIsTestingSupportDraftUrl.mockReturnValue(true);
    req = {path: '/testing-support/create-draft-claim', originalUrl: '/testing-support/create-draft-claim'};
    middlewares[0](req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(csurf).not.toHaveBeenCalled();
    expect(csrfMiddleware).not.toHaveBeenCalled();
  });

  it('applies csurf for protected paths', () => {
    req = {path: '/dashboard', originalUrl: '/dashboard'};
    middlewares[0](req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(csurf).toHaveBeenCalledTimes(1);
    expect(csrfMiddleware).toHaveBeenCalledTimes(1);
    expect(csrfMiddleware.mock.calls[0][0]).toBe(req);
    expect(csrfMiddleware.mock.calls[0][1]).toBe(res);
    expect(csrfMiddleware.mock.calls[0][2]).toBe(next);
  });

  it('passes a protected-path rejection from the CSRF middleware to next', () => {
    const failure = new Error('invalid csrf token');
    csrfMiddleware.mockImplementation((_req, _res, next) => next(failure));
    req = {path: '/dashboard', originalUrl: '/dashboard'};

    middlewares[0](req as Request, res as Response, next);

    expect(csrfMiddleware).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(failure);
  });

  it('sets csrf token on locals for protected paths', () => {
    req = {
      path: '/dashboard',
      originalUrl: '/dashboard',
      csrfToken: jest.fn().mockReturnValue('csrf-token'),
    };
    middlewares[1](req as Request, res as Response, next);
    expect(res.locals!.csrf).toBe('csrf-token');
    expect(next).toHaveBeenCalled();
  });

  it('does not set csrf token for eligibility paths', () => {
    req = {
      path: '/eligibility/claim-value',
      originalUrl: '/eligibility/claim-value',
      csrfToken: jest.fn().mockReturnValue('csrf-token'),
    };
    middlewares[1](req as Request, res as Response, next);
    expect(res.locals!.csrf).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('does not set csrf token for testing-support draft URLs', () => {
    mockIsTestingSupportDraftUrl.mockReturnValue(true);
    req = {
      path: '/testing-support/create-draft-claim',
      originalUrl: '/testing-support/create-draft-claim',
      csrfToken: jest.fn().mockReturnValue('csrf-token'),
    };
    middlewares[1](req as Request, res as Response, next);
    expect(res.locals!.csrf).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
