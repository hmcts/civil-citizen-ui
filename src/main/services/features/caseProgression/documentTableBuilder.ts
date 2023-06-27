import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  UploadDocumentTypes,
  UploadEvidenceDocumentType, UploadEvidenceExpert,
  UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {TableCell} from 'models/summaryList/summaryList';
//import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {t} from 'i18next';
import {formatStringDateDMY} from 'common/utils/dateUtils';

export function getEvidenceUploadDocuments(claim: Claim): DocumentTab {

  const documentTables = new DocumentTab();
  const trialOrHearing: string = claim.isFastTrackClaim ? 'trial': 'hearing';

  documentTables.claimantDisclosure = getDocumentTypeTable('disclosure', claim.caseProgression?.claimantUploadDocuments?.disclosure, true);
  documentTables.defendantDisclosure = getDocumentTypeTable('disclosure', claim.caseProgression?.defendantUploadDocuments?.disclosure, false);

  documentTables.claimantWitness = getDocumentTypeTable('witness', claim.caseProgression?.claimantUploadDocuments?.witness, true);
  documentTables.defendantWitness = getDocumentTypeTable('witness', claim.caseProgression?.defendantUploadDocuments?.witness, false);

  documentTables.claimantExpert = getDocumentTypeTable('expert', claim.caseProgression?.claimantUploadDocuments?.expert, true);
  documentTables.defendantExpert = getDocumentTypeTable('expert', claim.caseProgression?.defendantUploadDocuments?.expert, false);

  documentTables.claimantTrial = getDocumentTypeTable(trialOrHearing, claim.caseProgression?.claimantUploadDocuments?.trial, true);
  documentTables.defendantTrial = getDocumentTypeTable(trialOrHearing, claim.caseProgression?.defendantUploadDocuments?.trial, false);

  return documentTables;
}

function getDocumentTypeTable(header: string, rows: UploadDocumentTypes[], isClaimant: boolean) : ClaimSummarySection {

  if (!rows) return undefined;

  const tableRows = [] as TableCell[][];

  for(let i = rows.length-1; i>=0; i--)
  {
    const uploadDate: Date = new Date(rows[i].caseDocument.createdDatetime);
    const uploadDateString: string  = formatStringDateDMY(uploadDate.toISOString());

    tableRows.push([
      {html: getDocumentTypeName(rows[i].documentType, isClaimant) + '<br>' + 'Date Uploaded ' + uploadDateString},
      {html: getDocumentLink(rows[i])}],
    );
  }

  return {
    type: ClaimSummaryType.TABLE,
    data: {
      head: [
        {
          text: isClaimant == true ? 'Claimant ' + header : 'Defendant ' + header,
        },
        {
          text: '',
        },
      ],
      tableRows: tableRows,
    },
  };
}

function getDocumentTypeName(documentType: EvidenceUploadDisclosure | EvidenceUploadWitness | EvidenceUploadExpert | EvidenceUploadTrial, isClaimant: boolean)
{
  let documentName = isClaimant == true ? 'Claimant ' : 'Defendant ';

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

  if('documentUpload' in document.caseDocument)
  {
    document.caseDocument = document.caseDocument as UploadEvidenceDocumentType;
    documentName = document.caseDocument.documentUpload.document_filename;
  }
  else if('witnessOptionDocument' in document.caseDocument)
  {
    document.caseDocument = document.caseDocument as UploadEvidenceWitness;
    documentName = document.caseDocument.witnessOptionDocument.document_filename;
  }
  else if('expertDocument' in document.caseDocument)
  {
    document.caseDocument = document.caseDocument as UploadEvidenceExpert;
    documentName = document.caseDocument.expertDocument.document_filename;
  }

  //TODO: href will need to be added - dependent on document download API implementation.
  return '<a href="href will need to be connected to document">'+documentName+'</a>';
}

export class DocumentTab {

  //Claimant tables
  claimantDisclosure: ClaimSummarySection;
  claimantWitness: ClaimSummarySection;
  claimantExpert: ClaimSummarySection;
  claimantTrial: ClaimSummarySection;

  //Defendant tables
  defendantDisclosure: ClaimSummarySection;
  defendantWitness: ClaimSummarySection;
  defendantExpert: ClaimSummarySection;
  defendantTrial: ClaimSummarySection;
}
