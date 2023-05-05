import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
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
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getLng} from 'common/utils/languageToggleUtils';
import currencyFormat from 'common/utils/currencyFormat';
import {LatestUpdateSectionBuilder} from 'common/models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';

const PAGES_LATEST_UPDATE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.';

function getPartAdmitPayInstallmentItems(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  if (!claim.isBusiness()) {
    return new LatestUpdateSectionBuilder()
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {
        amount: currencyFormat(getAmount(claim)),
        claimantName: claimantFullName,
        installmentAmount: currencyFormat(getPaymentAmount(claim)),
        paymentSchedule: getRepaymentFrequency(claim),
        paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claimantFullName,
      installmentAmount: currencyFormat(getPaymentAmount(claim)),
      paymentSchedule: getRepaymentFrequency(claim),
      paymentDate: formatDateToFullDate(getPaymentDate(claim),lng),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
    .build();
}

function getPartAdmitPaidPayByDate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  if (!claim.isBusiness()) {
    return new LatestUpdateSectionBuilder()
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {
        amount: currencyFormat(getAmount(claim)),
        claimantName: claimantFullName,
        paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claimantFullName,
      paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
    .build();
}

function getPartAdmitPaidPayImmediately(claim: Claim, lng: string) {
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_IMMEDIATELY`, {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claim.getClaimantFullName(),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
    .build();
}

function getFullAdmitPayInstallments(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  if (!claim.isBusiness()) {
    return new LatestUpdateSectionBuilder()
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY_STARTING`, {
        claimantName: claimantFullName,
        installmentAmount: currencyFormat(getPaymentAmount(claim)),
        paymentSchedule: getRepaymentFrequency(claim),
        paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY_STARTING`, {
      claimantName: claimantFullName,
      installmentAmount:  currencyFormat(getPaymentAmount(claim)),
      paymentSchedule: getRepaymentFrequency(claim),
      paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
    .build();
}

function getFullAdmitPayByDate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  if (!claim.isBusiness()) {
    return new LatestUpdateSectionBuilder()
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY_BY`, {
        claimantName: claimantFullName,
        paymentDate:  formatDateToFullDate(getPaymentDate(claim),lng),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY_BY`, {
      claimantName: claimantFullName,
      paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
    .build();
}

function getFullAdmitPayImmediately(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_SAID_YOU_WILL_PAY`, {
      claimantName: claimantFullName,
      amount: currencyFormat(getAmount(claim)),
      paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}IF_YOU_PAY_BY_CHEQUE`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}IF_THEY_DONT_RECEIVE_THE_MONEY_BY_THEN`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}CONTACT`, claimId, {claimantName: claimantFullName})
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claimId)
    .build();
}

function generateLastUpdateResponseSections(claimResponseStatus: ClaimResponseStatus, claim: Claim, lng: string) {
  const claimResponsesStatus = {
    [ClaimResponseStatus.FA_PAY_IMMEDIATELY]: getFullAdmitPayImmediately(claim, lng),
    [ClaimResponseStatus.FA_PAY_BY_DATE]: getFullAdmitPayByDate(claim, lng),
    [ClaimResponseStatus.FA_PAY_INSTALLMENTS]: getFullAdmitPayInstallments(claim, lng),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY]: getPartAdmitPaidPayImmediately(claim, lng),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE]: getPartAdmitPaidPayByDate(claim, lng),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS]: getPartAdmitPayInstallmentItems(claim, lng),
  };
  return claimResponsesStatus[claimResponseStatus as keyof typeof claimResponsesStatus];
}

export const buildResponseToClaimSection = (claim: Claim, claimId: string, lang: string): ClaimSummarySection[] => {
  const sectionContent = [];
  const lng = getLng(lang);

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
    sectionContent.push(generateLastUpdateResponseSections(claim.responseStatus, claim, lng));

  }
  return sectionContent.flat();
};
