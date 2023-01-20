import {CCDClaim} from 'common/models/civilClaimResponse';
import {Claim} from 'common/models/claim';
import {toCCDParty} from '../response/convertToCCDParty';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

export const translateDraftClaimToCCD = (claim: Claim, applicantEmail: string): CCDClaim => {
  return {
    applicant1Represented: YesNoUpperCamelCase.NO,
    applicant1: toCCDParty(claim.applicant1, applicantEmail),
    respondent1: toCCDParty(claim.respondent1),
  };
};
