import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {CCDClaim} from 'models/civilClaimResponse';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {
  UploadDocuments,
  UploadDocumentTypes,
  UploadEvidenceDocumentType,
  UploadEvidenceElementCCD,
  UploadEvidenceExpert,
  UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {Document} from 'models/document/document';
import {toCCDEvidenceUpload} from 'services/translation/caseProgression/convertToCCDEvidenceUpload';

jest.mock('../../../../../main/modules/i18n/languageService', () => ({
  getLanguage: jest.fn().mockReturnValue('en'),
  setLanguage: jest.fn(),
}));

jest.useFakeTimers();

const witnessDocument = {
  witnessOptionName: 'witness name',
  witnessOptionUploadDate: new Date(0),
  witnessOptionDocument: {
    document_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
    document_filename: 'witness_document.pdf',
    document_binary_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
  } as Document,
  createdDateTime: new Date(0),
};

const expertDocument = {
  expertOptionName: 'expert name',
  expertOptionExpertise: 'expertise',
  expertOptionExpertises: 'expertises',
  expertOptionOtherParty: 'other party',
  expertDocumentQuestion: 'document question',
  expertDocumentAnswer: 'document answer',
  expertOptionUploadDate: new Date(0),
  expertDocument: {
    document_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
    document_filename: 'expert_document.pdf',
    document_binary_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
  } as Document,
  createdDateTime: new Date(0),
};

const typeDocument = {
  typeOfDocument: 'type',
  documentIssuedDate: new Date(0),
  documentUpload: {
    document_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
    document_filename: 'document_type.pdf',
    document_binary_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
  } as Document,
  createdDateTime: new Date(0),
};

const documentForWitness = {
  document_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
  document_filename: 'witness_document.pdf',
  document_binary_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
} as Document;

const documentForExpert = {
  document_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
  document_filename: 'expert_document.pdf',
  document_binary_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
} as Document;

const documentForType = {
  document_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
  document_filename: 'document_type.pdf',
  document_binary_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
} as Document;

const documentTypeAsParameter = new UploadEvidenceDocumentType('type', new Date(0), documentForType, new Date(0));
const witnessAsParameter = new UploadEvidenceWitness('witness name', new Date(0), documentForWitness, new Date(0));
const expertAsParameter = new UploadEvidenceExpert('expert name', 'expertise', 'expertises', 'other party', 'document question', 'document answer', new Date(0),documentForExpert, new Date(0));

const uuid = '1221';

describe('toCCDEvidenceUpload', () => {
  it('should convert CaseProgression to CCDClaim', () => {

    const ccdClaim= {} as  CCDClaim;
    const expectedOutput: CCDClaim = createCCDClaim();
    const cuiClaim = createCUIClaim();

    const actualOutput = toCCDEvidenceUpload(cuiClaim, ccdClaim);
    expect(actualOutput).toEqual(expectedOutput);
  });

  it('should return undefined when CaseProgression is undefined', () => {
    const ccdClaim = {} as  CCDClaim;
    const cuiClaim: CaseProgression = undefined;
    const expectedOutput:CCDClaim = undefined;
    const actualOutput = toCCDEvidenceUpload(cuiClaim, ccdClaim);
    expect(actualOutput).toEqual(expectedOutput);
  });

  it('should handle null or undefined properties of CaseProgression', () => {
    const ccdClaim: CCDClaim = {};
    const cuiClaim: CaseProgression = new CaseProgression();
    cuiClaim.claimantUploadDocuments = new UploadDocuments(undefined, undefined, undefined, undefined);
    cuiClaim.defendantUploadDocuments = new UploadDocuments(undefined, undefined, undefined, undefined);
    const expectedOutput: CCDClaim = {
      caseDocumentUploadDate: new Date(),
      caseDocumentUploadDateRes: new Date(),
      documentDisclosureList: undefined,
      documentForDisclosure: undefined,
      documentWitnessStatement: undefined,
      documentWitnessSummary: undefined,
      documentHearsayNotice: undefined,
      documentReferredInStatement: undefined,
      documentExpertReport: undefined,
      documentJointStatement: undefined,
      documentQuestions: undefined,
      documentAnswers: undefined,
      documentCaseSummary: undefined,
      documentSkeletonArgument: undefined,
      documentAuthorities: undefined,
      documentCosts: undefined,
      documentEvidenceForTrial: undefined,
      documentDisclosureListRes: undefined,
      documentForDisclosureRes: undefined,
      documentWitnessStatementRes: undefined,
      documentWitnessSummaryRes: undefined,
      documentHearsayNoticeRes: undefined,
      documentReferredInStatementRes: undefined,
      documentExpertReportRes: undefined,
      documentJointStatementRes: undefined,
      documentQuestionsRes: undefined,
      documentAnswersRes: undefined,
      documentCaseSummaryRes: undefined,
      documentSkeletonArgumentRes: undefined,
      documentAuthoritiesRes: undefined,
      documentCostsRes: undefined,
      documentEvidenceForTrialRes: undefined,
    };
    const actualOutput = toCCDEvidenceUpload(cuiClaim, ccdClaim);
    expect(actualOutput).toEqual(expectedOutput);
  });
});

function getCaseProgressionDocuments(documentType: EvidenceUploadDisclosure | EvidenceUploadWitness | EvidenceUploadExpert | EvidenceUploadTrial)
  : UploadEvidenceElementCCD[] {

  const uploadEvidenceElementCCD = new UploadEvidenceElementCCD();
  uploadEvidenceElementCCD.id = uuid;

  switch(documentType)
  {
    case EvidenceUploadWitness.WITNESS_STATEMENT:
    case EvidenceUploadWitness.WITNESS_SUMMARY:
    case EvidenceUploadWitness.NOTICE_OF_INTENTION:
      uploadEvidenceElementCCD.value = witnessDocument;
      break;
    case EvidenceUploadExpert.EXPERT_REPORT:
    case EvidenceUploadExpert.STATEMENT:
    case EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS:
    case EvidenceUploadExpert.ANSWERS_FOR_EXPERTS:
      uploadEvidenceElementCCD.value = expertDocument;
      break;
    case EvidenceUploadWitness.DOCUMENTS_REFERRED:
    case EvidenceUploadDisclosure.DISCLOSURE_LIST:
    case EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE:
    case EvidenceUploadTrial.CASE_SUMMARY:
    case EvidenceUploadTrial.SKELETON_ARGUMENT:
    case EvidenceUploadTrial.AUTHORITIES:
    case EvidenceUploadTrial.COSTS:
    case EvidenceUploadTrial.DOCUMENTARY:
      uploadEvidenceElementCCD.value = typeDocument;
      break;
  }

  return [uploadEvidenceElementCCD];
}

function createCCDClaim(): CCDClaim {
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
    caseDocumentUploadDate: new Date(),
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
    caseDocumentUploadDateRes: new Date(),
  };
}

function createCUIClaim(): CaseProgression {
  return {
    claimantUploadDocuments:
      new UploadDocuments(getUploadDocumentList('disclosure'), getUploadDocumentList('witness'), getUploadDocumentList('expert'), getUploadDocumentList('trial')),
    defendantUploadDocuments:
      new UploadDocuments(getUploadDocumentList('disclosure'), getUploadDocumentList('witness'), getUploadDocumentList('expert'), getUploadDocumentList('trial')),
    claimantLastUpload: new Date (),
    defendantLastUpload: new Date(),
  } as CaseProgression;
}

function getUploadDocumentList(documentCategory: string): UploadDocumentTypes[] {

  const uploadDocumentTypes = [] as UploadDocumentTypes[];

  switch(documentCategory) {
    case 'disclosure':
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadDisclosure.DISCLOSURE_LIST, uuid),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE, uuid),
      );
      break;
    case 'witness':
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, witnessAsParameter, EvidenceUploadWitness.WITNESS_STATEMENT, uuid),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, witnessAsParameter, EvidenceUploadWitness.WITNESS_SUMMARY, uuid),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false,witnessAsParameter,  EvidenceUploadWitness.NOTICE_OF_INTENTION, uuid),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadWitness.DOCUMENTS_REFERRED, uuid),
      );
      break;
    case 'expert':
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, expertAsParameter, EvidenceUploadExpert.EXPERT_REPORT, uuid),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, expertAsParameter, EvidenceUploadExpert.STATEMENT, uuid),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, expertAsParameter, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS, uuid),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, expertAsParameter, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS, uuid),
      );
      break;
    case 'trial':
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.CASE_SUMMARY, uuid),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.SKELETON_ARGUMENT, uuid),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.AUTHORITIES, uuid),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.COSTS, uuid),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.DOCUMENTARY, uuid),
      );
      break;
  }
  return uploadDocumentTypes;
}
