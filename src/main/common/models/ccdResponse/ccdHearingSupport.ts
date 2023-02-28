import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDHearingSupport {
  supportRequirementLip?: YesNoUpperCamelCase,
  requirementsLip?: CCDSupportRequirements[],
}

export interface CCDSupportRequirements{
  id?: string,
  value?: CCDHearingSupportDetails,
}

export interface  CCDHearingSupportDetails{
  name?: string,
  requirements? : CCDSupportRequirement[]
  signLanguageRequired? : string,
  languageToBeInterpreted? : string,
  otherSupport? : string,
}

export enum CCDSupportRequirement{
  DISABLED_ACCESS =  'DISABLED_ACCESS',
  HEARING_LOOPS = 'HEARING_LOOPS',
  SIGN_INTERPRETER = 'SIGN_INTERPRETER',
  LANGUAGE_INTERPRETER = 'LANGUAGE_INTERPRETER',
  OTHER_SUPPORT = 'OTHER_SUPPORT',
}
