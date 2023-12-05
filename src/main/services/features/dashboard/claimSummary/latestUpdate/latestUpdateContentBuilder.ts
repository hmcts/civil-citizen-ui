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
import {DocumentType} from 'models/document/documentType';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import { documentIdExtractor } from 'common/utils/stringUtils';

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
      .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
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
    .addContactLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, {lng}), claimId, {claimantName: claimantFullName})
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
    .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
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
      .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
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
    .addContactLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, {lng}), claimId, {claimantName: claimantFullName})
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
    .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
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
    .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
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
      .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
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
    .addContactLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, {lng}), claimId, {claimantName: claimantFullName})
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
    .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
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
      .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
      .build();
  }
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_BY`, {lng}), {
      claimantName: claimantFullName,
      paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
    })
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`, {lng}))
    .addContactLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, {lng}), claimId, {claimantName: claimantFullName})
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
    .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
    .build();
}

function getFullAdmitPayImmediately(claim: Claim, lng: string, respondentPaymentDeadline?: Date) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_SAID_YOU_WILL_PAY`, {lng}), {
      claimantName: claimantFullName,
      amount: currencyFormat(getAmount(claim)),
      paymentDate: formatDateToFullDate(respondentPaymentDeadline, lng),
    })
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.IF_YOU_PAY_BY_CHEQUE`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.IF_THEY_DONT_RECEIVE_THE_MONEY_BY_THEN`, {lng}))
    .addContactLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT`, {lng}), claimId, {claimantName: claimantFullName})
    .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
    .build();
}

function getStatusPaid(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`,{lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_HAVE_EMAILED`, {lng}), {
      claimantName: claimantFullName,
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
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
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
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
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
    .build();
}

function getPartAdmitAlreadyPaidNotAccepted(claim: Claim) {
  const partAmount = claim.partAdmitPaidValuePounds;
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.WAIT_FOR_THE_COURT_TO_REVIEW_THE_CASE`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.THEY_SAID_YOU_DIDN'T_PAY_THEM`, { partAmount })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_MIGHT_HAVE_TO_GO_TO_A_COURT_HEARING`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
    .build();
}

function getPartAdmitNotPaidNotAccepted(claim: Claim) {
  const fullAmount = claim.totalClaimAmount;
  const partAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount;
  const claimantName = claim.getClaimantFullName();
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.REJECTED_YOUR_ADMISSION`, { claimantName, partAmount })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.THEY_BELIEVE_FULL_AMOUNT_CLAIMED`, { fullAmount })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_MIGHT_HAVE_TO_GO_TO_A_COURT_HEARING`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
    .build();
}

function getStatusFDClaimDispute(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  if (claim.isFastTrackClaim) {
    return new LatestUpdateSectionBuilder()
      .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
      .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_REJECTED_CLAIM_MSG4`, {lng}))
      .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WILL_CONTACT_WHEN_CLAIMANT_RESPONDS`, {lng}))
      .build();
  } else {
    if (claim.hasRespondent1NotAgreedMediation()) {
      return new LatestUpdateSectionBuilder()
        .addTitle(t('PAGES.DASHBOARD.STATUS_DEFENDANT.AWAITING_CLAIMANT_RESPONSE', {lng}))
        .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_REJECTED_CLAIM`, {lng}))
        .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.NO_MEDIATION_REQUIRED`, {lng}))
        .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WILL_CONTACT_WHEN_CLAIMANT_RESPONDS`, {lng}))
        .build();

    }
    if (claim.hasRespondent1AgreedMediation()) {
      return new LatestUpdateSectionBuilder()
        .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
        .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_REJECTED_CLAIM_MSG1`, {lng}))
        .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_REJECTED_CLAIM_MSG2`, {lng}), {claimantName: claimantFullName})
        .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_REJECTED_CLAIM_MSG3`, {lng}))
        .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
        .build();
    }
  }

}

function getStatusFDClaimantIntentToProceed(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.WAIT_FOR_THE_COURT_TO_REVIEW_THE_CASE`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.REJECTED_YOUR_RESPONSE`, {lng}), { claimantName: claimantFullName })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.THE_COURT_WILL_REVIEW_THE_CASE`)
    .build();
}

function generateLastUpdateResponseSections(claimResponseStatus: ClaimResponseStatus, claim: Claim, lng: string, respondentPaymentDeadline?: Date) {
  const claimResponsesStatus = {
    [ClaimResponseStatus.FA_PAY_IMMEDIATELY]: getFullAdmitPayImmediately(claim, lng, respondentPaymentDeadline),
    [ClaimResponseStatus.FA_PAY_BY_DATE]: getFullAdmitPayByDate(claim, lng),
    [ClaimResponseStatus.FA_PAY_INSTALLMENTS]: getFullAdmitPayInstallments(claim, lng),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY]: getPartAdmitPaidPayImmediately(claim, lng),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE]: getPartAdmitPaidPayByDate(claim, lng),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS]: getPartAdmitPayInstallmentItems(claim, lng),
    [ClaimResponseStatus.PA_ALREADY_PAID]: getStatusPaid(claim, lng),
    [ClaimResponseStatus.RC_PAID_FULL]: getStatusPaid(claim, lng),
    [ClaimResponseStatus.RC_PAID_LESS]: getStatusPaid(claim, lng),
    [ClaimResponseStatus.RC_DISPUTE]: getStatusFDClaimDispute(claim, lng),
    [ClaimResponseStatus.RC_DISPUTE_CLAIMANT_INTENDS_TO_PROCEED]: getStatusFDClaimantIntentToProceed(claim, lng),
    [ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY_ACCEPTED]: getPartAdmitPaidPayImmediatelyAccepted(claim, lng),
    [ClaimResponseStatus.PA_ALREADY_PAID_ACCEPTED_SETTLED]: getPartAdmitAlreadyPaidSettled(claim, lng),
    [ClaimResponseStatus.PA_ALREADY_PAID_ACCEPTED_NOT_SETTLED]: getPartAdmitAlreadyPaidNotSettled(claim),
    [ClaimResponseStatus.PA_ALREADY_PAID_NOT_ACCEPTED]: getPartAdmitAlreadyPaidNotAccepted(claim),
    [ClaimResponseStatus.PA_NOT_PAID_NOT_ACCEPTED]: getPartAdmitNotPaidNotAccepted(claim),
    [ClaimResponseStatus.PA_FA_CLAIMANT_REJECT_REPAYMENT_PLAN]: getLatestUpdateForClaimantRejectRepaymentPlan(claim, lng),
  };
  return claimResponsesStatus[claimResponseStatus as keyof typeof claimResponsesStatus];
}

const getLastUpdateSdoDocument = (claimId: string, claim: Claim) => {
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_AN_ORDER_HAS_BEEN_ISSUED_BY_THE_COURT`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_PLEASE_FOLLOW_THE_INSTRUCTIONS_IN_THE_ORDER`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_THIS_CLAIM_WILL_NO_PROCEED_OFFLINE`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_DOWNLOAD_THE_COURTS_ORDER`, claimId,  getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments,DocumentType.SDO_ORDER), null,`${PAGES_LATEST_UPDATE_CONTENT}.SDO_TO_FIND_OUT_THE_DETAILS`)
    .build();
};

function generateClaimEndedLatestUpdate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimTakenOffline = claim.takenOfflineDate;
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIM_ENDED_TITLE`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIM_ENDED_MESSAGE`, {lng}), {
      claimantName: claimantFullName,
      acceptFullDefenseDate: formatDateToFullDate(claimTakenOffline, lng),
    })
    .build();
}

function generateMediationSuccessfulLatestUpdate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SETTLED_CLAIM_TITLE`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SETTLED_CLAIM`, {lng}), {
      claimantName: claimantFullName,
    })
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.MEDIATION_AGREEMENT`, claimId, documentIdExtractor(claim?.mediationAgreement?.document?.document_binary_url))
    .addContactLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT`, {lng}), claimId, {claimantName: claimantFullName},
      t(`${PAGES_LATEST_UPDATE_CONTENT}.THEIR_PAYMENT_DETAILS`, {lng}))
    .build();
}

function generateMediationUnSuccessfulLatestUpdate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.MEDIATION_UNSUCCESSFUL_TITLE`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.MEDIATION_UNSUCCESSFUL_MSG1`, {lng}), {
      claimantName: claimantFullName,
    })
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.MEDIATION_UNSUCCESSFUL_MSG2`, {lng}))
    .build();
}

function generateDefaultJudgmentSubmittedLatestUpdate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const styleClass = 'govuk-body govuk-!-margin-bottom-0';
  const emailId= 'mailto:contactocmc@justice.gov.uk';
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.DEFAULT_JUDGMENT_SUBMITTED_TITLE`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.DEFAULT_JUDGMENT_MSG1`, {lng}), {
      claimantName: claimantFullName,
    })
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.DEFAULT_JUDGMENT_MSG2`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.DEFAULT_JUDGMENT_MSG3`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT_INFO`, {lng}))
    .addLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.EMAIL_ID`, {lng}),emailId, t(`${PAGES_LATEST_UPDATE_CONTENT}.EMAIL`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.TELEPHONE`, {lng}),undefined, styleClass)
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WORKING_HOURS`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_POST_COPY`, {lng}), {
      claimantName: claimantFullName,
    })
    .build();
}

function generateCCJRequestedLatestUpdate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const certificateLink = 'https://www.gov.uk/government/publications/form-n443-application-for-a-certificate-of-satisfaction-or-cancellation';
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.CCJ_REQUESTED_TITLE`, {lng}), {
      claimantName: claimantFullName})
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.CCJ_REQUESTED_MSG1`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.CCJ_REQUESTED_MSG2`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.CCJ_REQUESTED_MSG3`, {lng}),{
      claimantName: claimantFullName,
    })
    .addLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.CERTIFICATE_LINK`,{lng}), certificateLink,
      t(`${PAGES_LATEST_UPDATE_CONTENT}.CCJ_REQUESTED_MSG4`, {lng}),
      t(`${PAGES_LATEST_UPDATE_CONTENT}.CCJ_REQUESTED_MSG5`, {lng}))
    .addContactLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT`, {lng}), claimId, {claimantName: claimantFullName})
    .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
    .build();
}

export function generateClaimSettledLatestUpdate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  return new LatestUpdateSectionBuilder()
    .addTitle(t('PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIM_SETTLED', {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIMANT_CONFIRMED_SETTLED_CLAIM`, {lng}), {
      claimantName: claimantFullName,
      settlementDate: formatDateToFullDate(claim.lastModifiedDate, lng),
    })
    .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE))
    .build();
}

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

function getLatestUpdateForClaimantRejectRepaymentPlan(claim: Claim, lng: string) {
  const claimantName = claim.getClaimantFullName();
  return new LatestUpdateSectionBuilder()
    .addTitle(t('PAGES.DASHBOARD.STATUS_DEFENDANT.WAITING_COURT_REVIEW', {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIMANT_REJECT_PAYMENT_PLAN_MSG1`, {lng}), {
      claimantName: claimantName})
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIMANT_REJECT_PAYMENT_PLAN_MSG2`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIMANT_REJECT_PAYMENT_PLAN_MSG3`, {lng}))
    .build();
}

export const buildResponseToClaimSection = (claim: Claim, claimId: string, lang: string, respondentPaymentDeadline?: Date): ClaimSummarySection[] => {
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
    sectionContent.push(getLastUpdateSdoDocument(claimId, claim));
  } else if (claim.hasClaimTakenOffline()) {
    sectionContent.push(generateClaimEndedLatestUpdate(claim, lng));
  } else if (claim.hasMediationSuccessful()) {
    sectionContent.push(generateMediationSuccessfulLatestUpdate(claim, lng));
  } else if (claim.hasMediationUnSuccessful() && !claim.hasSdoOrderDocument()) {
    sectionContent.push(generateMediationUnSuccessfulLatestUpdate(claim, lng));
  } else if (claim.hasDefaultJudgmentSubmitted() && !claim.isClaimSettled()) {
    sectionContent.push(generateDefaultJudgmentSubmittedLatestUpdate(claim, lng));
  } else if(claim.hasClaimantRequestedCCJ() && !claim.isClaimSettled()) {
    sectionContent.push(generateCCJRequestedLatestUpdate(claim, lng));
  } else if (claim.isClaimSettled()) {
    sectionContent.push(generateClaimSettledLatestUpdate(claim, lng));
  } else if (claim.hasApplicant1DeadlinePassed()) {
    sectionContent.push(getLastUpdateForClaimDismissed(claim));
  } else if (claim.hasClaimInMediation()) {
    sectionContent.push(getLastUpdateForClaimMediation(claim));
  } else if (![ClaimResponseStatus.PA_ALREADY_PAID_NOT_ACCEPTED, ClaimResponseStatus.PA_ALREADY_PAID_ACCEPTED_NOT_SETTLED].includes(responseStatus) && claim.hasClaimantNotAgreedToMediation() && !claim.hasSdoOrderDocument() && !claim.isClaimantRejectedPaymentPlan()) {
    sectionContent.push(getLastUpdateForNoMediation(claim));
  } else {
    sectionContent.push(generateLastUpdateResponseSections(responseStatus, claim, lng, respondentPaymentDeadline));
  }
  return sectionContent.flat();
};
