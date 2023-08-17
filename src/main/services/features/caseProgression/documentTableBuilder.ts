import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  UploadDocumentTypes,
  UploadEvidenceDocumentType, UploadEvidenceExpert,
  UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {TableCell} from 'models/summaryList/summaryList';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {t} from 'i18next';
import {TabSectionBuilder} from 'models/caseProgression/TabSectionBuilder';

export function getEvidenceUploadDocuments(claim: Claim, lang: string): ClaimSummarySection[] {

  const disclosureHeading = 'PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS';
  const witnessHeading = 'PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE';
  const expertHeading = 'PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE';
  const trialOrHearingHeading: string = claim.isFastTrackClaim ? 'PAGES.CLAIM_SUMMARY.TRIAL_DOCUMENTS': 'PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS';

  const disclosureListClaimant = claim.caseProgression?.claimantUploadDocuments?.disclosure;
  const witnessListClaimant = claim.caseProgression?.claimantUploadDocuments?.witness;
  const expertListClaimant = claim.caseProgression?.claimantUploadDocuments?.expert;
  const trialListClaimant = claim.caseProgression?.claimantUploadDocuments?.trial;

  const disclosureListDefendant = claim.caseProgression?.defendantUploadDocuments?.disclosure;
  const witnessListDefendant = claim.caseProgression?.defendantUploadDocuments?.witness;
  const expertListDefendant = claim.caseProgression?.defendantUploadDocuments?.expert;
  const trialListDefendant = claim.caseProgression?.defendantUploadDocuments?.trial;

  const wrap = 'tableWrap';

  const evidenceUploadTab = new TabSectionBuilder()
    .addParagraph('PAGES.CLAIM_SUMMARY.EVIDENCE_UPLOAD_SUMMARY')
    .addTable(getTableHeaders(disclosureHeading, disclosureListClaimant, true, lang), getTableRows(disclosureListClaimant, true, lang), wrap)
    .addTable(getTableHeaders(disclosureHeading, disclosureListDefendant, false, lang), getTableRows(disclosureListDefendant, false, lang), wrap)
    .addTable(getTableHeaders(witnessHeading, witnessListClaimant, true, lang), getTableRows(witnessListClaimant, true, lang), wrap)
    .addTable(getTableHeaders(witnessHeading, witnessListDefendant, false, lang), getTableRows(witnessListDefendant, false, lang), wrap)
    .addTable(getTableHeaders(expertHeading, expertListClaimant, true, lang), getTableRows(expertListClaimant, true, lang), wrap)
    .addTable(getTableHeaders(expertHeading, expertListDefendant, false, lang), getTableRows(expertListDefendant, false, lang), wrap)
    .addTable(getTableHeaders(trialOrHearingHeading, trialListClaimant, true, lang), getTableRows(trialListClaimant, true, lang), wrap)
    .addTable(getTableHeaders(trialOrHearingHeading, trialListDefendant, false, lang), getTableRows(trialListDefendant, false, lang), wrap)
    .build();

  return evidenceUploadTab;
}

function getTableHeaders(header: string, rows: UploadDocumentTypes[], isClaimant: boolean, lang: string){
  if(!rows) return null;

  const newHeader = isClaimant == true ? t('PAGES.CLAIM_SUMMARY.CLAIMANT', {lng: lang}) + t(header, {lng: lang}) : t('PAGES.CLAIM_SUMMARY.DEFENDANT', {lng: lang}) + t(header, {lng: lang});

  return [{html: newHeader, classes:'govuk-!-width-one-half'},{html: '', classes: 'govuk-!-width-one-half'}] as TableCell[];
}

function getTableRows(rows: UploadDocumentTypes[], isClaimant: boolean, lang: string) {

  if (!rows) return null;

  const tableRows = [] as TableCell[][];

  orderDocumentNewestToOldest(rows);

  for(const upload of rows)
  {
    const uploadDateString: string  = upload.createdDateTimeFormatted;

    tableRows.push([
      {html: getDocumentTypeName(upload.documentType, isClaimant, lang) + '<br>' + t('PAGES.CLAIM_SUMMARY.DATE_DOCUMENT_UPLOADED', {lng: lang}) + uploadDateString,
        classes: 'govuk-!-width-one-half'},
      {html: getDocumentLink(upload),
        classes: 'govuk-!-width-one-half govuk-table__cell--numeric'}],
    );
  }

  return tableRows;
}

function orderDocumentNewestToOldest(documentsWithDates: UploadDocumentTypes[]): UploadDocumentTypes[] {

  documentsWithDates.sort((a: UploadDocumentTypes, b: UploadDocumentTypes) => {
    return +b.caseDocument?.createdDatetime - +a.caseDocument?.createdDatetime;
  });

  return documentsWithDates;
}

function getDocumentTypeName(documentType: EvidenceUploadDisclosure | EvidenceUploadWitness | EvidenceUploadExpert | EvidenceUploadTrial, isClaimant: boolean, lang: string)
{
  let documentName = isClaimant == true ? t('PAGES.CLAIM_SUMMARY.CLAIMANT', {lng: lang}) : t('PAGES.CLAIM_SUMMARY.DEFENDANT', {lng: lang});

  switch(documentType)
  {
    case EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DOCUMENTS_FOR_DISCLOSURE', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadDisclosure.DISCLOSURE_LIST:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DISCLOSURE_LIST', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadWitness.WITNESS_STATEMENT:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.WITNESS_STATEMENT', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadWitness.WITNESS_SUMMARY:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.WITNESS_SUMMARY', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadWitness.NOTICE_OF_INTENTION:
      documentName = documentName +t('PAGES.CLAIM_SUMMARY.NOTICE_OF_INTENTION', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadWitness.DOCUMENTS_REFERRED:
      documentName = documentName +t('PAGES.CLAIM_SUMMARY.DOCUMENTS_REFERRED_TO_STATEMENT', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadExpert.STATEMENT:
      documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.JOINT_STATEMENT_OF_EXPERTS', {lng: lang});
      break;
    case EvidenceUploadExpert.EXPERT_REPORT:
      documentName = documentName +t('PAGES.CLAIM_SUMMARY.EXPERT_REPORT', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.QUESTIONS_FOR_OTHER_PARTY', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadExpert.ANSWERS_FOR_EXPERTS:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.ANSWERS_TO_QUESTIONS', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadTrial.CASE_SUMMARY:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CASE_SUMMARY', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadTrial.SKELETON_ARGUMENT:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.SKELETON_ARGUMENT', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadTrial.AUTHORITIES:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.LEGAL_AUTHORITIES', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadTrial.COSTS:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.COSTS', {lng: lang}).toLowerCase();
      break;
    case EvidenceUploadTrial.DOCUMENTARY:
      documentName = documentName +t('PAGES.CLAIM_SUMMARY.DOCUMENTARY_EVIDENCE', {lng: lang}).toLowerCase();
      break;
  }
  return documentName;
}

function getDocumentLink (document: UploadDocumentTypes) : string {
  let documentName : string;

  if(document.caseDocument instanceof UploadEvidenceDocumentType)
  {
    documentName = document.caseDocument.documentUpload.document_filename;
  }
  else if(document.caseDocument instanceof  UploadEvidenceWitness)
  {
    documentName = document.caseDocument.witnessOptionDocument.document_filename;
  }
  else if(document.caseDocument instanceof UploadEvidenceExpert)
  {
    documentName = document.caseDocument.expertDocument.document_filename;
  }

  //TODO: href will need to be added - dependent on document download API implementation.
  return '<a class="govuk-link" href="href will need to be connected to document">'+documentName+'</a>';
}
