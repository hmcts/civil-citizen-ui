import {HTTPError} from '../../../../HttpError';
import {GenericForm} from 'common/form/models/genericForm';
import {FormValidationError} from 'common/form/validationErrors/formValidationError';

/**
 * Shape of the structured body civil-service returns (from DTSCCI-5282) when a
 * CCD citizen-event submission is rejected with HTTP 422. CCD uses two distinct
 * envelopes:
 *  - callback-returned errors (e.g. business rules / the businessProcess guard)
 *    arrive as `callbackErrors`;
 *  - CCD field-type validation (e.g. invalid email, out-of-range date) arrives
 *    as a CaseValidationException with `details.field_errors[].message`.
 * Both carry user-actionable text we want to surface.
 */
export interface CallbackErrorResponseBody {
  message?: string;
  error?: string;
  callbackErrors?: string[];
  callbackWarnings?: string[];
  details?: {
    field_errors?: { id?: string; message?: string }[];
  };
}

export interface CcdFieldError {
  id: string;
  message: string;
}
/**
 * Pull the user-actionable messages out of either envelope a 422 can use:
 * the `callbackErrors` array and/or the CCD `details.field_errors` messages.
 */
export function extractCallbackErrorMessages(body?: CallbackErrorResponseBody): string[] {
  if (!body) {
    return [];
  }
  const callbackErrors = body.callbackErrors ?? [];
  const fieldErrors = (body.details?.field_errors ?? [])
    .map(fieldError => fieldError?.message)
    .filter((message): message is string => typeof message === 'string' && message.length > 0);
  return [...callbackErrors, ...fieldErrors];
}

export function extractCallbackOnlyMessages(body?: CallbackErrorResponseBody): string[] {
  return body?.callbackErrors ?? [];
}

export function extractCcdFieldErrors(body?: CallbackErrorResponseBody): CcdFieldError[] {
  if (!body?.details?.field_errors?.length) {
    return [];
  }
  return body.details.field_errors
    .filter((fe): fe is {id: string; message: string} =>
      typeof fe?.id === 'string' && fe.id.length > 0
    && typeof fe?.message === 'string' && fe.message.length > 0)
    .map(fe => ({id: fe.id, message: fe.message}));
}
/**
 * Raised when civil-service returns a 422 with callback errors for a citizen
 * event. Carries the user-actionable messages so they can be surfaced instead
 * of the generic "Something went wrong" page.
 */
export class CallbackError extends HTTPError {
  callbackErrors: string[];
  callbackWarnings: string[];
  fieldErrors: CcdFieldError[];

  constructor(callbackErrors: string[], callbackWarnings: string[] = [], fieldErrors: CcdFieldError[] = []) {
    super(callbackErrors?.[0] ?? fieldErrors?.[0]?.message?? 'Unprocessable Entity');
    this.name = 'CallbackError';
    this.status = 422;
    this.callbackErrors = callbackErrors ?? [];
    this.callbackWarnings = callbackWarnings ?? [];
    this.fieldErrors = fieldErrors ?? [];
  }
  hasFieldErrors(): boolean {
    return this.fieldErrors.length > 0;
  }
}

export function applyCcdFieldErrorsToForm<T>(form: GenericForm<T>, fieldErrors: CcdFieldError[]): void {
  form.errors = form.errors ?? [];
  for (const fieldError of fieldErrors) {
    form.errors.push(new FormValidationError({
      property: fieldError.id,
      constraints: {ccdFieldError: fieldError.message},
    }));
  }
}

export function isCallbackFieldValidationError(error: unknown): error is CallbackError {
  return error instanceof CallbackError && error.hasFieldErrors();
}
