import {Claim} from 'models/claim';
import {CCDClaim} from 'models/civilClaimResponse';
import {toCUIClaimDetails} from 'services/translation/convertToCUI/convertToCUIClaimDetails';
import {toCUIEvidence} from 'services/translation/convertToCUI/convertToCUIEvidence';
import {toCUIParty, toCUIPartyRespondent} from 'services/translation/convertToCUI/convertToCUIParty';
import {toCUIMediation} from 'services/translation/convertToCUI/convertToCUIMediation';
import {YesNo} from 'form/models/yesNo';
import {toCUIAddress} from 'services/translation/convertToCUI/convertToCUIAddress';
import {PartyDetails} from 'form/models/partyDetails';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {toCUIStatementOfMeans} from 'services/translation/convertToCUI/convertToCUIStatementOfMeans';

export const translateCCDCaseDataToCUIModel = (ccdClaim: CCDClaim): Claim => {
  const claim: Claim = Object.assign(new Claim(), ccdClaim);
  claim.claimDetails = toCUIClaimDetails(ccdClaim);
  claim.evidence = toCUIEvidence(ccdClaim?.speclistYourEvidenceList);
  claim.applicant1 = toCUIParty(ccdClaim?.applicant1);
  claim.respondent1 = toCUIPartyRespondent(ccdClaim?.respondent1,ccdClaim?.respondent1LiPResponse);
  claim.mediation = toCUIMediation(ccdClaim?.respondent1LiPResponse?.respondent1MediationLiPResponse);
  claim.statementOfMeans = toCUIStatementOfMeans(ccdClaim);
  return claim;
};

export const convertExtraPartyDetailsFieldsForRespondent1 = (partyDetails: PartyDetails, ccdRespondent1: CCDRespondentLiPResponse) => {
  partyDetails.correspondenceAddress = toCUIAddress(ccdRespondent1?.respondent1LiPCorrespondenceAddress);
  partyDetails.provideCorrespondenceAddress = partyDetails.correspondenceAddress ? YesNo.YES : YesNo.NO;
  partyDetails.postToThisAddress = partyDetails.correspondenceAddress ? YesNo.YES : YesNo.NO;
  partyDetails.contactPerson = ccdRespondent1?.respondent1LiPContactPerson;
};
