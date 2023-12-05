import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';

export class PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];

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

  addLeadParagraph(text: string, variables?: unknown, classes?: string) {
    const leadParagraphSection = ({
      type: ClaimSummaryType.LEAD_PARAGRAPH,
      data: {
        text: text,
        variables: variables,
        classes: classes,
      },
    });
    this._claimSummarySections.push(leadParagraphSection);
    return this;
  }

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

  addInsetText(text: string, variables?: unknown) {
    const insetSection = ({
      type: ClaimSummaryType.INSET_TEXT,
      data: {
        html: t(text),
        variables: variables,
      },
    });
    this._claimSummarySections.push(insetSection);
    return this;
  }

  addRawHtml(html: string, variables?: any) {
    const htmlSection = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: html,
        variables: variables,
      },
    });
    this._claimSummarySections.push(htmlSection);
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

  addMicroText(microText: string, variables?: unknown) {
    const microTextSection = ({
      type: ClaimSummaryType.MICRO_TEXT,
      data: {
        text: microText,
        variables: variables,
      },
    });
    this._claimSummarySections.push(microTextSection);
    return this;
  }

  addButtonWithCancelLink(title: string, href: string, startButton = false, cancelHref?: string) {
    const startButtonSection = ({
      type: ClaimSummaryType.BUTTON_WITH_CANCEL_LINK,
      data: {
        text: title,
        href: href,
        isStartButton: startButton,
        cancelHref: cancelHref,
      },
    });
    this._claimSummarySections.push(startButtonSection);
    return this;
  }
  build() {
    return this._claimSummarySections;
  }
}
