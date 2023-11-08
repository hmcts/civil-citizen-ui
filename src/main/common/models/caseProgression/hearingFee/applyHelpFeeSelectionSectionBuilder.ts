import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
export class ApplyHelpFeeSelectionSectionBuilder extends PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];

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

  build() {
    return this._claimSummarySections;
  }
}
