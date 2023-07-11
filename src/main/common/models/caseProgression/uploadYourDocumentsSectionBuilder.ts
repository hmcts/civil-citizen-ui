import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
export class UploadYourDocumentsSectionBuilder extends PageSectionBuilder {
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

  addStartButton(title: string, href: string) {
    const startButtonSection = ({
      type: ClaimSummaryType.BUTTON,
      data: {
        text: title,
        //TODO: (href) in the future we should add in here the document url (it is in development)
        href: href,
        isStartButton: true,
      },
    });
    this._claimSummarySections.push(startButtonSection);
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

  build() {
    return this._claimSummarySections;
  }
}
