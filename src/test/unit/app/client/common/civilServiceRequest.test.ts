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
import {executeRequest} from 'client/common/civilServiceRequest';

const getLoggerError = () => require('@hmcts/nodejs-logging').Logger.getLogger('civilServiceClient').error as jest.Mock;
const getTrackException = () => require('applicationinsights').defaultClient.trackException as jest.Mock;

const axiosError = (status: number): Error => {
  const error = new Error(`Request failed with status code ${status}`);
  const stack = `AxiosError: Request failed with status code ${status}\n    at Client.request (civilServiceClient.ts:10:5)`;
  error.stack = stack;
  return Object.assign(error, {
    isAxiosError: true,
    status,
    response: {status},
  });
};

describe('executeRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs the error stack and tracks a 4xx exception', async () => {
    const error = axiosError(409);
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
        message: 'Error when getting agreed deadline response date',
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
