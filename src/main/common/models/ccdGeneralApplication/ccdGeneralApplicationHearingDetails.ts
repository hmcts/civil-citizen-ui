import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  CcdGeneralApplicationUnavailableHearingDatesElement,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationUnavailableHearingDates';
import {CcdSupportRequirement} from 'models/ccdGeneralApplication/ccdSupportRequirement';

export interface CcdGeneralApplicationHearingDetails {
  HearingPreferencesPreferredType: CcdHearingType,
  ReasonForPreferredHearingType: string,
  HearingPreferredLocation: CcdHearingPreferredLocation,
  HearingDetailsTelephoneNumber: string,
  HearingDetailsEmailID: string,
  unavailableTrialRequiredYesOrNo: YesNoUpperCamelCase,
  generalAppUnavailableDates: CcdGeneralApplicationUnavailableHearingDatesElement[],
  SupportRequirement: CcdSupportRequirement[],
  SupportRequirementSignLanguage: string,
  SupportRequirementLanguageInterpreter: string,
  SupportRequirementOther: string,
}

export interface CcdHearingPreferredLocation {
  value: CcdHearingPreferredLocationLabel,
}

export interface CcdHearingPreferredLocationLabel {
  label: string,
}

export enum CcdHearingType {
  IN_PERSON = 'IN_PERSON',
  VIDEO = 'VIDEO',
  TELEPHONE = 'TELEPHONE',
}
