import {GenericForm} from 'common/form/models/genericForm';
import {FormValidationError} from 'common/form/validationErrors/formValidationError';
import {SummaryRow} from 'common/models/summaryList/summaryList';
import {SummarySection} from 'common/models/summaryList/summarySections';
import {CcdFieldError} from 'client/common/error/callbackError';
import {escapeHtml} from 'common/utils/escapeHtml';

const CYA_FIELD_ERROR_MESSAGE = 'ERRORS.ENTER_VALID_ANSWER_BEFORE_SUBMITTING';

const WITNESS_TO_DQ_CCD_FIELD_ID =
  /^(applicant|respondent)1Witnesses\.(\d+)\.(email|phone|phoneNumber|telephone)$/;

export function toCcdFieldErrorAnchorId(ccdFieldId: string): string {
  return `ccd-field-${ccdFieldId.replace(/[^a-zA-Z0-9_-]+/g, '-')}`;
}

export function canonicalizeCcdFieldErrorId(id: string): string {
  const match = WITNESS_TO_DQ_CCD_FIELD_ID.exec(id);
  if (!match) return id;
  const [, party, index, field] = match;
  const leaf = field === 'email' ? 'emailAddress' : 'phoneNumber';
  return `${party}1DQWitnesses.details.${index}.${leaf}`;
}

function normalizeCcdFieldErrors(fieldErrors: CcdFieldError[] | undefined): CcdFieldError[] {
  if (!fieldErrors?.length) return [];
  const seen = new Set<string>();
  const result: CcdFieldError[] = [];
  for (const fieldError of fieldErrors) {
    const id = canonicalizeCcdFieldErrorId(fieldError.id);
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(id === fieldError.id ? fieldError : {...fieldError, id});
  }
  return result;
}

function ccdFieldIdsMatch(rowCcdFieldId: string | undefined, fieldErrorId: string): boolean {
  if (!rowCcdFieldId) return false;
  if (rowCcdFieldId === fieldErrorId) return true;
  return rowCcdFieldId.endsWith(`.${fieldErrorId}`) || fieldErrorId.endsWith(`.${rowCcdFieldId}`);
}

export function applyCcdFieldErrorsToForm<T>(form: GenericForm<T>, fieldErrors: CcdFieldError[]): void {
  form.errors = form.errors ?? [];
  for (const fieldError of normalizeCcdFieldErrors(fieldErrors)) {
    form.errors.push(new FormValidationError({
      property: toCcdFieldErrorAnchorId(fieldError.id),
      constraints: {ccdFieldError: CYA_FIELD_ERROR_MESSAGE},
    }));
  }
}

function buildInlineErrorHtml(anchorId: string, message: string, errorLabel: string): string {
  return `<p class="govuk-error-message" id="${escapeHtml(anchorId)}">`
    + `<span class="govuk-visually-hidden">${escapeHtml(errorLabel)}:</span> `
    + `${escapeHtml(message)}</p>`;
}

function attachToRow(row: SummaryRow, fieldError: CcdFieldError, errorLabel: string, displayMessage: string): void {
  const anchorId = toCcdFieldErrorAnchorId(fieldError.id);
  const errorHtml = buildInlineErrorHtml(anchorId, displayMessage, errorLabel);
  const existing = row.value?.html
    ?? (row.value?.text != null ? escapeHtml(row.value.text) : '');
  row.value = {html: `${errorHtml}${existing}`};
}

export type UnmappedCcdFieldError = CcdFieldError & { anchorId: string };

export function applyCcdFieldErrorsToSummaryRows(
  rows: SummaryRow[] | undefined,
  fieldErrors: CcdFieldError[],
  errorLabel: string,
  displayMessage: string,
): UnmappedCcdFieldError[] {
  const normalized = normalizeCcdFieldErrors(fieldErrors);
  if (!normalized.length) return [];
  if (!rows?.length) {
    return normalized.map(fe => ({...fe, anchorId: toCcdFieldErrorAnchorId(fe.id)}));
  }

  const unmapped: UnmappedCcdFieldError[] = [];
  for (const fieldError of normalized) {
    const row = rows.find(r => ccdFieldIdsMatch(r.ccdFieldId, fieldError.id));
    if (!row) {
      unmapped.push({...fieldError, anchorId: toCcdFieldErrorAnchorId(fieldError.id)});
      continue;
    }
    attachToRow(row, fieldError, errorLabel, displayMessage);
  }
  return unmapped;
}

export function applyCcdFieldErrorsToSummarySections(
  sections: SummarySection[] | undefined,
  fieldErrors: CcdFieldError[],
  errorLabel: string,
  displayMessage: string,
): UnmappedCcdFieldError[] {
  const rows = sections?.flatMap(s => s?.summaryList?.rows ?? []) ?? [];
  return applyCcdFieldErrorsToSummaryRows(rows, fieldErrors, errorLabel, displayMessage);
}

export function applyCcdFieldErrorsToCya<T>(
  form: GenericForm<T>,
  sections: SummarySection[] | undefined,
  fieldErrors: CcdFieldError[],
  errorLabel: string,
  displayMessage: string,
): UnmappedCcdFieldError[] {
  applyCcdFieldErrorsToForm(form, fieldErrors);
  return applyCcdFieldErrorsToSummarySections(sections, fieldErrors, errorLabel, displayMessage);
}
