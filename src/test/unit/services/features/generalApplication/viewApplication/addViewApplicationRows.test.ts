import { YesNoUpperCamelCase } from 'common/form/models/yesNo';
import { CcdHearingType } from 'common/models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import { CcdSupportRequirement } from 'common/models/ccdGeneralApplication/ccdSupportRequirement';
import {
  ApplicationResponse,
  CCDApplication,
} from 'common/models/generalApplication/applicationResponse';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';
import { addHearingSupportRows } from 'services/features/generalApplication/viewApplication/addViewApplicationRows';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('addViewApplicatiosRows', () => {
  describe('build addHearingSupportRows', () => {
    const caseData: CCDApplication =  {
      applicationTypes: 'test',
      generalAppType: null,
      generalAppRespondentAgreement: null,
      generalAppInformOtherParty: null,
      generalAppAskForCosts: YesNoUpperCamelCase.NO,
      generalAppDetailsOfOrder: 'test',
      generalAppReasonsOfOrder: 'test',
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

  });
});
