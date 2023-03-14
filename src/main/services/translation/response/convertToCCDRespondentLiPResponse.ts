import {Claim} from 'models/claim';
import {
  toCCDResponseLiPFinancialDetails,
} from 'services/translation/response/convertToCCDResponseLiPFinancialDetails';
import {toCCDMediation} from 'services/translation/response/convertToCCDMediation';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {toCCDAddress} from 'services/translation/response/convertToCCDAddress';

export const toCCDRespondentLiPResponse = (claim: Claim): CCDRespondentLiPResponse => {
  return {
    respondent1LiPFinancialDetails : toCCDResponseLiPFinancialDetails(claim.statementOfMeans),
    respondent1MediationLiPResponse: toCCDMediation(claim.mediation),
    respondent1LiPContactPerson: claim.respondent1?.partyDetails?.contactPerson,
    respondent1LiPCorrespondenceAddress: claim.respondent1?.partyDetails?.provideCorrespondenceAddress === 'yes' ? toCCDAddress(claim.respondent1?.partyDetails?.correspondenceAddress) : undefined,
  };
};
