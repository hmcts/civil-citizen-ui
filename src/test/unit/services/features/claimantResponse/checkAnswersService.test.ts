import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {SignatureType} from 'models/signatureType';
import {Claim} from 'models/claim';
import {CLAIM_ID} from '../../../../utils/checkAnswersConstants';
import {ClaimantResponse} from 'models/claimantResponse';
import { getSummarySections, saveStatementOfTruth } from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import {ResponseType} from 'common/form/models/responseType';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {CCJRequest} from 'common/models/claimantResponse/ccj/ccjRequest';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';
import {PaidAmount} from 'common/models/claimantResponse/ccj/paidAmount';
import {YesNo} from 'common/form/models/yesNo';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('Check Answers service', () => {
  describe('Get Data from Draft', () => {

    it('should throw error when retrieving data from draft store fails', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(false, SignatureType.BASIC, true))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should retrieve data from draft store', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.claimantStatementOfTruth = new StatementOfTruthForm(false, SignatureType.BASIC, true, false);
        return claim;
      });

      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(false, SignatureType.BASIC, true))).toBeTruthy();
    });
  });
  describe('Build check answers for judgment request', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.totalClaimAmount = 500;
      claim.respondent1 = {responseType: ResponseType.FULL_ADMISSION};
      claim.fullAdmission = {paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE}};
      claim.claimantResponse = {
        chooseHowToProceed: {option: ChooseHowProceed.REQUEST_A_CCJ},
        ccjRequest: new CCJRequest(),
      } as ClaimantResponse;
    });

    it('should check answers for defendant paid some of the money', () => {
      claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.YES, 100, 500);
      const result = getSummarySections('12345', claim, 'en', 70);
      expect(5).toEqual(result.sections.length);
    });

    it('should check answers for defendant didn`t paid any amount', () => {
      claim.claimantResponse.ccjRequest.paidAmount = {option: YesNo.NO};
      const result = getSummarySections('12345', claim, 'en', 70);
      expect(5).toEqual(result.sections.length);
    });
  });
});
