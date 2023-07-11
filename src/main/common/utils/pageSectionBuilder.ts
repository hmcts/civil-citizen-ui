import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';

export class PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];
  addTitle(title: string, variables?: unknown, classes?: string) {
    const titleSection = ({
      type: ClaimSummaryType.TITLE,
      data: {
        text: title,
        variables: variables,
        classes: classes,
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
  addLink(text: string, href: string, textBefore?: string, textAfter?: string, variables?: any, externalLink = false) {
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        href: href,
        textBefore: textBefore,
        textAfter: textAfter,
        variables: variables,
        externalLink,
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

  build() {
    return this._claimSummarySections;
  }
}
