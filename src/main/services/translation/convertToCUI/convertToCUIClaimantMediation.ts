import {CCDClaimantMediationLip} from 'models/claimantResponse/ccdClaimantResponse';
import {Mediation} from 'models/mediation/mediation';
import {toCUIGenericYesNo, toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {CanWeUse} from 'models/mediation/canWeUse';
import {NoMediationReason} from 'form/models/mediation/noMediationReason';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';

export const toCUIClaimantMediation = (applicant1ClaimMediationSpecRequiredLip: CCDClaimantMediationLip): Mediation =>{
  if (!applicant1ClaimMediationSpecRequiredLip) return undefined;
  const mediation : Mediation = new Mediation();
  mediation.canWeUse = toCUICanWeUse(applicant1ClaimMediationSpecRequiredLip);
  mediation.mediationDisagreement = toCUIGenericYesNo(applicant1ClaimMediationSpecRequiredLip.mediationDisagreementLiP);
  mediation.noMediationReason = toNoMediationReason(applicant1ClaimMediationSpecRequiredLip);
  mediation.companyTelephoneNumber = toCompanyTelephoneNumber(applicant1ClaimMediationSpecRequiredLip);
  return mediation;
};

function toCUICanWeUse(applicant1ClaimMediationSpecRequiredLip: CCDClaimantMediationLip) : CanWeUse {
  return {
    option: toCUIYesNo(applicant1ClaimMediationSpecRequiredLip.canWeUseMediationLiP),
    mediationPhoneNumber: applicant1ClaimMediationSpecRequiredLip.canWeUseMediationPhoneLiP,
  };
}

function toNoMediationReason(applicant1ClaimMediationSpecRequiredLip: CCDClaimantMediationLip) : NoMediationReason {
  return new NoMediationReason(
    applicant1ClaimMediationSpecRequiredLip.noMediationReasonLiP,
    applicant1ClaimMediationSpecRequiredLip.noMediationOtherReasonLiP,
  );
}

function toCompanyTelephoneNumber(applicant1ClaimMediationSpecRequiredLip: CCDClaimantMediationLip) : CompanyTelephoneNumber {
  return new CompanyTelephoneNumber(
    toCUIYesNo(applicant1ClaimMediationSpecRequiredLip.companyTelephoneOptionMediationLiP),
    applicant1ClaimMediationSpecRequiredLip.companyTelephonePhoneNumberMediationLiP,
    applicant1ClaimMediationSpecRequiredLip.companyTelephoneContactPersonMediationLiP,
    applicant1ClaimMediationSpecRequiredLip.companyTelephoneConfirmationMediationLiP,
  );
}
