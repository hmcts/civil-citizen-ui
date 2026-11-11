import {AxiosRequestConfig, AxiosResponse, isAxiosError} from 'axios';
import {AppRequest} from 'common/models/AppRequest';
import {markAppInsightsExceptionTracked} from 'modules/appinsights/trackedException';

const {Logger} = require('@hmcts/nodejs-logging');
const appInsights = require('applicationinsights');
const logger = Logger.getLogger('civilServiceClient');

// Outcomes the caller already handles: a wrong PIN (400/401), an expired session (401)
// and a missing claim (404). Recording them buries real faults in AppExceptions.
const EXPECTED_CLIENT_STATUSES = new Set([400, 401, 404]);
const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

const errorDetail = (err: unknown): string => {
  if (err instanceof Error) {
    return err.stack || err.message;
  }
  return String(err);
};

const responseStatus = (err: unknown): number | undefined => {
  if (isAxiosError(err)) {
    return err.response?.status ?? err.status;
  }
  if (typeof err === 'object' && err !== null && 'status' in err) {
    const status = (err as {status?: unknown}).status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
};

/**
 * Log the failure with its stack as text. Passing the Error object itself is fully redacted
 * by PII logging (message and stack become [REDACTED]), so the frames never reach App Insights.
 */
export const logCivilServiceFailure = (message: string, err: unknown): void => {
  const detail = errorDetail(err);
  logger.error(detail ? `${message}\n${detail}` : message);
};

/**
 * Path only, with case, user and document ids replaced. The query string is dropped
 * because it can carry a PIN or token, and the path itself contains the case id.
 */
const sanitiseRequestUrl = (url: string): string => {
  const path = url.split(/[?#]/, 1)[0];
  return path
    .replace(UUID_PATTERN, '{id}')
    .split('/')
    .map((segment) => {
      if (/^\d+$/.test(segment)) {
        return '{id}';
      }
      if (segment.length >= 8 && /\d/.test(segment)) {
        return '{id}';
      }
      return segment;
    })
    .join('/');
};

const requestTelemetry = (err: unknown): {method?: string; url?: string} => {
  if (!isAxiosError(err)) {
    return {};
  }
  const method = err.config?.method?.toUpperCase();
  const url = err.config?.url ? sanitiseRequestUrl(err.config.url) : undefined;
  return {
    ...(method ? {method} : {}),
    ...(url ? {url} : {}),
  };
};

/**
 * Record unexpected 4xx responses, such as 403 and 409. 400, 401 and 404 are left out,
 * and 5xx (including status-less failures, which the global handler treats as 500) are
 * left to that handler. Call this only when the caller's error handler has returned:
 * a thrown CallbackError (422) is intentionally left out of App Insights.
 * The error is marked so the global handler does not track it again.
 */
export const trackCivilServiceClientException = (err: unknown, message?: string): void => {
  const status = responseStatus(err);
  if (status === undefined || status >= 500 || EXPECTED_CLIENT_STATUSES.has(status)) {
    return;
  }
  const client = appInsights.defaultClient;
  if (!client) {
    return;
  }
  const exception = err instanceof Error ? err : new Error(message ?? 'Civil service request failed');
  try {
    client.trackException({
      exception,
      properties: {
        source: 'civilServiceClient',
        status: String(status),
        ...requestTelemetry(err),
        ...(message ? {message} : {}),
      },
    });
  } catch {
    // Telemetry must not replace the original failure.
    return;
  }
  markAppInsightsExceptionTracked(err);
};

export const reportCivilServiceFailure = (message: string, err: unknown): void => {
  logCivilServiceFailure(message, err);
  trackCivilServiceClientException(err, message);
};

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
      logCivilServiceFailure(onError, err);
      trackCivilServiceClientException(err, onError);
    } else {
      onError(err);
      trackCivilServiceClientException(err);
    }
    throw err;
  }
};
