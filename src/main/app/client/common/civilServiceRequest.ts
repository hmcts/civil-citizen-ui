import {AxiosRequestConfig, AxiosResponse, isAxiosError} from 'axios';
import {AppRequest} from 'common/models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const appInsights = require('applicationinsights');
const logger = Logger.getLogger('civilServiceClient');

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
 * 5xx (and status-less failures, which the global handler treats as 500) are already sent via
 * trackException there. 401/403/409 and other client-caught 4xx are not, so record them here.
 * Call this only when the caller's error handler has returned: a thrown CallbackError (422)
 * is intentionally left out of App Insights.
 */
export const trackCivilServiceClientException = (err: unknown, message?: string): void => {
  const status = responseStatus(err);
  if (status === undefined || status >= 500) {
    return;
  }
  const exception = err instanceof Error ? err : new Error(message ?? 'Civil service request failed');
  try {
    appInsights.defaultClient?.trackException({
      exception,
      properties: {
        source: 'civilServiceClient',
        status: String(status),
        ...(message ? {message} : {}),
      },
    });
  } catch {
    // Telemetry must not replace the original failure.
  }
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
