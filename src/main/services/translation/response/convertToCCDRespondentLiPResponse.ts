import {CCDRespondentLiPResponse} from 'models/ccdResponse/CCDRespondentLiPResponse';
import {Claim} from 'models/claim';
import {toCCDMediation} from 'services/translation/response/convertToCCDMediation';

export const toCCDRespondentLiPResponse = (claim: Claim): CCDRespondentLiPResponse => {
  return {
    respondent1MediationLipResponse: toCCDMediation(claim.mediation),
  };
};
