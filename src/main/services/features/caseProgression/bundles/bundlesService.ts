import {Claim} from 'models/claim';
import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {TableCell} from 'models/summaryList/summaryList';
import {formatStringDateDMY, formatStringTimeHMS} from 'common/utils/dateUtils';
import {Bundle} from 'models/caseProgression/bundles/bundle';
import {CASE_DOCUMENT_DOWNLOAD_URL, MAKE_APPLICATION_TO_COURT} from 'routes/urls';
import {t} from 'i18next';

export function getBundlesContent(claim: Claim, lang: string): ClaimSummaryContent[] {

  const tableHeaders = getTableHeaders(lang);
  const tableRows = getTableRows(claim);

  const bundlesSection = new LatestUpdateSectionBuilder()
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

  orderBundlesNewToOld(bundles);

  for(const bundle of bundles){
    const creationDateFormatted = formatStringDateDMY(bundle.createdOn);
    const creationTimeFormatted = formatStringTimeHMS(bundle.createdOn);
    const hearingDateFormatted = formatStringDateDMY(bundle.bundleHearingDate);

    tableRows.push([{html: bundle.title}, {html: `${creationDateFormatted}, ${creationTimeFormatted}`}, {html: hearingDateFormatted}, {html: getBundleLink(bundle, claim.id)}]);
  }

  return tableRows;
}

function getBundleLink(bundle: Bundle, claimId: string): string {

  const binaryUrl = bundle.stitchedDocument?.document_binary_url;
  const url = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', binaryUrl);
  const fileName = bundle.stitchedDocument?.document_filename;

  return `<a class="govuk-link" href="${url}">${fileName}</a>`;
}

export function orderBundlesNewToOld(documentsWithDates: Bundle[]): Bundle[] {

  documentsWithDates.sort((a: Bundle, b: Bundle) => {

    return +b.createdOn - +a.createdOn;
  });

  return documentsWithDates;
}
