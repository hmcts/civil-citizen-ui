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
import { addDaysToDate, formatDateToFullDate } from 'common/utils/dateUtils';
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
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {
        amount: currencyFormat(getAmount(claim)),
        claimantName: claimantFullName,
        installmentAmount: currencyFormat(getPaymentAmount(claim)),
        paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
        paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim), lng),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claimantFullName,
      installmentAmount: currencyFormat(getPaymentAmount(claim)),
      paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
      paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

function getPartAdmitPaidPayByDate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  if (!claim.isBusiness()) {
    return new LatestUpdateSectionBuilder()
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {
        amount: currencyFormat(getAmount(claim)),
        claimantName: claimantFullName,
        paymentDate: formatDateToFullDate(getPaymentDate(claim),lng),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claimantFullName,
      paymentDate: formatDateToFullDate(getPaymentDate(claim),lng),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

function getPartAdmitPaidPayImmediately(claim: Claim) {
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_IMMEDIATELY`, {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claim.getClaimantFullName(),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.SEALED_CLAIM)
    .build();
}

function getFullAdmitPayInstallments(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  if (!claim.isBusiness()) {
    return new LatestUpdateSectionBuilder()
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_STARTING`, {
        claimantName: claimantFullName,
        installmentAmount: currencyFormat(getPaymentAmount(claim)),
        paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
        paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_STARTING`, {
      claimantName: claimantFullName,
      installmentAmount:  currencyFormat(getPaymentAmount(claim)),
      paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
      paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

function getFullAdmitPayByDate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  if (!claim.isBusiness()) {
    return new LatestUpdateSectionBuilder()
      .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_BY`, {
        claimantName: claimantFullName,
        paymentDate:  formatDateToFullDate(getPaymentDate(claim),lng),
      })
      .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
      .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_BY`, {
      claimantName: claimantFullName,
      paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, claimId, {claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

function getFullAdmitPayImmediately(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_SAID_YOU_WILL_PAY`, {
      claimantName: claimantFullName,
      amount: currencyFormat(getAmount(claim)),
      paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.IF_YOU_PAY_BY_CHEQUE`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.IF_THEY_DONT_RECEIVE_THE_MONEY_BY_THEN`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT`, claimId, {claimantName: claimantFullName})
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

function getPartAdmitPaidPayImmediatelyAccepted(claim: Claim, lng: string) {
  const claimId = claim.id;
  const claimantFullName = claim.getClaimantFullName();
  const immediatePaymentDate = addDaysToDate(claim?.respondent1ResponseDate, 5);
  const immediatePaymentDeadline = formatDateToFullDate(immediatePaymentDate, lng);
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIMANT_ACCEPTED_PART_ADMIT_PAYMENT`, {
      amount: currencyFormat(getAmount(claim)),
      claimantName: claimantFullName,
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_MUST_PAY_THEM_BY_PAYMENT_DATE`, { paymentDate: immediatePaymentDeadline })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.IF_MONEY_NOT_RECEIVED_COUNTY_COURT_JUDGEMENT_AGAINST_YOU`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT`, claimId, { claimantName: claimantFullName }, `${PAGES_LATEST_UPDATE_CONTENT}.IF_YOU_NEED_THEIR_PAYMENT_DETAILS_GET_RECEIPTS_FOR_ANY_PAYMENTS`)
    .build();
}

function getPartAdmitAlreadyPaidSettled(claim: Claim, lng: string) {
  const claimId = claim.id;
  const claimantFullName = claim.getClaimantFullName();
  const amount = claim?.partAdmitPaidValuePounds;
  const moneyReceivedOn = claim?.respondent1PaymentDateToStringSpec && formatDateToFullDate(claim?.respondent1PaymentDateToStringSpec, lng);
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIM_SETTLED`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIMANT_CONFIRMED_YOU_PAID`, { claimantName: claimantFullName, amount, moneyReceivedOn })
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

function getPartAdmitAlreadyPaidNotSettled(claim: Claim) {
  const claimId = claim.id;
  const partAmount = claim.partAdmitPaidValuePounds;
  const fullAmount = claim.totalClaimAmount;
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.WAIT_FOR_THE_COURT_TO_REVIEW_THE_CASE`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.THEY_ACCEPT_THAT_YOU_HAVE_PAID_THEM`, { partAmount, fullAmount })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_MIGHT_HAVE_TO_GO_TO_A_COURT_HEARING`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

function getPartAdmitAlreadyPaidNotAccepted(claim: Claim) {
  const partAmount = claim.partAdmitPaidValuePounds;
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.WAIT_FOR_THE_COURT_TO_REVIEW_THE_CASE`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.THEY_SAID_YOU_DIDN'T_PAY_THEM`, { partAmount })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_MIGHT_HAVE_TO_GO_TO_A_COURT_HEARING`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

function generateLastUpdateResponseSections(claimResponseStatus: ClaimResponseStatus, claim: Claim, lng: string) {
  const claimResponsesStatus = {
    [ClaimResponseStatus.FA_PAY_IMMEDIATELY]: getFullAdmitPayImmediately(claim, lng),
    [ClaimResponseStatus.FA_PAY_BY_DATE]: getFullAdmitPayByDate(claim, lng),
    [ClaimResponseStatus.FA_PAY_INSTALLMENTS]: getFullAdmitPayInstallments(claim, lng),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY]: getPartAdmitPaidPayImmediately(claim),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE]: getPartAdmitPaidPayByDate(claim, lng),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS]: getPartAdmitPayInstallmentItems(claim, lng),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY_ACCEPTED]: getPartAdmitPaidPayImmediatelyAccepted(claim, lng),
    [ClaimResponseStatus.PA_ALREADY_PAID_ACCEPTED_SETTLED]: getPartAdmitAlreadyPaidSettled(claim, lng),
    [ClaimResponseStatus.PA_ALREADY_PAID_ACCEPTED_NOT_SETTLED]: getPartAdmitAlreadyPaidNotSettled(claim),
    [ClaimResponseStatus.PA_ALREADY_PAID_NOT_ACCEPTED]: getPartAdmitAlreadyPaidNotAccepted(claim),
  };
  return claimResponsesStatus[claimResponseStatus as keyof typeof claimResponsesStatus];
}

const getLastUpdateSdoDocument = (claimId: string) => {
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_AN_ORDER_HAS_BEEN_ISSUED_BY_THE_COURT`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_PLEASE_FOLLOW_THE_INSTRUCTIONS_IN_THE_ORDER`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_THIS_CLAIM_WILL_NO_PROCEED_OFFLINE`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_DOWNLOAD_THE_COURTS_ORDER`, claimId,  DocumentUri.SDO_ORDER, null,`${PAGES_LATEST_UPDATE_CONTENT}.SDO_TO_FIND_OUT_THE_DETAILS`)
    .build();
};

const getLastUpdateForClaimDismissed = (claim: Claim) => {
  const claimantName = claim.getClaimantFullName();
  const deadline = formatDateToFullDate(claim.applicant1ResponseDeadline);
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.THE_COURT_ENDED_THE_CLAIM`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.DID_N'T_PROCEED_WITH_IT_BEFORE_THE_DEADLINE`, { claimantName, deadline })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.IF_THEY_WANT_TO_RESTART_THE_CLAIM_THEY_NEED_TO_ASK_FOR_PERMISSION_FROM_THE_COURT`)
    .build();
};

const getLastUpdateForClaimMediation = (claim: Claim) => {
  const claimantName = claim.getClaimantFullName();
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.REJECTED_YOUR_RESPONSE`, { claimantName })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_BOTH_AGREED_TO_TRY_MEDIATION`)
    .addLink(`${PAGES_LATEST_UPDATE_CONTENT}.MORE_INFO_ABOUT_MEDIATION_WORKS`, 'https://www.gov.uk/guidance/small-claims-mediation-service', '', '', '', true)
    .build();
};

const getLastUpdateForNoMediation = (claim: Claim) => {
  const claimantName = claim.getClaimantFullName();
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.WAIT_FOR_THE_COURT_TO_REVIEW_THE_CASE`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.REJECTED_YOUR_RESPONSE`, { claimantName })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.NO_TO_TRYING_MEDIATION`, { claimantName })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.THE_COURT_WILL_REVIEW_THE_CASE`)
    .build();
};

export const buildResponseToClaimSection = (claim: Claim, claimId: string, lang: string): ClaimSummarySection[] => {
  const sectionContent = [];
  const lng = getLng(lang);

  const responseNotSubmittedTitle = getResponseNotSubmittedTitle(claim.isDeadlineExtended(), lng);
  const responseDeadlineNotPassedContent = getNotPastResponseDeadlineContent(claim, lng);
  const responseDeadlinePassedContent = getPastResponseDeadlineContent(claim, lng);
  const respondToClaimLink = getRespondToClaimLink(claimId, lng);
  const responseStatus = claim.responseStatus;

  if (claim.isDefendantNotResponded()) {
    sectionContent.push(responseNotSubmittedTitle);
    if (claim.isDeadLinePassed()) {
      sectionContent.push(responseDeadlinePassedContent);
    } else {
      sectionContent.push(responseDeadlineNotPassedContent);
    }
    sectionContent.push(respondToClaimLink);
  } else if (claim.hasSdoOrderDocument()) {
    sectionContent.push(getLastUpdateSdoDocument(claimId));
  } else if (claim.hasApplicant1DeadlinePassed()) {
    sectionContent.push(getLastUpdateForClaimDismissed(claim));
  } else if (claim.hasClaimInMediation()) {
    sectionContent.push(getLastUpdateForClaimMediation(claim));
  } else if (![ClaimResponseStatus.PA_ALREADY_PAID_NOT_ACCEPTED, ClaimResponseStatus.PA_ALREADY_PAID_ACCEPTED_NOT_SETTLED].includes(responseStatus) && claim.hasClaimantNotAgreedToMediation() && !claim.hasSdoOrderDocument()) {
    sectionContent.push(getLastUpdateForNoMediation(claim));
  } else {
    sectionContent.push(generateLastUpdateResponseSections(responseStatus, claim, lng));
  }
  return sectionContent.flat();
};
