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

function generateExpectedResultForPartAdmitPayImmediatelyAccept(option: string) {
  return {
    'sections': [
      {
        'title': 'PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION',
              },
              'value': {
                'html': 'PAGES.CHECK_YOUR_ANSWER.I_ACCEPT_THIS_AMOUNT',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/claimant-response/settle-admitted',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION',
                  },
                ],
              },
            },
          ],
        },
      },
      undefined,
      null,
      undefined,
      null,
      null,
    ],
  };
}

function generateExpectedResultForPartAdmitPayImmediatelyReject(option: string) {
  return {
    'sections': [
      {
        'title': 'PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION',
              },
              'value': {
                'html': option === YesNo.NO
                  ? 'PAGES.CHECK_YOUR_ANSWER.I_REJECT_THIS_AMOUNT' : undefined,
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/claimant-response/settle-admitted',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION',
                  },
                ],
              },
            },
          ],
        },
      },
      undefined,
      null,
      undefined,
      {
        'title': 'PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION',
              },
              'value': {
                'html': 'COMMON.VARIATION_2.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/mediation/free-telephone-mediation',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION',
                  },
                ],
              },
            },
          ],
        },
      },
      {
        'title': 'PAGES.CHECK_YOUR_ANSWER.YOUR_HEARING_REQUIREMENTS_TITLE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
              },
              'value': {
                'html': 'COMMON.VARIATION_2.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/determination-without-hearing',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE',
              },
              'value': {
                'html': 'COMMON.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/expert-report-details',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE',
              },
              'value': {
                'html': 'COMMON.VARIATION_2.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/permission-for-expert',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE',
              },
              'value': {
                'html': 'COMMON.VARIATION.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/expert-can-still-examine',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES',
              },
              'value': {
                'html': 'COMMON.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/other-witnesses',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
              },
              'value': {
                'html': '',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/cant-attend-hearing-in-next-12-months',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.SPECIFIC_COURT.TITLE',
              },
              'value': {
                'html': '',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/court-location',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.SPECIFIC_COURT.TITLE',
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

function generateExpectedResultForFullDefenceIntentionToProceedAccept() {
  return {
    'sections': [
      {
        'title': 'PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE',
        'summaryList': {
          'rows': [],
        },
      },
      undefined,
      null,
      undefined,
      {
        'title': 'PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION',
              },
              'value': {
                'html': 'COMMON.VARIATION_2.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/mediation/free-telephone-mediation',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION',
                  },
                ],
              },
            },
          ],
        },
      },
      {
        'title': 'PAGES.CHECK_YOUR_ANSWER.YOUR_HEARING_REQUIREMENTS_TITLE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
              },
              'value': {
                'html': 'COMMON.VARIATION_2.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/determination-without-hearing',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE',
              },
              'value': {
                'html': 'COMMON.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/expert-report-details',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE',
              },
              'value': {
                'html': 'COMMON.VARIATION_2.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/permission-for-expert',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE',
              },
              'value': {
                'html': 'COMMON.VARIATION.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/expert-can-still-examine',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES',
              },
              'value': {
                'html': 'COMMON.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/other-witnesses',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
              },
              'value': {
                'html': '',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/cant-attend-hearing-in-next-12-months',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.SPECIFIC_COURT.TITLE',
              },
              'value': {
                'html': '',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/court-location',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.SPECIFIC_COURT.TITLE',
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

function generateExpectedResultForFullDefenceIntentionToProceedReject() {
  const rows: [] = [];
  return {
    'sections': [
      {
        'title': 'PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE',
        'summaryList': {
          'rows': rows,
        },
      },
      undefined,
      null,
      undefined,
      null,
      null,
    ],
  };
}

function generateExpectedResultForPartAdmitAndPaidAccept() {
  return {
    'sections': [
      {
        'title': 'PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_AGREE_PAID',
              },
              'value': {
                'html': 'COMMON.YES',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/claimant-response/part-payment-received',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.DO_YOU_AGREE_PAID',
                  },
                ],
              },
            },
          ],
        },
      },
      undefined,
      null,
      undefined,
      null,
      null,
    ],
  };
}

function generateExpectedResultForPartAdmitAndPaidReject() {
  return {
    'sections': [
      {
        'title': 'PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_AGREE_PAID',
              },
              'value': {
                'html': 'COMMON.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/claimant-response/part-payment-received',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.DO_YOU_AGREE_PAID',
                  },
                ],
              },
            },
          ],
        },
      },
      undefined,
      null,
      undefined,
      {
        'title': 'PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION',
              },
              'value': {
                'html': 'COMMON.VARIATION_2.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/mediation/free-telephone-mediation',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION',
                  },
                ],
              },
            },
          ],
        },
      },
      {
        'title': 'PAGES.CHECK_YOUR_ANSWER.YOUR_HEARING_REQUIREMENTS_TITLE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
              },
              'value': {
                'html': 'COMMON.VARIATION_2.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/determination-without-hearing',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE',
              },
              'value': {
                'html': 'COMMON.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/expert-report-details',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE',
              },
              'value': {
                'html': 'COMMON.VARIATION_2.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/permission-for-expert',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE',
              },
              'value': {
                'html': 'COMMON.VARIATION.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/expert-can-still-examine',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES',
              },
              'value': {
                'html': 'COMMON.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/other-witnesses',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
              },
              'value': {
                'html': '',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/cant-attend-hearing-in-next-12-months',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.SPECIFIC_COURT.TITLE',
              },
              'value': {
                'html': '',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/court-location',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.SPECIFIC_COURT.TITLE',
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

function generateExpectedResultForPartAdmitAndPaymentAccept() {
  return {
    'sections': [
      {
        'title': 'PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_TO_SETTLE_PAID',
              },
              'value': {
                'html': 'COMMON.YES',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/claimant-response/settle-claim',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_TO_SETTLE_PAID',
                  },
                ],
              },
            },
          ],
        },
      },
      undefined,
      null,
      undefined,
      null,
      null,
    ],
  };
}

function generateExpectedResultForPartAdmitAndPaymentReject() {
  return {
    'sections': [
      {
        'title': 'PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_TO_SETTLE_PAID',
              },
              'value': {
                'html': 'COMMON.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/claimant-response/settle-claim',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_TO_SETTLE_PAID',
                  },
                ],
              },
            },
          ],
        },
      },
      undefined,
      null,
      undefined,
      {
        'title': 'PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION',
              },
              'value': {
                'html': 'COMMON.VARIATION_2.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/mediation/free-telephone-mediation',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION',
                  },
                ],
              },
            },
          ],
        },
      },
      {
        'title': 'PAGES.CHECK_YOUR_ANSWER.YOUR_HEARING_REQUIREMENTS_TITLE',
        'summaryList': {
          'rows': [
            {
              'key': {
                'text': 'PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
              },
              'value': {
                'html': 'COMMON.VARIATION_2.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/determination-without-hearing',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE',
              },
              'value': {
                'html': 'COMMON.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/expert-report-details',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE',
              },
              'value': {
                'html': 'COMMON.VARIATION_2.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/permission-for-expert',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE',
              },
              'value': {
                'html': 'COMMON.VARIATION.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/expert-can-still-examine',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES',
              },
              'value': {
                'html': 'COMMON.NO',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/other-witnesses',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
              },
              'value': {
                'html': '',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/cant-attend-hearing-in-next-12-months',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
                  },
                ],
              },
            },
            {
              'key': {
                'text': 'PAGES.SPECIFIC_COURT.TITLE',
              },
              'value': {
                'html': '',
              },
              'actions': {
                'items': [
                  {
                    'href': '/case/12345/directions-questionnaire/court-location',
                    'text': 'COMMON.BUTTONS.CHANGE',
                    'visuallyHiddenText': ' PAGES.SPECIFIC_COURT.TITLE',
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

      expect(result.sections[3].summaryList.rows.length).toEqual(2);
      expect(result.sections[3].summaryList.rows[0]).toEqual({ 'actions': { 'items': [{ 'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }] }, 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }, 'value': { 'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE' } });
      expect(result.sections[3].summaryList.rows[1]).toEqual({ 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA' }, 'value': { 'html': expectedPaymentDate } });
    });

    it('should show the check your answers for pay by set date for full admit', () => {
      claim.fullAdmission = {paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()}};
      claim.claimantResponse = {chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}} as ClaimantResponse;
      claim.respondent1 = {responseType: ResponseType.FULL_ADMISSION};
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[3].summaryList.rows.length).toEqual(2);
      expect(result.sections[3].summaryList.rows[0]).toEqual({ 'actions': { 'items': [{ 'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }] }, 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }, 'value': { 'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE' } });
      expect(result.sections[3].summaryList.rows[1]).toEqual({ 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA' }, 'value': { 'html': expectedPaymentDate } });
    });

    it('should show the check your answers for pay by installments for part admit', () => {
      claim.partialAdmission = {paymentIntention: {paymentOption: PaymentOptionType.INSTALMENTS, paymentDate: new Date()}};
      claim.claimantResponse = {chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}} as ClaimantResponse;
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[3].summaryList.rows.length).toEqual(2);
      expect(result.sections[3].summaryList.rows[0]).toEqual({ 'actions': { 'items': [{ 'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }] }, 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }, 'value': { 'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS' } });
      expect(result.sections[3].summaryList.rows[1]).toEqual({ 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA' }, 'value': { 'html': expectedPaymentDate } });
    });

    it('should show the check your answers for pay by set date for full admit', () => {
      claim.fullAdmission = {paymentIntention: {paymentOption: PaymentOptionType.INSTALMENTS, paymentDate: new Date()}};
      claim.claimantResponse = {chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}} as ClaimantResponse;
      claim.respondent1 = {responseType: ResponseType.FULL_ADMISSION};
      const expectedPaymentDate = formatDateToFullDate(new Date());
      const result = getSummarySections('12345', claim, 'en');

      expect(result.sections[3].summaryList.rows.length).toEqual(2);
      expect(result.sections[3].summaryList.rows[0]).toEqual({ 'actions': { 'items': [{ 'href': '/case/12345/claimant-response/choose-how-to-proceed', 'text': 'COMMON.BUTTONS.CHANGE', 'visuallyHiddenText': ' PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }] }, 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA' }, 'value': { 'html': 'PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS' } });
      expect(result.sections[3].summaryList.rows[1]).toEqual({ 'key': { 'text': 'PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA' }, 'value': { 'html': expectedPaymentDate } });
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
      const expectedResult = generateExpectedResultForPartAdmitPayImmediatelyAccept(YesNo.YES);
      claim.claimantResponse = {hasPartAdmittedBeenAccepted: {option: YesNo.YES}} as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(expectedResult).toEqual(result);
      expect(7).toEqual(result.sections.length);
    });

    it('should check answers for part admit pay immediately for no option', () => {
      const expectedResult = generateExpectedResultForPartAdmitPayImmediatelyReject(YesNo.NO);
      claim.claimantResponse = {hasPartAdmittedBeenAccepted: {option: YesNo.NO}} as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(7).toEqual(result.sections.length);
      expect(expectedResult).toEqual(result);
    });
  });

  describe('Build check answers for full defence intention to proceed', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.respondent1 = {responseType: ResponseType.FULL_DEFENCE};
    });

    it('should check answers for full defence intention to proceed', () => {
      const expectedResult = generateExpectedResultForFullDefenceIntentionToProceedAccept();
      claim.claimantResponse = {intentionToProceed: {option: YesNo.YES}} as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(expectedResult).toEqual(result);
    });

    it('should check answers for full defence reject intention to proceed', () => {
      const expectedResult = generateExpectedResultForFullDefenceIntentionToProceedReject();
      claim.claimantResponse = {intentionToProceed: {option: YesNo.NO}} as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(expectedResult).toEqual(result);
    });
  });

  describe('Build check answers for part admit and paid', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.respondent1 = {responseType: ResponseType.PART_ADMISSION};
      claim.partialAdmission = {alreadyPaid : { option : YesNo.YES}};
    });

    it('should check answers for part admit and paid accept', () => {
      const expectedResult = generateExpectedResultForPartAdmitAndPaidAccept();
      claim.claimantResponse = {hasDefendantPaidYou: {option: YesNo.YES}} as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(expectedResult).toEqual(result);
    });

    it('should check answers for part admit and paid reject', () => {
      const expectedResult = generateExpectedResultForPartAdmitAndPaidReject();
      claim.claimantResponse = {hasDefendantPaidYou: {option: YesNo.NO}} as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(expectedResult).toEqual(result);
    });
  });

  describe('Build check answers for part admit and paid', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.respondent1 = {responseType: ResponseType.PART_ADMISSION};
      claim.partialAdmission = {alreadyPaid : { option : YesNo.YES}};
    });

    it('should check answers for part admit and payment accept', () => {
      const expectedResult = generateExpectedResultForPartAdmitAndPaymentAccept();
      claim.claimantResponse = {hasPartPaymentBeenAccepted: {option: YesNo.YES}} as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(expectedResult).toEqual(result);
    });

    it('should check answers for part admit and payment reject', () => {
      const expectedResult = generateExpectedResultForPartAdmitAndPaymentReject();
      claim.claimantResponse = {hasPartPaymentBeenAccepted: {option: YesNo.NO}} as ClaimantResponse;
      const result = getSummarySections('12345', claim, 'en');
      expect(expectedResult).toEqual(result);
      expect(7).toEqual(result.sections.length);
    });
  });
});
