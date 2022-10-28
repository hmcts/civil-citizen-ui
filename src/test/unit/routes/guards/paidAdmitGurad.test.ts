import express from 'express';
import * as draftStoreService from '../../../../main/modules/draft-store/draftStoreService';
import {CLAIM_TASK_LIST_URL} from '../../../../main/routes/urls';
import {Claim} from '../../../../main/common/models/claim';
import {partAdmitGuard} from '../../../../main/routes/guards/partAdmitGuard';
import {HowMuchDoYouOwe} from '../../../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/routes/features/response/checkAnswersController');
jest.mock('../../../../main/services/features/response/taskListService');
jest.mock('../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const CLAIM_ID = '123';
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

const MOCK_REQUEST = () => {
  return {
    session: {
      claimId: CLAIM_ID,
    },
  } as express.Request;
};

const MOCK_RESPONSE = {
  redirect: jest.fn(),
} as unknown as express.Response;

const MOCK_NEXT = jest.fn() as express.NextFunction;

describe('Response - Part Admit Amount not entered', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should call next middleware function which will render payment plan screen', async () => {
      // Given
      const mockRequest = MOCK_REQUEST();
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
      await partAdmitGuard.apply(CLAIM_TASK_LIST_URL)(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_NEXT).toHaveBeenCalledWith();
    });

    it('should call next middleware function which will redirect to task list when part admit payment do not exists', async () => {
      // Given
      const mockRequest = MOCK_REQUEST();
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
      await partAdmitGuard.apply(CLAIM_TASK_LIST_URL)(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
    });
  });

  it('should throw an error when redis throws an error', async () => {
    // Given
    const mockRequest = MOCK_REQUEST();
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
    await partAdmitGuard.apply(CLAIM_TASK_LIST_URL)(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
    // Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
