import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';

const BUNDLE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.BUNDLE';
export const getViewBundle = (): ClaimSummarySection[] => {
  const bundleTitle = `${BUNDLE_CONTENT}.TITLE`;
  const bundleContains = `${BUNDLE_CONTENT}.BUNDLE_CONTAINS_ALL_DOCUMENTS`;
  const reminder = `${BUNDLE_CONTENT}.YOU_ARE_REMINDED`;
  const viewBundleButtonText = `${BUNDLE_CONTENT}.VIEW_BUNDLE`;
  const viewBundleButtonHref = 'href'; // TODO - add an actual href once available after work on CIV-9800 is done;

  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(bundleTitle)
    .addParagraph(bundleContains)
    .addParagraph(reminder)
    .addButton(viewBundleButtonText, viewBundleButtonHref);
  return latestUpdateSectionBuilder.build();
};
