import {Claim} from '../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../common/form/models/claimSummarySection';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {
  getDisagreementStatementWithEvidence,
  getDisagreementStatementWithTimeline,
  getTheirEvidence,
  getTheirTOEs,
} from './fullDisputeDefendantsResponseContent';
import {formatDateToFullDate} from '../../../../common/utils/dateUtils';
import {t} from 'i18next';

const getResponseStatement = (claim: Claim, lang: string) => {
  switch(claim.responseStatus) {
    case ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS:
      return getResponseStatementPayInstallments(claim, lang);

    case ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY:
      return getResponseStatementPayImmediately(claim, lang);

    case ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE:
      return getResponseStatementPayByDate(claim, lang);
  }
};

const getResponseStatementPayInstallments = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [{
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.DEFENDANT_ADMITS_THEY_OWE', {lng}),
      variables: {defendant: claim.getDefendantFullName(), paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount},
    }},
  {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU', {lng}),
      variables: {paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount},
    },
  }];
};

const getResponseStatementPayImmediately = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [{
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.DEFENDANT_ADMITS_THEY_OWE', {lng}),
      variables: {defendant: claim.getDefendantFullName(), paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount},
    }},
  {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU_IMMEDIATELY', {lng}),
      variables: {paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount},
    },
  }];
};

const getResponseStatementPayByDate = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [{
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.DEFENDANT_ADMITS_THEY_OWE', {lng}),
      variables: {defendant: claim.getDefendantFullName(), paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount},
    }},
  {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU_BY_DATE', {lng}),
      variables: {paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount, datePaid: formatDateToFullDate(claim.partialAdmission.paymentIntention.paymentDate, lng)},
    },
  }];
};

export const getTheirDefence = (text: string, lng: string): ClaimSummarySection[] => {
  return [{
    type: ClaimSummaryType.TITLE,
    data: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_DEFENCE', {lng}),
    },
  },
  {
    type: ClaimSummaryType.SUBTITLE,
    data: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.WHY_THEY_DONT_OWE', {lng}),
    },
  },
  {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: text,
    },
  }];
};

const getPayByDateResponseForHowTheyWantToPay = (claim: Claim, lang: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU_BY_DATE',
        variables: {paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount, datePaid: formatDateToFullDate(claim.partialAdmission.paymentIntention.paymentDate, lang)},
      },
    }];
};

export const buildPartAdmitNotPaidResponseContent = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [
    ...getResponseStatement(claim, lng),
    ...getTheirDefence(claim.partialAdmission.whyDoYouDisagree.text, lng),
    ...getTheirTOEs(claim, lng),
    ...getDisagreementStatementWithTimeline(claim),
    ...getTheirEvidence(claim, lng),
    ...getDisagreementStatementWithEvidence(claim),
  ];
};

export const buildPartAdmitNotPaidResponseForHowTheyWantToPay = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [
    ...getPayByDateResponseForHowTheyWantToPay(claim, lng),
  ];
};
