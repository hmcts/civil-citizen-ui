import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {Claim} from 'models/claim';
import {toUpperCaseGenericYesNo} from 'form/models/yesNo';
import {toCCDMediation} from 'services/translation/response/convertToCCDMediation';
import {toCCDDQExtraDetails} from 'services/translation/response/convertToCCDDQExtraDetials';
import {toCCDSHearingSupport} from 'services/translation/response/convertToCCDHearingSupport';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {toCCDAddress} from 'services/translation/response/convertToCCDAddress';
import {YesNo} from 'form/models/yesNo';

export const toCCDRespondentLiPResponse = (claim: Claim): CCDRespondentLiPResponse => {
  return {
    timelineComment: claim.partialAdmission?.timeline?.comment,
    evidenceComment: claim.evidence?.comment,
    respondent1LiPFinancialDetails : toCCDResponseLiPFinancialDetails(claim.statementOfMeans),
    respondent1MediationLiPResponse: toCCDMediation(claim.mediation),
    respondent1DQExtraDetails: toCCDDQExtraDetails(claim.directionQuestionnaire),
    respondent1DQHearingSupportLip: toCCDSHearingSupport(claim.directionQuestionnaire?.hearing?.supportRequiredList),
    respondent1LiPContactPerson: claim.respondent1?.partyDetails?.contactPerson,
    respondent1LiPCorrespondenceAddress: (claim.respondent1?.partyDetails?.provideCorrespondenceAddress === YesNo.YES || claim.respondent1?.partyDetails?.postToThisAddress === YesNo.YES) ? toCCDAddress(claim.respondent1?.partyDetails?.correspondenceAddress) : undefined,
  };
};
