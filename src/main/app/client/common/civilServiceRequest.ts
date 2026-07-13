import {AxiosRequestConfig, AxiosResponse} from 'axios';
import {AppRequest} from 'common/models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('civilServiceClient');

export const buildAuthenticatedConfig = (req: AppRequest): AxiosRequestConfig => ({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${req.session?.user?.accessToken}`,
  },
});

export const buildJsonOnlyConfig = (): AxiosRequestConfig => ({
  headers: {
    'Content-Type': 'application/json',
  },
});

export const buildAuthorizationOnlyConfig = (req: AppRequest): AxiosRequestConfig => ({
  headers: {
    'Authorization': `Bearer ${req.session?.user?.accessToken}`,
  },
});

export type RequestErrorHandler = string | ((err: unknown) => void);

export const executeRequest = async <T>(
  operation: () => Promise<AxiosResponse<T>>,
  onError: RequestErrorHandler,
): Promise<AxiosResponse<T>> => {
  try {
    return await operation();
  } catch (err: unknown) {
    if (typeof onError === 'string') {
      logger.error(onError);
    } else {
      onError(err);
    }
    throw err;
  }
};
