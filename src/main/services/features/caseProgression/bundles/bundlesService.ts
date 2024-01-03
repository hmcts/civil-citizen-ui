import {Claim} from 'models/claim';
import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {TableCell} from 'models/summaryList/summaryList';
import {MAKE_APPLICATION_TO_COURT} from 'routes/urls';
import {t} from 'i18next';
import {BundlesFormatter} from 'services/features/caseProgression/bundles/bundlesFormatter';
import {formatDocumentViewURL} from 'common/utils/formatDocumentURL';
import {TabSectionBuilder} from 'models/caseProgression/TabSectionBuilder';
import {UploadDocuments, UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {
  UploadedEvidenceFormatter,
} from 'services/features/caseProgression/uploadedEvidenceFormatter';

export function getBundlesContent(claim: Claim, lang: string): ClaimSummaryContent[] {

  const claimSummaryContent = [] as ClaimSummaryContent[];
  claimSummaryContent.push(getBundles(claim, lang));
  claimSummaryContent.push(getUploadedAfterBundle(claim, lang, true));
  claimSummaryContent.push(getUploadedAfterBundle(claim, lang, false));

  return claimSummaryContent;
}

function getBundles(claim: Claim, lang: string): ClaimSummaryContent {

  const tableHeaders = getBundleTableHeaders(lang);
  const tableRows = getBundleTableRows(claim);

  const bundlesSection = new TabSectionBuilder()
    .addParagraph('PAGES.CLAIM_SUMMARY.BUNDLES.FIND_BUNDLE_BELOW')
    .addLink('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_LINK', MAKE_APPLICATION_TO_COURT, 'PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_BEFORE', 'PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_AFTER', null, true)
    .addParagraph('PAGES.CLAIM_SUMMARY.BUNDLES.NEW_DOCUMENT_NOT_INCLUDED')
    .addTable(tableHeaders, tableRows, 'tableWrap')
    .build();

  return {contentSections: bundlesSection, hasDivider: false};
}

function getUploadedAfterBundle(claim: Claim, lang: string, isClaimant: boolean): ClaimSummaryContent {

  const claimantLastUploadDate = claim.caseProgression?.claimantLastUploadDate;
  const defendantLastUploadDate = claim.caseProgression?.defendantLastUploadDate;

  if(isClaimant && (!claimantLastUploadDate || claim.lastBundleCreatedDate() > claimantLastUploadDate)){
    return undefined;
  } else if (!isClaimant && (!defendantLastUploadDate || claim.lastBundleCreatedDate() > defendantLastUploadDate)){
    return undefined;
  }

  const documentUploadedBy = isClaimant
    ? t('PAGES.CLAIM_SUMMARY.BUNDLES.UPLOADED_AFTER_UPLOADED_DOCUMENTS_CLAIMANT', {lng: lang})
    : t('PAGES.CLAIM_SUMMARY.BUNDLES.UPLOADED_AFTER_UPLOADED_DOCUMENTS_DEFENDANT', {lng: lang});

  const uploadedAfterBundlesSection = new TabSectionBuilder()
    .addTitle(documentUploadedBy)
    .addParagraph('PAGES.CLAIM_SUMMARY.BUNDLES.UPLOADED_AFTER_DOCUMENTS_BELOW')
    .addTable(getUploadedAfterTableHeaders(lang), getUploadedAfterTableRows(claim, isClaimant, lang), 'tableWrap')
    .build();

  return {contentSections: uploadedAfterBundlesSection, hasDivider: false};
}

function getBundleTableHeaders(lang: string): TableCell[]{
  const tableHeaders = [] as TableCell[];

  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.BUNDLE_HEADER', {lng:lang})});
  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.CREATED_DATE_HEADER', {lng:lang})});
  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.HEARING_DATE_HEADER', {lng:lang})});
  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.URL_HEADER', {lng:lang})});

  return tableHeaders;
}

function getBundleTableRows(claim: Claim): TableCell[][] {

  const tableRows = [] as TableCell[][];
  const bundles = claim.caseProgression?.caseBundles;

  if(!bundles){
    return null;
  }

  BundlesFormatter.orderBundlesNewToOld(bundles);

  for(const bundle of bundles){

    if(bundle.createdOn && bundle.stitchedDocument) {

      const bundleLink = formatDocumentViewURL(bundle.stitchedDocument?.document_filename, claim.id, bundle.stitchedDocument?.document_binary_url);

      tableRows.push([{html: bundle.title}, {html: bundle.getFormattedCreatedOn}, {html: bundle.getFormattedHearingDate}, {html: bundleLink}]);
    }
  }

  return tableRows;
}

function getUploadedAfterTableHeaders(lang: string): TableCell[]{
  const tableHeaders = [] as TableCell[];

  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.UPLOADED_AFTER_DOCUMENT_NAME', {lng:lang})});
  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.UPLOADED_AFTER_DATE_UPLOADED', {lng:lang})});
  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.UPLOADED_AFTER_DOCUMENT', {lng:lang})});

  return tableHeaders;
}

function getUploadedAfterTableRows(claim: Claim, isClaimant: boolean, lang: string): TableCell[][] {

  const tableRows = [] as TableCell[][];

  let uploadedDocuments: UploadDocuments;

  if(isClaimant){
    uploadedDocuments = claim.caseProgression?.claimantUploadDocuments;
  } else {
    uploadedDocuments = claim.caseProgression?.defendantUploadDocuments;
  }

  if(!uploadedDocuments) {
    return undefined;
  }

  if(uploadedDocuments.disclosure && uploadedDocuments.disclosure.length > 0) {
    uploadedDocuments.disclosure?.forEach(element => {
      addUploadedAfterBundleToTable(element, claim, tableRows, lang);
    });
  }

  if(uploadedDocuments.witness && uploadedDocuments.witness.length > 0) {
    uploadedDocuments.witness?.forEach(element => {
      addUploadedAfterBundleToTable(element, claim, tableRows, lang);
    });
  }

  if(uploadedDocuments.expert && uploadedDocuments.expert.length > 0) {
    uploadedDocuments.expert?.forEach(element => {
      addUploadedAfterBundleToTable(element, claim, tableRows, lang);
    });
  }

  if(uploadedDocuments.trial && uploadedDocuments.trial.length > 0) {
    uploadedDocuments.trial?.forEach(element => {
      addUploadedAfterBundleToTable(element, claim, tableRows, lang);
    });
  }

  return tableRows;
}

function addUploadedAfterBundleToTable(document: UploadDocumentTypes, claim: Claim, tableRows: TableCell[][], lang: string){
  if(document.caseDocument?.createdDatetime > claim.lastBundleCreatedDate()){
    const documentTypeName = UploadedEvidenceFormatter.getDocumentTypeName(document.documentType, lang);
    const documentLink = UploadedEvidenceFormatter.getDocumentLink(document, claim.id);

    tableRows.push([{html: documentTypeName}, {html: document.createdDateTimeFormatted}, {html: documentLink}]);
  }
}
