import {AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig} from 'axios';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('civilServiceClient');

const MAX_LOG_PAYLOAD_LENGTH = 10_000;

const buildRequestUrl = (config: InternalAxiosRequestConfig): string => {
  const baseURL = config.baseURL ?? '';
  const url = config.url ?? '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

const truncate = (value: string): string => {
  if (value.length <= MAX_LOG_PAYLOAD_LENGTH) {
    return value;
  }
  return `${value.slice(0, MAX_LOG_PAYLOAD_LENGTH)}... [truncated, totalLength=${value.length}]`;
};

const sanitizeBinary = (data: unknown, type: string): Record<string, unknown> => ({
  _type: type,
  byteLength: data instanceof ArrayBuffer
    ? data.byteLength
    : Buffer.isBuffer(data)
      ? data.length
      : data instanceof Uint8Array
        ? data.byteLength
        : undefined,
});

const sanitizeFormData = (formData: FormData): Record<string, unknown> => {
  const fields: Record<string, unknown> = {_type: 'FormData'};
  formData.forEach((value, key) => {
    if (value instanceof Blob) {
      fields[key] = {_type: 'Blob', size: value.size, mimeType: value.type};
    } else if (value !== null && typeof value === 'object') {
      const fileLike = value as {size?: number; path?: string; originalFilename?: string};
      if ('size' in fileLike && 'path' in fileLike) {
        fields[key] = {
          _type: 'File',
          size: fileLike.size,
          filename: fileLike.originalFilename ?? fileLike.path,
        };
      } else {
        fields[key] = value;
      }
    } else {
      fields[key] = value;
    }
  });
  return fields;
};

export const sanitizeForLog = (data: unknown): unknown => {
  if (data === undefined || data === null) {
    return data;
  }

  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return sanitizeFormData(data);
  }

  if (Buffer.isBuffer(data)) {
    return sanitizeBinary(data, 'Buffer');
  }

  if (data instanceof ArrayBuffer) {
    return sanitizeBinary(data, 'ArrayBuffer');
  }

  if (data instanceof Uint8Array) {
    return sanitizeBinary(data, 'Uint8Array');
  }

  if (typeof data === 'string') {
    return truncate(data);
  }

  try {
    return truncate(JSON.stringify(data));
  } catch {
    return '[Unserializable payload]';
  }
};

const logRequest = (config: InternalAxiosRequestConfig): void => {
  logger.info('Civil service request', {
    method: config.method?.toUpperCase(),
    url: buildRequestUrl(config),
    body: sanitizeForLog(config.data),
  });
};

const logSuccessResponse = (response: AxiosResponse): void => {
  logger.info('Civil service response', {
    method: response.config.method?.toUpperCase(),
    url: buildRequestUrl(response.config),
    status: response.status,
    body: sanitizeForLog(response.data),
  });
};

const logErrorResponse = (error: AxiosError): void => {
  logger.error('Civil service error response', {
    method: error.config?.method?.toUpperCase(),
    url: error.config ? buildRequestUrl(error.config) : undefined,
    status: error.response?.status,
    message: error.message,
    requestBody: sanitizeForLog(error.config?.data),
    responseBody: sanitizeForLog(error.response?.data),
  });
};

export const attachCivilServiceHttpLogging = (client: AxiosInstance): void => {
  if (!client?.interceptors?.request?.use || !client?.interceptors?.response?.use) {
    return;
  }

  client.interceptors.request.use((config) => {
    logRequest(config);
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      logSuccessResponse(response);
      return response;
    },
    (error: AxiosError) => {
      logErrorResponse(error);
      return Promise.reject(error);
    },
  );
};
