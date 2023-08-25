import {CCDClaim} from 'models/civilClaimResponse';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {UploadEvidenceElementCCD} from 'models/caseProgression/uploadDocumentsType';
import {getMockDocument} from '../mockDocument';

export const mockUUID = '1221';

export const mockWitnessDocument = {
  witnessOptionName: 'witness name',
  witnessOptionUploadDate: new Date(0),
  witnessOptionDocument: getMockDocument(),

  createdDatetime: new Date(0),
};

export const mockExpertDocument = {
  expertOptionName: 'expert name',
  expertOptionExpertise: 'expertise',
  expertOptionExpertises: 'expertises',
  expertOptionOtherParty: 'other party',
  expertDocumentQuestion: 'document question',
  expertDocumentAnswer: 'document answer',
  expertOptionUploadDate: new Date(0),
  expertDocument: getMockDocument(),
  createdDatetime: new Date(0),
};

export const mockTypeDocument = {
  typeOfDocument: 'type',
  documentIssuedDate: new Date(0),
  documentUpload: getMockDocument(),
  createdDatetime: new Date(0),
};

export function createCCDClaimForEvidenceUpload(): CCDClaim {
  return {
    documentDisclosureList: getCaseProgressionDocuments(EvidenceUploadDisclosure.DISCLOSURE_LIST),
    documentForDisclosure: getCaseProgressionDocuments(EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE),
    documentWitnessStatement: getCaseProgressionDocuments(EvidenceUploadWitness.WITNESS_STATEMENT),
    documentWitnessSummary: getCaseProgressionDocuments(EvidenceUploadWitness.WITNESS_SUMMARY),
    documentHearsayNotice: getCaseProgressionDocuments(EvidenceUploadWitness.NOTICE_OF_INTENTION),
    documentReferredInStatement: getCaseProgressionDocuments(EvidenceUploadWitness.DOCUMENTS_REFERRED),
    documentExpertReport: getCaseProgressionDocuments(EvidenceUploadExpert.EXPERT_REPORT),
    documentJointStatement: getCaseProgressionDocuments(EvidenceUploadExpert.STATEMENT),
    documentQuestions: getCaseProgressionDocuments(EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS),
    documentAnswers: getCaseProgressionDocuments(EvidenceUploadExpert.ANSWERS_FOR_EXPERTS),
    documentCaseSummary: getCaseProgressionDocuments(EvidenceUploadTrial.CASE_SUMMARY),
    documentSkeletonArgument: getCaseProgressionDocuments(EvidenceUploadTrial.SKELETON_ARGUMENT),
    documentAuthorities: getCaseProgressionDocuments(EvidenceUploadTrial.AUTHORITIES),
    documentCosts: getCaseProgressionDocuments(EvidenceUploadTrial.COSTS),
    documentEvidenceForTrial: getCaseProgressionDocuments(EvidenceUploadTrial.DOCUMENTARY),
    documentDisclosureListRes: getCaseProgressionDocuments(EvidenceUploadDisclosure.DISCLOSURE_LIST),
    documentForDisclosureRes: getCaseProgressionDocuments(EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE),
    documentWitnessStatementRes: getCaseProgressionDocuments(EvidenceUploadWitness.WITNESS_STATEMENT),
    documentWitnessSummaryRes: getCaseProgressionDocuments(EvidenceUploadWitness.WITNESS_SUMMARY),
    documentHearsayNoticeRes: getCaseProgressionDocuments(EvidenceUploadWitness.NOTICE_OF_INTENTION),
    documentReferredInStatementRes: getCaseProgressionDocuments(EvidenceUploadWitness.DOCUMENTS_REFERRED),
    documentExpertReportRes: getCaseProgressionDocuments(EvidenceUploadExpert.EXPERT_REPORT),
    documentJointStatementRes: getCaseProgressionDocuments(EvidenceUploadExpert.STATEMENT),
    documentQuestionsRes: getCaseProgressionDocuments(EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS),
    documentAnswersRes: getCaseProgressionDocuments(EvidenceUploadExpert.ANSWERS_FOR_EXPERTS),
    documentCaseSummaryRes: getCaseProgressionDocuments(EvidenceUploadTrial.CASE_SUMMARY),
    documentSkeletonArgumentRes: getCaseProgressionDocuments(EvidenceUploadTrial.SKELETON_ARGUMENT),
    documentAuthoritiesRes: getCaseProgressionDocuments(EvidenceUploadTrial.AUTHORITIES),
    documentCostsRes: getCaseProgressionDocuments(EvidenceUploadTrial.COSTS),
    documentEvidenceForTrialRes: getCaseProgressionDocuments(EvidenceUploadTrial.DOCUMENTARY),
    caseDocumentUploadDate: new Date('1970-01-01T00:00:00.000Z'),
    caseDocumentUploadDateRes: new Date('1970-01-01T00:00:00.000Z'),
  };
}

function getCaseProgressionDocuments(documentType: EvidenceUploadDisclosure | EvidenceUploadWitness | EvidenceUploadExpert | EvidenceUploadTrial)
  : UploadEvidenceElementCCD[] {

  const uploadEvidenceElementCCD = new UploadEvidenceElementCCD();
  uploadEvidenceElementCCD.id = mockUUID;

  switch(documentType)
  {
    case EvidenceUploadWitness.WITNESS_STATEMENT:
    case EvidenceUploadWitness.WITNESS_SUMMARY:
    case EvidenceUploadWitness.NOTICE_OF_INTENTION:
      uploadEvidenceElementCCD.value = mockWitnessDocument;
      break;
    case EvidenceUploadExpert.EXPERT_REPORT:
    case EvidenceUploadExpert.STATEMENT:
    case EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS:
    case EvidenceUploadExpert.ANSWERS_FOR_EXPERTS:
      uploadEvidenceElementCCD.value = mockExpertDocument;
      break;
    case EvidenceUploadWitness.DOCUMENTS_REFERRED:
    case EvidenceUploadDisclosure.DISCLOSURE_LIST:
    case EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE:
    case EvidenceUploadTrial.CASE_SUMMARY:
    case EvidenceUploadTrial.SKELETON_ARGUMENT:
    case EvidenceUploadTrial.AUTHORITIES:
    case EvidenceUploadTrial.COSTS:
    case EvidenceUploadTrial.DOCUMENTARY:
      uploadEvidenceElementCCD.value = mockTypeDocument;
      break;
  }

  return [uploadEvidenceElementCCD];
}

