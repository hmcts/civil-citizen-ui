import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
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
  
  addLeadParagraphWithNoBottomMargin(text: string, variables?: unknown) {
    const leadParagraphSectionWithNoMargin = ({
      type: ClaimSummaryType.LEAD_PARAGRAPH_WITH_NO_BOTTOM_MARGIN,
      data: {
        text: text,
        variables: variables,
      },
    });
    this._claimSummarySections.push(leadParagraphSectionWithNoMargin);
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

  addInsetText(text: string, text1: string, text2: string, variables?: any) {
    const insetSection = ({
      type: ClaimSummaryType.INSET_TEXT,
      data: {
        html: '<STRONG>'+ t(text) +'</STRONG>' + t(text1) +'<P>' + t(text2) +'</P>',
        variables: variables,
      },
    });
    this._claimSummarySections.push(insetSection);
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

  build() {
    return this._claimSummarySections;
  }
}
