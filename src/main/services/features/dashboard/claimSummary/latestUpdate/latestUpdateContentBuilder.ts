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
import {getPaymentDate} from 'common/utils/repaymentUtils';
import {DocumentUri} from 'models/document/documentType';
import {CASE_DOCUMENT_DOWNLOAD_URL, CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {formatDateToFullDate} from "common/utils/dateUtils";
import {getLng} from "common/utils/languageToggleUtils";

const PAGES_LATEST_UPDATE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.';

export class LastUpdateSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];

  addTitle(title: string, variables?: any) {
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

  addSection(section: ClaimSummarySection) {
    this._claimSummarySections.push(section);
    return this;
  }

  addParagraph(text: string, variables?: any) {
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

  addContactLink(text: string, claimId: string, variables?: any, textAfter?: string) {
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        variables: variables,
        href: CITIZEN_CONTACT_THEM_URL.replace(':id', claimId),
        textAfter: textAfter,
      },
    });

    this._claimSummarySections.push(linkSection);
    return this;
  }
  addResponseDocumentLink(text: string, claimId: string, variables?: any, textAfter?: string) {
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        variables: variables,
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentType', DocumentUri.SEALED_CLAIM),
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

function getPaPaidPayInstallmentItems(claim: Claim) {
  if (!claim.isBusiness()) {
    return new LastUpdateSectionBuilder()
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARING`, {
        amount: claim.totalClaimAmount,
        claimantName: claim.getClaimantFullName(),
        installmentAmount: 'installmentAmount',
        paymentSchedule: 'paymentSchedule',
        paymentDate: getPaymentDate(claim),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
      .build();
  }
  return new LastUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARING`, {
      amount: claim.totalClaimAmount,
      claimantName: claim.getClaimantFullName(),
      installmentAmount: 'installmentAmount',
      paymentSchedule: 'paymentSchedule',
      paymentDate: getPaymentDate(claim),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
    .build();
}

function getPaPaidPayByDate(claim: Claim) {
  if (!claim.isBusiness()) {
    return new LastUpdateSectionBuilder()
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {
        amount: claim.totalClaimAmount,
        claimantName: claim.getClaimantFullName(),
        paymentDate: getPaymentDate(claim),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
      .build();
  }
  return new LastUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {
      amount: claim.totalClaimAmount,
      claimantName: claim.getClaimantFullName(),
      paymentDate: getPaymentDate(claim),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
    .build();
}

function getPaPaidPayImmediately(claim: Claim) {
  if (!claim.isBusiness()) {
    return new LastUpdateSectionBuilder()
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_IMMEDIATELY`, {
        amount: claim.totalClaimAmount,
        claimantName: claim.getClaimantFullName(),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
      .build();
  }
}

function getFaPayInstallments(claim: Claim) {
  if (!claim.isBusiness()) {
    return new LastUpdateSectionBuilder()
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY_STARRING`, {
        claimantName: claim.getClaimantFullName(),
        installmentAmount: claim.totalClaimAmount,
        paymentSchedule: 'paymentSchedule',
        paymentDate: getPaymentDate(claim),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
      .build();
  }
  return new LastUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY_STARRING`, {
      claimantName: claim.getClaimantFullName(),
      installmentAmount: claim.totalClaimAmount,
      paymentSchedule: 'paymentSchedule ',
      paymentDate: getPaymentDate(claim),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
    .build();
}

function getFaPayByDate(claim: Claim) {
  if (!claim.isBusiness()) {
    return new LastUpdateSectionBuilder()
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY`, {
        claimantName: claim.getClaimantFullName(),
        paymentDate: getPaymentDate(claim),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
      .build();
  }
  return new LastUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY`, {
      claimantName: claim.getClaimantFullName(),
      paymentDate: getPaymentDate(claim),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
    .build();
}

function getFaPayImmediately(claim: Claim) {
  return new LastUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_SAID_YOU_WILL_PAY`, {
      claimantName: claim.getClaimantFullName(),
      amount: claim.formattedTotalClaimAmount(),
      paymentDate: formatDateToFullDate(new Date(getPaymentDate(claim)), getLng('en')),
      //paymentDate: formatDateToFullDate(getPaymentDate(claim)),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}IF_YOU_PAY_BY_CHEQUE`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}IF_THEY_DONT_RECEIVE_THE_MONEY_BY_THEN`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}CONTACT`, claim.id, {claimantName: claim.getClaimantFullName()})
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
    .build();
}

function generateLastUpdateResponseSections(claimResponseStatus: ClaimResponseStatus, claim: Claim) {
  const claimResponsesStatus = {
    [ClaimResponseStatus.FA_PAY_IMMEDIATELY]: (claim: Claim): ClaimSummarySection[] => {
      return getFaPayImmediately(claim);
    },
    [ClaimResponseStatus.FA_PAY_BY_DATE]: (claim: Claim): ClaimSummarySection[] => {
      return getFaPayByDate(claim);
    },
    [ClaimResponseStatus.FA_PAY_INSTALLMENTS]: (claim: Claim): ClaimSummarySection[] => {
      return getFaPayInstallments(claim);
    },
    [ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY]: (claim: Claim): ClaimSummarySection[] => {
      return getPaPaidPayImmediately(claim);
    },
    [ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE]: (claim: Claim): ClaimSummarySection[] => {
      return getPaPaidPayByDate(claim);
    },
    [ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS]: (claim: Claim): ClaimSummarySection[] => {
      return getPaPaidPayInstallmentItems(claim);
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
  } else {
    sectionContent.push(generateLastUpdateResponseSections(ClaimResponseStatus.FA_PAY_IMMEDIATELY, claim));

  }
  return sectionContent.flat();
};
