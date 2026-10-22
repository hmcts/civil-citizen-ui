jest.mock('@hmcts/nodejs-logging', () => ({
  Logger: (() => {
    const logger = {error: jest.fn()};
    return {getLogger: () => logger};
  })(),
}));

jest.mock('applicationinsights', () => ({
  defaultClient: {
    trackException: jest.fn(),
  },
}));

import {AxiosResponse} from 'axios';
import {AppRequest} from 'common/models/AppRequest';
import {buildAuthenticatedConfig, buildJsonOnlyConfig, buildAuthorizationOnlyConfig, executeRequest} from 'client/common/civilServiceRequest';
import {isAppInsightsExceptionTracked} from 'modules/appinsights/trackedException';

const getLoggerError = () => require('@hmcts/nodejs-logging').Logger.getLogger('civilServiceClient').error as jest.Mock;
const getTrackException = () => require('applicationinsights').defaultClient.trackException as jest.Mock;

const axiosError = (status: number, config?: {method?: string; url?: string}): Error => {
  const error = new Error(`Request failed with status code ${status}`);
  const stack = `AxiosError: Request failed with status code ${status}\n    at Client.request (civilServiceClient.ts:10:5)`;
  error.stack = stack;
  return Object.assign(error, {
    isAxiosError: true,
    status,
    response: {status},
    config,
  });
};

describe('executeRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs the error stack and tracks an unexpected 4xx with the request, ids removed', async () => {
    const error = axiosError(409, {
      method: 'get',
      url: '/cases/1738173817381738/citizen/11111111-1111-4111-8111-111111111111/event?pin=secret',
    });
    const operation = jest.fn().mockRejectedValue(error);

    await expect(executeRequest(operation, 'Error when getting agreed deadline response date'))
      .rejects.toBe(error);

    const logged = getLoggerError().mock.calls[0][0] as string;
    expect(logged).toContain('Error when getting agreed deadline response date');
    expect(logged).toContain('at Client.request (civilServiceClient.ts:10:5)');
    expect(getTrackException()).toHaveBeenCalledWith({
      exception: error,
      properties: {
        source: 'civilServiceClient',
        status: '409',
        method: 'GET',
        url: '/cases/{id}/citizen/{id}/event',
        message: 'Error when getting agreed deadline response date',
      },
    });
    expect(isAppInsightsExceptionTracked(error)).toBe(true);
  });

  it.each([400, 401, 404])('logs a %s but does not track it as an exception', async (status) => {
    const error = axiosError(status, {method: 'post', url: '/assignment/reference/1738173817381738'});
    const operation = jest.fn().mockRejectedValue(error);

    await expect(executeRequest(operation, 'Error when verifying pin')).rejects.toBe(error);

    expect(getLoggerError()).toHaveBeenCalled();
    expect(getTrackException()).not.toHaveBeenCalled();
    expect(isAppInsightsExceptionTracked(error)).toBe(false);
  });

  it('tracks a function-handler failure with method and url and no message', async () => {
    const error = axiosError(403, {method: 'put', url: '/fees/hearing/RC-1234-5678-9012'});
    const operation = jest.fn().mockRejectedValue(error);

    await expect(executeRequest(operation, () => undefined)).rejects.toBe(error);

    expect(getTrackException()).toHaveBeenCalledWith({
      exception: error,
      properties: {
        source: 'civilServiceClient',
        status: '403',
        method: 'PUT',
        url: '/fees/hearing/{id}',
      },
    });
  });

  it('logs the stack for a 5xx but leaves exception tracking to the global handler', async () => {
    const error = axiosError(502);
    const operation = jest.fn().mockRejectedValue(error);

    await expect(executeRequest(operation, 'Error when getting court location')).rejects.toBe(error);

    expect(getLoggerError().mock.calls[0][0]).toContain('at Client.request (civilServiceClient.ts:10:5)');
    expect(getTrackException()).not.toHaveBeenCalled();
  });

  it('does not track when the error handler throws, so callback 422s stay out of App Insights', async () => {
    const error = axiosError(422);
    const callbackError = new Error('callback');
    const operation = jest.fn().mockRejectedValue(error);

    await expect(executeRequest(operation, () => {
      throw callbackError;
    })).rejects.toBe(callbackError);

    expect(getTrackException()).not.toHaveBeenCalled();
  });

  it('returns the response when the call succeeds', async () => {
    const response = {data: {ok: true}} as AxiosResponse;
    const operation = jest.fn().mockResolvedValue(response);

    await expect(executeRequest(operation, 'unused')).resolves.toBe(response);
    expect(getLoggerError()).not.toHaveBeenCalled();
    expect(getTrackException()).not.toHaveBeenCalled();
  });
});

describe('civilServiceRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildAuthenticatedConfig', () => {
    it('should include Content-Type and Authorization from session access token', () => {
      const req = {
        session: {user: {accessToken: 'token-123'}},
      } as unknown as AppRequest;

      expect(buildAuthenticatedConfig(req)).toEqual({
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token-123',
        },
      });
    });

  });

  describe('buildJsonOnlyConfig', () => {
    it('should return Content-Type only headers', () => {
      expect(buildJsonOnlyConfig()).toEqual({
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('buildAuthorizationOnlyConfig', () => {
    it('should include Authorization from session access token', () => {
      const req = {
        session: {user: {accessToken: 'auth-token'}},
      } as unknown as AppRequest;

      expect(buildAuthorizationOnlyConfig(req)).toEqual({
        headers: {
          'Authorization': 'Bearer auth-token',
        },
      });
    });
  });

  describe('executeRequest', () => {
    const mockResponse = {
      data: {ok: true},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as AxiosResponse;

    it('should return the operation response on success', async () => {
      const operation = jest.fn().mockResolvedValue(mockResponse);

      const result = await executeRequest(operation, 'should not log');

      expect(result).toBe(mockResponse);
      expect(operation).toHaveBeenCalledTimes(1);
      expect(getLoggerError()).not.toHaveBeenCalled();
    });

    it('should log string error message and rethrow', async () => {
      const error = new Error('network failure');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(executeRequest(operation, 'Civil service request failed')).rejects.toBe(error);
      expect(getLoggerError()).toHaveBeenCalledWith(`Civil service request failed\n${error.stack}`);
    });

    it('should invoke error callback and rethrow', async () => {
      const error = new Error('callback failure');
      const operation = jest.fn().mockRejectedValue(error);
      const onError = jest.fn();

      await expect(executeRequest(operation, onError)).rejects.toBe(error);
      expect(onError).toHaveBeenCalledWith(error);
      expect(getLoggerError()).not.toHaveBeenCalled();
    });
  });
});
