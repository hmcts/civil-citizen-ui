import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';

const documentTypeToName =
    new Map<(EvidenceUploadWitness | EvidenceUploadDisclosure | EvidenceUploadExpert | EvidenceUploadTrial), string>;

export function getDocumentTypeToName(){
  fillDocumentTypeToName();
  return documentTypeToName;
}

function fillDocumentTypeToName() {
  documentTypeToName.set(EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DOCUMENTS_FOR_DISCLOSURE');
  documentTypeToName.set(EvidenceUploadDisclosure.DISCLOSURE_LIST, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DISCLOSURE_LIST');
  documentTypeToName.set(EvidenceUploadWitness.WITNESS_STATEMENT, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.WITNESS_STATEMENT');
  documentTypeToName.set(EvidenceUploadWitness.WITNESS_SUMMARY, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.WITNESS_SUMMARY');
  documentTypeToName.set(EvidenceUploadWitness.NOTICE_OF_INTENTION, 'PAGES.CLAIM_SUMMARY.NOTICE_OF_INTENTION');
  documentTypeToName.set(EvidenceUploadWitness.DOCUMENTS_REFERRED, 'PAGES.CLAIM_SUMMARY.DOCUMENTS_REFERRED_TO_STATEMENT');
  documentTypeToName.set(EvidenceUploadExpert.STATEMENT, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.JOINT_STATEMENT_OF_EXPERTS');
  documentTypeToName.set(EvidenceUploadExpert.EXPERT_REPORT, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.EXPERT_REPORT');
  documentTypeToName.set(EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.QUESTIONS_FOR_OTHER_PARTY');
  documentTypeToName.set(EvidenceUploadExpert.ANSWERS_FOR_EXPERTS, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.ANSWERS_TO_QUESTIONS');
  documentTypeToName.set(EvidenceUploadTrial.CASE_SUMMARY, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CASE_SUMMARY');
  documentTypeToName.set(EvidenceUploadTrial.SKELETON_ARGUMENT, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.SKELETON_ARGUMENT');
  documentTypeToName.set(EvidenceUploadTrial.AUTHORITIES, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.LEGAL_AUTHORITIES');
  documentTypeToName.set(EvidenceUploadTrial.COSTS, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.COSTS');
  documentTypeToName.set(EvidenceUploadTrial.DOCUMENTARY, 'PAGES.CLAIM_SUMMARY.DOCUMENTARY_EVIDENCE');
}
