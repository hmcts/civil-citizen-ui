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
import {ChooseHowToProceed} from 'common/form/models/claimantResponse/chooseHowToProceed';
import {createClaimWithMediationSectionWithOptionClaimantResponse} from '../../../../utils/mockClaimForCheckAnswers';
import {buildMediationSection} from 'services/features/response/checkAnswers/responseSection/buildMediationSection';

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
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);
      claim.claimantResponse.ccjRequest = new CCJRequest();
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = {option: 'yes'};
    });

    it('should check answers for defendant paid some of the money', async () => {
      claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.YES, 100, 500);
      const result = await getSummarySections('12345', claim, 'en', 70);
      expect(result.sections).toHaveLength(8);
    });

    it('should contain mediation section when carm applicable', async () => {
      const claim = createClaimWithMediationSectionWithOptionClaimantResponse(YesNo.NO);
      const result = await getSummarySections('12345', claim, 'en', 70, true);
      const mediationSectionExpected = buildMediationSection(claim, '12345', 'en', true);
      expect(result.sections).toHaveLength(8);
      expect(result.sections[2]).toStrictEqual(mediationSectionExpected);
    });

    it('should check answers for defendant didn`t paid any amount', async () => {
      const expectedResult = generateExpectedResultForDefendantPaidNone();
      claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.NO);
      const result = await getSummarySections('12345', claim, 'en', 70);
      expect(expectedResult.sections).toHaveLength(result.sections.length);
    });
    it('should check answers be empty if non of the tasks completed', async () => {
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = undefined;
      claim.claimantResponse.chooseHowToProceed = undefined;
      claim.claimantResponse.ccjRequest = undefined;
      const result = await getSummarySections('12345', claim, 'en', 70);
      expect(result.sections).toHaveLength(8);
    });
  });
});

function generateExpectedResultForDefendantPaidNone() {
  return {
    sections: [
      {
        title: 'PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE',
        summaryList: {
          rows: [
            {
              key: {
                text: 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_THE_DEFENDANT_REPAYMENT_PLAN',
              },
              value: {
                html: 'PAGES.CHECK_YOUR_ANSWER.I_ACCEPT_THIS_REPAYMENT_PLAN',
              },
              actions: {
                items: [
                  {
                    href: '/case/12345/claimant-response/accept-payment-method',
                    text: 'COMMON.BUTTONS.CHANGE',
                    visuallyHiddenText: ' PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_THE_DEFENDANT_REPAYMENT_PLAN',
                  },
                ],
              },
            },
          ],
        },
      },
      {
        title: 'PAGES.CHECK_YOUR_ANSWER.HOW_DO_YOU_WISH_TO_PROCEED',
        summaryList: {
          rows: [
            {
              key: {
                text: 'PAGES.CHECK_YOUR_ANSWER.HOW_DO_YOU_WANT_TO_FORMALISE_THE_REPAYMENT_PLAN',
              },
              value: {
                html: 'PAGES.CHECK_YOUR_ANSWER.ISSUE_A_CCJ',
              },
              actions: {
                items: [
                  {
                    href: '/case/12345/claimant-response/choose-how-to-proceed',
                    text: 'COMMON.BUTTONS.CHANGE',
                    visuallyHiddenText: ' PAGES.CHECK_YOUR_ANSWER.HOW_DO_YOU_WANT_TO_FORMALISE_THE_REPAYMENT_PLAN',
                  },
                ],
              },
            },
          ],
        },
      },
      {
        title: 'PAGES.CHECK_YOUR_ANSWER.JUDGMENT_REQUEST',
        summaryList: {
          rows: [
            {
              key: {
                text: 'PAGES.CHECK_YOUR_ANSWER.CCJ_HAS_DEFENDANT_PAID_SOME',
              },
              value: {
                html: 'No',
              },
              actions: {
                items: [
                  {
                    href: '/case/12345/claimant-response/county-court-judgement/paid-amount',
                    text: 'COMMON.BUTTONS.CHANGE',
                    visuallyHiddenText: ' PAGES.CHECK_YOUR_ANSWER.CCJ_HAS_DEFENDANT_PAID_SOME',
                  },
                ],
              },
            },
            {
              key: {
                text: 'PAGES.CHECK_YOUR_ANSWER.CCJ_TOTAL_TO_BE_PAID',
              },
              value: {
                html: '£570.00',
              },
            },
          ],
        },
      },
      undefined,
      null,
      null,
      undefined,
      null,
    ],
  };

}
