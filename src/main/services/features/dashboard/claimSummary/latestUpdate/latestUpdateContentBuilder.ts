import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummarySectionBuilder, ClaimSummaryType, Variables} from 'form/models/claimSummarySection';
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

function getItems (claimResponseStatus: ClaimResponseStatus, claim: Claim) {
  const claimResponsesStatus = {
    [ClaimResponseStatus.FA_PAY_IMMEDIATELY] : (claim: Claim ) : ClaimSummarySection[] => {

      const sections: SectionInformation[] = [
        {
          text: 'PAGES.LATEST_UPDATE_CONTENT.YOU_SAID_YOU_WILL_PAY',
          variables: [
            {name: 'amount', value: 'claimantName'},
            {name: 'claimantName', value: 'claimantName'},
            {name: 'paymentDate', value: 'paymentDate'},
          ],
        },
        {
          text: 'PAGES.LATEST_UPDATE_CONTENT.IF_YOU_PAY_BY_CHEQUE',
        },
        {
          text: 'PAGES.LATEST_UPDATE_CONTENT.IF_THEY_DONT_RECEIVE_THE_MONEY_BY_THEN',
          variables: [
            {name: 'amount', value: 'claimantName'},
            {name: 'claimantName', value: 'claimantName'},
            {name: 'paymentDate', value: 'paymentDate'},
          ],
        },
      ];
      return generateUpdateSections('PAGES.LATEST_UPDATE_CONTENT.YOUR_RESPONSE_TO_THE_CLAIM',sections, claim);
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
interface SectionInformation{
  text: string;
  variables?: Variables[]
}

const generateUpdateSections = (titleText: string, sectionInformation?: SectionInformation[], claim?: Claim ): ClaimSummarySection[] => {
  const claimSummarySections: ClaimSummarySection[] = [];
  claimSummarySections.push(new ClaimSummarySectionBuilder(ClaimSummaryType.TITLE, titleText, claim.id).getClaimSummarySection());
  sectionInformation.forEach((item) => {
    claimSummarySections.push(new ClaimSummarySectionBuilder(ClaimSummaryType.PARAGRAPH, item.text, claim.id, item.variables).getClaimSummarySection());
  });
  claimSummarySections.push(new ClaimSummarySectionBuilder(ClaimSummaryType.PARAGRAPH, 'test', claim.id).getClaimSummarySection());

  return claimSummarySections;
};
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
  const v = getItems(ClaimResponseStatus.FA_PAY_IMMEDIATELY, claim);
  sectionContent.push(v);
  console.log(v);
  return sectionContent.flat();
};
