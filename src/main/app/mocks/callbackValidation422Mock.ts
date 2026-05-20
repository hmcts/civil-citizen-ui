import config from 'config';
import {Request} from 'express';
import {CallbackValidationError} from 'client/common/error/callbackValidationError';

/** Sample payload aligned with CCD/civil-service 422 callback validation (DTSCCI-5282 demo). */
export const MOCK_CALLBACK_VALIDATION_ERRORS = [
  'The case data is not valid for the current state',
  'Case status is not valid',
];

export const MOCK_CALLBACK_VALIDATION_WARNINGS = [
  'The case state will not be saved',
];

const MOCK_SUBMIT_PATH_SUFFIXES = [
  '/qm/create-query-cya',
  '/case-progression/check-and-send',
  '/claimant-response/check-and-send',
] as const;

export const isMockCallbackValidationSubmitRoute = (requestPath: string): boolean => {
  const pathWithoutQuery = requestPath.split('?')[0];
  return MOCK_SUBMIT_PATH_SUFFIXES.some((suffix) => pathWithoutQuery.endsWith(suffix));
};

export const isCallbackValidation422MockEnabled = (): boolean =>
  config.get<boolean>('mock.callbackValidation422.enabled');

/**
 * When enabled (preview mock branch), simulates civil-service HTTP 422 on selected CYA POST routes
 * so callback errors/warnings render without a real CCD callback failure.
 */
export const throwMockCallbackValidation422IfEnabled = (req: Request): void => {
  if (!isCallbackValidation422MockEnabled()) {
    return;
  }

  const requestPath = req.originalUrl || req.path;
  if (!isMockCallbackValidationSubmitRoute(requestPath)) {
    return;
  }

  throw new CallbackValidationError(
    MOCK_CALLBACK_VALIDATION_ERRORS,
    MOCK_CALLBACK_VALIDATION_WARNINGS,
  );
};
