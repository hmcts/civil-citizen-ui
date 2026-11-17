import {
  CallbackError,
  extractCallbackErrorMessages,
  extractCallbackOnlyMessage,
  extractCcdFieldErrors,
  isCallbackFieldValidationError,
} from 'client/common/error/callbackError';

describe('callbackError helpers', () => {
  describe('extractCallbackOnlyMessage', () => {
    it('returns callbackErrors only', () => {
      expect(extractCallbackOnlyMessage({
        callbackErrors: ['Business rule failed'],
        details: {field_errors: [{id: 'email', message: 'bad email'}]},
      })).toEqual(['Business rule failed']);
    });

    it('returns an empty array when body is missing', () => {
      expect(extractCallbackOnlyMessage()).toEqual([]);
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
            {id: 'blank-message', message: ''},
          ],
        },
      })).toEqual([{id: 'ok', message: 'valid'}]);
    });

    it('returns an empty array when there are no field_errors', () => {
      expect(extractCcdFieldErrors({callbackErrors: ['only callback']})).toEqual([]);
      expect(extractCcdFieldErrors()).toEqual([]);
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
    it('uses the first callback message as Error.message when present', () => {
      const error = new CallbackError(['callback message'], [], [{id: 'email', message: 'field message'}]);
      expect(error.message).toBe('callback message');
      expect(error.callbackErrors).toEqual(['callback message']);
      expect(error.fieldErrors).toEqual([{id: 'email', message: 'field message'}]);
    });

    it('falls back to the first field message when callbackErrors is empty', () => {
      const error = new CallbackError([], [], [{id: 'email', message: 'Invalid email'}]);
      expect(error.message).toBe('Invalid email');
      expect(error.hasFieldErrors()).toBe(true);
    });
  });

  describe('isCallbackFieldValidationError', () => {
    it('is true for field-only CallbackErrors', () => {
      expect(isCallbackFieldValidationError(
        new CallbackError([], [], [{id: 'email', message: 'bad'}]),
      )).toBe(true);
    });

    it('is false for callback-only, mixed, or non-CallbackError values', () => {
      expect(isCallbackFieldValidationError(new CallbackError(['callback'], []))).toBe(false);
      expect(isCallbackFieldValidationError(
        new CallbackError(['callback'], [], [{id: 'email', message: 'bad'}]),
      )).toBe(false);
      expect(isCallbackFieldValidationError(new Error('nope'))).toBe(false);
    });
  });
});
