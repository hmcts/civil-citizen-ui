import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {
  getNotPastResponseDeadlineContent,
  getPastResponseDeadlineContent,
  getRespondToClaimLink,
  getResponseNotSubmittedTitle,
} from './latestUpdateContent/responseToClaimSection';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {PartyType} from 'models/partyType';

//SCENARIO 1 - Full Admit Pay Immediately
const isFullAdmitPayImmediately = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.FA_PAY_IMMEDIATELY;
};

//SCENARIO 2 - Full Admit Pay Set Date + Defendant ISNOT Company or ORG
const isFullAdmitPayByDateAndNotCompanyOrOrganization = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.FA_PAY_BY_DATE &&
    (claim.respondent1.type === PartyType.COMPANY || claim.respondent1.type === PartyType.ORGANISATION);
};

//SCENARIO 3 - Full Admit Pay Set Date + Defendant IS Company or ORG **
const isFullAdmitPayByDateAndIsCompanyOrOrganization = (claim : Claim) => {
  return !isFullAdmitPayByDateAndNotCompanyOrOrganization(claim);
};
//SCENARIO 4 - Full Admit Pay Instalments + Defendant ISNOT Company or ORG **
const isFullAdmitPayInstalmentsAndDefendantIsCompanyOrOrganization = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.FA_PAY_INSTALLMENTS &&
    (claim.respondent1.type === PartyType.COMPANY || claim.respondent1.type === PartyType.ORGANISATION);
};
//SCENARIO 5 - Full Admit Pay Instalments+ Defendant IS Company or ORG **
const isFullAdmitPayInstalmentsAndDefendantIsCompanyOrOrganization = (claim : Claim) => {
  return !isFullAdmitPayInstalmentsAndDefendantIsCompanyOrOrganization(claim);
};

//SCENARIO 6 - Part Admit Pay Immediately
const isPartAdmitPayImmediately = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY;
};
//SCENARIO 7 -Part Admit Pay SET DATE - Defendant IS Org or Company{}
const isPartAdmitPaySetDatedDefendantIsOrgOrCompany = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY &&
    (claim.respondent1.type === PartyType.COMPANY || claim.respondent1.type === PartyType.ORGANISATION);
};
//SCENARIO 8 - Pay SET DATE - Defendant IS NOT Org or Company
const isPartAdmitPaySetDatedDefendantIsNotOrgOrCompany = (claim : Claim) => {
  return !isPartAdmitPaySetDatedDefendantIsOrgOrCompany;
};
//SCENARIO 9 Part Admit Pay Instalments - Defendant IS Org or Company
//Todo Review this part
const isPartAdmitPaySetDatedDefendantIsNotOrgOrCompany = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS &&
    (claim.respondent1.type === PartyType.COMPANY || claim.respondent1.type === PartyType.ORGANISATION);
};
//SCENARIO 10 Part Admit Pay Instalments - Defendant IS NOT Org or Company
//Todo Review this part
const isPartAdmitPaySetDatedDefendantIsNotOrgOrCompany = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS &&
    (claim.respondent1.type === PartyType.COMPANY || claim.respondent1.type === PartyType.ORGANISATION);
};

export const buildResponseToClaimSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  const sectionContent = [];
  const responseNotSubmittedTitle = getResponseNotSubmittedTitle(claim.isDeadlineExtended());
  const responseDeadlineNotPassedContent = getNotPastResponseDeadlineContent(claim);
  const responseDeadlinePassedContent = getPastResponseDeadlineContent(claim);
  const respondToClaimLink = getRespondToClaimLink(claimId);
  if (claim.isDefendantNotResponded()) {
    if (isFullAdmitPayImmediately(claim)){
      sectionContent.push(responseDeadlinePassedContent);
    }

    sectionContent.push(responseNotSubmittedTitle);
    if (claim.isDeadLinePassed()) {
      sectionContent.push(responseDeadlinePassedContent);
    } else {
      sectionContent.push(responseDeadlineNotPassedContent);
    }
    sectionContent.push(respondToClaimLink);
  }

  return sectionContent.flat();
};
