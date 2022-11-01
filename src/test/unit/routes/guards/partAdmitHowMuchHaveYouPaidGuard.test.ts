import express, { NextFunction } from 'express';
import {getCaseDataFromStore} from '../../../../main/modules/draft-store/draftStoreService';
import {CLAIM_TASK_LIST_URL} from '../../../../main/routes/urls';
import {Claim} from '../../../../main/common/models/claim';
import {YesNo} from '../../../../main/common/form/models/yesNo';
import {ResponseType} from '../../../../main/common/form/models/responseType';
import {PartAdmitHowMuchHaveYouPaidGuard} from '../../../../main/routes/guards/partAdmitHowMuchHaveYouPaidGuard';
import {constructResponseUrlWithIdParams} from '../../../../main/common/utils/urlFormatter';

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
const respondentIncompleteSubmissionUrl = constructResponseUrlWithIdParams(CLAIM_ID, CLAIM_TASK_LIST_URL);

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const MOCK_REQUEST = { params: { id: '123' } } as unknown as express.Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as express.Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Response - PartAdmitHowMuchHaveYouPaidGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should call next middleware function which will render how much have you paid screen', async () => {
      // Given
      const claim = new Claim();
      claim.respondent1 = {
        responseType: ResponseType.PART_ADMISSION,
      },
      claim.partialAdmission = {
        alreadyPaid: {
          option: YesNo.YES,
        },
      };

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      // When
      await PartAdmitHowMuchHaveYouPaidGuard.apply(CLAIM_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_NEXT).toHaveBeenCalledWith();
    });

    it('should call next middleware function which will render how much have you paid screen', async () => {
      // Given
      const claim = new Claim();
      claim.respondent1 = {
        responseType: ResponseType.PART_ADMISSION,
      },
      claim.partialAdmission = {
        alreadyPaid: {
          option: YesNo.NO,
        },
      };

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      // When
      await PartAdmitHowMuchHaveYouPaidGuard.apply(CLAIM_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_NEXT).toHaveBeenCalledWith();
    });

    it('should call next middleware function which will redirect to task list when paid amount do not exists', async () => {
      // Given
      const claim = new Claim();
      claim.respondent1 = {
      },

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      // When
      await PartAdmitHowMuchHaveYouPaidGuard.apply(CLAIM_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(respondentIncompleteSubmissionUrl);
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
    });

    it('should throw an error when redis throws an error', async () => {
      // Given
      const claim = new Claim();
      claim.respondent1 = {
        responseType: ResponseType.PART_ADMISSION,
      },
      claim.partialAdmission = {
        alreadyPaid: {
          option: YesNo.YES,
        },
      };

      mockGetCaseData.mockImplementation(async () => {
        throw new Error();
      });

      // When
      await PartAdmitHowMuchHaveYouPaidGuard.apply(CLAIM_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_NEXT).toHaveBeenCalled();
    });
  });
});
