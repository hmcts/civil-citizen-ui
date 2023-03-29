import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDDQExtraDetails {
  wantPhoneOrVideoHearing?: YesNoUpperCamelCase
  whyPhoneOrVideoHearing?: string,
  whyUnavailableForHearing?: string,
  giveEvidenceYourSelf?: YesNoUpperCamelCase,
}
