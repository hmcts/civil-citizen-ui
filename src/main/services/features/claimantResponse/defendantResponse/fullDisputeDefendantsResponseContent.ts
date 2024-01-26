import {t} from 'i18next';
import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {EvidenceItem} from 'form/models/evidence/evidenceItem';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';
import {TableCell} from 'models/summaryList/summaryList';
import {formatDateToFullDate} from 'common/utils/dateUtils';

export const generateTableRowsForTOEs = (theirTOERows: TimelineRow[], lng: string): TableCell[][] => {
  return theirTOERows.map(row => {
    return [{
      text: formatDateToFullDate(new Date(row?.date?.toString()), lng ),
    }, {
      text: row?.description,
    }];
  });
};

export const generateTableRowsForEvidence = (evidenceRows: EvidenceItem[]): TableCell[][] => {
  return evidenceRows.map(row => {
    return [{
      text: row.type,
    },
    {
      text: row.description,
    }];
  });
};

const getResponseStatement = (name: string, text: string, amount?: number) => {
  return [{
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: text,
      variables: {defendant: name, paidAmount: amount},
    },
  }];
};

export const getTheirTOEs = (claim: Claim, lng: string): ClaimSummarySection[] => {
  const theirTOERows = claim.partialAdmission?.timeline?.rows;
  if (!theirTOERows?.length) {
    return [];
  }
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_TOE', { lng }),
      },
    },
    {
      type: ClaimSummaryType.TABLE,
      data: {
        head: [
          {
            text: t('COMMON.DATE', {lng}),
          },
          {
            text: t('COMMON.TIMELINE.WHAT_HAPPENED', {lng}),
          },
        ],
        tableRows: generateTableRowsForTOEs(theirTOERows, lng),
      },
    },
  ];
};

export const getDisagreementStatementWithTimeline = (claim: Claim, lng: string): ClaimSummarySection[] => {
  if (!claim.partialAdmission?.timeline?.comment) {
    return [];
  }
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_TIMELINE', {lng}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: claim.partialAdmission?.timeline?.comment,
      },
    },
  ];
};

export const getTheirEvidence = (claim: Claim, lng: string): ClaimSummarySection[] => {
  const evidenceRows = claim.evidence?.evidenceItem;
  if (!evidenceRows?.length) {
    return [];
  }
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_EVIDENCE',
      },
    },
    {
      type: ClaimSummaryType.TABLE,
      data: {
        head: [
          {
            text: t('COMMON.EVIDENCE_SUMMARY.ROW_TYPE', {lng}),
          },
          {
            text: t('COMMON.DESCRIPTION', {lng}),
          },
        ],
        tableRows: generateTableRowsForEvidence(evidenceRows),
      },
    },
  ];
};

export const getDisagreementStatementWithEvidence = (claim: Claim, lng: string): ClaimSummarySection[] => {
  if (!claim.evidence?.comment) {
    return [];
  }
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_EVIDENCE', {lng}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: claim.evidence?.comment,
      },
    },
  ];
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
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_CLAIM', {lng}),
    },
  },
  {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: text,
    },
  }];
};

export const getPaymentDate = (paymentDate: Date, lng: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHEN_THEY_PAID_THIS_AMOUNT', {lng}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: formatDateToFullDate(paymentDate, lng),
      },
    },
  ];
};

export const getHowTheyPaid = (text: string, lng: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.HOW_THEY_PAID', {lng}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: text,
      },
    },
  ];
};

export const getWhyTheyDisagreeWithClaim = (text: string, lng: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEY_DONT_OWE_CLAIM_AMOUNT', {lng}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: text,
      },
    },
  ];
};

export const buildFullDisputeResponseContent = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [
    ...getResponseStatement(claim.getDefendantFullName(), t('PAGES.REVIEW_DEFENDANTS_RESPONSE.REJECT_CLAIM_STATEMENT', {lng})),
    ...getTheirDefence(claim.rejectAllOfClaim?.defence?.text, lng),
    ...getTheirTOEs(claim, lng),
    ...getDisagreementStatementWithTimeline(claim, lng),
    ...getTheirEvidence(claim, lng),
    ...getDisagreementStatementWithEvidence(claim, lng),
  ];
};
export const buildFullDisputePaidLessResponseContent = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [
    ...getResponseStatement(claim.getDefendantFullName(), t('PAGES.REVIEW_DEFENDANTS_RESPONSE.REJECT_CLAIM_PAID_LESS_STATEMENT', {lng}), claim.isRejectAllOfClaimAlreadyPaid()),
    ...getPaymentDate(claim.getRejectAllOfClaimPaidLessPaymentDate(), lng),
    ...getHowTheyPaid(claim.getRejectAllOfClaimPaidLessPaymentMode(), lng),
    ...getWhyTheyDisagreeWithClaim(claim.getRejectAllOfClaimDisagreementReason(), lng),
    ...getTheirTOEs(claim, lng),
    ...getDisagreementStatementWithTimeline(claim, lng),
    ...getTheirEvidence(claim, lng),
    ...getDisagreementStatementWithEvidence(claim, lng),
  ];
};

export const buildFullDisputePaidFullResponseContent = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [
    ...getResponseStatement(claim.getDefendantFullName(), t('PAGES.REVIEW_DEFENDANTS_RESPONSE.REJECT_CLAIM_PAID_FULL_STATEMENT', {lng}), claim.isRejectAllOfClaimAlreadyPaid()),
    ...getPaymentDate(claim.getRejectAllOfClaimPaidLessPaymentDate(), lng),
    ...getHowTheyPaid(claim.getRejectAllOfClaimPaidLessPaymentMode(), lng),
  ];
};

