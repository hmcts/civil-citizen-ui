import {ClaimSummarySection, ClaimSummaryType} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {t} from 'i18next';
import {CASE_DOCUMENT_DOWNLOAD_URL, CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {getPaymentDate} from 'common/utils/repaymentUtils';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';

export function buildPanelSection(claim: Claim, lang: string): ClaimSummarySection[] {
  if (claim?.respondentSignSettlementAgreement === YesNoUpperCamelCase.YES) {
    return getAcceptConfirmationPanel(claim, lang);
  } else if (claim?.respondentSignSettlementAgreement === YesNoUpperCamelCase.NO) {
    return getRejectConfirmationPanel(claim, lang);
  }
}

const getAcceptConfirmationPanel = (claim: Claim, lang: string) => {
  const documentLinkUrl = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claim.id).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SETTLEMENT_AGREEMENT));
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
  if (claim?.respondentSignSettlementAgreement === YesNoUpperCamelCase.YES) {
    return getAcceptSettlementAgreementNextSteps(claim, lang);
  } else if (claim?.respondentSignSettlementAgreement === YesNoUpperCamelCase.NO) {
    return getRejectSettlementAgreementNextSteps(claim, lang);
  }
}

const getAcceptSettlementAgreementNextSteps = (claim: Claim, lang: string) => {
  const claimantName = claim.getClaimantFullName();
  const nextSteps = [];
  let paymentDate;
  if (claim.hasCourtAcceptedClaimantsPlan()) {
    if (claim.getSuggestedPaymentIntentionOptionFromClaimant() === PaymentOptionType.IMMEDIATELY) {
      paymentDate = claim.claimantResponse.suggestedImmediatePaymentDeadLine;
    } else if (claim.getSuggestedPaymentIntentionOptionFromClaimant() === PaymentOptionType.BY_SET_DATE) {
      const date = claim.claimantResponse.suggestedPaymentIntention.paymentDate as unknown as PaymentDate;
      paymentDate = date as unknown as Date;
    }
    if(paymentDate) {
      nextSteps.push(
        {
          type: ClaimSummaryType.PARAGRAPH,
          data: {
            text: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.PAY_BY', {paymentDate: formatDateToFullDate(paymentDate, lang), lng: lang}),
          },
        },
      );
    }
  } else if (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate()) {
    paymentDate = getPaymentDate(claim);
    nextSteps.push(
      {
        type: ClaimSummaryType.PARAGRAPH,
        data: {
          text: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.PAY_BY', {paymentDate: formatDateToFullDate(paymentDate, lang), lng: lang}),
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
  return new PageSectionBuilder()
    .addTitle(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}))
    .addParagraph(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.CAN_REQUEST_CCJ', {lng: lang}))
    .addParagraph(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.REQUEST_CCJ', {lng: lang}))
    .addParagraph(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.COURT_REVIEWED_PLAN', {lng: lang}))
    .addParagraph(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.EMAIL_YOU', {lng: lang}))
    .build();
};
