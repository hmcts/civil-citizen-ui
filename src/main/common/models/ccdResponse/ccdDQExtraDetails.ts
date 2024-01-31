import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDLiPExpert} from 'models/ccdResponse/ccdLiPExpert';

export interface CCDDQExtraDetails {
  wantPhoneOrVideoHearing?: YesNoUpperCamelCase
  whyPhoneOrVideoHearing?: string,
  whyUnavailableForHearing?: string,
  giveEvidenceYourSelf?: YesNoUpperCamelCase,
  triedToSettle?: YesNoUpperCamelCase;
  determinationWithoutHearingRequired?: YesNoUpperCamelCase;
  determinationWithoutHearingReason?: string,
  requestExtra4weeks?: YesNoUpperCamelCase;
  considerClaimantDocuments?: YesNoUpperCamelCase;
  considerClaimantDocumentsDetails?: string;
  respondent1DQLiPExpert?: CCDLiPExpert;
  applicant1DQLiPExpert?: CCDLiPExpert;
}
