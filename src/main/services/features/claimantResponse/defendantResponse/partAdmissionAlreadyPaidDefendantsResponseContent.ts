import {Claim} from '../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../common/form/models/claimSummarySection';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {
  getDisagreementStatementWithEvidence, getDisagreementStatementWithTimeline, getTheirEvidence, getTheirTOEs,
} from './fullDisputeDefendantsResponseContent';

const getResponseStatement = (name: string, paidAmount: number) => {
  return [{
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_ALREADY_PAID_STATEMENT',
      variables: {defendant: name, paidAmount},
    },
  }];
};

export const getTheirDatePaid = (text: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.WHEN_THEY_SAY_THEY_PAID',
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: text,
      },
    }];
};

export const getWhyTheyDisagree = (text: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_AMOUNT',
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: text,
      },
    }];
};

export const getTheirPaidMethod = (text: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.HOW_PAID',
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
    ...getResponseStatement(claim.getDefendantFullName(), claim.partialAdmissionPaidAmount()),
    ...getTheirDatePaid(formatDateToFullDate(claim.partialAdmission.howMuchHaveYouPaid.date)),
    ...getTheirPaidMethod(claim.partialAdmission.howMuchHaveYouPaid.text),
    ...getWhyTheyDisagree(claim.partialAdmission.whyDoYouDisagree.text),
    ...getTheirTOEs(claim, lng),
    ...getDisagreementStatementWithTimeline(claim, lng),
    ...getTheirEvidence(claim, lng),
    ...getDisagreementStatementWithEvidence(claim, lng),
  ];
};
