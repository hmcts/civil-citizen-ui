import {
  CallbackError,
  extractCallbackErrorMessages,
  CallbackErrorResponseBody,
} from '../../../../../../main/app/client/common/error/callbackError';

describe('extractCallbackErrorMessages', () => {
  it('should return empty array when body is undefined', () => {
    expect(extractCallbackErrorMessages(undefined)).toEqual([]);
  });

  it('should return empty array when body has no errors', () => {
    expect(extractCallbackErrorMessages({})).toEqual([]);
  });

  it('should extract callbackErrors', () => {
    const body: CallbackErrorResponseBody = {
      callbackErrors: ['Business rule failed', 'Another error'],
    };

    expect(extractCallbackErrorMessages(body)).toEqual(['Business rule failed', 'Another error']);
  });

  it('should extract field_errors messages', () => {
    const body: CallbackErrorResponseBody = {
      details: {
        field_errors: [
          {id: 'email', message: 'Invalid email'},
          {id: 'date', message: 'Out of range'},
        ],
      },
    };

    expect(extractCallbackErrorMessages(body)).toEqual(['Invalid email', 'Out of range']);
  });

  it('should filter out missing or empty field error messages', () => {
    const body: CallbackErrorResponseBody = {
      details: {
        field_errors: [
          {id: 'a', message: 'Keep me'},
          {id: 'b'},
          {id: 'c', message: ''},
          {id: 'd', message: undefined},
        ],
      },
    };

    expect(extractCallbackErrorMessages(body)).toEqual(['Keep me']);
  });

  it('should combine callbackErrors and field_errors', () => {
    const body: CallbackErrorResponseBody = {
      callbackErrors: ['Callback failure'],
      details: {
        field_errors: [{id: 'field', message: 'Field failure'}],
      },
    };

    expect(extractCallbackErrorMessages(body)).toEqual(['Callback failure', 'Field failure']);
  });

  it('should treat missing callbackErrors as empty array', () => {
    const body: CallbackErrorResponseBody = {
      details: {
        field_errors: [{message: 'Only field'}],
      },
    };

    expect(extractCallbackErrorMessages(body)).toEqual(['Only field']);
  });
});

describe('CallbackError', () => {
  it('should set name, status, and use first callback error as message', () => {
    const error = new CallbackError(['First error', 'Second error'], ['Warning']);

    expect(error.name).toBe('CallbackError');
    expect(error.status).toBe(422);
    expect(error.message).toBe('First error');
    expect(error.callbackErrors).toEqual(['First error', 'Second error']);
    expect(error.callbackWarnings).toEqual(['Warning']);
  });

  it('should default message when callbackErrors is empty', () => {
    const error = new CallbackError([]);

    expect(error.message).toBe('Unprocessable Entity');
    expect(error.callbackErrors).toEqual([]);
    expect(error.callbackWarnings).toEqual([]);
  });

  it('should default message when callbackErrors is nullish', () => {
    const error = new CallbackError(null as unknown as string[]);

    expect(error.message).toBe('Unprocessable Entity');
    expect(error.callbackErrors).toEqual([]);
    expect(error.callbackWarnings).toEqual([]);
  });

  it('should default callbackWarnings when omitted', () => {
    const error = new CallbackError(['Only errors']);

    expect(error.callbackWarnings).toEqual([]);
  });
});
