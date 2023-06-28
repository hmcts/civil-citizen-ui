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
import {t} from 'i18next';
import {DocumentUri} from 'models/document/documentType';

const PAGES_LATEST_UPDATE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT';

function getPartAdmitPayInstallmentItems(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  if (!claim.isBusiness()) {
    return new LatestUpdateSectionBuilder()
      .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
      .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {lng}), {
        amount: currencyFormat(getAmount(claim)),
        claimantName: claimantFullName,
        installmentAmount: currencyFormat(getPaymentAmount(claim)),
        paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
        paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim), lng),
      })
      .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {lng}), {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claimantFullName,
      installmentAmount: currencyFormat(getPaymentAmount(claim)),
      paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
      paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
    })
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`, {lng}))
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

function getPartAdmitPaidPayByDate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  if (!claim.isBusiness()) {
    return new LatestUpdateSectionBuilder()
      .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
      .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {lng}), {
        amount: currencyFormat(getAmount(claim)),
        claimantName: claimantFullName,
        paymentDate: formatDateToFullDate(getPaymentDate(claim),lng),
      })
      .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {lng}), {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claimantFullName,
      paymentDate: formatDateToFullDate(getPaymentDate(claim),lng),
    })
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`, {lng}))
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

function getPartAdmitPaidPayImmediately(claim: Claim, lng: string) {
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_IMMEDIATELY`, {lng}), {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claim.getClaimantFullName(),
    })
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, lng))
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.SEALED_CLAIM)
    .build();
}

function getFullAdmitPayInstallments(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  if (!claim.isBusiness()) {
    return new LatestUpdateSectionBuilder()
      .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
      .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_STARTING`, {lng}), {
        claimantName: claimantFullName,
        installmentAmount: currencyFormat(getPaymentAmount(claim)),
        paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
        paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
      })
      .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_STARTING`, {lng}), {
      claimantName: claimantFullName,
      installmentAmount:  currencyFormat(getPaymentAmount(claim)),
      paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
      paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
    })
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`, {lng}))
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

function getFullAdmitPayByDate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  if (!claim.isBusiness()) {
    return new LatestUpdateSectionBuilder()
      .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
      .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_BY`, {lng}), {
        claimantName: claimantFullName,
        paymentDate:  formatDateToFullDate(getPaymentDate(claim),lng),
      })
      .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_BY`, {lng}), {
      claimantName: claimantFullName,
      paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
    })
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`, {lng}))
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

function getFullAdmitPayImmediately(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_SAID_YOU_WILL_PAY`, {lng}), {
      claimantName: claimantFullName,
      amount: currencyFormat(getAmount(claim)),
      paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
    })
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.IF_YOU_PAY_BY_CHEQUE`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.IF_THEY_DONT_RECEIVE_THE_MONEY_BY_THEN`, {lng}))
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT`, claimId, {claimantName: claimantFullName})
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
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

const getLastUpdateSdoDocument = (claimId: string, lng: string) => {
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_AN_ORDER_HAS_BEEN_ISSUED_BY_THE_COURT`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_PLEASE_FOLLOW_THE_INSTRUCTIONS_IN_THE_ORDER`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_THIS_CLAIM_WILL_NO_PROCEED_OFFLINE`, {lng}))
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_DOWNLOAD_THE_COURTS_ORDER`, claimId,  DocumentUri.SDO_ORDER, null,`${PAGES_LATEST_UPDATE_CONTENT}.SDO_TO_FIND_OUT_THE_DETAILS`)
    .build();
};

export const buildResponseToClaimSection = (claim: Claim, claimId: string, lang: string): ClaimSummarySection[] => {
  const sectionContent = [];
  const lng = getLng(lang);

  const responseNotSubmittedTitle = getResponseNotSubmittedTitle(claim.isDeadlineExtended(), lng);
  const responseDeadlineNotPassedContent = getNotPastResponseDeadlineContent(claim, lng);
  const responseDeadlinePassedContent = getPastResponseDeadlineContent(claim, lng);
  const respondToClaimLink = getRespondToClaimLink(claimId, lng);
  if (claim.isDefendantNotResponded()) {
    sectionContent.push(responseNotSubmittedTitle);
    if (claim.isDeadLinePassed()) {
      sectionContent.push(responseDeadlinePassedContent);
    } else {
      sectionContent.push(responseDeadlineNotPassedContent);
    }
    sectionContent.push(respondToClaimLink);
  } else if (claim.hasSdoOrderDocument()) {
    sectionContent.push(getLastUpdateSdoDocument(claimId, lng));
  } else {
    sectionContent.push(generateLastUpdateResponseSections(claim.responseStatus, claim, lng));
  }
  return sectionContent.flat();
};
