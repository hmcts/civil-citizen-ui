import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {CASE_DOCUMENT_DOWNLOAD_URL, CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {DocumentUri} from 'models/document/documentType';

export class PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];
  addCaption(caption: string, variables?: any) {
    const captionSection = ({
      type: ClaimSummaryType.CAPTION,
      data: {
        text: caption,
        variables: variables,
      },
    });
    this._claimSummarySections.push(captionSection);
    return this;
  }

  addMainTitle(mainTitle: string, variables?: unknown) {
    const mainTitleSection = ({
      type: ClaimSummaryType.MAINTITLE,
      data: {
        text: mainTitle,
        variables: variables,
      },
    });
    this._claimSummarySections.push(mainTitleSection);
    return this;
  }

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

  addLeadParagraph(text: string, variables?: unknown) {
    const leadParagraphSection = ({
      type: ClaimSummaryType.LEAD_PARAGRAPH,
      data: {
        text: text,
        variables: variables,
      },
    });
    this._claimSummarySections.push(leadParagraphSection);
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
  addResponseDocumentLink(text: string, claimId: string, variables?: any, textAfter?: string) {
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        variables: variables,
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentType', DocumentUri.SEALED_CLAIM),
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
        href: href,
      },
    });

    this._claimSummarySections.push(titleSection);
    return this;
  }

  addStartButton(title: string, href: string) {
    const startButtonSection = ({
      type: ClaimSummaryType.BUTTON,
      data: {
        text: title,
        //TODO: (href) in here in the future we should added the document url(is in development)
        href: href,
        isStartButton: true,
      },
    });

    this._claimSummarySections.push(startButtonSection);
    return this;
  }
  build() {
    return this._claimSummarySections;
  }
}
