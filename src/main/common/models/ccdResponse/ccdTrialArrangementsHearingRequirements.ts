import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {ClaimUpdate} from 'models/events/eventDto';

export interface CCDTrialArrangementsHearingRequirements {
  revisedHearingRequirements?: YesNoUpperCamelCase;
  revisedHearingComments?: string;
}

export interface CCDTrialArrangementsOtherComments {
  hearingOtherComments: string;
}

export interface CCDTrialArrangementDefendent extends ClaimUpdate {
  trialReadyRespondent1: YesNoUpperCamelCase;
  respondent1RevisedHearingRequirements: CCDTrialArrangementsHearingRequirements;
  respondent1HearingOtherComments: CCDTrialArrangementsOtherComments;
}
