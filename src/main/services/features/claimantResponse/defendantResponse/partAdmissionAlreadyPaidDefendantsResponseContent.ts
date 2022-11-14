import {t} from 'i18next';
import {Claim} from '../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../common/form/models/claimSummarySection';
import {EvidenceItem} from '../../../../common/form/models/evidence/evidenceItem';
import {TimelineRow} from '../../../../common/form/models/timeLineOfEvents/timelineRow';
import {TableCell} from '../../../../common/models/summaryList/summaryList';
import {formatDateToFullDate} from 'common/utils/dateUtils';

export const generateTableRowsForTOEs = (theirTOERows: TimelineRow[]): TableCell[][] => {
  return theirTOERows.map(row => {
    return [{
      text: row.date,
    }, {
      text: row.description,
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

const getResponseStatement = (name: string, paidAmount: number) => {
  return [{
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_ALREADY_PAID_STATEMENT',
      variables: {defendant: name, paidAmount},
    },
  }];
};

export const getTheirTOEs = (claim: Claim, lng: string): ClaimSummarySection[] => {
  const theirTOERows = claim.partialAdmission?.timeline?.rows;
  if (!theirTOERows?.length){
    return [];
  }
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_TOE',
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
        tableRows: generateTableRowsForTOEs(theirTOERows),
      },
    },
  ];
};

export const getDisagreementStatementWithTimeline = (claim: Claim): ClaimSummarySection[] => {
  if (!claim.partialAdmission?.timeline?.comment) {
    return [];
  }
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_TIMELINE',
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
    ...getResponseStatement(claim.getDefendantName(), claim.partialAdmissionPaidAmount()),
    ...getTheirDatePaid(formatDateToFullDate(claim.partialAdmission.howMuchHaveYouPaid.date)),
    ...getTheirPaidMethod(claim.partialAdmission.howMuchHaveYouPaid.text),
    ...getWhyTheyDisagree(claim.partialAdmission.whyDoYouDisagree.text),
    ...getTheirTOEs(claim, lng),
    ...getDisagreementStatementWithTimeline(claim),
    ...getTheirEvidence(claim, lng),
  ];
};
