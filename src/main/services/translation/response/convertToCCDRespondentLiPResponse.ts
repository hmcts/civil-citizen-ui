import {CCDRespondentLiPResponse} from 'models/ccdResponse/CCDRespondentLiPResponse';
import {Claim} from 'models/claim';
import {toUpperYesOrNo} from 'form/models/yesNo';

export const toCCDRespondentLiPResponse = (claim: Claim): CCDRespondentLiPResponse => {
  return {
    partialAdmissionAlreadyPaid: toUpperYesOrNo(claim.partialAdmission?.alreadyPaid),
    timelineComment: claim.partialAdmission?.timeline?.comment,
    evidenceComment: claim.evidence?.comment,
  };
};
