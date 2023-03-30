import {Mediation} from 'models/mediation/mediation';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';
import {CanWeUse} from 'models/mediation/canWeUse';
import {NoMediationReason} from 'form/models/mediation/noMediationReason';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
import {toCUIGenericYesNo, toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';

export const toCUIMediation = (ccdMediation: CCDMediation): Mediation => {
  if (!ccdMediation) return undefined;
  const mediation : Mediation = new Mediation();
  mediation.canWeUse = toCanWeUse(ccdMediation);
  mediation.mediationDisagreement = toCUIGenericYesNo(ccdMediation.mediationDisagreementLiP);
  mediation.noMediationReason = toNoMediationReason(ccdMediation);
  mediation.companyTelephoneNumber = toCompanyTelephoneNumber(ccdMediation);
  return mediation;
};

function toCanWeUse(mediation: CCDMediation) : CanWeUse {
  return {
    option: toCUIYesNo(mediation.canWeUseMediationLiP),
    mediationPhoneNumber: mediation.canWeUseMediationPhoneLiP,
  };
}

function toNoMediationReason(mediation: CCDMediation) : NoMediationReason {
  return new NoMediationReason(
    mediation.noMediationReasonLiP,
    mediation.noMediationOtherReasonLiP,
  );
}

function toCompanyTelephoneNumber(mediation: CCDMediation) : CompanyTelephoneNumber {
  return new CompanyTelephoneNumber(
    toCUIYesNo(mediation.companyTelephoneOptionMediationLiP),
    mediation.companyTelephonePhoneNumberMediationLiP,
    mediation.companyTelephoneContactPersonMediationLiP,
    mediation.companyTelephoneConfirmationMediationLiP,
  );
}
