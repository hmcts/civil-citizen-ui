import {ClaimSummarySection, ClaimSummaryType} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {t} from 'i18next';
import {CASE_DOCUMENT_DOWNLOAD_URL, CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {getPaymentDate} from 'common/utils/repaymentUtils';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {YesNo} from 'form/models/yesNo';

export function buildPanelSection(claim: Claim, lang: string): ClaimSummarySection[] {
  if (claim.defendantSignedSettlementAgreement === YesNo.YES) {
    return getAcceptConfirmationPanel(claim, lang);
  } else if (claim.defendantSignedSettlementAgreement === YesNo.NO) {
    return getRejectConfirmationPanel(claim, lang);
  }
}

const getAcceptConfirmationPanel = (claim: Claim, lang: string) => {
  // TODO: Replace with actual settlement agreement document id
  const documentId = 'document-id';
  const documentLinkUrl = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claim.id).replace(':documentId', documentId);
  return [
    {
      type: ClaimSummaryType.PANEL,
      data: {
        title: `<span class='govuk-!-font-size-36'>${t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.ACCEPTED_SETTLEMENT_AGREEMENT_TITLE', {lng: lang})}</span>`,
        html: `<span class='govuk-!-font-size-27'><a class="white-link" href="${documentLinkUrl}">${t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.DOWNLOAD_SETTLEMENT_AGREEMENT_LINK_TEXT', {lng: lang})}</a></span>`,
      },
    },
  ];
};

const getRejectConfirmationPanel = (claim: Claim, lang: string) => {
  return [
    {
      type: ClaimSummaryType.PANEL,
      data: {
        title: `<span class='govuk-!-font-size-36'>${t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.REJECTED_SETTLEMENT_AGREEMENT_TITLE', {lng: lang})}</span>`,
      },
    },
  ];
};

export function buildNextStepsSection(claim: Claim, lang: string): ClaimSummarySection[] {
  if (claim.defendantSignedSettlementAgreement === YesNo.YES) {
    return getAcceptSettlementAgreementNextSteps(claim, lang);
  } else if (claim.defendantSignedSettlementAgreement === YesNo.NO) {
    return getRejectSettlementAgreementNextSteps(claim, lang);
  }
}

const getAcceptSettlementAgreementNextSteps = (claim: Claim, lang: string) => {
  const claimantName = claim.getClaimantFullName();
  const nextSteps = [];
  if (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate()) {
    nextSteps.push(
      {
        type: ClaimSummaryType.PARAGRAPH,
        data: {
          text: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.PAY_BY', {paymentDate: formatDateToFullDate(getPaymentDate(claim)), lng: lang}),
        },
      },
    );
  }
  nextSteps.push(...[
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.CANT_REQUEST_CCJ', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.LINK,
      data: {
        text: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.CONTACT_CLAIMANT', {claimantName, lng: lang}),
        href: CITIZEN_CONTACT_THEM_URL.replace(':id', claim.id),
        textAfter: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.THEIR_PAYMENT_DETAILS', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.GET_RECEIPTS', {lng: lang}),
      },
    },
  ]);
  return nextSteps;
};

const getRejectSettlementAgreementNextSteps = (claim: Claim, lang: string) => {
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.CAN_REQUEST_CCJ', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.REQUEST_CCJ', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.COURT_REVIEWED_PLAN', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.EMAIL_YOU', {lng: lang}),
      },
    },
  ];
};
