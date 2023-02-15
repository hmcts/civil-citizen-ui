import {CCDResponseCuiFields} from 'models/ccdResponse/ccdResponseCuiFields';
import {Claim} from 'models/claim';
import {toCCDYesNo, toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';
import {toCCDFieldsOnlyInCuiFinancialDetails} from 'models/ccdResponse/convertToCCDFromCuiOnlyFinancialDetails';

export const toCCDFieldsOnlyInCui = (claim: Claim): CCDResponseCuiFields => {
  return {
    respondent1FinancialDetailsFromCui: toCCDFieldsOnlyInCuiFinancialDetails(claim.statementOfMeans),
  };
    const ccdResponseCuiFields: CCDResponseCuiFields = new CCDResponseCuiFields();
  toCCDMediation(ccdResponseCuiFields, claim);

  return ccdResponseCuiFields;

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
