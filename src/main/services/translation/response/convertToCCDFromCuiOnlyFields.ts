import {CCDResponseCuiFields} from 'models/ccdResponse/ccdResponseCuiFields';
import {Claim} from 'models/claim';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {toCCDYesNo, toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';

export const toCCDFieldsOnlyInCui = (claim: Claim): CCDResponseCuiFields => {
  const ccdResponseCuiFields: CCDResponseCuiFields = new CCDResponseCuiFields();
  toCCDStateOfMeans(ccdResponseCuiFields, claim);
  toCCDMediation(ccdResponseCuiFields, claim);

  return ccdResponseCuiFields;
};

const toCCDStateOfMeans = (ccdResponse: CCDResponseCuiFields, claim:Claim) => {
  ccdResponse.partnerDisabilityCui = claim.statementOfMeans?.partnerDisability?.option === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
  ccdResponse.partnerPensionCui= claim.statementOfMeans?.partnerPension?.option === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
  ccdResponse.partnerDisabilityCui= claim.statementOfMeans?.partnerDisability?.option === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
  ccdResponse.partnerSevereDisabilityCui= claim.statementOfMeans?.partnerSevereDisability?.option === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
  ccdResponse.childrenEducationCui= claim.statementOfMeans?.numberOfChildrenLivingWithYou?.toString();
};

const toCCDMediation = (ccdResponse: CCDResponseCuiFields, claim:Claim) => {
  ccdResponse.canWeUseMediationCui= toCCDYesNo(claim.mediation?.canWeUse?.option);
  ccdResponse.canWeUseMediationPhoneCui= claim.mediation?.canWeUse?.mediationPhoneNumber;
  ccdResponse.mediationDisagreementCui= toCCDYesNoFromGenericYesNo(claim.mediation?.mediationDisagreement);
  ccdResponse.noMediationReasonCui= claim.mediation?.noMediationReason?.iDoNotWantMediationReason;
  ccdResponse.noMediationOtherReasonCui= claim.mediation?.noMediationReason?.otherReason;
  ccdResponse.companyTelephoneOptionMediationCui= toCCDYesNo(claim.mediation?.companyTelephoneNumber?.option);
  ccdResponse.companyTelephoneConfirmationMediationCui= claim.mediation?.companyTelephoneNumber?.mediationPhoneNumberConfirmation;
  ccdResponse.companyTelephoneContactPersonMediationCui= claim.mediation?.companyTelephoneNumber?.mediationContactPerson;
  ccdResponse.companyTelephonePhoneNumberMediationCui= claim.mediation?.companyTelephoneNumber?.mediationPhoneNumber;
};
