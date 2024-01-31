import {Claim} from '../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../common/form/models/claimSummarySection';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {
  getDisagreementStatementWithEvidence, getDisagreementStatementWithTimeline, getTheirEvidence, getTheirTOEs,
} from './fullDisputeDefendantsResponseContent';
import {t} from 'i18next';

const getResponseStatement = (name: string, paidAmount: number, lang: string) => {
  return [{
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_ALREADY_PAID_STATEMENT', {lng: lang}),
      variables: {defendant: name, paidAmount},
    },
  }];
};

export const getTheirDatePaid = (text: string, lang: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHEN_THEY_SAY_THEY_PAID', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: text,
      },
    }];
};

export const getWhyTheyDisagree = (text: string, lang: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_AMOUNT', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: text,
      },
    }];
};

export const getTheirPaidMethod = (text: string, lang: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.HOW_PAID', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: text,
      },
    }];
};

export const buildPartAdmitAlreadyPaidResponseContent = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [
    ...getResponseStatement(claim.getDefendantFullName(), claim.partialAdmissionPaidAmount(), lng),
    ...getTheirDatePaid(formatDateToFullDate(claim.partialAdmission.howMuchHaveYouPaid.date), lng),
    ...getTheirPaidMethod(claim.partialAdmission.howMuchHaveYouPaid.text, lng),
    ...getWhyTheyDisagree(claim.partialAdmission.whyDoYouDisagree.text, lng),
    ...getTheirTOEs(claim, lng),
    ...getDisagreementStatementWithTimeline(claim, lng),
    ...getTheirEvidence(claim, lng),
    ...getDisagreementStatementWithEvidence(claim, lng),
  ];
};
