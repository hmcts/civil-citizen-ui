import {CCDClaim} from 'models/civilClaimResponse';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {
  UploadEvidenceDocumentType,
  UploadEvidenceElementCCD,
  UploadEvidenceExpert,
  UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {getMockDocument} from '../mockDocument';
import {mockNameValue} from './mockEvidenceUploadSummaryRows';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

export const mockUUID = '1221';

const document = {document_url:'http://test',document_binary_url:'http://test/binary',document_filename:'test.png',document_hash:'test'};

export const mockCCDWitnessArray = (length: number) => {
  if (length == 0) return undefined;
  const sectionArray: UploadEvidenceElementCCD[] = [];

  const witnessDocument = new UploadEvidenceWitness(mockNameValue, new Date('12-12-2022'), document, new Date('12-12-2022'));
  const ccdElement = {id: mockUUID, value: witnessDocument};

  for(let i = 0; i < length; i++)
  {
    sectionArray.push(ccdElement);
  }

  return sectionArray;
};

export const mockCCDDocumentTypeArray = (name: string, length: number) => {
  if (length == 0) return undefined;
  const sectionArray: UploadEvidenceElementCCD[] = [];

  const typeOfDocument = new UploadEvidenceDocumentType(name,'document type' ,new Date('12-12-2022'), document, new Date('12-12-2022'));
  const ccdElement = {id: mockUUID, value: typeOfDocument};

  for(let i = 0; i < length; i++)
  {
    sectionArray.push(ccdElement);
  }

  return sectionArray;
};

export const mockCCDExpertArray = (length: number) => {
  if (length == 0) return undefined;
  const sectionArray: UploadEvidenceElementCCD[] = [];

  const expertDocument = new UploadEvidenceExpert(mockNameValue, 'expertise', null, null, null, null, new Date('12-12-2022'), document, new Date('12-12-2022'));
  const ccdElement = {id: mockUUID, value: expertDocument};

  for(let i = 0; i < length; i++)
  {
    sectionArray.push(ccdElement);
  }

  return sectionArray;
};

export const mockCCDJointExpertsStatementArray = (length: number) => {
  if (length == 0) return undefined;
  const sectionArray: UploadEvidenceElementCCD[] = [];

  const expertDocument = new UploadEvidenceExpert(mockNameValue, null, 'expertise', null, null, null, new Date('12-12-2022'), document, new Date('12-12-2022'));
  const ccdElement = {id: mockUUID, value: expertDocument};

  for(let i = 0; i < length; i++)
  {
    sectionArray.push(ccdElement);
  }

  return sectionArray;
};

export const mockCCDExpertQuestionsAnswersArray = (length: number, questions: boolean) => {
  if (length == 0) return undefined;
  const sectionArray: UploadEvidenceElementCCD[] = [];

  const expertDocument = new UploadEvidenceExpert(mockNameValue, 'expertise', null, mockNameValue, questions ? 'other party document' : null, questions ? null : 'other party document', new Date('12-12-2022'), document, new Date('12-12-2022'));
  const ccdElement = {id: mockUUID, value: expertDocument};

  for(let i = 0; i < length; i++)
  {
    sectionArray.push(ccdElement);
  }

  return sectionArray;
};

export const mockCCDFileUploadArray = (length: number) => {
  if (length == 0) return undefined;
  const sectionArray: UploadEvidenceElementCCD[] = [];

  const typeOfDocument = new UploadEvidenceDocumentType(null, null ,null, document, new Date('12-12-2022'));
  const ccdElement = {id: mockUUID, value: typeOfDocument};

  for(let i = 0; i < length; i++)
  {
    sectionArray.push(ccdElement);
  }

  return sectionArray;
};

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
  witnessOptionName: undefined,
  typeOfDocument: 'type',
  documentIssuedDate: new Date(0),
  documentUpload: getMockDocument(),
  createdDatetime: new Date(0),
} as UploadEvidenceDocumentType;

export const mockReferredDocument = {
  witnessOptionName: 'witness name',
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
    trialReadyApplicant: YesNoUpperCamelCase.NO,
    trialReadyRespondent1: YesNoUpperCamelCase.YES,
  };
}

export function createCCDClaimForUploadedDocuments(length: number, isClaimant: boolean): CCDClaim {

  let ccdClaim: CCDClaim;

  if(isClaimant){
    ccdClaim = {
      documentDisclosureList: mockCCDFileUploadArray(length),
      documentForDisclosure: mockCCDDocumentTypeArray(null, length),
      documentWitnessStatement: mockCCDWitnessArray(length),
      documentWitnessSummary: mockCCDWitnessArray(length),
      documentHearsayNotice: mockCCDWitnessArray(length),
      documentReferredInStatement: mockCCDDocumentTypeArray('John Smith',length),
      documentExpertReport: mockCCDExpertArray(length),
      documentJointStatement: mockCCDJointExpertsStatementArray(length),
      documentQuestions: mockCCDExpertQuestionsAnswersArray(length,true),
      documentAnswers: mockCCDExpertQuestionsAnswersArray(length,false),
      documentCaseSummary: mockCCDFileUploadArray(length),
      documentSkeletonArgument: mockCCDFileUploadArray(length),
      documentAuthorities: mockCCDFileUploadArray(length),
      documentCosts: mockCCDFileUploadArray(length),
      documentEvidenceForTrial: mockCCDDocumentTypeArray(null,length),
      caseDocumentUploadDate: new Date('12-12-2022'),
    };

  } else {
    ccdClaim = {
      documentDisclosureListRes: mockCCDFileUploadArray(length),
      documentForDisclosureRes: mockCCDDocumentTypeArray(null, length),
      documentWitnessStatementRes: mockCCDWitnessArray(length),
      documentWitnessSummaryRes: mockCCDWitnessArray(length),
      documentHearsayNoticeRes: mockCCDWitnessArray(length),
      documentReferredInStatementRes: mockCCDDocumentTypeArray('John Smith', length),
      documentExpertReportRes: mockCCDExpertArray(length),
      documentJointStatementRes: mockCCDJointExpertsStatementArray(length),
      documentQuestionsRes: mockCCDExpertQuestionsAnswersArray(length, true),
      documentAnswersRes: mockCCDExpertQuestionsAnswersArray(length, false),
      documentCaseSummaryRes: mockCCDFileUploadArray(length),
      documentSkeletonArgumentRes: mockCCDFileUploadArray(length),
      documentAuthoritiesRes: mockCCDFileUploadArray(length),
      documentCostsRes: mockCCDFileUploadArray(length),
      documentEvidenceForTrialRes: mockCCDDocumentTypeArray(null, length),
      caseDocumentUploadDateRes: new Date('12-12-2022'),
    };
  }

  return ccdClaim;
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
      uploadEvidenceElementCCD.value = mockReferredDocument;
      break;
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
