import {t} from 'i18next';
import {Claim} from '../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../common/form/models/claimSummarySection';
import {EvidenceItem} from '../../../../common/form/models/evidence/evidenceItem';
import {TimelineRow} from '../../../../common/form/models/timeLineOfEvents/timelineRow';
import {TableCell} from '../../../../common/models/summaryList/summaryList';

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

const getResponseStatement = (name: string) => {
  return [{
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.REJECT_CLAIM_STATEMENT',
      variables: {defendant: name},
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

export const getDisagreementStatementWithEvidence = (claim: Claim): ClaimSummarySection[] => {
  if (!claim.evidence?.comment) {
    return [];
  }
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_EVIDENCE',
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

export const getTheirDefence = (text: string): ClaimSummarySection[] => {
  return [{
    type: ClaimSummaryType.TITLE,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_DEFENCE',
    },
  },
  {
    type: ClaimSummaryType.SUBTITLE,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_CLAIM',
    },
  },
  {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: text,
    },
  }];
};

export const buildFullDisputeResponseContent = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [
    ...getResponseStatement(claim.getDefendantName()),
    ...getTheirDefence(claim.rejectAllOfClaim?.defence?.text),
    ...getTheirTOEs(claim, lng),
    ...getDisagreementStatementWithTimeline(claim),
    ...getTheirEvidence(claim, lng),
    ...getDisagreementStatementWithEvidence(claim),
  ];
};
