import {HTTPError} from '../../../../HttpError';

/**
 * Shape of the structured body civil-service returns (from DTSCCI-5282) when a
 * CCD citizen-event callback is rejected: HTTP 422 with the callback errors and
 * warnings preserved.
 */
export interface CallbackErrorResponseBody {
  message?: string;
  error?: string;
  callbackErrors?: string[];
  callbackWarnings?: string[];
}

/**
 * Raised when civil-service returns a 422 with callback errors for a citizen
 * event. Carries the user-actionable messages so they can be surfaced instead
 * of the generic "Something went wrong" page.
 */
export class CallbackError extends HTTPError {
  callbackErrors: string[];
  callbackWarnings: string[];

  constructor(callbackErrors: string[], callbackWarnings: string[] = []) {
    super(callbackErrors?.[0] ?? 'Unprocessable Entity');
    this.name = 'CallbackError';
    this.status = 422;
    this.callbackErrors = callbackErrors ?? [];
    this.callbackWarnings = callbackWarnings ?? [];
  }
}
