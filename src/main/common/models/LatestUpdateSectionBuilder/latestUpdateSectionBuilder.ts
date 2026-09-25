import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {buildCaseDocumentDownloadUrl} from 'common/utils/formatDocumentURL';

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

  addResponseDocumentLink(text: string, claimId: string, documentId: string | null, variables?: any, textAfter?: string) {
    const href = buildCaseDocumentDownloadUrl(claimId, documentId);
    if (!href) {
      this._claimSummarySections.push({
        type: ClaimSummaryType.PARAGRAPH,
        data: {
          text: text,
          variables: variables,
        },
      });
      return this;
    }
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        variables: variables,
        href,
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

  build() {
    return this._claimSummarySections;
  }
}
