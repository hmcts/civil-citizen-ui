import {NextFunction, Response} from 'express';
import {
  CallbackValidationError,
  GovUkErrorListItem,
  isCallbackValidationError,
  toGovUkErrorList,
} from 'client/common/error/callbackValidationError';

export type CallbackErrorViewData = {
  callbackErrors: GovUkErrorListItem[];
  callbackWarnings: string[];
};

export const toCallbackErrorViewData = (error: CallbackValidationError): CallbackErrorViewData => ({
  callbackErrors: toGovUkErrorList(error.callbackErrors),
  callbackWarnings: error.callbackWarnings,
});

export const getCallbackErrorViewData = (error: unknown): CallbackErrorViewData | undefined => {
  if (!isCallbackValidationError(error)) {
    return undefined;
  }
  return toCallbackErrorViewData(error);
};

/**
 * Renders the CYA page with callback errors when civil-service returns HTTP 422.
 * Returns true when the error was handled; false when the caller should pass to next().
 */
export const handleCallbackValidationError = (
  error: unknown,
  renderWithCallbackErrors: (viewData: CallbackErrorViewData) => void | Promise<void>,
): boolean => {
  const viewData = getCallbackErrorViewData(error);
  if (!viewData) {
    return false;
  }
  void Promise.resolve(renderWithCallbackErrors(viewData));
  return true;
};

export const handleCallbackValidationErrorOrNext = async (
  error: unknown,
  res: Response,
  next: NextFunction,
  renderWithCallbackErrors: (viewData: CallbackErrorViewData) => void | Promise<void>,
): Promise<void> => {
  const viewData = getCallbackErrorViewData(error);
  if (!viewData) {
    next(error as Error);
    return;
  }
  await renderWithCallbackErrors(viewData);
};
