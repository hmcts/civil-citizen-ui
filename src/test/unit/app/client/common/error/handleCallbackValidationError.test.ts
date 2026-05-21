import {
  CallbackErrorViewData,
  callbackErrorRenderProps,
  ensureValueForCallbackRender,
  getCallbackErrorViewData,
  handleCallbackValidationErrorOrNext,
  toCallbackErrorViewData,
} from '../../../../../../main/app/client/common/error/handleCallbackValidationError';
import {CallbackValidationError} from '../../../../../../main/app/client/common/error/callbackValidationError';
import {NextFunction, Response} from 'express';

describe('callbackErrorRenderProps', () => {
  it('returns undefined callback fields when no view data is provided', () => {
    expect(callbackErrorRenderProps()).toEqual({
      callbackErrors: undefined,
      callbackWarnings: undefined,
    });
  });

  it('maps callback errors and warnings for template locals', () => {
    const viewData: CallbackErrorViewData = {
      callbackErrors: [{text: 'Error one'}],
      callbackWarnings: ['Warning one'],
    };

    expect(callbackErrorRenderProps(viewData)).toEqual({
      callbackErrors: [{text: 'Error one'}],
      callbackWarnings: ['Warning one'],
    });
  });
});

describe('ensureValueForCallbackRender', () => {
  it('returns the existing value when already loaded', async () => {
    const load = jest.fn().mockResolvedValue({id: 'loaded'});
    await expect(ensureValueForCallbackRender({id: 'existing'}, load)).resolves.toEqual({id: 'existing'});
    expect(load).not.toHaveBeenCalled();
  });

  it('loads the value when it was not set before submit failed', async () => {
    const load = jest.fn().mockResolvedValue({id: 'loaded'});
    await expect(ensureValueForCallbackRender(undefined, load)).resolves.toEqual({id: 'loaded'});
    expect(load).toHaveBeenCalledTimes(1);
  });
});

describe('getCallbackErrorViewData', () => {
  it('converts CallbackValidationError to view data', () => {
    const error = new CallbackValidationError(['Business rule failed'], ['Heads up']);
    expect(getCallbackErrorViewData(error)).toEqual(toCallbackErrorViewData(error));
  });

  it('returns undefined for non-callback errors', () => {
    expect(getCallbackErrorViewData(new Error('other'))).toBeUndefined();
  });
});

describe('handleCallbackValidationErrorOrNext', () => {
  const mockResponse = {} as Response;
  const mockNext = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('re-renders the page when civil-service returns callback validation', async () => {
    const error = new CallbackValidationError(['Validation failed'], []);
    const render = jest.fn().mockResolvedValue(undefined);

    await handleCallbackValidationErrorOrNext(error, mockResponse, mockNext, render);

    expect(render).toHaveBeenCalledWith({
      callbackErrors: [{text: 'Validation failed'}],
      callbackWarnings: [],
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('delegates to next when the error is not callback validation', async () => {
    const error = new Error('Server error');
    const render = jest.fn();

    await handleCallbackValidationErrorOrNext(error, mockResponse, mockNext, render);

    expect(render).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
