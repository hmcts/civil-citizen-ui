import {CCDResponseCuiFields} from 'models/ccdResponse/ccdResponseCuiFields';
import {Claim} from 'models/claim';
import {toCCDMediation} from 'services/translation/response/convertToCCDMediation';

export const toCCDFieldsOnlyInCui = (claim: Claim): CCDResponseCuiFields => {
  return {
    respondent1MediationFromCui: toCCDMediation(claim.mediation),
  };
};
