import {Claim} from '../../../common/models/claim';
import {toCCDParty} from '../response/convertToCCDParty';

export const translateDraftClaimToCCD = (claim: Claim) => {
  return {
    applicant1: toCCDParty(claim.applicant1),
    respondent1: toCCDParty(claim.respondent1),
  };
};
