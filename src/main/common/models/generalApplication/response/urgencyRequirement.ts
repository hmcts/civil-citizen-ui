import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface GeneralAppUrgencyRequirement {
  generalAppUrgency: YesNoUpperCamelCase,
  reasonsForUrgency?: string,
  urgentAppConsiderationDate: string
}
