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
import {formatStringDateDMY} from 'common/utils/dateUtils';
import {addEvidenceUploadTable} from 'models/caseProgression/uploadDocumentsTableSectionBuilder';
import {TypesOfEvidenceUploadDocuments} from 'models/caseProgression/TypesOfEvidenceUploadDocument';

export function getEvidenceUploadDocuments(claim: Claim): ClaimSummarySection[] {

  const documentTables = [] as ClaimSummarySection[];
  const trialOrHearing: string = claim.isFastTrackClaim ? t('PAGES.CLAIM_SUMMARY.TRIAL_DOCUMENTS'): t('PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS');

  documentTables.push(getDocumentTypeTable(t('PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS'), claim.caseProgression?.claimantUploadDocuments?.disclosure, true));
  documentTables.push(getDocumentTypeTable(t('PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS'), claim.caseProgression?.defendantUploadDocuments?.disclosure, false));

  documentTables.push(getDocumentTypeTable(t('PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE'), claim.caseProgression?.claimantUploadDocuments?.witness, true));
  documentTables.push(getDocumentTypeTable(t('PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE'), claim.caseProgression?.defendantUploadDocuments?.witness, false));

  documentTables.push(getDocumentTypeTable(t('PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE'), claim.caseProgression?.claimantUploadDocuments?.expert, true));
  documentTables.push(getDocumentTypeTable(t('PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE'), claim.caseProgression?.defendantUploadDocuments?.expert, false));

  documentTables.push(getDocumentTypeTable(trialOrHearing, claim.caseProgression?.claimantUploadDocuments?.trial, true));
  documentTables.push(getDocumentTypeTable(trialOrHearing, claim.caseProgression?.defendantUploadDocuments?.trial, false));

  return documentTables;
}

function getDocumentTypeTable(header: string, rows: UploadDocumentTypes[], isClaimant: boolean) : ClaimSummarySection {

  if (!rows) return undefined;

  const tableRows = [] as TableCell[][];

  rows.sort((a: UploadDocumentTypes, b: UploadDocumentTypes) => {
    //Sort in order of upload - newest to oldest
    return  new Date(b.caseDocument?.createdDatetime).getTime() - new Date(a.caseDocument?.createdDatetime).getTime();
  });

  for(const upload of rows)
  {
    const uploadDate: Date = new Date(upload.caseDocument.createdDatetime);
    const uploadDateString: string  = formatStringDateDMY(uploadDate.toISOString());

    tableRows.push([
      {html: getDocumentTypeName(upload.documentType, isClaimant) + '<br>' + t('PAGES.CLAIM_SUMMARY.DATE_DOCUMENT_UPLOADED') + uploadDateString},
      {html: getDocumentLink(upload)}],
    );
  }

  return addEvidenceUploadTable(header, isClaimant, tableRows);
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
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DOCUMENTS_REFERRED_TO_STATEMENT').toLowerCase();
      break;
    case EvidenceUploadExpert.STATEMENT:
      documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.JOINT_STATEMENT_OF_EXPERTS');
      break;
    case EvidenceUploadExpert.EXPERT_REPORT:
      documentName = documentName +t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.EXPERTS_REPORT').toLowerCase();
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

  if(TypesOfEvidenceUploadDocuments.DOCUMENT_TYPE in document.caseDocument)
  {
    document.caseDocument = document.caseDocument as UploadEvidenceDocumentType;
    documentName = document.caseDocument.documentUpload.document_filename;
  }
  else if(TypesOfEvidenceUploadDocuments.WITNESS in document.caseDocument)
  {
    document.caseDocument = document.caseDocument as UploadEvidenceWitness;
    documentName = document.caseDocument.witnessOptionDocument.document_filename;
  }
  else if(TypesOfEvidenceUploadDocuments.EXPERT in document.caseDocument)
  {
    document.caseDocument = document.caseDocument as UploadEvidenceExpert;
    documentName = document.caseDocument.expertDocument.document_filename;
  }

  //TODO: href will need to be added - dependent on document download API implementation.
  return '<a href="href will need to be connected to document">'+documentName+'</a>';
}
