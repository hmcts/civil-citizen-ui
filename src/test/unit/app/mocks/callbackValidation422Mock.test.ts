import config from 'config';
import {CallbackValidationError} from '../../../../main/app/client/common/error/callbackValidationError';
import {
  isMockCallbackValidationSubmitRoute,
  MOCK_CALLBACK_VALIDATION_ERRORS,
  MOCK_CALLBACK_VALIDATION_WARNINGS,
  throwMockCallbackValidation422IfEnabled,
} from '../../../../main/app/mocks/callbackValidation422Mock';

jest.mock('config');

const mockConfigGet = config.get as jest.MockedFunction<typeof config.get>;

describe('callbackValidation422Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isMockCallbackValidationSubmitRoute', () => {
    it.each([
      '/case/123/qm/create-query-cya',
      '/case/123/case-progression/check-and-send?lang=en',
      '/case/abc/general-application/check-and-send',
    ])('matches demo CYA submit path %s', (path) => {
      expect(isMockCallbackValidationSubmitRoute(path)).toBe(true);
    });

    it('does not match unrelated routes', () => {
      expect(isMockCallbackValidationSubmitRoute('/case/123/response/check-and-send')).toBe(false);
      expect(isMockCallbackValidationSubmitRoute('/case/123/claimant-response/check-and-send')).toBe(false);
    });
  });

  describe('throwMockCallbackValidation422IfEnabled', () => {
    it('does nothing when mock is disabled', () => {
      mockConfigGet.mockReturnValue(false);

      expect(() =>
        throwMockCallbackValidation422IfEnabled({
          originalUrl: '/case/1/qm/create-query-cya',
          path: '/case/1/qm/create-query-cya',
        } as never),
      ).not.toThrow();
    });

    it('throws CallbackValidationError with demo messages when enabled on a target route', () => {
      mockConfigGet.mockReturnValue(true);

      expect(() =>
        throwMockCallbackValidation422IfEnabled({
          originalUrl: '/case/1/qm/create-query-cya',
          path: '/case/1/qm/create-query-cya',
        } as never),
      ).toThrow(CallbackValidationError);

      try {
        throwMockCallbackValidation422IfEnabled({
          originalUrl: '/case/1/general-application/check-and-send',
          path: '/case/1/general-application/check-and-send',
        } as never);
      } catch (error) {
        expect(error).toBeInstanceOf(CallbackValidationError);
        expect((error as CallbackValidationError).callbackErrors).toEqual(MOCK_CALLBACK_VALIDATION_ERRORS);
        expect((error as CallbackValidationError).callbackWarnings).toEqual(MOCK_CALLBACK_VALIDATION_WARNINGS);
      }
    });
  });
});
