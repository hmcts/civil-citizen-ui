import {AxiosResponse} from 'axios';
import {AppRequest} from 'common/models/AppRequest';
import {
  buildAuthenticatedConfig,
  buildJsonOnlyConfig,
  buildAuthorizationOnlyConfig,
  executeRequest,
} from '../../../../../main/app/client/common/civilServiceRequest';

jest.mock('@hmcts/nodejs-logging', () => {
  const logger = {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
  return {
    Logger: {
      getLogger: () => logger,
    },
    mockLogger: logger,
  };
});

const {mockLogger} = jest.requireMock('@hmcts/nodejs-logging') as {
  mockLogger: {error: jest.Mock; info: jest.Mock; warn: jest.Mock};
};

describe('civilServiceRequest', () => {
  beforeEach(() => {
    mockLogger.error.mockClear();
    mockLogger.info.mockClear();
    mockLogger.warn.mockClear();
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
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should log string error message and rethrow', async () => {
      const error = new Error('network failure');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(executeRequest(operation, 'Civil service request failed')).rejects.toBe(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Civil service request failed');
    });

    it('should invoke error callback and rethrow', async () => {
      const error = new Error('callback failure');
      const operation = jest.fn().mockRejectedValue(error);
      const onError = jest.fn();

      await expect(executeRequest(operation, onError)).rejects.toBe(error);
      expect(onError).toHaveBeenCalledWith(error);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });
});
