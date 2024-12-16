import {
  CcdGADebtorPaymentPlanGAspec,
  CcdGARespondentDebtorOfferOptionsGAspec,
  CcdGeneralApplicationHearingDetails,
  CcdHearingType,
} from 'common/models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import { CcdGeneralApplicationRespondentResponse } from 'common/models/ccdGeneralApplication/ccdGeneralApplicationRespondentResponse';
import { CcdSupportRequirement } from 'common/models/ccdGeneralApplication/ccdSupportRequirement';
import { CCDApplication } from 'common/models/generalApplication/applicationResponse';
import { buildResponseSummaries } from 'services/features/generalApplication/viewApplication/addViewApplicationResponseRows';
import { YesNoUpperCamelCase } from 'form/models/yesNo';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('addViewApplicationResponseRows', () => {
  describe('buildResponseSummaries', () => {
    it('should return No agreement row', () => {
      const application: Partial<CCDApplication> = {
        gaRespondentDebtorOffer: {
          respondentDebtorOffer: CcdGARespondentDebtorOfferOptionsGAspec.DECLINE,
          debtorObjections: 'I disagree',
          paymentPlan: CcdGADebtorPaymentPlanGAspec.PAYFULL,
          paymentSetDate: new Date('2028-03-25'),

        },
        respondentsResponses: [{ value : {generalAppRespondent1Representative: YesNoUpperCamelCase.NO}} as CcdGeneralApplicationRespondentResponse],
      } satisfies Partial<CCDApplication>;
      const htmlData = '<ul class="no-list-style"><li class="govuk-summary-list__key">PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_SET_DATE</li><li>25/03/2028</li><li class="govuk-summary-list__key">PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.WHY_NOT_ACCEPT</li><li>I disagree</li></ul>';
      expect(buildResponseSummaries(application as CCDApplication, 'en')).toStrictEqual([
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.DEFENDANT_OFFER',
          },
          'value': {
            'html': 'COMMON.VARIATION_2.NO',
          },
        },{
          key: { text: 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.DO_YOU_AGREE_WITH_APPLICANT_REQUEST'},
          value: {html: 'COMMON.VARIATION_2.NO'},
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_PAYMENT_PLAN',
          },
          'value': {
            'html': htmlData,
          },
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.UNAVAILABLE_DATES',
          },
          'value': {
            'html': 'COMMON.NO',
          },
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
          },
          'value': {
            'html': 'COMMON.NO',
          },
        },
      ]);
    });

    it('should return No agreement row when instalments response', () => {
      const application: Partial<CCDApplication> = {
        gaRespondentDebtorOffer: {
          respondentDebtorOffer: CcdGARespondentDebtorOfferOptionsGAspec.DECLINE,
          debtorObjections: 'I disagree',
          paymentPlan: CcdGADebtorPaymentPlanGAspec.INSTALMENT,
          monthlyInstalment: ('12300'),

        },
        respondentsResponses: [{ value : {generalAppRespondent1Representative: YesNoUpperCamelCase.NO}} as CcdGeneralApplicationRespondentResponse],
      } satisfies Partial<CCDApplication>;
      const htmlData = '<ul class="no-list-style"><li class="govuk-summary-list__key">PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_INSTALMENTS</li><li>£123</li><li class="govuk-summary-list__key">PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.WHY_NOT_ACCEPT</li><li>I disagree</li></ul>';
      expect(buildResponseSummaries(application as CCDApplication, 'en')).toStrictEqual([
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.DEFENDANT_OFFER',
          },
          'value': {
            'html': 'COMMON.VARIATION_2.NO',
          },
        },
        {
          key: { text: 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.DO_YOU_AGREE_WITH_APPLICANT_REQUEST'},
          value: {html: 'COMMON.VARIATION_2.NO'},
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_PAYMENT_PLAN',
          },
          'value': {
            'html': htmlData,
          },
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.UNAVAILABLE_DATES',
          },
          'value': {
            'html': 'COMMON.NO',
          },
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
          },
          'value': {
            'html': 'COMMON.NO',
          },
        },
      ]);
    });

    it('should return Yes agreement row', () => {
      const application: Partial<CCDApplication> = {
        gaRespondentDebtorOffer: {
          respondentDebtorOffer: CcdGARespondentDebtorOfferOptionsGAspec.ACCEPT,
          debtorObjections: undefined,
        },
        respondentsResponses: [{ value : {generalAppRespondent1Representative: YesNoUpperCamelCase.YES}}],
      } satisfies Partial<CCDApplication>;

      expect(buildResponseSummaries(application as CCDApplication, 'en')).toStrictEqual([{
        key: {text: 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.DEFENDANT_OFFER'},
        value: {html: 'COMMON.VARIATION_2.YES'},
      },
      {
        key: { text: 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.DO_YOU_AGREE_WITH_APPLICANT_REQUEST'},
        value: {html: 'COMMON.VARIATION_2.YES'},
      },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.UNAVAILABLE_DATES',
          },
          'value': {
            'html': 'COMMON.NO',
          },
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
          },
          'value': {
            'html': 'COMMON.NO',
          },
        },
      ]);
    });

    it('should return undefined when there are not responses', () => {
      expect(buildResponseSummaries({} as CCDApplication, 'en')).toBeUndefined();
    });

    it('should include hearing type and contact details', () => {
      const application: Partial<CCDApplication> = {
        respondentsResponses: [{
          value: {
            generalAppRespondent1Representative: YesNoUpperCamelCase.NO,
            gaHearingDetails: {
              HearingPreferencesPreferredType: CcdHearingType.IN_PERSON,
              ReasonForPreferredHearingType: 'I prefer in person',
              HearingPreferredLocation: {
                value: {label: "Barnet Civil and Family Centre - St Mary's Court, Regents Park Road - N3 1BQ"},
              },
              HearingDetailsTelephoneNumber: '07878787878',
              HearingDetailsEmailID: 'email@addre.ss',
            } as CcdGeneralApplicationHearingDetails,
          } as unknown ,
        }],
      };
      expect(buildResponseSummaries(application as CCDApplication, 'en')).toStrictEqual([{
        key: { text: 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.DO_YOU_AGREE_WITH_APPLICANT_REQUEST' },
        value: { html: 'COMMON.VARIATION_2.NO' },
      },
      {
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE' },
        value: { html: 'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE_VIEW_APPLICATION.PERSON_AT_COURT' },
      }, {
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER' },
        value: { html: 'I prefer in person'},
      }, {
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PREFERRED_LOCATION' },
        value: { html: "Barnet Civil and Family Centre - St Mary's Court, Regents Park Road - N3 1BQ"},
      }, {
        key: { text: 'PAGES.GENERAL_APPLICATION.HEARING_CONTACT_DETAILS.PREFERRED_TELEPHONE_NUMBER' },
        value: { html: '07878787878'},
      }, {
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL' },
        value: { html: 'email@addre.ss'},
        }, {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.UNAVAILABLE_DATES',
          },
          'value': {
            'html': 'COMMON.NO',
          },
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
          },
          'value': {
            'html': 'COMMON.NO',
          },
        },]);

    });

    it('should include unavailable dates', () => {
      const application: Partial<CCDApplication> = {
        respondentsResponses: [{ value: {
          gaHearingDetails: {
            generalAppUnavailableDates: [
              {value: {
                unavailableTrialDateFrom: '2024-07-30',
              } },
              {value: {
                unavailableTrialDateTo: '2024-08-07',
                unavailableTrialDateFrom: '2024-08-01',
              } },
              {value: {
                unavailableTrialDateTo: '2024-08-22',
                unavailableTrialDateFrom: '2024-08-20',
              } },
            ]} as CcdGeneralApplicationHearingDetails,
        }}],
      };

      expect(buildResponseSummaries(application as CCDApplication, 'en')).toStrictEqual([{
        key: { text: 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.DO_YOU_AGREE_WITH_APPLICANT_REQUEST'},
        value: {html: 'COMMON.VARIATION_2.NO'},
      },
      {
        key: { text: 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.UNAVAILABLE_DATES'},
        value: {html: '<ul class="no-list-style"><li>30 July 2024</li><li>1 August 2024 - 7 August 2024</li><li>20 August 2024 - 22 August 2024</li></ul>'},
      },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
          },
          'value': {
            'html': 'COMMON.NO'
          },
        },]);
    });

    it('should include unavailable dates', () => {
      const application: Partial<CCDApplication> = {
        respondentsResponses: [{
          value: {
            gaHearingDetails: {
              generalAppUnavailableDates: [
                {
                  value: {
                    unavailableTrialDateFrom: '2024-07-30',
                  }
                },
                {
                  value: {
                    unavailableTrialDateTo: '2024-08-07',
                    unavailableTrialDateFrom: '2024-08-01',
                  }
                },
                {
                  value: {
                    unavailableTrialDateTo: '2024-08-22',
                    unavailableTrialDateFrom: '2024-08-20',
                  }
                },
              ]
            } as CcdGeneralApplicationHearingDetails,
          }
        }],
      };

      expect(buildResponseSummaries(application as CCDApplication, 'en')).toStrictEqual([{
        key: {text: 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.DO_YOU_AGREE_WITH_APPLICANT_REQUEST'},
        value: {html: 'COMMON.VARIATION_2.NO'},
      },
        {
          key: {text: 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.UNAVAILABLE_DATES'},
          value: {html: '<ul class="no-list-style"><li>30 July 2024</li><li>1 August 2024 - 7 August 2024</li><li>20 August 2024 - 22 August 2024</li></ul>'},
        }, {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
          },
          'value': {
            'html': 'COMMON.NO'
          },
        }]);
    });

    it('should include all support items', () => {
      const application: Partial<CCDApplication> = {
        respondentsResponses: [{ value: {
          gaHearingDetails: {
            SupportRequirement: [
              CcdSupportRequirement.LANGUAGE_INTERPRETER,
              CcdSupportRequirement.SIGN_INTERPRETER,
              CcdSupportRequirement.HEARING_LOOPS,
              CcdSupportRequirement.DISABLED_ACCESS,
              CcdSupportRequirement.OTHER_SUPPORT,
            ]} as CcdGeneralApplicationHearingDetails,
        }}],
      };

      expect(buildResponseSummaries(application as CCDApplication, 'en')).toStrictEqual([{
        key: { text: 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.DO_YOU_AGREE_WITH_APPLICANT_REQUEST'},
        value: {html: 'COMMON.VARIATION_2.NO'},
      }, {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.UNAVAILABLE_DATES',
        },
        'value': {
          'html': 'COMMON.NO',
        },
      }, {
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS'},
        value: {html: '<ul class="no-list-style">'
          + '<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.LANGUAGE_INTERPRETER</li>'
          + '<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.SIGN_LANGUAGE_INTERPRETER</li>'
          + '<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP</li>'
          + '<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.STEP_FREE_ACCESS</li>'
          + '<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.OTHER</li>'
          + '</ul>'},
      }]);
    });
  });
});
