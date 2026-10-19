import {GenericForm} from 'common/form/models/genericForm';
import {
  applyCcdFieldErrorsToForm,
  CallbackError,
  extractCallbackErrorMessages,
  extractCallbackOnlyMessages,
  extractCcdFieldErrors,
  isCallbackFieldValidationError,
  toCcdFieldErrorAnchorId,
} from '../../../../../../main/app/client/common/error/callbackError';

describe('callbackError helpers', () => {
  describe('extractCallbackOnlyMessages', () => {
    it('returns callbackErrors when present', () => {
      expect(extractCallbackOnlyMessages({
        callbackErrors: ['Business rule failed'],
      })).toEqual(['Business rule failed']);
    });

    it('returns an empty array when body is missing or has no callbackErrors', () => {
      expect(extractCallbackOnlyMessages(undefined)).toEqual([]);
      expect(extractCallbackOnlyMessages({})).toEqual([]);
    });
  });

  describe('extractCcdFieldErrors', () => {
    it('returns id and message for valid field_errors', () => {
      expect(extractCcdFieldErrors({
        details: {
          field_errors: [
            {id: 'respondent1.partyEmail', message: 'notanemail is not a valid Email address'},
          ],
        },
      })).toEqual([
        {id: 'respondent1.partyEmail', message: 'notanemail is not a valid Email address'},
      ]);
    });

    it('skips entries missing id or message', () => {
      expect(extractCcdFieldErrors({
        details: {
          field_errors: [
            {id: 'ok', message: 'valid'},
            {id: '', message: 'no id'},
            {id: 'missing-message'},
            {message: 'no id property'},
          ],
        },
      })).toEqual([{id: 'ok', message: 'valid'}]);
    });

    it('returns an empty array when body has no field_errors', () => {
      expect(extractCcdFieldErrors(undefined)).toEqual([]);
      expect(extractCcdFieldErrors({})).toEqual([]);
      expect(extractCcdFieldErrors({details: {}})).toEqual([]);
    });
  });

  describe('extractCallbackErrorMessages', () => {
    it('merges callback and field messages as strings (legacy behaviour)', () => {
      expect(extractCallbackErrorMessages({
        callbackErrors: ['Business rule failed'],
        details: {
          field_errors: [{id: 'email', message: 'Invalid email'}],
        },
      })).toEqual(['Business rule failed', 'Invalid email']);
    });
  });

  describe('CallbackError', () => {
    it('stores fieldErrors and reports hasFieldErrors', () => {
      const fieldErrors = [{id: 'email', message: 'Invalid email'}];
      const error = new CallbackError([], [], fieldErrors);

      expect(error.status).toBe(422);
      expect(error.name).toBe('CallbackError');
      expect(error.message).toBe('Invalid email');
      expect(error.fieldErrors).toEqual(fieldErrors);
      expect(error.hasFieldErrors()).toBe(true);
    });

    it('defaults fieldErrors to empty and hasFieldErrors to false', () => {
      const error = new CallbackError(['Business rule failed']);

      expect(error.callbackErrors).toEqual(['Business rule failed']);
      expect(error.fieldErrors).toEqual([]);
      expect(error.hasFieldErrors()).toBe(false);
    });
  });

  describe('toCcdFieldErrorAnchorId', () => {
    it('builds a safe HTML id from a CCD field path', () => {
      expect(toCcdFieldErrorAnchorId('respondent1.partyEmail')).toBe('ccd-field-respondent1-partyEmail');
      expect(toCcdFieldErrorAnchorId('generalAppType')).toBe('ccd-field-generalAppType');
    });
  });

  describe('applyCcdFieldErrorsToForm', () => {
    it('applies CCD field errors onto a GenericForm for GDS summary with linkable hrefs', () => {
      const form = new GenericForm({});
      applyCcdFieldErrorsToForm(form, [
        {id: 'respondent1.partyEmail', message: 'notanemail is not a valid Email address'},
      ]);

      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('ccd-field-respondent1-partyEmail')).toBe('notanemail is not a valid Email address');
      const [error] = form.getErrors();
      expect(error.href).toBe('#ccd-field-respondent1-partyEmail');
      expect(error.constraints?.ccdFieldError).toBe('notanemail is not a valid Email address');
    });

    it('detects CallbackError with field errors only', () => {
      expect(isCallbackFieldValidationError(new CallbackError([], [], [{id: 'email', message: 'bad'}]))).toBe(true);
      expect(isCallbackFieldValidationError(new CallbackError(['business rule']))).toBe(false);
      expect(isCallbackFieldValidationError(new Error('other'))).toBe(false);
    });

    it('does not treat mixed callbackErrors + field_errors as form remount', () => {
      expect(isCallbackFieldValidationError(new CallbackError(
        ['Business process must be finished'],
        [],
        [{id: 'email', message: 'Invalid email'}],
      ))).toBe(false);
    });
  });
});
