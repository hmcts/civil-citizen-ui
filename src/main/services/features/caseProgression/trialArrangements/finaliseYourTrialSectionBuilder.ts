import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export class FinaliseYourTrialSectionBuilder extends PageSectionBuilder {
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

  addParagraphWithHTML(text: string, variables?: any) {
    const paragraphSection = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: '<p class="govuk-body">'+text+'</p>',
        variables: variables,
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

  build() {
    return this._claimSummarySections;
  }
}
