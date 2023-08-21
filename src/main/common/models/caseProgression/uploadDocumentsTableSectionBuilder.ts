import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {TableCell} from 'models/summaryList/summaryList';

export function addEvidenceUploadDescription() {
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.CLAIM_SUMMARY.EVIDENCE_UPLOAD_SUMMARY'),
    },
  };
}

export const addEvidenceUploadTable = (header: string, isClaimant: boolean, tableRows: TableCell[][]) => {
  return {
    type: ClaimSummaryType.TABLE,
    data: {
      classes: 'tableWrap',
      head: [
        {
          text: isClaimant == true ? t('PAGES.CLAIM_SUMMARY.CLAIMANT') + t(header) : t('PAGES.CLAIM_SUMMARY.DEFENDANT') + t(header),
          classes: 'govuk-!-width-one-half',
        },
        {
          text: '',
          classes: 'govuk-!-width-one-half',
        },
      ],
      tableRows: tableRows,
    },
  };
};

