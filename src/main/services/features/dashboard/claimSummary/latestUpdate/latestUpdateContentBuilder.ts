import {Claim} from 'models/claim';
import {
  ClaimSummarySection, ClaimSummaryType,
} from 'form/models/claimSummarySection';
import {
  getNotPastResponseDeadlineContent,
  getPastResponseDeadlineContent,
  getRespondToClaimLink,
  getResponseNotSubmittedTitle,
} from './latestUpdateContent/responseToClaimSection';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {BILINGUAL_LANGUAGE_PREFERENCE_URL} from 'routes/urls';
import {getPaymentDate} from 'common/utils/repaymentUtils';

const PAGES_LATEST_UPDATE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.';
export class LastUpdateSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];

  addTitle(title: string, variables?: any ) {
    const titleSection = ({
      type: ClaimSummaryType.TITLE,
      data: {
        text: title,
        variables: variables,
      },
    });
    this._claimSummarySections.push(titleSection);
    return this;
  }
  addSection(section: ClaimSummarySection){
    this._claimSummarySections.push(section);
    return this;
  }
  addParagraph(text: string, variables?: any){
    const paragraphSection = ({
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: text,
        variables: variables,
      },
    });
    this._claimSummarySections.push(paragraphSection);
    return this;
  }

  addLink(text: string, claimId: string, variables?: any, textAfter?: string){
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        variables: variables,
        href: BILINGUAL_LANGUAGE_PREFERENCE_URL.replace(':id', claimId),
        textAfter: textAfter,
      },
    });
    this._claimSummarySections.push(linkSection);
    return this;
  }
  build() {
    return this._claimSummarySections;
  }
}

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
      return new LastUpdateSectionBuilder()
        .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_SAID_YOU_WILL_PAY`, {claimantName: claim.getClaimantFullName(), amount: claim.totalClaimAmount, paymentDate:  getPaymentDate(claim) })
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}IF_YOU_PAY_BY_CHEQUE`)
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}IF_THEY_DONT_RECEIVE_THE_MONEY_BY_THEN`)
        .addLink(`${PAGES_LATEST_UPDATE_CONTENT}CONTACT`, claim.id, {claimantName: claim.getClaimantFullName()})
        .addLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
        .build();

    },
    [ClaimResponseStatus.FA_PAY_BY_DATE] : (claim: Claim ) : ClaimSummarySection[] => {
      if (!claim.isBusiness()){
        return new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY`, {claimantName: claim.getClaimantFullName(), paymentDate:  getPaymentDate(claim) })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();
      }
      return new LastUpdateSectionBuilder()
        .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY`, {claimantName: claim.getClaimantFullName(), paymentDate:  getPaymentDate(claim) })
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
        .addLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
        .addLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
        .build();

    },
    [ClaimResponseStatus.FA_PAY_INSTALLMENTS] : (claim: Claim ) : ClaimSummarySection[] => {
      if (!claim.isBusiness()){
        return new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY_STARRING`, {claimantName: claim.getClaimantFullName(), installmentAmount: claim.totalClaimAmount, paymentSchedule: 'paymentSchedule ' ,paymentDate:  getPaymentDate(claim) })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();
      }
      return new LastUpdateSectionBuilder()
        .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY_STARRING`, {claimantName: claim.getClaimantFullName(), installmentAmount: claim.totalClaimAmount, paymentSchedule: 'paymentSchedule ' ,paymentDate:  getPaymentDate(claim) })
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
        .addLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
        .addLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
        .build();
    },
    [ClaimResponseStatus.PA_PAID_PAY_IMMEDIATELY] : (claim: Claim ) : ClaimSummarySection[] => {
      if (!claim.isBusiness()){
        return new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_IMMEDIATELY`, {amount: claim.totalClaimAmount, claimantName: claim.getClaimantFullName()})
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();
      }
    },
    [ClaimResponseStatus.PA_PAID_PAY_BY_DATE] : (claim: Claim ) : ClaimSummarySection[] => {
      if (!claim.isBusiness()){
        return new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {amount: claim.totalClaimAmount, claimantName: claim.getClaimantFullName(), paymentDate: getPaymentDate(claim)})
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();
      }
      return new LastUpdateSectionBuilder()
        .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {amount: claim.totalClaimAmount, claimantName: claim.getClaimantFullName(), paymentDate: getPaymentDate(claim)})
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
        .addLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
        .addLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
        .build();
    },
    [ClaimResponseStatus.PA_PAID_PAY_INSTALLMENTS] : (claim: Claim ) : ClaimSummarySection[] => {
      if (!claim.isBusiness()){
        return new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARING`, {amount: claim.totalClaimAmount, claimantName: claim.getClaimantFullName(), installmentAmount: 'installmentAmount', paymentSchedule: 'paymentSchedule', paymentDate: getPaymentDate(claim)})
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();
      }
      return new LastUpdateSectionBuilder()
        .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARING`, {amount: claim.totalClaimAmount, claimantName: claim.getClaimantFullName(), installmentAmount: 'installmentAmount', paymentSchedule: 'paymentSchedule', paymentDate: getPaymentDate(claim)})
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
        .addLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
        .addLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
        .build();
    },
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
