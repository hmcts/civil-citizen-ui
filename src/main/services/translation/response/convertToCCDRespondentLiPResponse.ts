import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {Claim} from 'models/claim';
import {
  toCCDResponseLiPFinancialDetails,
} from 'services/translation/response/convertToCCDResponseLiPFinancialDetails';
import {toCCDMediation} from 'services/translation/response/convertToCCDMediation';
import {toCCDDQExtraDetails} from 'services/translation/response/convertToCCDDQExtraDetials';
import {toCCDSHearingSupport} from 'services/translation/response/convertToCCDHearingSupport';

export const toCCDRespondentLiPResponse = (claim: Claim): CCDRespondentLiPResponse => {
  return {
    respondent1LiPFinancialDetails : toCCDResponseLiPFinancialDetails(claim.statementOfMeans),
    respondent1MediationLiPResponse: toCCDMediation(claim.mediation),
    respondent1DQExtraDetails: toCCDDQExtraDetails(claim.directionQuestionnaire),
    respondent1DQHearingSupportLip: toCCDSHearingSupport(claim.directionQuestionnaire?.hearing?.supportRequiredList),
  };
};
