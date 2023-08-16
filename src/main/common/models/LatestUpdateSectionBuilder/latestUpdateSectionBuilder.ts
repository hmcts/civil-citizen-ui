import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {CASE_DOCUMENT_DOWNLOAD_URL, CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {TableCell} from 'models/summaryList/summaryList';

export class LatestUpdateSectionBuilder extends PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];
  addContactLink(text: string, claimId: string, variables?: any, textAfter?: string) {
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        variables: variables,
        href: CITIZEN_CONTACT_THEM_URL.replace(':id', claimId),
        textAfter: textAfter,
      },
    });
    this._claimSummarySections.push(linkSection);
    return this;
  }

  addButtonOpensNewTab(title: string, href: string) {
    const newTabButtonSection = ({
      type: ClaimSummaryType.NEW_TAB_BUTTON,
      data: {
        text: title,
        href: href,
      },
    });
    this._claimSummarySections.push(newTabButtonSection);
    return this;
  }

  addResponseDocumentLink(text: string, claimId: string, documentId: string, variables?: any, textAfter?: string) {
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        variables: variables,
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', documentId),
        textAfter: textAfter,
      },
    });
    this._claimSummarySections.push(linkSection);
    return this;
  }

  addWarning(text: string, variables?: any) {
    const warningSection = ({
      type: ClaimSummaryType.WARNING,
      data: {
        text: text,
        variables: variables,
      },
    });
    this._claimSummarySections.push(warningSection);
    return this;
  }

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
