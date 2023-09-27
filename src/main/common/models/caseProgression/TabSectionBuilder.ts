import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {TableCell} from 'models/summaryList/summaryList';

export class TabSectionBuilder extends PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];

  addTable(tableHeaders?: TableCell[], tableRows?: TableCell[][], classes?: string){

    if(!tableHeaders && !tableRows)
    {
      return this;
    }

    const tableSection = ({
      type: ClaimSummaryType.TABLE,
      data: {
        classes: classes,
        head: tableHeaders,
        tableRows: tableRows,
      },
    });
    this._claimSummarySections.push(tableSection);
    return this;
  }

  build() {
    return this._claimSummarySections;
  }
}
