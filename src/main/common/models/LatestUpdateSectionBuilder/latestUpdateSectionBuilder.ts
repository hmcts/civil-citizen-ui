import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {CASE_DOCUMENT_DOWNLOAD_URL, CITIZEN_CONTACT_THEM_URL} from 'routes/urls';

export class LatestUpdateSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];

  addTitle(title: string, variables?: any) {
    const titleSection = ({
      type: ClaimSummaryType.TITLE,
      data: {
        text: title,
        variables: variables,
      },
    });
    this._claimSummarySections.push(titleSection);
    return this;
  }

  addParagraph(text: string, variables?: any) {
    const paragraphSection = ({
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: text,
        variables: variables,
      },
    });
    this._claimSummarySections.push(paragraphSection);
    return this;
  }

  addLink(text: string, href: string, textBefore?: string, textAfter?: string, variables?: any) {
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        href: href,
        textBefore: textBefore,
        textAfter: textAfter,
        variables: variables,
      },
    });

    this._claimSummarySections.push(linkSection);
    return this;
  }

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
  addResponseDocumentLink(text: string, claimId: string, documentUri: string, variables?: any, textAfter?: string) {
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        variables: variables,
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentType', documentUri),
        textAfter: textAfter,
      },
    });

    this._claimSummarySections.push(linkSection);
    return this;
  }

  addButton(title: string, href: string) {
    const titleSection = ({
      type: ClaimSummaryType.BUTTON,
      data: {
        text: title,
        //TODO: (href) in here in the future we should added the document url(is in development)
        href: href,
      },
    });

    this._claimSummarySections.push(titleSection);
    return this;
  }
  build() {
    return this._claimSummarySections;
  }
}
