import {ErrorHandler} from '../../../../main/modules/error';
import {HTTPError} from '../../../../main/HttpError';
import {CallbackError} from '../../../../main/app/client/common/error/callbackError';
import {AxiosError, AxiosHeaders} from 'axios';
import config from 'config';

jest.mock('@hmcts/nodejs-logging', () => ({
  Logger: (() => {
    const logger = {error: jest.fn(), warn: jest.fn()};
    return {
      getLogger: () => logger,
    };
  })(),
}));

jest.mock('applicationinsights', () => ({
  defaultClient: {
    trackTrace: jest.fn(),
    trackException: jest.fn(),
    flush: jest.fn(),
  },
}));

describe('ErrorHandler', () => {
  const getTrackExceptionMock = () => require('applicationinsights').defaultClient.trackException as jest.Mock;
  const getFlushMock = () => require('applicationinsights').defaultClient.flush as jest.Mock;
  const getErrorLoggerMock = () => require('@hmcts/nodejs-logging').Logger.getLogger('errorHandler').error as jest.Mock;
  const appUse = jest.fn();
  const app = {
    use: appUse,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const appInsights = require('applicationinsights');
    appInsights.defaultClient = {trackTrace: jest.fn(), trackException: jest.fn(), flush: jest.fn()};
    new ErrorHandler().enableFor(app as any);
  });

  it('tracks handled route errors with App Insights', () => {
    const errorMiddleware = appUse.mock.calls[1][0];
    const err = new Error('Unexpected failure');
    const req = {originalUrl: '/case/123/response', method: 'GET'} as any;
    const res = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    } as any;

    errorMiddleware(err, req, res, jest.fn());

    expect(getTrackExceptionMock()).toHaveBeenCalledWith({
      exception: err,
      properties: {
        url: '/case/123/response',
        method: 'GET',
        status: '500',
      },
    });
    expect(getFlushMock()).toHaveBeenCalledWith({
      isAppCrashing: false,
      callback: expect.any(Function),
    });
    expect(getErrorLoggerMock()).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith('error', {error: res.locals.error});
  });

  it('does not throw if App Insights default client is unavailable', () => {
    const appInsights = require('applicationinsights');
    appInsights.defaultClient = undefined;

    const errorMiddleware = appUse.mock.calls[1][0];
    const err = new Error('Unexpected failure');
    const req = {originalUrl: '/case/123/response', method: 'POST'} as any;
    const res = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    } as any;

    expect(() => errorMiddleware(err, req, res, jest.fn())).not.toThrow();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith('error', {error: res.locals.error});
  });

  it('does not track App Insights exceptions for 4xx errors', () => {
    const errorMiddleware = appUse.mock.calls[1][0];
    const err = {message: 'Bad request', status: 400} as HTTPError;
    const req = {originalUrl: '/case/123/response', method: 'POST'} as any;
    const res = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    } as any;

    errorMiddleware(err, req, res, jest.fn());

    expect(getTrackExceptionMock()).not.toHaveBeenCalled();
    expect(getFlushMock()).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith('error', {error: res.locals.error});
  });

  it('renders the callback errors (422) and does not track App Insights (DTSCCI-5282)', () => {
    const errorMiddleware = appUse.mock.calls[1][0];
    const callbackErrors = ['There is a technical issue causing a delay. You do not need to do anything. Please come back later.'];
    const err = new CallbackError(callbackErrors, []);
    const req = {originalUrl: '/case/123/qm/create-query-cya', method: 'POST'} as any;
    const res = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    } as any;

    errorMiddleware(err, req, res, jest.fn());

    expect(getTrackExceptionMock()).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({callbackErrors}));
  });

  it('does not treat a non-CallbackError that happens to carry callbackErrors as a 422 (DTSCCI-5282)', () => {
    const errorMiddleware = appUse.mock.calls[1][0];
    // An unrelated 5xx that coincidentally has a callbackErrors property must still be
    // tracked as a 500, not masked as a 422 (guarded by instanceof CallbackError).
    const err = Object.assign(new Error('Unexpected failure'), {status: 500, callbackErrors: ['not a real callback error']});
    const req = {originalUrl: '/case/123/response', method: 'POST'} as any;
    const res = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    } as any;

    errorMiddleware(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status).not.toHaveBeenCalledWith(422);
    expect(getTrackExceptionMock()).toHaveBeenCalled();
  });
  describe('civil-service 401 (DTSCCI-6600)', () => {
    const civilServiceUrl = config.get<string>('services.civilService.url');

    const axios401 = (baseURL: string, status = 401) => {
      const headers = new AxiosHeaders();
      return new AxiosError('Request failed', 'ERR_BAD_REQUEST', {baseURL, headers}, {}, {
        status, statusText: '', headers: {}, config: {headers}, data: {},
      });
    };

    const buildReq = (session: Record<string, unknown>) => ({
      originalUrl: '/dashboard',
      method: 'GET',
      session: {save: jest.fn((cb: (err?: Error) => void) => cb()), ...session},
    }) as any;

    const buildRes = () => ({
      locals: {},
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
      redirect: jest.fn(),
    }) as any;

    it('clears the user and redirects to sign in', () => {
      const errorMiddleware = appUse.mock.calls[1][0];
      const req = buildReq({user: {id: 'user-1'}});
      const res = buildRes();

      errorMiddleware(axios401(civilServiceUrl), req, res, jest.fn());

      expect(req.session.user).toBeUndefined();
      expect(req.session.reauthOn401At).toEqual(expect.any(Number));
      expect(req.session.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(res.render).not.toHaveBeenCalled();
      expect(getTrackExceptionMock()).not.toHaveBeenCalled();
    });

    it('passes a session save failure to next', () => {
      const errorMiddleware = appUse.mock.calls[1][0];
      const saveErr = new Error('redis down');
      const req = buildReq({user: {id: 'user-1'}});
      req.session.save = jest.fn((cb: (err?: Error) => void) => cb(saveErr));
      const res = buildRes();
      const next = jest.fn();

      errorMiddleware(axios401(civilServiceUrl), req, res, next);

      expect(next).toHaveBeenCalledWith(saveErr);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('renders the error page when the user was re-authenticated moments ago', () => {
      const errorMiddleware = appUse.mock.calls[1][0];
      const req = buildReq({user: {id: 'user-1'}, reauthOn401At: Date.now()});
      const res = buildRes();

      errorMiddleware(axios401(civilServiceUrl), req, res, jest.fn());

      expect(res.redirect).not.toHaveBeenCalled();
      expect(req.session.user).toEqual({id: 'user-1'});
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.render).toHaveBeenCalledWith('error', {error: res.locals.error});
    });

    it('re-authenticates again once the previous attempt is older than the window', () => {
      const errorMiddleware = appUse.mock.calls[1][0];
      const req = buildReq({user: {id: 'user-1'}, reauthOn401At: Date.now() - 6 * 60 * 1000});
      const res = buildRes();

      errorMiddleware(axios401(civilServiceUrl), req, res, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith('/login');
    });

    it('renders the error page for a 401 from another service', () => {
      const errorMiddleware = appUse.mock.calls[1][0];
      const req = buildReq({user: {id: 'user-1'}});
      const res = buildRes();

      errorMiddleware(axios401('http://some-other-service'), req, res, jest.fn());

      expect(res.redirect).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.render).toHaveBeenCalledWith('error', {error: res.locals.error});
    });

    it('renders the error page when there is no signed-in user', () => {
      const errorMiddleware = appUse.mock.calls[1][0];
      const req = buildReq({});
      const res = buildRes();

      errorMiddleware(axios401(civilServiceUrl), req, res, jest.fn());

      expect(res.redirect).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('leaves non-401 civil-service errors unchanged', () => {
      const errorMiddleware = appUse.mock.calls[1][0];
      const req = buildReq({user: {id: 'user-1'}});
      const res = buildRes();

      errorMiddleware(axios401(civilServiceUrl, 500), req, res, jest.fn());

      expect(res.redirect).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(getTrackExceptionMock()).toHaveBeenCalled();
    });
  });
});
