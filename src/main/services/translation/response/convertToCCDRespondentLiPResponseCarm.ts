import {Claim} from 'models/claim';
import {toCCDMediationCarm} from "services/translation/response/convertToCCDMediationCarm";
import {CCDRespondentLiPResponseCarm} from "models/ccdResponse/ccdRespondentLiPResponseCarm";

export const toCCDRespondentLiPResponseCarm = (claim: Claim): CCDRespondentLiPResponseCarm => {
  return {
    respondent1MediationLiPResponseCarm: toCCDMediationCarm(claim.mediationCarm),
  };
};

