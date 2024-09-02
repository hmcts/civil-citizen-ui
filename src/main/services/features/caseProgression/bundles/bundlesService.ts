import {Claim} from 'models/claim';
import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {TableCell} from 'models/summaryList/summaryList';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, MAKE_APPLICATION_TO_COURT} from 'routes/urls';
import {t} from 'i18next';
import {BundlesFormatter} from 'services/features/caseProgression/bundles/bundlesFormatter';
import {formatDocumentViewURL} from 'common/utils/formatDocumentURL';
import {TabSectionBuilder} from 'models/caseProgression/TabSectionBuilder';
import {UploadDocuments, UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {
  UploadedEvidenceFormatter,
} from 'services/features/caseProgression/uploadedEvidenceFormatter';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {formatDateSlash} from 'common/utils/dateUtils';

export function getBundlesContent(claimId: string, claim: Claim, lang: string): ClaimSummaryContent[] {

  const claimSummaryContent = [] as ClaimSummaryContent[];
  claimSummaryContent.push(getBundles(claimId, claim, lang));
  claimSummaryContent.push(getUploadedAfterBundle(claimId, claim, lang, true));
  claimSummaryContent.push(getUploadedAfterBundle(claimId, claim, lang, false));
  claimSummaryContent.push(getButton(claimId, claim, lang));

  return claimSummaryContent;
}

function getButton(claimId: string, claim: Claim, lang: string): ClaimSummaryContent {

  const redirectUrl = claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL;

  const buttonSection = new TabSectionBuilder()
    .addButton('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW', constructResponseUrlWithIdParams(claimId, redirectUrl))
    .build();

  return {contentSections: buttonSection, hasDivider: false};
}

function getBundles(claimId: string, claim: Claim, lang: string): ClaimSummaryContent {

  const tableRows = getBundleTableRows(claimId, claim, lang);

  const bundlesSection = new TabSectionBuilder()
    .addParagraph('PAGES.CLAIM_SUMMARY.BUNDLES.FIND_BUNDLE_BELOW')
    .addLink('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_LINK', MAKE_APPLICATION_TO_COURT, 'PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_BEFORE', 'PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_AFTER', null, true)
    .addParagraph('PAGES.CLAIM_SUMMARY.BUNDLES.NEW_DOCUMENT_NOT_INCLUDED')
    .addTable(getTableHeaders(lang), tableRows, 'tableWrap')
    .build();

  return {contentSections: bundlesSection, hasDivider: false};
}

function getUploadedAfterBundle(claimId: string, claim: Claim, lang: string, isClaimant: boolean): ClaimSummaryContent {

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
    .addTable(getTableHeaders(lang), getUploadedAfterTableRows(claimId, claim, isClaimant, lang), 'tableWrap')
    .build();

  return {contentSections: uploadedAfterBundlesSection, hasDivider: false};
}

function getBundleTableRows(claimId: string, claim: Claim, lng: string): TableCell[][] {

  const tableRows = [] as TableCell[][];
  const bundles = claim.caseProgression?.caseBundles;

  if(!bundles || bundles.length === 0){
    return null;
  }

  BundlesFormatter.orderBundlesNewToOld(bundles);

  let i = 0;
  for(const bundle of bundles){

    if(bundle.createdOn && bundle.stitchedDocument) {
      const bundleLink = formatDocumentViewURL(bundle.stitchedDocument?.document_filename, claimId, bundle.stitchedDocument?.document_binary_url);
      const bundleNumber = bundles.length-i;
      tableRows.push([
        {html: t('PAGES.CLAIM_SUMMARY.BUNDLES.DOCUMENT_TITLE', lng) + ' ' + bundleNumber},
        {html: formatDateSlash(bundle.createdOn)},
        {html: bundleLink},
      ]);
      i++;
    }
  }

  return tableRows;
}

function getTableHeaders(lang: string): TableCell[]{
  const tableHeaders = [] as TableCell[];

  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.DOCUMENT_NAME', {lng:lang})});
  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.DATE_UPLOADED', {lng:lang})});
  tableHeaders.push({html: t('PAGES.CLAIM_SUMMARY.BUNDLES.DOCUMENT', {lng:lang})});

  return tableHeaders;
}

function getUploadedAfterTableRows(claimId: string, claim: Claim, isClaimant: boolean, lang: string): TableCell[][] {

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
      addUploadedAfterBundleToTable(element, claimId, claim, tableRows, lang);
    });
  }

  if(uploadedDocuments.witness && uploadedDocuments.witness.length > 0) {
    uploadedDocuments.witness?.forEach(element => {
      addUploadedAfterBundleToTable(element, claimId,claim, tableRows, lang);
    });
  }

  if(uploadedDocuments.expert && uploadedDocuments.expert.length > 0) {
    uploadedDocuments.expert?.forEach(element => {
      addUploadedAfterBundleToTable(element, claimId,claim, tableRows, lang);
    });
  }

  if(uploadedDocuments.trial && uploadedDocuments.trial.length > 0) {
    uploadedDocuments.trial?.forEach(element => {
      addUploadedAfterBundleToTable(element, claimId,claim, tableRows, lang);
    });
  }

  return tableRows;
}

function addUploadedAfterBundleToTable(document: UploadDocumentTypes, claimId: string, claim: Claim, tableRows: TableCell[][], lang: string){
  if(document.caseDocument?.createdDatetime > claim.lastBundleCreatedDate()){
    const documentTypeName = UploadedEvidenceFormatter.getDocumentTypeName(document.documentType, lang);
    const documentLink = UploadedEvidenceFormatter.getDocumentLink(document, claimId);

    tableRows.push([{html: documentTypeName}, {html: formatDateSlash(document?.caseDocument?.createdDatetime)}, {html: documentLink}]);
  }
}
