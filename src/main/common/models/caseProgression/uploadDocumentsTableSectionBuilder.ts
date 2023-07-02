import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {TableCell} from 'models/summaryList/summaryList';

export const addEvidenceUploadTable = (header: string, isClaimant: boolean, tableRows: TableCell[][]) => {
  return {
    type: ClaimSummaryType.TABLE,
    data: {
      head: [
        {
          text: isClaimant == true ? t('PAGES.CLAIM_SUMMARY.CLAIMANT') + header : t('PAGES.CLAIM_SUMMARY.DEFENDANT') + header,
        },
        {
          text: '',
        },
      ],
      tableRows: tableRows,
    },
  };
};

