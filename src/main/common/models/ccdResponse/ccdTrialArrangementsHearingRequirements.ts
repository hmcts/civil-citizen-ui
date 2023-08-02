import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDTrialArrangementsHearingRequirements {
  revisedHearingRequirements?: YesNoUpperCamelCase;
  revisedHearingComments?: string;
}

export interface CCDTrialArrangementsOtherComments {
  hearingOtherComments: string;
}
