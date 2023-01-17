import {CCDClaim} from 'common/models/civilClaimResponse';
import {Claim} from 'common/models/claim';
import {toCCDParty} from '../response/convertToCCDParty';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';

export const translateDraftClaimToCCD = (claim: Claim, req: AppRequest): CCDClaim => {
  return {
    applicant1Represented: YesNoUpperCamelCase.NO,
    applicant1: toCCDParty(claim.applicant1, req, true),
    respondent1: toCCDParty(claim.respondent1, req, false),

  };
};
