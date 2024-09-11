import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {ApplicationState} from 'models/generalApplication/applicationSummary';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {isPastDeadline} from 'common/utils/dateUtils';

export const isRespondentAllowedToRespond = (applicationResponse: ApplicationResponse): boolean => {
  const applicationResponseData = applicationResponse.case_data;
  const isStateAwaitingResponse = applicationResponse.state === ApplicationState.AWAITING_RESPONDENT_RESPONSE;
  const isUrgencyResponse = applicationResponseData.generalAppUrgencyRequirement.generalAppUrgency === YesNoUpperCamelCase.YES && (applicationResponseData.generalAppRespondentAgreement.hasAgreed === YesNoUpperCamelCase.YES || applicationResponse.case_data.generalAppInformOtherParty.isWithNotice === YesNoUpperCamelCase.YES);
  const isAllowedToRespondForUrgent = isUrgencyResponse && !isPastDeadline(applicationResponseData.generalAppNotificationDeadlineDate) && !applicationResponseData.respondentsResponses && !applicationResponseData.judicialDecision && applicationResponse.state === ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION;
  return isStateAwaitingResponse || isAllowedToRespondForUrgent;
}
