import {ErrorHandler} from '../../../../main/modules/error';
import {HTTPError} from '../../../../main/HttpError';

jest.mock('@hmcts/nodejs-logging', () => ({
  Logger: (() => {
    const logger = {error: jest.fn()};
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
});
