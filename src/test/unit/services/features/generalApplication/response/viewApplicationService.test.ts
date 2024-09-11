import {ApplicationState} from 'models/generalApplication/applicationSummary';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {isRespondentAllowedToRespond} from 'services/features/generalApplication/response/viewApplicationService';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {DateTime} from 'luxon';
import {CcdGeneralApplicationHearingDetails} from 'models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';

describe('view application service test', () => {

  const defaultApplicationResponse: ApplicationResponse = new ApplicationResponse();
  defaultApplicationResponse.state = ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION;
  defaultApplicationResponse.case_data = {
    ...defaultApplicationResponse.case_data,

    generalAppUrgencyRequirement: {
      generalAppUrgency: YesNoUpperCamelCase.NO,
      urgentAppConsiderationDate: '2025-10-10'
    }
  }
  it('should return true when state is AWAITING_RESPONDENT_RESPONSE', () => {
    const applicationResponse = {
      ...defaultApplicationResponse,
      state: ApplicationState.AWAITING_RESPONDENT_RESPONSE
    };
    expect(isRespondentAllowedToRespond(applicationResponse)).toBe(true);
  });

  it('should return false when respondents have already responded', () => {
    const applicationResponse = {
      ...defaultApplicationResponse,
      case_data: {
        ...defaultApplicationResponse.case_data,
        generalAppUrgencyRequirement: {
          generalAppUrgency: YesNoUpperCamelCase.YES,
          urgentAppConsiderationDate: DateTime.now().plus({days: 10}).toString(),
        },
        generalAppRespondentAgreement: {
          hasAgreed: YesNoUpperCamelCase.YES,
        },
        generalAppInformOtherParty: {
          isWithNotice: YesNoUpperCamelCase.YES,
          reasonsForWithoutNotice: '',
        },
        respondentsResponses: [{
          value: {
            generalAppRespondent1Representative: YesNoUpperCamelCase.NO,
            gaHearingDetails: {} as CcdGeneralApplicationHearingDetails,
            gaRespondentDetails: 'abc',
            gaRespondentResponseReason: 'test',
          }
        }]
      }
    };
    expect(isRespondentAllowedToRespond(applicationResponse)).toBe(false);

  });
  it('should return true when urgency case is with notice and not past deadline', () => {
    const applicationResponse = {
      ...defaultApplicationResponse,
      case_data: {
        ...defaultApplicationResponse.case_data,
        generalAppUrgencyRequirement: {
          generalAppUrgency: YesNoUpperCamelCase.YES,
          urgentAppConsiderationDate: DateTime.now().plus({days: 10}).toString(),
        },
        generalAppRespondentAgreement: {
          hasAgreed: YesNoUpperCamelCase.NO,
        },
        generalAppInformOtherParty: {
          isWithNotice: YesNoUpperCamelCase.YES,
          reasonsForWithoutNotice: '',
        },
      },
      generalAppNotificationDeadlineDate: DateTime.now().plus({days: 5}).toString(),
    };
    expect(isRespondentAllowedToRespond(applicationResponse)).toBe(true);
  });
})
