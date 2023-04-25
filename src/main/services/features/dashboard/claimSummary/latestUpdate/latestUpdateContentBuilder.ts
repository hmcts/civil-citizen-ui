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
import {
  getAmount,
  getFirstRepaymentDate,
  getPaymentAmount,
  getPaymentDate,
  getRepaymentFrequency,
} from 'common/utils/repaymentUtils';
import {DocumentUri} from 'models/document/documentType';
import {CASE_DOCUMENT_DOWNLOAD_URL, CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getLanguage} from 'modules/i18n/languageService';
import currencyFormat from 'common/utils/currencyFormat';

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

function getPartAdmitPayInstallmentItems(claim: Claim) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  const commonLastUpdateSection = new LastUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claimantFullName,
      installmentAmount: currencyFormat(getPaymentAmount(claim)),
      paymentSchedule: getRepaymentFrequency(claim),
      paymentDate: formatDateToFullDate(getPaymentDate(claim), getLanguage()),
    })
  if (!claim.isBusiness()) {
    return commonLastUpdateSection
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
      .build();
  }
  return commonLastUpdateSection
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
    .build();
}

function getPartAdmitPaidPayByDate(claim: Claim) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  const commonLastUpdateSection = new LastUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claimantFullName,
      paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),getLanguage()),
    })

  if (!claim.isBusiness()) {
    return commonLastUpdateSection
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
      .build();
  }
  return commonLastUpdateSection
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
    .build();
}

function getPartAdmitPaidPayImmediately(claim: Claim) {
  return new LastUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_IMMEDIATELY`, {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claim.getClaimantFullName(),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
    .build();
}

function getFullAdmitPayInstallments(claim: Claim) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  const commonLastUpdateSection = new LastUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY_STARTING`, {
      claimantName: claimantFullName,
      installmentAmount: currencyFormat(getPaymentAmount(claim)),
      paymentSchedule: getRepaymentFrequency(claim),
      paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),getLanguage()),
    });
  
  if (!claim.isBusiness()) {
    return commonLastUpdateSection
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
      .build();
  }
  return commonLastUpdateSection
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
    .build();
}

function getFullAdmitPayByDate(claim: Claim) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  const commonLastUpdateSection = new LastUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY`, {
      claimantName: claimantFullName,
      paymentDate: formatDateToFullDate(getPaymentDate(claim), getLanguage()),
    });

  if (!claim.isBusiness()) {
    return commonLastUpdateSection
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
      .build();
  }
  return commonLastUpdateSection
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
    .build();
}

function getFullAdmitPayImmediately(claim: Claim) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  return new LastUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_SAID_YOU_WILL_PAY`, {
      claimantName: claimantFullName,
      amount: currencyFormat(getAmount(claim)),
      paymentDate: formatDateToFullDate(getPaymentDate(claim), getLanguage()),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}IF_YOU_PAY_BY_CHEQUE`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}IF_THEY_DONT_RECEIVE_THE_MONEY_BY_THEN`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}CONTACT`, claimId, {claimantName: claimantFullName})
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
    .build();
}

function generateLastUpdateResponseSections(claimResponseStatus: ClaimResponseStatus, claim: Claim) {
  const claimResponsesStatus = {
    [ClaimResponseStatus.FA_PAY_IMMEDIATELY]: getFullAdmitPayImmediately(claim),
    [ClaimResponseStatus.FA_PAY_BY_DATE]: getFullAdmitPayByDate(claim),
    [ClaimResponseStatus.FA_PAY_INSTALLMENTS]: getFullAdmitPayInstallments(claim),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY]: getPartAdmitPaidPayImmediately(claim),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE]: getPartAdmitPaidPayByDate(claim),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS]: getPartAdmitPayInstallmentItems(claim),
  };
  return claimResponsesStatus[claimResponseStatus as keyof typeof claimResponsesStatus];
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
    sectionContent.push(generateLastUpdateResponseSections(claim.responseStatus, claim));

  }
  return sectionContent.flat();
};
