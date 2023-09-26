import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  UploadDocumentTypes,
  UploadEvidenceDocumentType,
  UploadEvidenceExpert,
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
import {documentIdExtractor} from 'common/utils/stringUtils';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';

export function getEvidenceUploadDocuments(claim: Claim): ClaimSummarySection[] {

  const documentTables = [] as ClaimSummarySection[];
  const trialOrHearing: string = claim.isFastTrackClaim ? 'PAGES.CLAIM_SUMMARY.TRIAL_DOCUMENTS': 'PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS';

  documentTables.push(addEvidenceUploadDescription());

  documentTables.push(getDocumentTypeTable('PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS', claim.caseProgression?.claimantUploadDocuments?.disclosure, true, claim.id));
  documentTables.push(getDocumentTypeTable('PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS', claim.caseProgression?.defendantUploadDocuments?.disclosure, false, claim.id));

  documentTables.push(getDocumentTypeTable('PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE', claim.caseProgression?.claimantUploadDocuments?.witness, true, claim.id));
  documentTables.push(getDocumentTypeTable('PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE', claim.caseProgression?.defendantUploadDocuments?.witness, false, claim.id));

  documentTables.push(getDocumentTypeTable('PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE', claim.caseProgression?.claimantUploadDocuments?.expert, true, claim.id));
  documentTables.push(getDocumentTypeTable('PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE', claim.caseProgression?.defendantUploadDocuments?.expert, false, claim.id));

  documentTables.push(getDocumentTypeTable(trialOrHearing, claim.caseProgression?.claimantUploadDocuments?.trial, true, claim.id));
  documentTables.push(getDocumentTypeTable(trialOrHearing, claim.caseProgression?.defendantUploadDocuments?.trial, false, claim.id));

  return documentTables;
}

function getDocumentTypeTable(header: string, rows: UploadDocumentTypes[], isClaimant: boolean, claimId: string) : ClaimSummarySection {

  if (!rows || rows.length == 0) return undefined;

  const tableRows = [] as TableCell[][];

  orderDocumentByTypeAndNewestToOldest(rows);

  for(const upload of rows)
  {
    const uploadDateString: string  = upload.createdDateTimeFormatted;

    tableRows.push([
      {html: getDocumentTypeName(upload.documentType, isClaimant) + '<br>' + t('PAGES.CLAIM_SUMMARY.DATE_DOCUMENT_UPLOADED') + uploadDateString,
        classes: 'govuk-!-width-one-half'},
      {html: getDocumentLink(upload, claimId),
        classes: 'govuk-!-width-one-half govuk-table__cell--numeric'}],
    );
  }

  return addEvidenceUploadTable(header, isClaimant, tableRows);
}

function orderDocumentByTypeAndNewestToOldest(documentsWithDates: UploadDocumentTypes[]): UploadDocumentTypes[] {

  documentsWithDates.sort((a: UploadDocumentTypes, b: UploadDocumentTypes) => {
    const typeAValue = typeValueMap[a.documentType];
    const typeBValue = typeValueMap[b.documentType];

    if (typeAValue < typeBValue) {
      return -1;
    } else if (typeAValue > typeBValue) {
      return 1;
    } else {
      return +b.caseDocument?.createdDatetime - +a.caseDocument?.createdDatetime;
    }
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

function getDocumentLink (document: UploadDocumentTypes, claimId: string) : string {
  let documentName : string;
  let documentId : string;

  if(document.caseDocument instanceof UploadEvidenceDocumentType)
  {
    documentName = document.caseDocument.documentUpload.document_filename;
    documentId = documentIdExtractor(document.caseDocument.documentUpload.document_binary_url);
  }
  else if(document.caseDocument instanceof  UploadEvidenceWitness)
  {
    documentName = document.caseDocument.witnessOptionDocument.document_filename;
    documentId = documentIdExtractor(document.caseDocument.witnessOptionDocument.document_binary_url);
  }
  else if(document.caseDocument instanceof UploadEvidenceExpert)
  {
    documentName = document.caseDocument.expertDocument.document_filename;
    documentId = documentIdExtractor(document.caseDocument.expertDocument.document_binary_url);
  }
  const url = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', documentId);
  return `<a class="govuk-link" href="${url}">${documentName}</a>`;
}

const typeValueMap: Record<string, number> = {
  DOCUMENTS_FOR_DISCLOSURE: 1,
  DISCLOSURE_LIST: 2,
  WITNESS_STATEMENT: 3,
  WITNESS_SUMMARY: 4,
  NOTICE_OF_INTENTION: 5,
  DOCUMENTS_REFERRED: 6,
  STATEMENT: 7,
  QUESTIONS_FOR_EXPERTS: 8,
  ANSWERS_FOR_EXPERTS: 9,
  CASE_SUMMARY: 10,
  SKELETON_ARGUMENT: 11,
  AUTHORITIES: 12,
  COSTS: 13,
  DOCUMENTARY: 14,
};
