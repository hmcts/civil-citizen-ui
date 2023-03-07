import {Claim} from 'models/claim';
import {
  toCCDResponseLiPFinancialDetails,
} from 'services/translation/response/convertToCCDResponseLiPFinancialDetails';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';

export const toCCDRespondentLiPResponse = (claim: Claim): CCDRespondentLiPResponse => {
  return {
    respondent1LiPFinancialDetails : toCCDResponseLiPFinancialDetails(claim.statementOfMeans),
  };
};
