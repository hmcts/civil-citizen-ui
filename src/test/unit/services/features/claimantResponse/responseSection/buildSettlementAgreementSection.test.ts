
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';
import { ResponseType } from 'common/form/models/responseType';
import { ChooseHowProceed } from 'common/models/chooseHowProceed';
import { Claim } from 'common/models/claim';
import { ClaimantResponse } from 'common/models/claimantResponse';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { getSummarySections } from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import {Party} from 'models/party';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';

describe('Check Answers Page :Settlement Agreement Section', () => {

  describe('Build check answers for pay by set date either for part admit or full admit ', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();

    });

    it('should show the check your answers for pay by set date for part admit', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = { paymentIntention: { paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date() } };
      claim.claimantResponse = { chooseHowToProceed: { option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT } } as ClaimantResponse;
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[3].summaryList.rows.length).toEqual(2);
      expect(result.sections[3].summaryList.rows[0]).toEqual({ 'actions': { 'items': [{ 'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }] }, 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }, 'value': { 'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE' } });
      expect(result.sections[3].summaryList.rows[1]).toEqual({ 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA' }, 'value': { 'html': expectedPaymentDate } });
    });

    it('should show the check your answers for pay by set date for full admit', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = { paymentIntention: { paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date() } };
      claim.claimantResponse = { chooseHowToProceed: { option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT } } as ClaimantResponse;
      claim.respondent1 = { responseType: ResponseType.FULL_ADMISSION };
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[3].summaryList.rows.length).toEqual(2);
      expect(result.sections[3].summaryList.rows[0]).toEqual({ 'actions': { 'items': [{ 'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }] }, 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }, 'value': { 'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE' } });
      expect(result.sections[3].summaryList.rows[1]).toEqual({ 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA' }, 'value': { 'html': expectedPaymentDate } });
    });

    it('should show the check your answers for pay by installments for part admit', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = { paymentIntention: { paymentOption: PaymentOptionType.INSTALMENTS, paymentDate: new Date() } };
      claim.claimantResponse = { chooseHowToProceed: { option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT } } as ClaimantResponse;
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[3].summaryList.rows.length).toEqual(2);
      expect(result.sections[3].summaryList.rows[0]).toEqual({ 'actions': { 'items': [{ 'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }] }, 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }, 'value': { 'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS' } });
      expect(result.sections[3].summaryList.rows[1]).toEqual({ 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA' }, 'value': { 'html': expectedPaymentDate } });
    });

    it('should show the check your answers for pay by installments for full admit', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = { paymentIntention: { paymentOption: PaymentOptionType.INSTALMENTS, paymentDate: new Date() } };
      claim.claimantResponse = { chooseHowToProceed: { option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT } } as ClaimantResponse;
      claim.respondent1 = { responseType: ResponseType.FULL_ADMISSION };
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[3].summaryList.rows.length).toEqual(2);
      expect(result.sections[3].summaryList.rows[0]).toEqual({ 'actions': { 'items': [{ 'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }] }, 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }, 'value': { 'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS' } });
      expect(result.sections[3].summaryList.rows[1]).toEqual({ 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA' }, 'value': { 'html': expectedPaymentDate } });
    });

    it('should show the check your answers for pay by installments for claimant plan', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = { paymentIntention: { paymentOption: PaymentOptionType.INSTALMENTS, paymentDate: new Date() } };
      claim.claimantResponse = { chooseHowToProceed: { option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT } } as ClaimantResponse;
      claim.respondent1 = { responseType: ResponseType.FULL_ADMISSION };
      claim.claimantResponse=new ClaimantResponse();
      claim.claimantResponse.courtDecision=RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
      claim.claimantResponse.suggestedPaymentIntention={
        paymentOption:PaymentOptionType.INSTALMENTS,
        repaymentPlan:{
          paymentAmount:10,
        },
      };
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[3].summaryList.rows.length).toEqual(2);
      expect(result.sections[3].summaryList.rows[0]).toEqual({ 'actions': { 'items': [{ 'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }] }, 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }, 'value': { 'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS' } });
      expect(result.sections[3].summaryList.rows[1]).toEqual({ 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA' }, 'value': { 'html': expectedPaymentDate } });
    });

    it('should show the check your answers for pay by set date for claimant plan', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = { paymentIntention: { paymentOption: PaymentOptionType.INSTALMENTS, paymentDate: new Date() } };
      claim.claimantResponse = { chooseHowToProceed: { option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT } } as ClaimantResponse;
      claim.respondent1 = { responseType: ResponseType.FULL_ADMISSION };
      claim.claimantResponse=new ClaimantResponse();
      claim.claimantResponse.courtDecision=RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
      claim.claimantResponse.suggestedPaymentIntention={
        paymentOption:PaymentOptionType.BY_SET_DATE,
        paymentDate: new Date(),
      };
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[3].summaryList.rows.length).toEqual(2);
      expect(result.sections[3].summaryList.rows[0]).toEqual({ 'actions': { 'items': [{ 'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }] }, 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }, 'value': { 'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE' } });
    });
  });
});
