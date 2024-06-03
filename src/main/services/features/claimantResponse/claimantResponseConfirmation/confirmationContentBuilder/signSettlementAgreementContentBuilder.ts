import {t} from 'i18next';
import {ClaimSummaryType} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {formatDateToFullDate} from 'common/utils/dateUtils';

export const getSignSettlementAgreementNextSteps = (claim: Claim, lang: string, respondToSettlementAgreementDeadLine ?: Date) => {
  const defendantName = claim?.getDefendantFullName();
  const respondByDate = formatDateToFullDate(respondToSettlementAgreementDeadLine, lang);
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.WE_EMAILED', {defendantName, lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.THEY_MUST_RESPOND_BEFORE', {respondByDate, lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.IF_THEY_SIGN', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.IF_DONT_SIGN', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.IF_CANT_AFFORD', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.IF_NOT_PAID', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.IF_SIGNS', {defendantName, lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.AFTER_REQUESTED', {lng: lang}),
      },
    },
  ];
};
