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

function getPartAdmitPaidPayImmediately(claim: Claim, lng: string) {
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

function getStatusPaid(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`,{lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_HAVE_EMAILED`, {lng}), {
      claimantName: claimantFullName,
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU`)
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
    [ClaimResponseStatus.PA_ALREADY_PAID]: getStatusPaid(claim, lng),
    [ClaimResponseStatus.RC_PAID_FULL]: getStatusPaid(claim, lng),
    [ClaimResponseStatus.RC_PAID_LESS]: getStatusPaid(claim, lng),

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

function generateClaimEndedLatestUpdate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimTakenOffline = claim.takenOfflineDate;
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIM_ENDED_TITLE`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIM_ENDED_MESSAGE`, {
      claimantName: claimantFullName,
      acceptFullDefenseDate: formatDateToFullDate(claimTakenOffline, lng),
    })
    .build();
}

function generateMediationSuccessfulLatestUpdate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SETTLED_CLAIM_TITLE`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SETTLED_CLAIM`, {
      claimantName: claimantFullName,
    })
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT`, claimId, {claimantName: claimantFullName},
      `${PAGES_LATEST_UPDATE_CONTENT}.THEIR_PAYMENT_DETAILS`)
    .build();
}

function generateMediationUnSuccessfulLatestUpdate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.MEDIATION_UNSUCCESSFUL_TITLE`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.MEDIATION_UNSUCCESSFUL_MSG1`, {
      claimantName: claimantFullName,
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.MEDIATION_UNSUCCESSFUL_MSG2`)
    .build();
}

function generateDefaultJudgmentSubmittedLatestUpdate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const styleClass = 'govuk-body govuk-!-margin-bottom-0';
  const emailId= 'mailto:contactocmc@justice.gov.uk';
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.DEFAULT_JUDGMENT_SUBMITTED_TITLE`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.DEFAULT_JUDGMENT_MSG1`, {
      claimantName: claimantFullName,
    })
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.DEFAULT_JUDGMENT_MSG2`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.DEFAULT_JUDGMENT_MSG3`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT_INFO`)
    .addLink(`${PAGES_LATEST_UPDATE_CONTENT}.EMAIL_ID`,emailId, `${PAGES_LATEST_UPDATE_CONTENT}.EMAIL`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.TELEPHONE`,undefined, styleClass)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WORKING_HOURS`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_POST_COPY`, {
      claimantName: claimantFullName,
    })
    .build();
}

function generateCCJRequestedLatestUpdate(claim: Claim, lng: string) {
  const claimantFullName = claim.getClaimantFullName();
  const certificateLink = 'https://www.gov.uk/government/publications/form-n443-application-for-a-certificate-of-satisfaction-or-cancellation';
  const claimId = claim.id;
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.CCJ_REQUESTED_TITLE`, {
      claimantName: claimantFullName})
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.CCJ_REQUESTED_MSG1`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.CCJ_REQUESTED_MSG2`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.CCJ_REQUESTED_MSG3`,{
      claimantName: claimantFullName,
    })
    .addLink(`${PAGES_LATEST_UPDATE_CONTENT}.CERTIFICATE_LINK`, certificateLink,
      `${PAGES_LATEST_UPDATE_CONTENT}.CCJ_REQUESTED_MSG4`,
      `${PAGES_LATEST_UPDATE_CONTENT}.CCJ_REQUESTED_MSG5`)
    .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT`, claimId, {claimantName: claimantFullName})
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
    .build();
}

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
    sectionContent.push(getLastUpdateSdoDocument(claimId));
  } else if (claim.hasClaimTakenOffline()) {
    sectionContent.push(generateClaimEndedLatestUpdate(claim, lng));
  } else if (claim.hasMediationSuccessful()) {
    sectionContent.push(generateMediationSuccessfulLatestUpdate(claim, lng));
  } else if (claim.hasMediationUnSuccessful()) {
    sectionContent.push(generateMediationUnSuccessfulLatestUpdate(claim, lng));
  } else if (claim.hasDefaultJudgmentSubmitted()) {
    sectionContent.push(generateDefaultJudgmentSubmittedLatestUpdate(claim, lng));
  } else if(claim.hasClaimantRequestedCCJ()) {
    sectionContent.push(generateCCJRequestedLatestUpdate(claim, lng));
  } else
  {
    sectionContent.push(generateLastUpdateResponseSections(claim.responseStatus, claim, lng));
  }
  return sectionContent.flat();
};
