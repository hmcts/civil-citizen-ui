import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {SignatureType} from 'models/signatureType';
import {Claim} from 'models/claim';
import {CLAIM_ID} from '../../../../../utils/checkAnswersConstants';
import {ClaimantResponse} from 'models/claimantResponse';
import {getSummarySections, saveStatementOfTruth} from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {ResponseType} from 'common/form/models/responseType';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {YesNo} from 'common/form/models/yesNo';
import {Party} from 'models/party';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
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

    it('should retrieve data from draft store if claimantResponse doesnt exist', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return new Claim();
      });

      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, null)).toBeTruthy();
    });
  });

  describe('Build check answers for pay by set date either for part admit or full admit ', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();

    });

    it('should show the check your answers for pay by set date for part admit', () => {
      claim.partialAdmission = {paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()}};
      claim.claimantResponse = {chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}} as ClaimantResponse;
      claim.respondent1=new Party();
      claim.respondent1.responseType=ResponseType.PART_ADMISSION;
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[2].summaryList.rows.length).toEqual(2);
      expect(result.sections[2].summaryList.rows[0]).toEqual({'actions': {'items': [{'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}]}, 'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}, 'value': {'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE'}});
      expect(result.sections[2].summaryList.rows[1]).toEqual({'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA'}, 'value': {'html': expectedPaymentDate}});
    });

    it('should show the check your answers for pay by set date for full admit', () => {
      claim.fullAdmission = {paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()}};
      claim.claimantResponse = {chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}} as ClaimantResponse;
      claim.respondent1 = {responseType: ResponseType.FULL_ADMISSION};
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[2].summaryList.rows.length).toEqual(2);
      expect(result.sections[2].summaryList.rows[0]).toEqual({'actions': {'items': [{'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}]}, 'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}, 'value': {'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE'}});
      expect(result.sections[2].summaryList.rows[1]).toEqual({'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA'}, 'value': {'html': expectedPaymentDate}});
    });

    it('should show the check your answers for pay by installments for part admit', () => {
      claim.partialAdmission = {paymentIntention: {paymentOption: PaymentOptionType.INSTALMENTS, paymentDate: new Date()}};
      claim.claimantResponse = {chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}} as ClaimantResponse;
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[2].summaryList.rows.length).toEqual(2);
      expect(result.sections[2].summaryList.rows[0]).toEqual({'actions': {'items': [{'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}]}, 'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}, 'value': {'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS'}});
      expect(result.sections[2].summaryList.rows[1]).toEqual({'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA'}, 'value': {'html': expectedPaymentDate}});
    });

    it('should show the check your answers for pay by set date for full admit', () => {
      claim.fullAdmission = {paymentIntention: {paymentOption: PaymentOptionType.INSTALMENTS, paymentDate: new Date()}};
      claim.claimantResponse = {chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}} as ClaimantResponse;
      claim.respondent1 = {responseType: ResponseType.FULL_ADMISSION};
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[2].summaryList.rows.length).toEqual(2);
      expect(result.sections[2].summaryList.rows[0]).toEqual({'actions': {'items': [{'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}]}, 'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}, 'value': {'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS'}});
      expect(result.sections[2].summaryList.rows[1]).toEqual({'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA'}, 'value': {'html': expectedPaymentDate}});
    });
  });

  describe('Build check answers for part admit immediately', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.respondent1 = {responseType: ResponseType.PART_ADMISSION};
      claim.partialAdmission = {paymentIntention: {paymentOption: PaymentOptionType.IMMEDIATELY}};
    });

    it('should check answers for part admit pay immediately for yes option', () => {
      claim.claimantResponse = {hasPartAdmittedBeenAccepted: {option: YesNo.YES}} as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(5).toEqual(result.sections.length);
    });

    it('should check answers for part admit pay immediately for no option', () => {
      claim.claimantResponse = {hasPartAdmittedBeenAccepted: {option: YesNo.NO}} as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(5).toEqual(result.sections.length);
    });
  });
});
