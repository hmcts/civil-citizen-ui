import {AxiosError} from 'axios';
import {
  CallbackValidationError,
  parseCallbackValidationBody,
  parseCallbackValidationFromAxiosError,
  toGovUkErrorList,
} from '../../../../../../main/app/client/common/error/callbackValidationError';

describe('parseCallbackValidationBody', () => {
  it('parses callbackErrors and callbackWarnings from a structured body', () => {
    const result = parseCallbackValidationBody({
      callbackErrors: ['You must upload documents'],
      callbackWarnings: ['This is a warning'],
    });

    expect(result).toEqual({
      callbackErrors: ['You must upload documents'],
      callbackWarnings: ['This is a warning'],
    });
  });

  it('parses CCD array response format from Feign', () => {
    const result = parseCallbackValidationBody([{
      status: 422,
      callbackErrors: ['Business process not finished'],
      callbackWarnings: [],
    }]);

    expect(result?.callbackErrors).toEqual(['Business process not finished']);
    expect(result?.callbackWarnings).toEqual([]);
  });

  it('parses JSON string bodies', () => {
    const result = parseCallbackValidationBody(JSON.stringify({
      callbackErrors: ['Error from callback'],
      callbackWarnings: [],
    }));

    expect(result?.callbackErrors).toEqual(['Error from callback']);
  });

  it('returns null when no callback errors or warnings are present', () => {
    expect(parseCallbackValidationBody({callbackErrors: [], callbackWarnings: []})).toBeNull();
    expect(parseCallbackValidationBody(null)).toBeNull();
    expect(parseCallbackValidationBody('not-json')).toBeNull();
  });

  it('filters out non-string entries', () => {
    const result = parseCallbackValidationBody({
      callbackErrors: ['valid', 1, '', '  '],
      callbackWarnings: [null, 'warning'],
    });

    expect(result).toEqual({
      callbackErrors: ['valid'],
      callbackWarnings: ['warning'],
    });
  });
});

describe('parseCallbackValidationFromAxiosError', () => {
  it('extracts callback validation from axios 422 response', () => {
    const error = {
      response: {
        status: 422,
        data: {
          callbackErrors: ['Unable to submit'],
          callbackWarnings: [],
        },
      },
    } as AxiosError;

    expect(parseCallbackValidationFromAxiosError(error)).toEqual({
      callbackErrors: ['Unable to submit'],
      callbackWarnings: [],
    });
  });
});

describe('CallbackValidationError', () => {
  it('stores callback errors and warnings', () => {
    const error = new CallbackValidationError(['Error one'], ['Warning one']);
    expect(error.name).toBe('CallbackValidationError');
    expect(error.callbackErrors).toEqual(['Error one']);
    expect(error.callbackWarnings).toEqual(['Warning one']);
  });
});

describe('toGovUkErrorList', () => {
  it('maps messages to govuk error summary items', () => {
    expect(toGovUkErrorList(['Error one', 'Error two'])).toEqual([
      {text: 'Error one'},
      {text: 'Error two'},
    ]);
  });
});
