import {
  ExpertSection, ReferredToInTheStatementSection,
  TypeOfDocumentSection,
  UploadDocumentsUserForm,
  WitnessSection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {UploadDocuments, UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {
  DocumentType,
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {CaseDocument} from 'models/document/caseDocument';
import {mockNameValue} from './mockEvidenceUploadSummaryRows';

const caseDoc = (documentType: DocumentType|EvidenceUploadWitness|EvidenceUploadExpert|EvidenceUploadDisclosure|EvidenceUploadTrial) => {
  return {documentType: documentType, documentLink:{document_url:'http://test',document_binary_url:'http://test/binary',document_filename:'test.png',document_hash:'test'},documentName:'test.png',documentSize:86349,createdDatetime:new Date('2022-12-12T00:00:00.000Z'),createdBy:'test'} as CaseDocument;
};

export const getMockSectionArray = (documentType: EvidenceUploadWitness|EvidenceUploadDisclosure|EvidenceUploadTrial) => {
  const sectionArray: TypeOfDocumentSection[] = [];

  const typeOfDocument = new TypeOfDocumentSection('12', '12', '2022');
  typeOfDocument.typeOfDocument = 'document type';
  typeOfDocument.caseDocument = caseDoc(documentType);
  sectionArray.push(typeOfDocument);
  sectionArray.push(typeOfDocument);
  return sectionArray;
};

export const getMockDocumentsReferredSectionArray = (documentType: EvidenceUploadWitness|EvidenceUploadDisclosure|EvidenceUploadTrial) => {
  const sectionArray: ReferredToInTheStatementSection[] = [];

  const typeOfDocument = new ReferredToInTheStatementSection('12', '12', '2022');
  typeOfDocument.witnessName = 'John Smith';
  typeOfDocument.typeOfDocument = 'document type';
  typeOfDocument.caseDocument = caseDoc(documentType);
  sectionArray.push(typeOfDocument);
  sectionArray.push(typeOfDocument);
  return sectionArray;
};

export const getMockWitnessSectionArray = (documentType: EvidenceUploadWitness) => {
  const sectionArray: WitnessSection[] = [];

  const witnessDocument = new WitnessSection('12', '12', '2022');
  witnessDocument.witnessName = 'John Smith';
  witnessDocument.caseDocument = caseDoc(documentType);

  sectionArray.push(witnessDocument);
  sectionArray.push(witnessDocument);
  return sectionArray;
};

export const getMockExpertSectionArray = (documentType: EvidenceUploadExpert) => {
  const sectionArray: ExpertSection[] = [];

  const expertDocument = new ExpertSection('12', '12', '2022');
  expertDocument.expertName = mockNameValue;
  expertDocument.otherPartyName = mockNameValue;
  expertDocument.fieldOfExpertise = 'expertise';
  expertDocument.questionDocumentName = 'other party document';
  expertDocument.otherPartyQuestionsDocumentName = 'other party document';
  expertDocument.caseDocument = caseDoc(documentType);

  sectionArray.push(expertDocument);
  sectionArray.push(expertDocument);
  return sectionArray;
};

export const getMockFullUploadDocumentsUserForm = () => {
  const uploadedDocuments: UploadDocumentsUserForm = new UploadDocumentsUserForm();
  uploadedDocuments.documentsForDisclosure = getMockSectionArray(EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE);
  uploadedDocuments.disclosureList = getMockSectionArray(EvidenceUploadDisclosure.DISCLOSURE_LIST);

  uploadedDocuments.witnessStatement = getMockWitnessSectionArray(EvidenceUploadWitness.WITNESS_STATEMENT);
  uploadedDocuments.witnessSummary = getMockWitnessSectionArray(EvidenceUploadWitness.WITNESS_SUMMARY);
  uploadedDocuments.noticeOfIntention = getMockWitnessSectionArray(EvidenceUploadWitness.NOTICE_OF_INTENTION);
  uploadedDocuments.documentsReferred = getMockDocumentsReferredSectionArray(EvidenceUploadWitness.DOCUMENTS_REFERRED);

  uploadedDocuments.expertStatement = getMockExpertSectionArray(EvidenceUploadExpert.STATEMENT);
  uploadedDocuments.expertReport = getMockExpertSectionArray(EvidenceUploadExpert.EXPERT_REPORT);
  uploadedDocuments.questionsForExperts = getMockExpertSectionArray(EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS);
  uploadedDocuments.answersForExperts = getMockExpertSectionArray(EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);

  uploadedDocuments.trialCaseSummary = getMockSectionArray(EvidenceUploadTrial.CASE_SUMMARY);
  uploadedDocuments.trialSkeletonArgument = getMockSectionArray(EvidenceUploadTrial.SKELETON_ARGUMENT);
  uploadedDocuments.trialAuthorities = getMockSectionArray(EvidenceUploadTrial.AUTHORITIES);
  uploadedDocuments.trialCosts = getMockSectionArray(EvidenceUploadTrial.COSTS);
  uploadedDocuments.trialDocumentary = getMockSectionArray(EvidenceUploadTrial.DOCUMENTARY);

  return uploadedDocuments;
};

export const getMockEmptyUploadDocumentsUserForm = () => {
  const uploadedDocuments: UploadDocumentsUserForm = new UploadDocumentsUserForm();
  uploadedDocuments.documentsForDisclosure = [];
  uploadedDocuments.disclosureList = [];

  uploadedDocuments.witnessStatement = [];
  uploadedDocuments.witnessSummary = [];
  uploadedDocuments.noticeOfIntention = [];
  uploadedDocuments.documentsReferred = [];

  uploadedDocuments.expertStatement = [];
  uploadedDocuments.expertReport = [];
  uploadedDocuments.questionsForExperts = [];
  uploadedDocuments.answersForExperts = [];

  uploadedDocuments.trialCaseSummary = [];
  uploadedDocuments.trialSkeletonArgument = [];
  uploadedDocuments.trialAuthorities = [];
  uploadedDocuments.trialCosts = [];
  uploadedDocuments.trialDocumentary = [];

  return uploadedDocuments;
};

export const getMockUploadDocumentsSelected = (selected: boolean) => {
  const selectDocuments = new UploadDocuments();

  selectDocuments.disclosure = [];
  selectDocuments.disclosure.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE));
  selectDocuments.disclosure.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadDisclosure.DISCLOSURE_LIST));

  selectDocuments.witness = [];
  selectDocuments.witness.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadWitness.WITNESS_STATEMENT));
  selectDocuments.witness.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadWitness.WITNESS_SUMMARY));
  selectDocuments.witness.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadWitness.NOTICE_OF_INTENTION));
  selectDocuments.witness.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadWitness.DOCUMENTS_REFERRED));

  selectDocuments.expert = [];
  selectDocuments.expert.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadExpert.STATEMENT));
  selectDocuments.expert.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadExpert.EXPERT_REPORT));
  selectDocuments.expert.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS));
  selectDocuments.expert.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS));

  selectDocuments.trial = [];
  selectDocuments.trial.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadTrial.CASE_SUMMARY));
  selectDocuments.trial.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadTrial.SKELETON_ARGUMENT));
  selectDocuments.trial.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadTrial.AUTHORITIES));
  selectDocuments.trial.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadTrial.COSTS));
  selectDocuments.trial.push(new UploadDocumentTypes(selected, undefined, EvidenceUploadTrial.DOCUMENTARY));

  return selectDocuments;
};
