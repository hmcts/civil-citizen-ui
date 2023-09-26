import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {SignatureType} from 'models/signatureType';
import {Claim} from 'models/claim';
import {CLAIM_ID} from '../../../../../utils/checkAnswersConstants';
import {ClaimantResponse} from 'models/claimantResponse';
import { getSummarySections, saveStatementOfTruth } from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import { ResponseType } from 'common/form/models/responseType';
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';
import { YesNo } from 'common/form/models/yesNo';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/i18n');
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
    {
      title: "PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE",
      summaryList: {
        rows: [
          {
            key: {
              text: "PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION",
            },
            value: {
              html: "COMMON.undefined",
            },
            actions: {
              items: [
                {
                  href: "/case/12345/mediation/free-telephone-mediation",
                  text: "COMMON.BUTTONS.CHANGE",
                  visuallyHiddenText: " PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION",
                },
              ],
            },
          },
        ],
      },
    },
    {
      title: "PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE",
      summaryList: {
        rows: [
          {
            key: {
              text: "PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE",
            },
            value: {
              html: "COMMON.NO",
            },
            actions: {
              items: [
                {
                  href: "/case/12345/directions-questionnaire/determination-without-hearing",
                  text: "COMMON.BUTTONS.CHANGE",
                  visuallyHiddenText: " PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE",
                },
              ],
            },
          },
          {
            key: {
              text: "PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE",
            },
            value: {
              html: "COMMON.VARIATION_2.NO",
            },
            actions: {
              items: [
                {
                  href: "/case/12345/directions-questionnaire/expert-report-details",
                  text: "COMMON.BUTTONS.CHANGE",
                  visuallyHiddenText: " PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE",
                },
              ],
            },
          },
          {
            key: {
              text: "PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE",
            },
            value: {
              html: "COMMON.VARIATION.NO",
            },
            actions: {
              items: [
                {
                  href: "/case/12345/directions-questionnaire/permission-for-expert",
                  text: "COMMON.BUTTONS.CHANGE",
                  visuallyHiddenText: " PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE",
                },
              ],
            },
          },
          {
            key: {
              text: "PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE",
            },
            value: {
              html: "COMMON.VARIATION.NO",
            },
            actions: {
              items: [
                {
                  href: "/case/12345/directions-questionnaire/expert-can-still-examine",
                  text: "COMMON.BUTTONS.CHANGE",
                  visuallyHiddenText: " PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE",
                },
              ],
            },
          },
          {
            key: {
              text: "PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES",
            },
            value: {
              html: "COMMON.NO",
            },
            actions: {
              items: [
                {
                  href: "/case/12345/directions-questionnaire/other-witnesses",
                  text: "COMMON.BUTTONS.CHANGE",
                  visuallyHiddenText: " PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES",
                },
              ],
            },
          },
          {
            key: {
              text: "PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE",
            },
            value: {
              html: "",
            },
            actions: {
              items: [
                {
                  href: "/case/12345/directions-questionnaire/cant-attend-hearing-in-next-12-months",
                  text: "COMMON.BUTTONS.CHANGE",
                  visuallyHiddenText: " PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE",
                },
              ],
            },
          },
          {
            key: {
              text: "PAGES.SPECIFIC_COURT.TITLE",
            },
            value: {
              html: "",
            },
            actions: {
              items: [
                {
                  href: "/case/12345/directions-questionnaire/court-location",
                  text: "COMMON.BUTTONS.CHANGE",
                  visuallyHiddenText: " PAGES.SPECIFIC_COURT.TITLE",
                },
              ],
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
  describe('Build check answers for part admit immediately', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.respondent1 = { responseType: ResponseType.PART_ADMISSION };
      claim.partialAdmission = { paymentIntention: { paymentOption: PaymentOptionType.IMMEDIATELY } };
    });

    it('should check answers for part admit pay immediately for yes option', () => {
      const expectedResult = generateExpectedResultForPartAdmitPayImmediately(YesNo.YES);
      claim.claimantResponse = { hasPartAdmittedBeenAccepted: { option: YesNo.YES } } as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(expectedResult).toEqual(result);
    });

    it('should check answers for part admit pay immediately for no option', () => {
      const expectedResult = generateExpectedResultForPartAdmitPayImmediately(YesNo.NO);
      claim.claimantResponse = { hasPartAdmittedBeenAccepted: { option: YesNo.NO } } as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(expectedResult).toEqual(result);
    });
  });

});

