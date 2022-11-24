import {CCDClaim} from 'common/models/civilClaimResponse';
import {Claim} from 'common/models/claim';
import {toCCDParty} from '../response/convertToCCDParty';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

export const translateDraftClaimToCCD = (claim: Claim): CCDClaim => {
  return {
    applicant1Represented: YesNoUpperCamelCase.NO,
    applicant1: toCCDParty(claim.applicant1),
    respondent1: toCCDParty(claim.respondent1),
  };
};
