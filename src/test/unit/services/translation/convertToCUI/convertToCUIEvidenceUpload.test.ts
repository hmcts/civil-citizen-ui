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
  UploadEvidenceExpert,
  UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {toCUICaseProgression} from 'services/translation/convertToCUI/convertToCUIEvidenceUpload';
import {
  createCCDClaimForEvidenceUpload, mockExpertDocument,
  mockTypeDocument, mockUUID, mockWitnessDocument,
} from '../../../../utils/caseProgression/mockCCDClaimForEvidenceUpload';

jest.mock('../../../../../main/modules/i18n/languageService', () => ({
  getLanguage: jest.fn().mockReturnValue('en'),
  setLanguage: jest.fn(),
}));

const documentForWitness = {
  document_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
  document_filename: 'witness_document.pdf',
  document_binary_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
};

const documentForExpert = {
  document_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
  document_filename: 'expert_document.pdf',
  document_binary_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
};

const documentForType = {
  document_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
  document_filename: 'document_type.pdf',
  document_binary_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
};

const documentTypeAsParameter = new UploadEvidenceDocumentType('type', new Date(0), documentForType, new Date(0));
const witnessAsParameter = new UploadEvidenceWitness('witness name', new Date(0), documentForWitness, new Date(0));
const expertAsParameter = new UploadEvidenceExpert('expert name', 'expertise','expertises','other party', 'document question', 'document answer', new Date(0), documentForExpert, new Date(0));

describe('toCUIEvidenceUpload', () => {
  it('should convert CCDClaim to CaseProgression', () => {

    const ccdClaim: CCDClaim = createCCDClaimForEvidenceUpload();
    const expectedOutput = createCUIClaim();

    const actualOutput = toCUICaseProgression(ccdClaim);
    expect(actualOutput).toEqual(expectedOutput);
  });

  it('should return undefined when CCDClaim is undefined', () => {
    const ccdClaim:CCDClaim = undefined;
    const expectedOutput:CCDClaim = undefined;
    const actualOutput = toCUICaseProgression(ccdClaim);
    expect(actualOutput).toEqual(expectedOutput);
  });

  it('should handle null or undefined properties of CCDClaim', () => {
    const ccdClaim: CCDClaim = {
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
      caseDocumentUploadDate: undefined,
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
      caseDocumentUploadDateRes: undefined,
    };
    const expectedOutput: CaseProgression = new CaseProgression();
    expectedOutput.claimantUploadDocuments = new UploadDocuments(undefined, undefined, undefined, undefined);
    expectedOutput.defendantUploadDocuments = new UploadDocuments(undefined, undefined, undefined, undefined);
    const actualOutput = toCUICaseProgression(ccdClaim);
    expect(actualOutput).toEqual(expectedOutput);
  });

  it('should handle partially filled + multiples of same type', () => {
    const ccdClaim: CCDClaim = {
      documentDisclosureList: [{id: 'Claimant', value: mockTypeDocument}, {id: 'Claimant', value: mockTypeDocument}],
      documentWitnessStatement: [{id: 'Claimant', value: mockWitnessDocument}],
      documentExpertReport: [{id: 'Claimant', value: mockExpertDocument}],
      documentCosts: [{id: 'Claimant', value: mockTypeDocument}],
      documentEvidenceForTrial: undefined,
      documentForDisclosureRes: [{id: 'Defendant', value: mockTypeDocument}],
      documentWitnessStatementRes: undefined,
      documentWitnessSummaryRes: [{id: 'Defendant', value: mockWitnessDocument}],
      documentAuthoritiesRes: [{id: 'Defendant', value: mockTypeDocument}],
    };
    const expectedOutput: CaseProgression = new CaseProgression();
    expectedOutput.claimantUploadDocuments = new UploadDocuments(
      [new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadDisclosure.DISCLOSURE_LIST, 'Claimant'),
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadDisclosure.DISCLOSURE_LIST, 'Claimant')],
      [new UploadDocumentTypes(false, witnessAsParameter, EvidenceUploadWitness.WITNESS_STATEMENT, 'Claimant')],
      [new UploadDocumentTypes(false, expertAsParameter, EvidenceUploadExpert.EXPERT_REPORT, 'Claimant')],
      [new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.COSTS, 'Claimant')],
    );
    expectedOutput.defendantUploadDocuments = new UploadDocuments(
      [new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE, 'Defendant')],
      [new UploadDocumentTypes(false, witnessAsParameter, EvidenceUploadWitness.WITNESS_SUMMARY, 'Defendant')],
      undefined,
      [new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.AUTHORITIES, 'Defendant')],
    );
    const actualOutput = toCUICaseProgression(ccdClaim);
    expect(actualOutput).toEqual(expectedOutput);
  });
});

function createCUIClaim(): CaseProgression {
  return {
    claimantUploadDocuments:
      new UploadDocuments(getUploadDocumentList('disclosure'), getUploadDocumentList('witness'), getUploadDocumentList('expert'), getUploadDocumentList('trial')),
    defendantUploadDocuments:
      new UploadDocuments(getUploadDocumentList('disclosure'), getUploadDocumentList('witness'), getUploadDocumentList('expert'), getUploadDocumentList('trial')),
    claimantLastUploadDate: new Date('1970-01-01T00:00:00.000Z'),
    defendantLastUploadDate: new Date('1970-01-01T00:00:00.000Z'),
  } as CaseProgression;
}

function getUploadDocumentList(documentCategory: string): UploadDocumentTypes[] {

  const uploadDocumentTypes = [] as UploadDocumentTypes[];

  switch(documentCategory) {
    case 'disclosure':
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadDisclosure.DISCLOSURE_LIST, mockUUID),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE, mockUUID),
      );
      break;
    case 'witness':
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, witnessAsParameter, EvidenceUploadWitness.WITNESS_STATEMENT, mockUUID),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, witnessAsParameter, EvidenceUploadWitness.WITNESS_SUMMARY, mockUUID),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false,witnessAsParameter,  EvidenceUploadWitness.NOTICE_OF_INTENTION, mockUUID),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadWitness.DOCUMENTS_REFERRED, mockUUID),
      );
      break;
    case 'expert':
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, expertAsParameter, EvidenceUploadExpert.EXPERT_REPORT, mockUUID),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, expertAsParameter, EvidenceUploadExpert.STATEMENT, mockUUID),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, expertAsParameter, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS, mockUUID),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, expertAsParameter, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS, mockUUID),
      );
      break;
    case 'trial':
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.CASE_SUMMARY, mockUUID),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.SKELETON_ARGUMENT, mockUUID),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.AUTHORITIES, mockUUID),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.COSTS, mockUUID),
      );
      uploadDocumentTypes.push(
        new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.DOCUMENTARY, mockUUID),
      );
      break;
  }
  return uploadDocumentTypes;
}
