import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {
  getViewBundle,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/viewBundleContent';

describe('test getViewBundle method', () => {
  const BUNDLE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.BUNDLE';

  it('should have view bundle content', () => {
    //Given
    const viewBundleContentExpected: ClaimSummarySection[] = new LatestUpdateSectionBuilder()
      .addTitle(`${BUNDLE_CONTENT}.TITLE`)
      .addParagraph(`${BUNDLE_CONTENT}.BUNDLE_CONTAINS_ALL_DOCUMENTS`)
      .addParagraph(`${BUNDLE_CONTENT}.YOU_ARE_REMINDED`)
      .addButton(`${BUNDLE_CONTENT}.VIEW_BUNDLE`, 'href') // TODO - add an actual href once available after work on CIV-9800 is done;
      .build();

    //When
    const viewBundleContent = getViewBundle();

    //Then
    expect(viewBundleContent).toEqual(viewBundleContentExpected);
  });
});
