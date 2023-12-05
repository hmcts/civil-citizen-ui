import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {DEFENDANT_SUMMARY_TAB_URL} from 'routes/urls';
import {TabId} from 'routes/tabs';
import {Claim} from 'models/claim';

const BUNDLE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.BUNDLE';
export const getViewBundle = (claim: Claim): ClaimSummarySection[] => {
  const bundleTitle = `${BUNDLE_CONTENT}.TITLE`;
  const bundleContains = `${BUNDLE_CONTENT}.BUNDLE_CONTAINS_ALL_DOCUMENTS`;
  const reminder = `${BUNDLE_CONTENT}.YOU_ARE_REMINDED`;
  const viewBundleButtonText = `${BUNDLE_CONTENT}.VIEW_BUNDLE`;
  const viewBundleButtonHref = DEFENDANT_SUMMARY_TAB_URL.replace(':id', claim.id).replace(':tab', TabId.BUNDLES);

  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(bundleTitle)
    .addParagraph(bundleContains)
    .addParagraph(reminder)
    .addButton(viewBundleButtonText, viewBundleButtonHref);
  return latestUpdateSectionBuilder.build();
};
