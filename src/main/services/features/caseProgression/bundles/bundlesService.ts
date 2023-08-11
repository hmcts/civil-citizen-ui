import {Claim} from 'models/claim';
import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {TableHead} from 'models/LatestUpdateSectionBuilder/tableHead.js';
import {TableCell} from 'models/summaryList/summaryList';
import {formatStringDateDMY, formatStringTimeHMS} from 'common/utils/dateUtils';

export function getBundlesContent(claim: Claim): ClaimSummaryContent[] {

  const tableHeaders = getTableHeaders();
  const tableRows = getTableRows(claim);

  const bundlesSection = new LatestUpdateSectionBuilder()
    .addParagraph('You can find the bundle below')
    .addLink('apply to the court', 'href', 'As the bundle has now been created, you will have to', 'if you want any new documents you upload to be used at your trial or hearing.')
    .addParagraph('Any new documents you upload will not be included in the main bundle. They will be listed separately below and under \'Documents\'.')
    .addTable(tableHeaders, tableRows)
    .build();

  return [{contentSections: bundlesSection, hasDivider: false}];
}

function getTableHeaders(): TableHead[]{
  const tableHeaders = [] as TableHead[];

  tableHeaders.push(new TableHead('Trial Bundle'));
  tableHeaders.push(new TableHead('Created On'));
  tableHeaders.push(new TableHead('Hearing Date'));
  tableHeaders.push(new TableHead('Document URL'));

  return tableHeaders;
}

function getTableRows(claim: Claim): TableCell[][] {

  const tableRows = [] as TableCell[][];

  for(const bundle of claim.caseProgression.caseBundles){

    tableRows.push([{html: bundle.filename, classes: ''}, {html: formatStringDateDMY(bundle.createdOn)+formatStringTimeHMS(bundle.createdOn), classes: ''}, {html: '', classes: ''}]);
  }

  return tableRows;
}
