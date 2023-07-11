import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';

export class PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];
  addTitle(title: string, variables?: any, classes?: string) {
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

  addParagraph(text: string, variables?: any, classes?: string) {
    const paragraphSection = ({
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: text,
        variables: variables,
        classes: classes,
      },
    });
    this._claimSummarySections.push(paragraphSection);
    return this;
  }
<<<<<<< HEAD
  addLink(text: string, href: string, textBefore?: string, textAfter?: string, variables?: any, externalLink = false) {
=======

  addLink(text: string, href: string, textBefore?: string, textAfter?: string, variables?: any) {
>>>>>>> bbc4fd27a (CIV-9198 - Added page for hearing duration and other information in trial arrangements)
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
