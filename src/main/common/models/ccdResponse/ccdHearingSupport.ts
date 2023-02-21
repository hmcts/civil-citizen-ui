import {YesNoUpperCamelCase} from 'form/models/yesNo';

export enum CCDSupportRequirements{
  DISABLED_ACCESS =  'DISABLED_ACCESS',
  HEARING_LOOPS = 'HEARING_LOOPS',
  SIGN_INTERPRETER = 'SIGN_INTERPRETER',
  LANGUAGE_INTERPRETER = 'LANGUAGE_INTERPRETER',
  OTHER_SUPPORT = 'OTHER_SUPPORT',
}

export interface CCDHearingSupport {
  requirements?:CCDSupportRequirements[],
  signLanguageRequired?: string,
  languageToBeInterpreted?: string,
  otherSupport?: string,
  supportRequirements?: YesNoUpperCamelCase,
  supportRequirementsAdditional?: string,
}
