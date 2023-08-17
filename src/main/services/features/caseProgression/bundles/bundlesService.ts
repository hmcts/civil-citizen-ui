import {Claim} from 'models/claim';
import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {TableCell} from 'models/summaryList/summaryList';
import {MAKE_APPLICATION_TO_COURT} from 'routes/urls';
import {t} from 'i18next';
import {BundlesFormatter} from 'services/features/caseProgression/bundles/bundlesFormatter';
import {formatDocumentDownloadURL} from 'common/utils/formatDocumentURL';
import {TabSectionBuilder} from 'models/caseProgression/TabSectionBuilder';

export function getBundlesContent(claim: Claim, lang: string): ClaimSummaryContent[] {

  const tableHeaders = getTableHeaders(lang);
  const tableRows = getTableRows(claim);

  const bundlesSection = new TabSectionBuilder()
    .addParagraph('PAGES.CLAIM_SUMMARY.BUNDLES.FIND_BUNDLE_BELOW')
    .addLink('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_LINK', MAKE_APPLICATION_TO_COURT, 'PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_BEFORE', 'PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_AFTER', null, true)
    .addParagraph('PAGES.CLAIM_SUMMARY.BUNDLES.NEW_DOCUMENT_NOT_INCLUDED')
    .addTable(tableHeaders, tableRows, 'tableWrap')
    .build();

  return [{contentSections: bundlesSection, hasDivider: false}];
}

function getTableHeaders(lang: string): TableCell[]{
  const tableHeaders = [] as TableCell[];

  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.BUNDLE_HEADER', {lng:lang})});
  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.CREATED_DATE_HEADER', {lng:lang})});
  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.HEARING_DATE_HEADER', {lng:lang})});
  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.URL_HEADER', {lng:lang})});

  return tableHeaders;
}

function getTableRows(claim: Claim): TableCell[][] {

  const tableRows = [] as TableCell[][];
  const bundles = claim.caseProgression?.caseBundles;

  if(!bundles){
    return null;
  }

  BundlesFormatter.orderBundlesNewToOld(bundles);

  for(const bundle of bundles){

    if(bundle.createdOn && bundle.stitchedDocument) {
      const bundleLink = formatDocumentDownloadURL(bundle.stitchedDocument?.document_filename, claim.id, bundle.stitchedDocument?.document_binary_url);

      tableRows.push([{html: bundle.title}, {html: bundle.getFormattedCreatedOn}, {html: bundle.getFormattedHearingDate}, {html: bundleLink}]);
    }
  }

  return tableRows;
}
