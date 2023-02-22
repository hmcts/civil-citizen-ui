import {Claim} from 'models/claim';
import {
  ClaimSummarySection,
  LastUpdateSectionBuilder,
} from 'form/models/claimSummarySection';
import {
  getNotPastResponseDeadlineContent,
  getPastResponseDeadlineContent,
  getRespondToClaimLink,
  getResponseNotSubmittedTitle,
} from './latestUpdateContent/responseToClaimSection';
import {ClaimResponseStatus} from 'models/claimResponseStatus';

/*
//SCENARIO 1 - Full Admit Pay Immediately
const isFullAdmitPayImmediately = (claim : Claim) => {
  return claim.isFAPaymentOptionPayImmediately();
};

//SCENARIO 2 - Full Admit Pay Set Date + Defendant ISNOT Company or ORG
const isFullAdmitPayByDateAndNotCompanyOrOrganization = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.FA_PAY_BY_DATE &&
    !isBusiness(claim);
};

//SCENARIO 3 - Full Admit Pay Set Date + Defendant IS Company or ORG **
const isFullAdmitPayByDateAndIsCompanyOrOrganization = (claim : Claim) => {
  return  claim.responseStatus === ClaimResponseStatus.FA_PAY_BY_DATE &&
    isCompanyOrOrganization(claim);
};
//SCENARIO 4 - Full Admit Pay Instalments + Defendant IS NOT Company or ORG **
const isFullAdmitPayInstalmentsAndDefendantIsCompanyOrOrganization = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.FA_PAY_INSTALLMENTS &&
    !isCompanyOrOrganization(claim);
};
//SCENARIO 5 - Full Admit Pay Instalments+ Defendant IS Company or ORG **
const isFullAdmitPayInstalmentsAndDefendantIsCompanyOrOrganization = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.FA_PAY_INSTALLMENTS &&
    isCompanyOrOrganization(claim);
};
//SCENARIO 6 - Part Admit Pay Immediately
const isPartAdmitPayImmediately = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY;
};
//SCENARIO 7 -Part Admit Pay SET DATE - Defendant IS Org or Company{}
const isPartAdmitPaySetDatedDefendantIsOrgOrCompany = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY &&
    !isCompanyOrOrganization(claim);
};
//SCENARIO 8 - Pay SET DATE - Defendant IS NOT Org or Company
const isPartAdmitPaySetDatedDefendantIsNotOrgOrCompany = (claim : Claim) => {
  return claim.responseStatus !== ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE &&
    !isCompanyOrOrganization(claim);
};
//SCENARIO 9 Part Admit Pay Instalments - Defendant IS Org or Company
//Todo Review this part
const isPartAdmitPayInstalmentsDefendantIsOrgOrCompany = (claim : Claim) => {
  return claim.responseStatus !== ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS &&
    (claim.respondent1.type === PartyType.COMPANY || claim.respondent1.type === PartyType.ORGANISATION);
};
//SCENARIO 10 Part Admit Pay Instalments - Defendant IS NOT Org or Company
//Todo Review this part
const isPartAdmitPayInstalmentsDefendantIsNotOrgOrCompany = (claim : Claim) => {
  return claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS &&
    (claim.respondent1.type === PartyType.COMPANY || claim.respondent1.type === PartyType.ORGANISATION);
};
*/

function generateLastUpdateResponse (claimResponseStatus: ClaimResponseStatus, claim: Claim) {
  const claimResponsesStatus = {
    [ClaimResponseStatus.FA_PAY_IMMEDIATELY] : (claim: Claim ) : ClaimSummarySection[] => {
      const title = getResponseNotSubmittedTitle(claim.isDeadlineExtended());
      const sections = getPastResponseDeadlineContent(claim);
      const lastUpdateSection = new LastUpdateSectionBuilder()
        .setTitle(title)
        .setSections(sections)
        .build();
      return lastUpdateSection;

    },
    /*[ClaimResponseStatus.FA_PAY_BY_DATE] : (claim: Claim ) : ClaimSummarySection[] => {
      return generateUpdateSections('PAGES.YOUR_RESPONSE_TO_THE_CLAIM', claim);
    },
    [ClaimResponseStatus.FA_PAY_INSTALLMENTS] : (claim: Claim ) : ClaimSummarySection[] => {
      return generateUpdateSections('PAGES.YOUR_RESPONSE_TO_THE_CLAIM', claim);
    },*/
  };
  return claimResponsesStatus[claimResponseStatus as keyof typeof claimResponsesStatus]?.(claim);
}
export const buildResponseToClaimSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  const sectionContent = [];

  const responseNotSubmittedTitle = getResponseNotSubmittedTitle(claim.isDeadlineExtended());
  const responseDeadlineNotPassedContent = getNotPastResponseDeadlineContent(claim);
  const responseDeadlinePassedContent = getPastResponseDeadlineContent(claim);
  const respondToClaimLink = getRespondToClaimLink(claimId);
  if (claim.isDefendantNotResponded()) {

    sectionContent.push(responseNotSubmittedTitle);
    if (claim.isDeadLinePassed()) {
      sectionContent.push(responseDeadlinePassedContent);
    } else {
      sectionContent.push(responseDeadlineNotPassedContent);
    }
    sectionContent.push(respondToClaimLink);
  }
  sectionContent.push(generateLastUpdateResponse(ClaimResponseStatus.FA_PAY_IMMEDIATELY, claim));
  return sectionContent.flat();
};
