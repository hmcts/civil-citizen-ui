import {Request, Response, NextFunction} from 'express';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {ResponseType} from 'form/models/responseType';
import {PartAdmitHowMuchHaveYouPaidGuard} from 'routes/guards/partAdmitHowMuchHaveYouPaidGuard';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const CLAIM_ID = '123';
const respondentIncompleteSubmissionUrl = constructResponseUrlWithIdParams(CLAIM_ID, RESPONSE_TASK_LIST_URL);

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const MOCK_REQUEST = {params: {id: CLAIM_ID}} as unknown as Request;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
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
      };
      claim.partialAdmission = {
        alreadyPaid: {
          option: YesNo.YES,
        },
      };

      mockGetResponseClaimById.mockResolvedValue(claim);
      // When
      await PartAdmitHowMuchHaveYouPaidGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(MOCK_REQUEST, CLAIM_ID);
      expect(MOCK_NEXT).toHaveBeenCalledWith();
    });

    it('should call next middleware function which will render how much have you paid screen', async () => {
      // Given
      const claim = new Claim();
      claim.respondent1 = {
        responseType: ResponseType.PART_ADMISSION,
      };
      claim.partialAdmission = {
        alreadyPaid: {
          option: YesNo.NO,
        },
      };

      mockGetResponseClaimById.mockResolvedValue(claim);
      // When
      await PartAdmitHowMuchHaveYouPaidGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_NEXT).toHaveBeenCalledWith();
    });

    it('should call next middleware function which will redirect to task list when paid amount do not exists', async () => {
      // Given
      const claim = new Claim();
      claim.respondent1 = {};

      mockGetResponseClaimById.mockResolvedValue(claim);
      // When
      await PartAdmitHowMuchHaveYouPaidGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(respondentIncompleteSubmissionUrl);
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
    });

    it('should throw an error when redis throws an error', async () => {
      // Given
      mockGetResponseClaimById.mockRejectedValue(new Error());

      // When
      await PartAdmitHowMuchHaveYouPaidGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_NEXT).toHaveBeenCalled();
    });
  });
});
