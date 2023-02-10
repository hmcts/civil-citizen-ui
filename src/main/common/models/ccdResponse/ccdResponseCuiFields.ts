import {YesNoUpperCamelCase} from "form/models/yesNo";

export interface CCDResponseCuiFields {
  partnerPensionCui?: YesNoUpperCamelCase,
  partnerDisabilityCui?: YesNoUpperCamelCase,
  partnerSevereDisabilityCui?: YesNoUpperCamelCase,
  childrenEducationCui?: string,
}
