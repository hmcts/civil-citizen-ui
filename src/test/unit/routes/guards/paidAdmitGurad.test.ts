import express, {NextFunction} from 'express';
import {getCaseDataFromStore} from '../../../../main/modules/draft-store/draftStoreService';
import {RESPONSE_TASK_LIST_URL} from '../../../../main/routes/urls';
import {Claim} from '../../../../main/common/models/claim';
import {PartAdmitGuard} from '../../../../main/routes/guards/partAdmitGuard';
import {HowMuchDoYouOwe} from '../../../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/routes/features/response/checkAnswersController');
jest.mock('../../../../main/services/features/common/taskListService');
jest.mock('../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const MOCK_REQUEST = {params: {id: '123'}} as unknown as express.Request;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as express.Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Response - Part Admit Amount not entered', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCaseData.mockReset();
  });

  describe('on GET', () => {
    it('should call next middleware function which will render payment plan screen', async () => {
      // Given
      const claim = new Claim();
      const howMuchDoYouOwe = new HowMuchDoYouOwe(100, 1000);
      claim.partialAdmission = {
        alreadyPaid: {
          option: 'Yes',
        },
      };
      claim.partialAdmission.howMuchDoYouOwe = howMuchDoYouOwe;

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      // When
      await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_NEXT).toHaveBeenCalledTimes(1);
      expect(MOCK_NEXT).toHaveBeenCalledWith();
      expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
    });

    it.each<[string, number | undefined]>([
      ['zero', 0],
      ['missing', undefined],
    ])('should redirect without continuing when the partial admission amount is %s', async (_label, amount) => {
      // Given
      const claim = new Claim();
      const howMuchDoYouOwe = new HowMuchDoYouOwe(amount);
      claim.partialAdmission = {
        alreadyPaid: {
          option: 'No',
        },
      };
      claim.partialAdmission.howMuchDoYouOwe = howMuchDoYouOwe;

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      // When
      await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalledTimes(1);
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(RESPONSE_TASK_LIST_URL.replace(':id', '123'));
      expect(MOCK_NEXT).not.toHaveBeenCalled();
    });

    it('should redirect without continuing when partial admission is missing', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());

      await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

      expect(MOCK_RESPONSE.redirect).toHaveBeenCalledTimes(1);
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(RESPONSE_TASK_LIST_URL.replace(':id', '123'));
      expect(MOCK_NEXT).not.toHaveBeenCalled();
    });
  });

  it('should forward the original draft-store error without redirecting', async () => {
    // Given
    const error = new Error('draft store unavailable');
    mockGetCaseData.mockRejectedValue(error);

    // When
    await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    // Then
    expect(MOCK_NEXT).toHaveBeenCalledTimes(1);
    expect(MOCK_NEXT).toHaveBeenCalledWith(error);
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
  });
});
