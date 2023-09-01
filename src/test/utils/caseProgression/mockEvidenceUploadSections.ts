import {
  ExpertSection,
  TypeOfDocumentSection,
  UploadDocumentsUserForm,
  WitnessSection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {UploadDocuments, UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';

export const getMockSectionArray = () => {
  const sectionArray: TypeOfDocumentSection[] = [];
  sectionArray.push(new TypeOfDocumentSection('12', '12', '2022'));
  sectionArray.push(new TypeOfDocumentSection('12', '12', '2022'));
  return sectionArray;
};

export const getMockWitnessSectionArray = () => {
  const sectionArray: WitnessSection[] = [];
  sectionArray.push(new WitnessSection('12', '12', '2022'));
  sectionArray.push(new WitnessSection('12', '12', '2022'));
  return sectionArray;
};

export const getMockExpertSectionArray = () => {
  const sectionArray: ExpertSection[] = [];
  sectionArray.push(new ExpertSection('12', '12', '2022'));
  sectionArray.push(new ExpertSection('12', '12', '2022'));
  return sectionArray;
};

export const getMockFullUploadDocumentsUserForm = () => {
  const uploadedDocuments: UploadDocumentsUserForm = new UploadDocumentsUserForm();
  uploadedDocuments.documentsForDisclosure = getMockSectionArray();
  uploadedDocuments.disclosureList = getMockSectionArray();

  uploadedDocuments.witnessStatement = getMockWitnessSectionArray();
  uploadedDocuments.witnessSummary = getMockWitnessSectionArray();
  uploadedDocuments.noticeOfIntention = getMockWitnessSectionArray();
  uploadedDocuments.documentsReferred = getMockSectionArray();

  uploadedDocuments.expertStatement = getMockExpertSectionArray();
  uploadedDocuments.expertReport = getMockExpertSectionArray();
  uploadedDocuments.questionsForExperts = getMockExpertSectionArray();
  uploadedDocuments.answersForExperts = getMockExpertSectionArray();

  uploadedDocuments.trialCaseSummary = getMockSectionArray();
  uploadedDocuments.trialSkeletonArgument = getMockSectionArray();
  uploadedDocuments.trialAuthorities = getMockSectionArray();
  uploadedDocuments.trialCosts = getMockSectionArray();
  uploadedDocuments.trialDocumentary = getMockSectionArray();

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
