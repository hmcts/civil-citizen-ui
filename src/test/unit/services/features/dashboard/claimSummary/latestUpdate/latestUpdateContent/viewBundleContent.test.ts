import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {
  getViewBundle,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/viewBundleContent';
import {DEFENDANT_SUMMARY_TAB_URL} from 'routes/urls';
import {TabId} from 'routes/tabs';
import {Claim} from 'models/claim';

describe('test getViewBundle method', () => {
  const BUNDLE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.BUNDLE';

  it('should have view bundle content', () => {
    //Given
    const claim = new Claim();
    claim.id = '1234';
    const viewBundleContentExpected: ClaimSummarySection[] = new LatestUpdateSectionBuilder()
      .addTitle(`${BUNDLE_CONTENT}.TITLE`)
      .addParagraph(`${BUNDLE_CONTENT}.BUNDLE_CONTAINS_ALL_DOCUMENTS`)
      .addParagraph(`${BUNDLE_CONTENT}.YOU_ARE_REMINDED`)
      .addButton(`${BUNDLE_CONTENT}.VIEW_BUNDLE`, DEFENDANT_SUMMARY_TAB_URL.replace(':id', claim.id).replace(':tab', TabId.BUNDLES))
      .build();

    //When
    const viewBundleContent = getViewBundle(claim);

    //Then
    expect(viewBundleContent).toEqual(viewBundleContentExpected);
  });
});
