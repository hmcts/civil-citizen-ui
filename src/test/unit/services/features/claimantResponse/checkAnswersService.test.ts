import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {SignatureType} from 'models/signatureType';
import {Claim} from 'models/claim';
import {CLAIM_ID} from '../../../../utils/checkAnswersConstants';
import {ClaimantResponse} from 'models/claimantResponse';
import {getSummarySections, saveStatementOfTruth} from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {ResponseType} from 'common/form/models/responseType';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {YesNo} from 'common/form/models/yesNo';
import {CCJRequest} from 'common/models/claimantResponse/ccj/ccjRequest';
import {PaidAmount} from 'common/models/claimantResponse/ccj/paidAmount';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;

function generateExpectedResultForPartAdmitPayImmediately(option: string) {
  return {
    sections: [{
      title: 'PAGES.CLAIMANT_RESPONSE_TASK_LIST.HEADER',
      summaryList: {
        rows: [
          {
            key: {
              text: 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION',
            },
            value: {
              html: option === YesNo.YES
                ? 'PAGES.CHECK_YOUR_ANSWER.I_ACCEPT_THIS_AMOUNT'
                : 'PAGES.CHECK_YOUR_ANSWER.I_REJECT_THIS_AMOUNT',
            },
            actions: {
              items: [
                {
                  href: '/case/12345/claimant-response/settle-admitted',
                  text: 'COMMON.BUTTONS.CHANGE',
                  visuallyHiddenText: ' PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION',
                },
              ],
            },
          },
        ],
      },
    },
      null,
    ],
  };
}

function generateExpectedResultForDefendantPaidNone() {
  return {
    sections: [
      undefined,
      {
        title: "PAGES.CHECK_YOUR_ANSWER.JUDGMENT_REQUEST",
        summaryList: {
          rows: [
            {
              key: {
                text: "PAGES.CHECK_YOUR_ANSWER.CCJ_HAS_DEFENDANT_PAID_SOME",
              },
              value: {
                html:'No',
              },
              actions: {
                items: [
                  {
                    href: "/case/12345/ccj/paid-amount",
                    text: "COMMON.BUTTONS.CHANGE",
                    visuallyHiddenText: " PAGES.CHECK_YOUR_ANSWER.CCJ_HAS_DEFENDANT_PAID_SOME",
                  },
                ],
              },
            },
            {
              key: {
                text: "PAGES.CHECK_YOUR_ANSWER.CCJ_TOTAL_TO_BE_PAID",
              },
              value: {
                html: "£570.00",
              },
            },
          ],
        },
      },
    ],
  };
}

function generateExpectedResultForDefendantPaidSome() {
  return {
    sections: [
      undefined,
      {
        title: "PAGES.CHECK_YOUR_ANSWER.JUDGMENT_REQUEST",
        summaryList: {
          rows: [
            {
              key: {
                text: "PAGES.CHECK_YOUR_ANSWER.CCJ_HAS_DEFENDANT_PAID_SOME",
              },
              value: {
                html: 'Yes',
              },
              actions: {
                items: [
                  {
                    href: "/case/12345/ccj/paid-amount",
                    text: "COMMON.BUTTONS.CHANGE",
                    visuallyHiddenText: " PAGES.CHECK_YOUR_ANSWER.CCJ_HAS_DEFENDANT_PAID_SOME",
                  },
                ],
              },
            },
           {
              key: {
                text: "PAGES.CHECK_YOUR_ANSWER.CCJ_AMOUNT_ALREADY_PAID",
              },
              value: {
                html: "£100.00",
              },
            },
            {
              key: {
                text: "PAGES.CHECK_YOUR_ANSWER.CCJ_TOTAL_TO_BE_PAID",
              },
              value: {
                html: "£470.00",
              },
            },
          ],
        },
      },
    ],
  };
}

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

  describe('Build check answers for pay by set date either for part admit or full admit ', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();

    });

    it('should show the check your answers for pay by set date for part admit', () => {
      claim.partialAdmission = {paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()}};
      claim.claimantResponse = {chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}} as ClaimantResponse;
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[0].summaryList.rows.length).toEqual(2);
      expect(result.sections[0].summaryList.rows[0]).toEqual({'actions': {'items': [{'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}]}, 'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}, 'value': {'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE'}});
      expect(result.sections[0].summaryList.rows[1]).toEqual({'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA'}, 'value': {'html': expectedPaymentDate}});
    });

    it('should show the check your answers for pay by set date for full admit', () => {
      claim.fullAdmission = {paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()}};
      claim.claimantResponse = {chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}} as ClaimantResponse;
      claim.respondent1 = {responseType: ResponseType.FULL_ADMISSION};
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[0].summaryList.rows.length).toEqual(2);
      expect(result.sections[0].summaryList.rows[0]).toEqual({'actions': {'items': [{'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}]}, 'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}, 'value': {'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE'}});
      expect(result.sections[0].summaryList.rows[1]).toEqual({'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA'}, 'value': {'html': expectedPaymentDate}});
    });

    it('should show the check your answers for pay by installments for part admit', () => {
      claim.partialAdmission = {paymentIntention: {paymentOption: PaymentOptionType.INSTALMENTS, paymentDate: new Date()}};
      claim.claimantResponse = {chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}} as ClaimantResponse;
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[0].summaryList.rows.length).toEqual(2);
      expect(result.sections[0].summaryList.rows[0]).toEqual({'actions': {'items': [{'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}]}, 'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}, 'value': {'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS'}});
      expect(result.sections[0].summaryList.rows[1]).toEqual({'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA'}, 'value': {'html': expectedPaymentDate}});
    });

    it('should show the check your answers for pay by set date for full admit', () => {
      claim.fullAdmission = {paymentIntention: {paymentOption: PaymentOptionType.INSTALMENTS, paymentDate: new Date()}};
      claim.claimantResponse = {chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}} as ClaimantResponse;
      claim.respondent1 = {responseType: ResponseType.FULL_ADMISSION};
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[0].summaryList.rows.length).toEqual(2);
      expect(result.sections[0].summaryList.rows[0]).toEqual({'actions': {'items': [{'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}]}, 'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA'}, 'value': {'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS'}});
      expect(result.sections[0].summaryList.rows[1]).toEqual({'key': {'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA'}, 'value': {'html': expectedPaymentDate}});
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
      const expectedResult = generateExpectedResultForPartAdmitPayImmediately(YesNo.YES);
      claim.claimantResponse = {hasPartAdmittedBeenAccepted: {option: YesNo.YES}} as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(expectedResult).toEqual(result);
    });

    it('should check answers for part admit pay immediately for no option', () => {
      const expectedResult = generateExpectedResultForPartAdmitPayImmediately(YesNo.NO);
      claim.claimantResponse = {hasPartAdmittedBeenAccepted: {option: YesNo.NO}} as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(expectedResult).toEqual(result);
    });
  });
  describe('Build check answers for judgment request', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.totalClaimAmount = 500;
      claim.respondent1 = {responseType: ResponseType.PART_ADMISSION};
      claim.partialAdmission = {paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE}};
      claim.claimantResponse = {
        chooseHowToProceed: {option: ChooseHowProceed.REQUEST_A_CCJ},
        ccjRequest: new CCJRequest(),
      } as ClaimantResponse;
    });

    it('should check answers for defendant paid some of the money', () => {
      const expectedResult = generateExpectedResultForDefendantPaidSome();
      claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.YES, 100, 500);
      const result = getSummarySections('12345', claim, 'en', 70);
      expect(expectedResult).toEqual(result);
    });

    it('should check answers for defendant didn`t paid any amount', () => {
      const expectedResult = generateExpectedResultForDefendantPaidNone();
      claim.claimantResponse.ccjRequest.paidAmount = {option: YesNo.NO};
      const result = getSummarySections('12345', claim, 'en', 70);
      expect(expectedResult).toEqual(result);
    });
  });
});

