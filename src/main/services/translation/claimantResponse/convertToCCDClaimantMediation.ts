import {Mediation} from 'models/mediation/mediation';
import {toAgreedMediation} from '../response/convertToCCDAgreedMediation';
import {CCDClaimantMediationLip} from 'common/models/claimantResponse/ccdClaimantResponse';
import {toCCDMediation} from '../response/convertToCCDMediation';

export const toCCDClaimantMediation = (mediation: Mediation): CCDClaimantMediationLip => {
  if (!mediation) {
    return undefined;
  }
  const ccdMediation = toCCDMediation(mediation);
  return {
    ...ccdMediation,
    hasAgreedFreeMediation: toAgreedMediation(mediation),
  };
};
