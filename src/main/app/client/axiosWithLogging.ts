import Axios, {AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig} from 'axios';

const {Logger} = require('@hmcts/nodejs-logging');

const SENSITIVE_HEADERS = ['authorization', 'serviceauthorization', 'secret', 'cookie'];
const MAX_BODY_LOG_LENGTH = 2000;

function sanitiseHeaders(headers?: Record<string, unknown>): Record<string, unknown> {
  if (!headers || typeof headers !== 'object') return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase();
    out[key] = SENSITIVE_HEADERS.some(h => lower.includes(h)) ? '***' : value;
  }
  return out;
}

function redactSensitiveInBody(str: string): string {
  return str
    .replace(/client_secret=[^&]*/gi, 'client_secret=***')
    .replace(/code=[^&]*/gi, 'code=***')
    .replace(/oneTimePassword[^,}]*/gi, 'oneTimePassword:***');
}

function bodyForLog(data: unknown, responseType?: string): string {
  if (data === undefined || data === null) return '';
  if (responseType === 'arraybuffer' || data instanceof ArrayBuffer) return '[binary]';
  let str: string;
  if (typeof data === 'string') {
    str = data.length > MAX_BODY_LOG_LENGTH ? data.slice(0, MAX_BODY_LOG_LENGTH) + '...' : data;
  } else {
    try {
      str = JSON.stringify(data);
      str = str.length > MAX_BODY_LOG_LENGTH ? str.slice(0, MAX_BODY_LOG_LENGTH) + '...' : str;
    } catch {
      return '[non-serialisable]';
    }
  }
  return redactSensitiveInBody(str);
}

/**
 * Creates an Axios instance that logs every request and response.
 * Sensitive headers (e.g. Authorization) are redacted. Large or binary bodies are truncated.
 */
export function createAxiosInstanceWithLogging(config: AxiosRequestConfig, loggerName: string): AxiosInstance {
  const logger = Logger.getLogger(loggerName);
  const instance = Axios.create(config);

  if (instance.interceptors?.request) {
    instance.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const url = req.baseURL ? `${req.baseURL}${req.url}` : req.url;
    logger.info('API request', {
      method: req.method?.toUpperCase(),
      url,
      headers: sanitiseHeaders(req.headers as Record<string, unknown>),
      data: bodyForLog(req.data, req.responseType),
    });
    return req;
    }, (err) => {
      logger.error('API request error', err);
      return Promise.reject(err);
    });
  }

  if (instance.interceptors?.response) {
    instance.interceptors.response.use(
    (response) => {
      const url = response.config.baseURL ? `${response.config.baseURL}${response.config.url}` : response.config.url;
      logger.info('API response', {
        method: response.config.method?.toUpperCase(),
        url,
        status: response.status,
        statusText: response.statusText,
        data: bodyForLog(response.data, response.config.responseType),
      });
      return response;
    },
    (err) => {
      const url = err.config?.baseURL ? `${err.config.baseURL}${err.config?.url}` : err.config?.url;
      logger.error('API response error', {
        method: err.config?.method?.toUpperCase(),
        url,
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: err.message,
      });
      return Promise.reject(err);
    },
    );
  }

  return instance;
}
