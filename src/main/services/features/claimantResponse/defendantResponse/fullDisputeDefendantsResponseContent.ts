import {t} from 'i18next';
import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {EvidenceItem} from 'form/models/evidence/evidenceItem';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';
import {TableCell} from 'models/summaryList/summaryList';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {convertToEvidenceTypeToTranslationKey} from 'models/evidence/evidenceType';
import {getLng} from 'common/utils/languageToggleUtils';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {CCDHowWasThisAmountPaid} from 'models/ccdResponse/ccdRespondToClaim';

export const generateTableRowsForTOEs = (theirTOERows: TimelineRow[], lng: string): TableCell[][] => {
  return theirTOERows.map(row => {
    return [{
      text: formatDateToFullDate(new Date(row?.date?.toString()), lng ),
    }, {
      text: row?.description,
    }];
  });
};

export const generateTableRowsForEvidence = (evidenceRows: EvidenceItem[], lng: string): TableCell[][] => {
  return evidenceRows.map(row => {
    return [{
      text: t(convertToEvidenceTypeToTranslationKey(row.type), {lng: getLng(lng)}),
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
  if (claim.defendantResponseTimelineDocument) {
    const timelineDocId = documentIdExtractor(claim.defendantResponseTimelineDocument.document_binary_url);
    const timelineDocumentLink= CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claim.id).replace(':documentId', timelineDocId);
    return [
      {
        type: ClaimSummaryType.SUBTITLE,
        data: {
          text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_TOE',
        },
      },
      {
        type: ClaimSummaryType.LINK,
        data: {
          text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.DOWNLOAD_TIMELINE',
          href: timelineDocumentLink,
        },
      },
    ];
  }
  const theirTOERows = claim.isPartialAdmission()
    ? claim.partialAdmission?.timeline?.rows
    : claim.rejectAllOfClaim?.timeline?.rows;
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
  const comment = claim.isPartialAdmission()
    ? claim.partialAdmission?.timeline?.comment
    : claim.rejectAllOfClaim?.timeline?.comment;
  if (!comment) {
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
        text: comment,
      },
    },
  ];
};

export const getTheirEvidence = (claim: Claim, lng: string): ClaimSummarySection[] => {
  const evidenceDocId = getSystemGeneratedCaseDocumentIdByType(claim.defendantResponseDocuments, DocumentType.DEFENDANT_DEFENCE);
  if (evidenceDocId) {
    const evidenceDocName = claim.defendantResponseDocuments
      .find(doc => doc.value.documentLink.document_url.includes(evidenceDocId))
      .value.documentName;
    const evidenceDocFileType = evidenceDocName.lastIndexOf('.') !== -1
      ? evidenceDocName.slice(evidenceDocName.lastIndexOf('.') + 1)
      : undefined;
    const evidenceDocumentLinkText = evidenceDocFileType
      ? `${t('PAGES.REVIEW_DEFENDANTS_RESPONSE.DOWNLOAD_EVIDENCE', {lng})} (${evidenceDocFileType.toUpperCase()})`
      : t('PAGES.REVIEW_DEFENDANTS_RESPONSE.DOWNLOAD_EVIDENCE', {lng});
    const evidenceDocumentLink = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claim.id).replace(':documentId', evidenceDocId);
    return [
      {
        type: ClaimSummaryType.SUBTITLE,
        data: {
          text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_EVIDENCE',
        },
      },
      {
        type: ClaimSummaryType.LINK,
        data: {
          text: evidenceDocumentLinkText,
          href: evidenceDocumentLink,
        },
      },
    ];
  }
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
        tableRows: generateTableRowsForEvidence(evidenceRows, lng),
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
  const textTranslated = (text === CCDHowWasThisAmountPaid.BACS || text === CCDHowWasThisAmountPaid.CREDIT_CARD || text === CCDHowWasThisAmountPaid.CHEQUE) ? t(`COMMON.TYPE_OF_PAYMENT.${text}`, {lng}) : text;
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
        text: textTranslated,
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
    ...getTheirTOEs(claim, lng),
    ...getTheirEvidence(claim, lng),
  ];
};

