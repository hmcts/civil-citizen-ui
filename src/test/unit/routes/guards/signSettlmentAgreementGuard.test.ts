import {Request, Response, NextFunction} from 'express';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {ResponseType} from 'form/models/responseType';
import {SignSettlmentAgreementGuard} from 'routes/guards/signSettlmentAgreementGuard';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {Party} from 'common/models/party';
import {PartialAdmission} from 'common/models/partialAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {FullAdmission} from 'common/models/fullAdmission';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/routes/features/response/checkAnswersController');
jest.mock('../../../../main/services/features/common/taskListService');
jest.mock('../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const CLAIM_ID = '123';
const respondentIncompleteSubmissionUrl = constructResponseUrlWithIdParams(CLAIM_ID, CLAIMANT_RESPONSE_TASK_LIST_URL);

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const MOCK_REQUEST = {params: {id: CLAIM_ID}} as unknown as Request;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Response - SignSettlmentAgreementGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should call next middleware function which will render sign settlement agreement screen when PART_ADMISSION', async () => {
      // Given
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
      claim.partialAdmission.howMuchDoYouOwe.amount = 200;
      claim.partialAdmission.howMuchDoYouOwe.totalAmount = 1000;
      claim.partialAdmission.paymentIntention.paymentDate = new Date(Date.now());
      claim.partialAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 50,
        repaymentFrequency: TransactionSchedule.WEEK,
        firstRepaymentDate: new Date(Date.now()),
      };

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      // When
      await SignSettlmentAgreementGuard.apply(CLAIMANT_RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_NEXT).toHaveBeenCalledWith();
    });

    it('should call next middleware function which will render sign settlement agreement screen when FULL_ADMISSION', async () => {
      // Given
      const claim = new Claim();
      claim.totalClaimAmount = 200;
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentDate = new Date(Date.now());
      claim.fullAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 50,
        repaymentFrequency: TransactionSchedule.WEEK,
        firstRepaymentDate: new Date(Date.now()),
      };

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      // When
      await SignSettlmentAgreementGuard.apply(CLAIMANT_RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_NEXT).toHaveBeenCalledWith();
    });

    it('should call next middleware function which will redirect to task list when repayment plan do not exists', async () => {
      // Given
      const claim = new Claim();
      claim.respondent1 = {};

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      // When
      await SignSettlmentAgreementGuard.apply(CLAIMANT_RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(respondentIncompleteSubmissionUrl);
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
    });

    it('should throw an error when redis throws an error when PART_ADMISSION', async () => {
      // Given
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
      claim.partialAdmission.howMuchDoYouOwe.amount = 200;
      claim.partialAdmission.howMuchDoYouOwe.totalAmount = 1000;
      claim.partialAdmission.paymentIntention.paymentDate = new Date(Date.now());
      claim.partialAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 50,
        repaymentFrequency: TransactionSchedule.WEEK,
        firstRepaymentDate: new Date(Date.now()),
      };

      mockGetCaseData.mockImplementation(async () => {
        throw new Error();
      });

      // When
      await SignSettlmentAgreementGuard.apply(CLAIMANT_RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_NEXT).toHaveBeenCalled();
    });

    it('should throw an error when redis throws an error when FULL_ADMISSION', async () => {
      // Given
      const claim = new Claim();
      claim.totalClaimAmount = 200;
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentDate = new Date(Date.now());
      claim.fullAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 50,
        repaymentFrequency: TransactionSchedule.WEEK,
        firstRepaymentDate: new Date(Date.now()),
      };

      mockGetCaseData.mockImplementation(async () => {
        throw new Error();
      });

      // When
      await SignSettlmentAgreementGuard.apply(CLAIMANT_RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
      // Then
      expect(MOCK_NEXT).toHaveBeenCalled();
    });
  });
});
