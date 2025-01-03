import { YesNoUpperCamelCase } from 'common/form/models/yesNo';
import { CcdHearingType } from 'common/models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import { CcdSupportRequirement } from 'common/models/ccdGeneralApplication/ccdSupportRequirement';
import {
  ApplicationResponse,
  CCDApplication,
} from 'common/models/generalApplication/applicationResponse';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';
import {
  addHearingArrangementsRows,
  addHearingSupportRows, addOrderJudgeRow, addRequestingReasonRow,
} from 'services/features/generalApplication/viewApplication/addViewApplicationRows';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const caseData: CCDApplication =  {
  applicationTypes: 'test',
  generalAppType: null,
  generalAppRespondentAgreement: null,
  generalAppInformOtherParty: null,
  generalAppAskForCosts: YesNoUpperCamelCase.NO,
  generalAppDetailsOfOrder: null,
  generalAppReasonsOfOrder: null,
  generalAppEvidenceDocument: [],
  gaAddlDoc: [],
  generalAppStatementOfTruth: null,
  generalAppPBADetails: null,
  applicationFeeAmountInPence: 'test',
  parentClaimantIsApplicant: YesNoUpperCamelCase.NO,
  generalAppHearingDetails: {
    HearingPreferencesPreferredType: CcdHearingType.IN_PERSON,
    ReasonForPreferredHearingType: 'test',
    HearingPreferredLocation: null,
    HearingDetailsTelephoneNumber: 'test',
    HearingDetailsEmailID: 'test',
    unavailableTrialRequiredYesOrNo: null,
    generalAppUnavailableDates: null,
    SupportRequirement: [],
    SupportRequirementSignLanguage: 'ASL',
    SupportRequirementLanguageInterpreter: 'Spanish',
    SupportRequirementOther: 'Wheelchair assistance',
  },
  judicialDecision: undefined,
};

const applicationResponse = new ApplicationResponse(
  '123', caseData, ApplicationState.AWAITING_RESPONDENT_RESPONSE, null, null,
);

describe('addViewApplicationsRows', () => {
  describe('build addHearingSupportRows', () => {

    it('should return a summary row with selected supports', () => {
      caseData.generalAppHearingDetails.SupportRequirement = [
        CcdSupportRequirement.DISABLED_ACCESS,
        CcdSupportRequirement.HEARING_LOOPS,
        CcdSupportRequirement.SIGN_INTERPRETER,
      ];

      const result = addHearingSupportRows(applicationResponse, 'en');

      expect(result).toHaveLength(1);
      expect(result[0].value.html).toContain(
        '<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.STEP_FREE_ACCESS</li>',
      );
      expect(result[0].value.html).toContain(
        '<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP</li>',
      );
      expect(result[0].value.html).toContain(
        "<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.SIGN_LANGUAGE_INTERPRETER - 'ASL'</li>",
      );
    });

    it('should return NO when no support is selected', () => {
      caseData.generalAppHearingDetails.SupportRequirement  = [];
      const result = addHearingSupportRows(applicationResponse, 'en');
      expect(result).toHaveLength(1);
      expect(result[0].value.html).toBe('COMMON.NO');
    });

    it('should return NO when no support is undefined', () => {
      caseData.generalAppHearingDetails.SupportRequirement = undefined;
      const result = addHearingSupportRows(applicationResponse, 'en');

      expect(result).toHaveLength(1);
      expect(result[0].value.html).toBe('COMMON.NO');
    });

    it('should handle language interpreter and other support requirements', () => {
      caseData.generalAppHearingDetails.SupportRequirement = [
        CcdSupportRequirement.LANGUAGE_INTERPRETER,
        CcdSupportRequirement.OTHER_SUPPORT,
      ];

      const result = addHearingSupportRows(applicationResponse, 'en');

      expect(result).toHaveLength(1);
      expect(result[0].value.html).toContain(
        "<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.LANGUAGE_INTERPRETER - 'Spanish'</li>",
      );
      expect(result[0].value.html).toContain(
        "<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.OTHER - 'Wheelchair assistance'</li>",
      );
    });

    it('should handle addHearingArrangementsRows with CcdHearingType.VIDEO', () => {
      caseData.generalAppHearingDetails.HearingPreferencesPreferredType = CcdHearingType.VIDEO;

      const result = addHearingArrangementsRows(applicationResponse, 'en');

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(  {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
        },
        'value': {
          'html': 'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE_VIEW_APPLICATION.VIDEO_CONFERENCE',
        },
      });
      expect(result[1]).toEqual(  {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
        },
        'value': {
          'html': 'test',
        },
      });
      expect(result[2]).toEqual(  {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_COURT_LOCATION',
        },
        'value': {
          'html': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NONE',
        },
      });
    });

    it('should handle addHearingArrangementsRows with CcdHearingType.WITHOUT_HEARING', () => {
      caseData.generalAppHearingDetails.HearingPreferencesPreferredType = CcdHearingType.WITHOUT_HEARING;

      const result = addHearingArrangementsRows(applicationResponse, 'en');

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(  {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
        },
        'value': {
          'html': 'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE_VIEW_APPLICATION.WITHOUT_HEARING',
        },
      });
      expect(result[1]).toEqual(  {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
        },
        'value': {
          'html': 'test',
        },
      });
      expect(result[2]).toEqual(  {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_COURT_LOCATION',
        },
        'value': {
          'html': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NONE',
        },
      });
    });

    it('should handle addHearingArrangementsRows with CcdHearingType.VIDEO', () => {
      caseData.generalAppHearingDetails.HearingPreferencesPreferredType = CcdHearingType.TELEPHONE;

      const result = addHearingArrangementsRows(applicationResponse, 'en');

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(  {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
        },
        'value': {
          'html': 'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE_VIEW_APPLICATION.TELEPHONE',
        },
      });
      expect(result[1]).toEqual(  {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
        },
        'value': {
          'html': 'test',
        },
      });
      expect(result[2]).toEqual(  {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_COURT_LOCATION',
        },
        'value': {
          'html': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NONE',
        },
      });
    });

    it('should handle addHearingArrangementsRows with CcdHearingType.IN_PERSON', () => {
      caseData.generalAppHearingDetails.HearingPreferencesPreferredType = CcdHearingType.IN_PERSON;

      const result = addHearingArrangementsRows(applicationResponse, 'en');

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(  {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
        },
        'value': {
          'html': 'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE_VIEW_APPLICATION.PERSON_AT_COURT',
        },
      });
      expect(result[1]).toEqual(  {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
        },
        'value': {
          'html': 'test',
        },
      });
      expect(result[2]).toEqual(  {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_COURT_LOCATION',
        },
        'value': {
          'html': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NONE',
        },
      });
    });

  });

  describe('build addOrderJudgeRow', () => {

    it('should return a summary row with generalAppAskForCosts = yes addOrderJudgeRow Lip v Lip', () => {
      applicationResponse.case_data.generalAppDetailsOfOrderColl = Array.of({ value: 'test1'});
      applicationResponse.case_data.generalAppAskForCosts = YesNoUpperCamelCase.YES;
      const result = addOrderJudgeRow(applicationResponse, 0,'en');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(  {
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHAT_ORDER' },
        value: {
          html: '<p class="govuk-body">test1 <br> PAGES.GENERAL_APPLICATION.ORDER_FOR_COSTS</p>',
        },
      });
    });

    it('should return a summary row with generalAppAskForCosts = no addOrderJudgeRow Lip v Lip', () => {
      applicationResponse.case_data.generalAppDetailsOfOrderColl = Array.of({ value: 'test1'});
      applicationResponse.case_data.generalAppAskForCosts = YesNoUpperCamelCase.NO;
      const result = addOrderJudgeRow(applicationResponse, 0,'en');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(  {
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHAT_ORDER' },
        value: {
          html: '<p class="govuk-body">test1 <br> </p>',
        },
      });
    });

    it('should return a summary row with addOrderJudgeRow LR v Lip', () => {
      applicationResponse.case_data.generalAppDetailsOfOrderColl = [];
      applicationResponse.case_data.generalAppAskForCosts = null;
      applicationResponse.case_data.generalAppDetailsOfOrder = 'generalAppDetailsOfOrder';
      const result = addOrderJudgeRow(applicationResponse, 0,'en');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(  {
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHAT_ORDER' },
        value: {
          html: '<p class="govuk-body">generalAppDetailsOfOrder</p>',
        },
      });
    });

    it('should return not return row', () => {
      applicationResponse.case_data.generalAppDetailsOfOrderColl = [];
      applicationResponse.case_data.generalAppAskForCosts = null;
      applicationResponse.case_data.generalAppDetailsOfOrder = null;
      const result = addOrderJudgeRow(applicationResponse, 0,'en');
      expect(result).toHaveLength(0);
    });

  });

  describe('build addRequestingReasonRow', () => {

    it('should return a summary row with generalAppReasonsOfOrderColl Lip v Lip', () => {
      applicationResponse.case_data.generalAppReasonsOfOrderColl = Array.of({ value: 'test1'});
      const result = addRequestingReasonRow(applicationResponse, 0,'en');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(  {
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_REQUESTING' },
        value: {
          html: 'test1',
        },
      });
    });

    it('should return a summary row with addOrderJudgeRow LR v Lip', () => {
      applicationResponse.case_data.generalAppReasonsOfOrderColl = [];
      applicationResponse.case_data.generalAppReasonsOfOrder = 'generalAppReasonsOfOrder';

      const result = addRequestingReasonRow(applicationResponse, 0,'en');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(  {
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_REQUESTING' },
        value: {
          html: '<p class="govuk-body">generalAppReasonsOfOrder</p>',
        },
      });
    });

    it('should return not return row', () => {
      applicationResponse.case_data.generalAppReasonsOfOrderColl = [];
      applicationResponse.case_data.generalAppReasonsOfOrder = null;

      const result = addRequestingReasonRow(applicationResponse, 0,'en');
      expect(result).toHaveLength(0);
    });

  });

});
