import axios, {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import {
  attachCivilServiceHttpLogging,
  sanitizeForLog,
} from '../../../../../main/app/client/common/civilServiceHttpLogging';

jest.mock('@hmcts/nodejs-logging', () => {
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  };
  return {
    Logger: {
      getLogger: jest.fn(() => logger),
    },
  };
});

const {Logger} = require('@hmcts/nodejs-logging');
const mockInfo = Logger.getLogger().info as jest.Mock;
const mockError = Logger.getLogger().error as jest.Mock;

const getLatestRequestInterceptor = (client: AxiosInstance) => {
  const handlers = (client.interceptors.request as unknown as {handlers: {fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig}[]}).handlers;
  return handlers[handlers.length - 1].fulfilled;
};

const getLatestResponseInterceptors = (client: AxiosInstance) => {
  const handlers = (client.interceptors.response as unknown as {
    handlers: {
      fulfilled: (response: unknown) => unknown;
      rejected: (error: unknown) => unknown;
    }[];
  }).handlers;
  return handlers[handlers.length - 1];
};

describe('civilServiceHttpLogging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeForLog', () => {
    it('should stringify JSON payloads', () => {
      expect(sanitizeForLog({event: 'TEST_EVENT', caseId: '123'})).toBe(
        '{"event":"TEST_EVENT","caseId":"123"}',
      );
    });

    it('should summarise binary payloads', () => {
      expect(sanitizeForLog(Buffer.from('test'))).toEqual({
        _type: 'Buffer',
        byteLength: 4,
      });
    });

    it('should summarise FormData file uploads', () => {
      const formData = new FormData();
      formData.append('file', new Blob(['content'], {type: 'application/pdf'}), 'test.pdf');

      expect(sanitizeForLog(formData)).toEqual({
        _type: 'FormData',
        file: {_type: 'Blob', size: 7, mimeType: 'application/pdf'},
      });
    });

    it('should truncate very large payloads', () => {
      const largePayload = 'x'.repeat(10_500);
      const result = sanitizeForLog(largePayload) as string;

      expect(result).toContain('[truncated, totalLength=10500]');
      expect(result.length).toBeLessThan(10_500);
    });
  });

  describe('attachCivilServiceHttpLogging', () => {
    let client: AxiosInstance;

    beforeEach(() => {
      client = axios.create({baseURL: 'http://civil-service'});
      attachCivilServiceHttpLogging(client);
    });

    it('should log request and successful response payloads', () => {
      const requestInterceptor = getLatestRequestInterceptor(client);
      const responseInterceptor = getLatestResponseInterceptors(client);

      requestInterceptor({
        method: 'get',
        baseURL: 'http://civil-service',
        url: '/cases/123',
      } as InternalAxiosRequestConfig);

      responseInterceptor.fulfilled({
        status: 200,
        data: {id: '123'},
        config: {
          method: 'get',
          baseURL: 'http://civil-service',
          url: '/cases/123',
        },
        headers: {},
      });

      expect(mockInfo).toHaveBeenCalledWith('Civil service request', {
        method: 'GET',
        url: 'http://civil-service/cases/123',
        body: undefined,
      });
      expect(mockInfo).toHaveBeenCalledWith('Civil service response', {
        method: 'GET',
        url: 'http://civil-service/cases/123',
        status: 200,
        body: '{"id":"123"}',
      });
    });

    it('should log request and error response payloads', async () => {
      const requestInterceptor = getLatestRequestInterceptor(client);
      const responseInterceptor = getLatestResponseInterceptors(client);

      requestInterceptor({
        method: 'post',
        baseURL: 'http://civil-service',
        url: '/cases/123/citizen/1/event',
        data: {event: 'CREATE_LIP_CLAIM'},
      } as InternalAxiosRequestConfig);

      const axiosError = new AxiosError(
        'Request failed with status code 400',
        'ERR_BAD_REQUEST',
        {
          method: 'post',
          baseURL: 'http://civil-service',
          url: '/cases/123/citizen/1/event',
          data: {event: 'CREATE_LIP_CLAIM'},
        },
        {},
        {
          status: 400,
          data: {message: 'Validation failed'},
          statusText: 'Bad Request',
          headers: {},
          config: {},
        },
      );

      await expect(responseInterceptor.rejected(axiosError)).rejects.toThrow('Request failed with status code 400');

      expect(mockInfo).toHaveBeenCalledWith('Civil service request', {
        method: 'POST',
        url: 'http://civil-service/cases/123/citizen/1/event',
        body: '{"event":"CREATE_LIP_CLAIM"}',
      });
      expect(mockError).toHaveBeenCalledWith('Civil service error response', {
        method: 'POST',
        url: 'http://civil-service/cases/123/citizen/1/event',
        status: 400,
        message: 'Request failed with status code 400',
        requestBody: '{"event":"CREATE_LIP_CLAIM"}',
        responseBody: '{"message":"Validation failed"}',
      });
    });
  });
});
