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
import {
  addEvidenceUploadDescription,
  addEvidenceUploadTable,
} from 'models/caseProgression/uploadDocumentsTableSectionBuilder';

export function getEvidenceUploadDocuments(claim: Claim): ClaimSummarySection[] {

  const documentTables = [] as ClaimSummarySection[];
  const trialOrHearing: string = claim.isFastTrackClaim ? 'PAGES.CLAIM_SUMMARY.TRIAL_DOCUMENTS': 'PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS';

  documentTables.push(addEvidenceUploadDescription());

  documentTables.push(getDocumentTypeTable('PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS', claim.caseProgression?.claimantUploadDocuments?.disclosure, true));
  documentTables.push(getDocumentTypeTable('PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS', claim.caseProgression?.defendantUploadDocuments?.disclosure, false));

  documentTables.push(getDocumentTypeTable('PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE', claim.caseProgression?.claimantUploadDocuments?.witness, true));
  documentTables.push(getDocumentTypeTable('PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE', claim.caseProgression?.defendantUploadDocuments?.witness, false));

  documentTables.push(getDocumentTypeTable('PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE', claim.caseProgression?.claimantUploadDocuments?.expert, true));
  documentTables.push(getDocumentTypeTable('PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE', claim.caseProgression?.defendantUploadDocuments?.expert, false));

  documentTables.push(getDocumentTypeTable(trialOrHearing, claim.caseProgression?.claimantUploadDocuments?.trial, true));
  documentTables.push(getDocumentTypeTable(trialOrHearing, claim.caseProgression?.defendantUploadDocuments?.trial, false));

  return documentTables;
}

function getDocumentTypeTable(header: string, rows: UploadDocumentTypes[], isClaimant: boolean) : ClaimSummarySection {

  if (!rows) return undefined;

  const tableRows = [] as TableCell[][];

  orderDocumentNewestToOldest(rows);

  for(const upload of rows)
  {
    const uploadDateString: string  = upload.createdDateTimeFormatted;

    tableRows.push([
      {html: getDocumentTypeName(upload.documentType, isClaimant) + '<br>' + t('PAGES.CLAIM_SUMMARY.DATE_DOCUMENT_UPLOADED') + uploadDateString,
        classes: 'govuk-!-width-one-half'},
      {html: getDocumentLink(upload),
        classes: 'govuk-!-width-one-half govuk-table__cell--numeric'}],
    );
  }

  return addEvidenceUploadTable(header, isClaimant, tableRows);
}

function orderDocumentNewestToOldest(documentsWithDates: UploadDocumentTypes[]): UploadDocumentTypes[] {

  documentsWithDates.sort((a: UploadDocumentTypes, b: UploadDocumentTypes) => {
    return +b.caseDocument?.createdDatetime - +a.caseDocument?.createdDatetime;
  });

  return documentsWithDates;
}

function getDocumentTypeName(documentType: EvidenceUploadDisclosure | EvidenceUploadWitness | EvidenceUploadExpert | EvidenceUploadTrial, isClaimant: boolean)
{
  let documentName = isClaimant == true ? t('PAGES.CLAIM_SUMMARY.CLAIMANT') : t('PAGES.CLAIM_SUMMARY.DEFENDANT');

  switch(documentType)
  {
    case EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DOCUMENTS_FOR_DISCLOSURE').toLowerCase();
      break;
    case EvidenceUploadDisclosure.DISCLOSURE_LIST:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DISCLOSURE_LIST').toLowerCase();
      break;
    case EvidenceUploadWitness.WITNESS_STATEMENT:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.WITNESS_STATEMENT').toLowerCase();
      break;
    case EvidenceUploadWitness.WITNESS_SUMMARY:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.WITNESS_SUMMARY').toLowerCase();
      break;
    case EvidenceUploadWitness.NOTICE_OF_INTENTION:
      documentName = documentName +t('PAGES.CLAIM_SUMMARY.NOTICE_OF_INTENTION').toLowerCase();
      break;
    case EvidenceUploadWitness.DOCUMENTS_REFERRED:
      documentName = documentName +t('PAGES.CLAIM_SUMMARY.DOCUMENTS_REFERRED_TO_STATEMENT').toLowerCase();
      break;
    case EvidenceUploadExpert.STATEMENT:
      documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.JOINT_STATEMENT_OF_EXPERTS');
      break;
    case EvidenceUploadExpert.EXPERT_REPORT:
      documentName = documentName +t('PAGES.CLAIM_SUMMARY.EXPERT_REPORT').toLowerCase();
      break;
    case EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.QUESTIONS_FOR_OTHER_PARTY').toLowerCase();
      break;
    case EvidenceUploadExpert.ANSWERS_FOR_EXPERTS:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.ANSWERS_TO_QUESTIONS').toLowerCase();
      break;
    case EvidenceUploadTrial.CASE_SUMMARY:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CASE_SUMMARY').toLowerCase();
      break;
    case EvidenceUploadTrial.SKELETON_ARGUMENT:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.SKELETON_ARGUMENT').toLowerCase();
      break;
    case EvidenceUploadTrial.AUTHORITIES:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.LEGAL_AUTHORITIES').toLowerCase();
      break;
    case EvidenceUploadTrial.COSTS:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.COSTS').toLowerCase();
      break;
    case EvidenceUploadTrial.DOCUMENTARY:
      documentName = documentName +t('PAGES.CLAIM_SUMMARY.DOCUMENTARY_EVIDENCE').toLowerCase();
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
