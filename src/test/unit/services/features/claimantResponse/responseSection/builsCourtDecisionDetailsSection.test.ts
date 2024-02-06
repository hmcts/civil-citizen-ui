
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';
import { ResponseType } from 'common/form/models/responseType';
import { Claim } from 'common/models/claim';
import { ClaimantResponse } from 'common/models/claimantResponse';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { getSummarySections } from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import { Party } from 'models/party';
import { RepaymentDecisionType } from 'common/models/claimantResponse/RepaymentDecisionType';

describe('Check Answers Page :Court Decision Section', () => {

  describe('Build check answers for pay by set date either for part admit or full admit ', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
    });

    it('should show the check your answers for pay by set date for part admit', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = { paymentIntention: { paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date() } };
      claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT;
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[6].summaryList.rows.length).toEqual(3);
      expect(result.sections[6].summaryList.rows[0]).toEqual({
        key: {
          text: 'PAGES.CHECK_YOUR_ANSWER.COURT_DECISION_ROW',
        },
        value: {
          html: 'PAGES.CHECK_YOUR_ANSWER.COURT_REJECTED_YOUR_REPAYMENT_PLAN',
        },
      });
      expect(result.sections[6].summaryList.rows[1]).toEqual({
        key: {
          text: 'PAGES.CHECK_YOUR_ANSWER.COURT_REPAYMENT_PLAN',
        },
        value: {
          html: 'PAGES.CHECK_YOUR_ANSWER.REPAYMENT_IN_FULL',
        },
      });
      expect(result.sections[6].summaryList.rows[2]).toEqual({
        key: {
          text: 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA',
        },
        value: {
          html: expectedPaymentDate,
        },
      });
    });

    it('should show the check your answers for pay by set date for full admit', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = { paymentIntention: { paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date() } };
      claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT;
      claim.respondent1 = { responseType: ResponseType.FULL_ADMISSION };
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[6].summaryList.rows.length).toEqual(3);
      expect(result.sections[6].summaryList.rows[0]).toEqual({
        key: {
          text: 'PAGES.CHECK_YOUR_ANSWER.COURT_DECISION_ROW',
        },
        value: {
          html: 'PAGES.CHECK_YOUR_ANSWER.COURT_REJECTED_YOUR_REPAYMENT_PLAN',
        },
      });
      expect(result.sections[6].summaryList.rows[1]).toEqual({
        key: {
          text: 'PAGES.CHECK_YOUR_ANSWER.COURT_REPAYMENT_PLAN',
        },
        value: {
          html: 'PAGES.CHECK_YOUR_ANSWER.REPAYMENT_IN_FULL',
        },
      });
      expect(result.sections[6].summaryList.rows[2]).toEqual({
        key: {
          text: 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA',
        },
        value: {
          html: expectedPaymentDate,
        },
      });
    });

    it('should show the check your answers for pay by installments for part admit', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = { paymentIntention: { paymentOption: PaymentOptionType.INSTALMENTS, paymentDate: new Date() } };
      claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT;
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[6].summaryList.rows.length).toEqual(3);
      expect(result.sections[6].summaryList.rows[0]).toEqual({
        key: {
          text: 'PAGES.CHECK_YOUR_ANSWER.COURT_DECISION_ROW',
        },
        value: {
          html: 'PAGES.CHECK_YOUR_ANSWER.COURT_REJECTED_YOUR_REPAYMENT_PLAN',
        },
      });
      expect(result.sections[6].summaryList.rows[1]).toEqual({
        key: {
          text: 'PAGES.CHECK_YOUR_ANSWER.COURT_REPAYMENT_PLAN',
        },
        value: {
          html: 'PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS',
        },
      });
      expect(result.sections[6].summaryList.rows[2]).toEqual({
        key: {
          text: 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA',
        },
        value: {
          html: expectedPaymentDate,
        },
      });
    });

    it('should show the check your answers for pay by installments for full admit', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = { paymentIntention: { paymentOption: PaymentOptionType.INSTALMENTS, paymentDate: new Date() } };
      claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT;
      claim.respondent1 = { responseType: ResponseType.FULL_ADMISSION };
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[6].summaryList.rows.length).toEqual(3);
      expect(result.sections[6].summaryList.rows[0]).toEqual({
        key: {
          text: 'PAGES.CHECK_YOUR_ANSWER.COURT_DECISION_ROW',
        },
        value: {
          html: 'PAGES.CHECK_YOUR_ANSWER.COURT_REJECTED_YOUR_REPAYMENT_PLAN',
        },
      });
      expect(result.sections[6].summaryList.rows[1]).toEqual({
        key: {
          text: 'PAGES.CHECK_YOUR_ANSWER.COURT_REPAYMENT_PLAN',
        },
        value: {
          html: 'PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS',
        },
      });
      expect(result.sections[6].summaryList.rows[2]).toEqual({
        key: {
          text: 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA',
        },
        value: {
          html: expectedPaymentDate,
        },
      });

    });
  });
});
