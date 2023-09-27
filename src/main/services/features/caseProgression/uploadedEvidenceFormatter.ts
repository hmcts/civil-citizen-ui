import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {t} from 'i18next';
import {
  UploadDocumentTypes,
  UploadEvidenceDocumentType, UploadEvidenceExpert,
  UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {formatDocumentViewURL} from 'common/utils/formatDocumentURL';

export class UploadedEvidenceFormatter {

  static  getDocumentTypeName(documentType: EvidenceUploadDisclosure | EvidenceUploadWitness | EvidenceUploadExpert | EvidenceUploadTrial, lang: string) {
    let documentName: string;

    switch(documentType)
    {
      case EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE:
        documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DOCUMENTS_FOR_DISCLOSURE', {lng: lang});
        break;
      case EvidenceUploadDisclosure.DISCLOSURE_LIST:
        documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DISCLOSURE_LIST', {lng: lang});
        break;
      case EvidenceUploadWitness.WITNESS_STATEMENT:
        documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.WITNESS_STATEMENT', {lng: lang});
        break;
      case EvidenceUploadWitness.WITNESS_SUMMARY:
        documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.WITNESS_SUMMARY', {lng: lang});
        break;
      case EvidenceUploadWitness.NOTICE_OF_INTENTION:
        documentName = t('PAGES.CLAIM_SUMMARY.NOTICE_OF_INTENTION', {lng: lang});
        break;
      case EvidenceUploadWitness.DOCUMENTS_REFERRED:
        documentName = t('PAGES.CLAIM_SUMMARY.DOCUMENTS_REFERRED_TO_STATEMENT', {lng: lang});
        break;
      case EvidenceUploadExpert.STATEMENT:
        documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.JOINT_STATEMENT_OF_EXPERTS', {lng: lang});
        break;
      case EvidenceUploadExpert.EXPERT_REPORT:
        documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.EXPERT_REPORT', {lng: lang});
        break;
      case EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS:
        documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.QUESTIONS_FOR_OTHER_PARTY', {lng: lang});
        break;
      case EvidenceUploadExpert.ANSWERS_FOR_EXPERTS:
        documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.ANSWERS_TO_QUESTIONS', {lng: lang});
        break;
      case EvidenceUploadTrial.CASE_SUMMARY:
        documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CASE_SUMMARY', {lng: lang});
        break;
      case EvidenceUploadTrial.SKELETON_ARGUMENT:
        documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.SKELETON_ARGUMENT', {lng: lang});
        break;
      case EvidenceUploadTrial.AUTHORITIES:
        documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.LEGAL_AUTHORITIES', {lng: lang});
        break;
      case EvidenceUploadTrial.COSTS:
        documentName = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.COSTS', {lng: lang});
        break;
      case EvidenceUploadTrial.DOCUMENTARY:
        documentName = t('PAGES.CLAIM_SUMMARY.DOCUMENTARY_EVIDENCE', {lng: lang});
        break;
    }
    return documentName;
  }

  static getDocumentLink (document: UploadDocumentTypes, claimId: string) : string {
    let documentName : string;
    let documentBinary: string;

    if(document.caseDocument instanceof UploadEvidenceDocumentType)
    {
      documentName = document.caseDocument.documentUpload.document_filename;
      documentBinary = document.caseDocument.documentUpload.document_binary_url;
    }
    else if(document.caseDocument instanceof  UploadEvidenceWitness)
    {
      documentName = document.caseDocument.witnessOptionDocument.document_filename;
      documentBinary = document.caseDocument.witnessOptionDocument.document_binary_url;
    }
    else if(document.caseDocument instanceof UploadEvidenceExpert)
    {
      documentName = document.caseDocument.expertDocument.document_filename;
      documentBinary = document.caseDocument.expertDocument.document_binary_url;
    }

    return formatDocumentViewURL(documentName, claimId, documentBinary);
  }

}
