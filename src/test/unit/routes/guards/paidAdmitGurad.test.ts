import express, { NextFunction } from 'express';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CLAIM_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'common/models/claim';
import {PartAdmitGuard} from 'routes/guards/partAdmitGuard';
import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';

jest.mock('modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('routes/features/response/checkAnswersController');
jest.mock('services/features/response/taskListService');
jest.mock('modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const MOCK_REQUEST = { params: { id: '123' } } as unknown as express.Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as express.Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Response - Part Admit Amount not entered', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should call next middleware function which will render payment plan screen', async () => {
      // Given
      const claim = new Claim();
      const howMuchDoYouOwe = new HowMuchDoYouOwe(100,1000);
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
      await PartAdmitGuard.apply(CLAIM_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_NEXT).toHaveBeenCalledWith();
    });

    it('should call next middleware function which will redirect to task list when part admit payment do not exists', async () => {
      // Given
      const claim = new Claim();
      const howMuchDoYouOwe = new HowMuchDoYouOwe();
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
      await PartAdmitGuard.apply(CLAIM_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
    });
  });

  it('should throw an error when redis throws an error', async () => {
    // Given
    const claim = new Claim();
    const howMuchDoYouOwe = new HowMuchDoYouOwe(100,1000);
    claim.partialAdmission = {
      alreadyPaid: {
        option: 'Yes',
      },
    };
    claim.partialAdmission.howMuchDoYouOwe = howMuchDoYouOwe;

    mockGetCaseData.mockImplementation(async () => {
      throw new Error();
    });

    // When
    await PartAdmitGuard.apply(CLAIM_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    // Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
