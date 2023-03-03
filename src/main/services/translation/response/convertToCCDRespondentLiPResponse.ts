import {CCDRespondentLiPResponse} from '../../../common/models/ccdResponse/CCDRespondentLiPResponse';
import {Claim} from '../../../common/models/claim';
import {toUpperCaseGenericYesNo} from '../../../common/form/models/yesNo';

export const toCCDRespondentLiPResponse = (claim: Claim): CCDRespondentLiPResponse => {
  return {
    partialAdmissionAlreadyPaid: toUpperCaseGenericYesNo(claim.partialAdmission?.alreadyPaid),
    timelineComment: claim.partialAdmission?.timeline?.comment,
    evidenceComment: claim.evidence?.comment,
  };
};
