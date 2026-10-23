import {HTTPError} from '../../../../HttpError';
import {GenericForm} from 'common/form/models/genericForm';
import {FormValidationError} from 'common/form/validationErrors/formValidationError';
import {SummaryRow} from 'common/models/summaryList/summaryList';
import {SummarySection} from 'common/models/summaryList/summarySections';
import {escapeHtml} from 'common/utils/escapeHtml';

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

/** Unmapped field error ready for the CYA fallback inline block. */
export interface UnmappedCcdFieldInlineError extends CcdFieldError {
  anchorId: string;
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

export function toCcdFieldErrorAnchorId(ccdFieldId: string): string {
  return `ccd-field-${ccdFieldId.replace(/[^a-zA-Z0-9_-]+/g, '-')}`;
}

export function applyCcdFieldErrorsToForm<T>(form: GenericForm<T>, fieldErrors: CcdFieldError[]): void {
  form.errors = form.errors ?? [];
  for (const fieldError of fieldErrors) {
    const anchorId = toCcdFieldErrorAnchorId(fieldError.id);
    form.errors.push(new FormValidationError({
      property: anchorId,
      constraints: {ccdFieldError: fieldError.message},
    }));
  }
}

/**
 * Attach CCD field_errors to matching CYA summary rows (by ccdFieldId) so the
 * GDS error summary can link to an inline message next to the answer.
 * Returns any field errors that could not be mapped to a row (fallback block).
 */
export function applyCcdFieldErrorsToSummaryRows(
  rows: SummaryRow[] | undefined,
  fieldErrors: CcdFieldError[],
  errorLabel: string,
): UnmappedCcdFieldInlineError[] {
  if (!fieldErrors?.length) {
    return [];
  }
  if (!rows?.length) {
    return fieldErrors.map(toUnmappedCcdFieldInlineError);
  }

  const unmapped: UnmappedCcdFieldInlineError[] = [];
  for (const fieldError of fieldErrors) {
    const row = rows.find(candidate => ccdFieldIdsMatch(candidate.ccdFieldId, fieldError.id));
    if (!row) {
      unmapped.push(toUnmappedCcdFieldInlineError(fieldError));
      continue;
    }
    attachCcdFieldErrorToSummaryRow(row, fieldError, errorLabel);
  }
  return unmapped;
}

export function ccdFieldIdsMatch(rowCcdFieldId: string | undefined, fieldErrorId: string): boolean {
  if (!rowCcdFieldId) {
    return false;
  }
  if (rowCcdFieldId === fieldErrorId) {
    return true;
  }
  return rowCcdFieldId.endsWith(`.${fieldErrorId}`) || fieldErrorId.endsWith(`.${rowCcdFieldId}`);
}

export function applyCcdFieldErrorsToSummarySections(
  sections: SummarySection[] | undefined,
  fieldErrors: CcdFieldError[],
  errorLabel: string,
): UnmappedCcdFieldInlineError[] {
  const rows = sections?.flatMap(section => section?.summaryList?.rows ?? []) ?? [];
  return applyCcdFieldErrorsToSummaryRows(rows, fieldErrors, errorLabel);
}

function toUnmappedCcdFieldInlineError(fieldError: CcdFieldError): UnmappedCcdFieldInlineError {
  return {
    id: fieldError.id,
    message: fieldError.message,
    anchorId: toCcdFieldErrorAnchorId(fieldError.id),
  };
}

function attachCcdFieldErrorToSummaryRow(
  row: SummaryRow,
  fieldError: CcdFieldError,
  errorLabel: string,
): void {
  const anchorId = toCcdFieldErrorAnchorId(fieldError.id);
  const errorHtml = buildCcdFieldInlineErrorHtml(anchorId, fieldError.message, errorLabel);
  const existingValue = row.value?.html
    ?? (row.value?.text != null ? escapeHtml(row.value.text) : '');
  row.value = {html: `${errorHtml}${existingValue}`};
}

export function buildCcdFieldInlineErrorHtml(
  anchorId: string,
  message: string,
  errorLabel: string,
): string {
  return `<p class="govuk-error-message" id="${escapeHtml(anchorId)}">`
    + `<span class="govuk-visually-hidden">${escapeHtml(errorLabel)}:</span> `
    + `${escapeHtml(message)}</p>`;
}

export function isCallbackFieldValidationError(error: unknown): error is CallbackError {
  return error instanceof CallbackError
    && error.hasFieldErrors()
    && !(error.callbackErrors?.length);
}

/** Known CCD case-field ids remounted on LiP Check your answers. */
export const CcdCyaFieldId = {
  APPLICANT1_PARTY_PHONE: 'applicant1.partyPhone',
  RESPONDENT1_PARTY_EMAIL: 'respondent1.partyEmail',
  RESPONDENT1_PARTY_PHONE: 'respondent1.partyPhone',
  GA_HEARING_EMAIL: 'generalAppHearingDetails.HearingDetailsEmailID',
  GA_HEARING_TELEPHONE: 'generalAppHearingDetails.HearingDetailsTelephoneNumber',
  GA_RESPONSE_HEARING_EMAIL: 'hearingDetailsResp.HearingDetailsEmailID',
  GA_RESPONSE_HEARING_TELEPHONE: 'hearingDetailsResp.HearingDetailsTelephoneNumber',
  APPLICANT1_MEDIATION_EMAIL: 'applicant1LiPResponseCarm.alternativeMediationEmail',
  APPLICANT1_MEDIATION_TELEPHONE: 'applicant1LiPResponseCarm.alternativeMediationTelephone',
  RESPONDENT1_MEDIATION_EMAIL: 'respondent1LiPResponseCarm.alternativeMediationEmail',
  RESPONDENT1_MEDIATION_TELEPHONE: 'respondent1LiPResponseCarm.alternativeMediationTelephone',
} as const;

