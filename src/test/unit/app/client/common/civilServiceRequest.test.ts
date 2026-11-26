jest.mock('@hmcts/nodejs-logging', () => ({
  Logger: (() => {
    const logger = {error: jest.fn(), warn: jest.fn()};
    return {getLogger: () => logger};
  })(),
}));

jest.mock('applicationinsights', () => ({
  defaultClient: {
    trackException: jest.fn(),
  },
}));

import {AxiosResponse} from 'axios';
import {executeRequest, logCivilServiceFailure} from 'client/common/civilServiceRequest';
import {isAppInsightsExceptionTracked} from 'modules/appinsights/trackedException';

const getLogger = () => require('@hmcts/nodejs-logging').Logger.getLogger('civilServiceClient') as {error: jest.Mock; warn: jest.Mock};
const getLoggerError = () => getLogger().error;
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
    expect(logged).toContain('status 409 GET /cases/{id}/citizen/{id}/event');
    expect(logged).not.toContain('pin=secret');
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

  it('logs a wrong pin at warn, with the case reference, status and path', () => {
    const error = axiosError(400, {method: 'post', url: '/assignment/reference/000MC039?pin=secret'});

    logCivilServiceFailure('Pin verification failed for case reference 000MC039', error, 'warn');

    const logged = getLogger().warn.mock.calls[0][0] as string;
    expect(logged).toContain('Pin verification failed for case reference 000MC039');
    expect(logged).toContain('status 400 POST /assignment/reference/{id}');
    expect(logged).not.toContain('pin=secret');
    expect(getLoggerError()).not.toHaveBeenCalled();
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
