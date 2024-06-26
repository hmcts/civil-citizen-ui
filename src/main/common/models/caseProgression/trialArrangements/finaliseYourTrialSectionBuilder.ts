import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {UploadYourDocumentsSectionBuilder} from 'models/caseProgression/uploadYourDocumentsSectionBuilder';
export class FinaliseYourTrialSectionBuilder extends UploadYourDocumentsSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];

  addLeadParagraph(text: string, variables?: unknown, classes?: string) {
    const leadParagraphSectionWithNoMargin = ({
      type: ClaimSummaryType.LEAD_PARAGRAPH,
      data: {
        text: text,
        variables: variables,
        classes: classes,
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

  addStartButtonWithLink(title: string, href: string, cancelHref: string) {
    const startButtonSection = ({
      type: ClaimSummaryType.BUTTON_WITH_CANCEL_LINK,
      data: {
        text: title,
        href: href,
        isStartButton: true,
        cancelHref: cancelHref,
      },
    });
    this._claimSummarySections.push(startButtonSection);
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

  build() {
    return this._claimSummarySections;
  }
}
