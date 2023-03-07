import {CCDRespondentLiPResponse} from '../../../common/models/ccdResponse/CCDRespondentLiPResponse';
import {Claim} from '../../../common/models/claim';
import {toUpperCaseGenericYesNo} from '../../../common/form/models/yesNo';
import {toCCDMediation} from 'services/translation/response/convertToCCDMediation';
import {toCCDResponseLiPFinancialDetails} from 'services/translation/response/convertToCCDResponseLiPFinancialDetails';

export const toCCDRespondentLiPResponse = (claim: Claim): CCDRespondentLiPResponse => {
  return {
    partialAdmissionAlreadyPaid: toUpperCaseGenericYesNo(claim.partialAdmission?.alreadyPaid),
    timelineComment: claim.partialAdmission?.timeline?.comment,
    evidenceComment: claim.evidence?.comment,
    respondent1LiPFinancialDetails : toCCDResponseLiPFinancialDetails(claim.statementOfMeans),
    respondent1MediationLiPResponse: toCCDMediation(claim.mediation),
  };
};
