import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {TableCell} from 'models/summaryList/summaryList';
import {TableHead} from 'models/LatestUpdateSectionBuilder/tableHead.js';

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

export function buildTableHeaders(headerStrings: string[], headerClasses?: string[]){
  const tableHeaders = [] as TableHead[];

  for(let i = 0; i < headerStrings.length; i++){
    let headerClass = '';
    if(headerClasses && i < headerClasses.length) {
      headerClass = headerClasses[i];
    }

    const header = new TableHead(headerStrings[i], headerClass);
    tableHeaders.push(header);
  }

  return tableHeaders;
}

