import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export class hearingFeePageBuilder extends PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];
  build() {
    return this._claimSummarySections;
  }
}
