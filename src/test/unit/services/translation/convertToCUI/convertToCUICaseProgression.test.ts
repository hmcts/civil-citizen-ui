import {
  DocumentType,
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {CCDClaim} from 'models/civilClaimResponse';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {
  UploadDocuments,
  UploadDocumentTypes, UploadEvidenceDocumentType, UploadEvidenceExpert, UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {toCUICaseProgression} from 'services/translation/convertToCUI/convertToCUICaseProgression';
import {
  createCCDClaimForEvidenceUpload, mockExpertDocument,
  mockTypeDocument, mockUUID, mockWitnessDocument,
} from '../../../../utils/caseProgression/mockCCDClaimForEvidenceUpload';
import {Bundle} from 'models/caseProgression/bundles/bundle';
import {FinalOrderDocumentCollection} from 'models/caseProgression/finalOrderDocumentCollectionType';
import {
  mockFinalOrderDocument1,
  mockFinalOrderDocument2,
} from '../../../../utils/caseProgression/mockCCDFinalOrderDocumentCollection';
import {FIXED_DATE} from '../../../../utils/dateUtils';
import {getMockDocument} from '../../../../utils/mockDocument';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {TrialArrangements} from 'models/caseProgression/trialArrangements/trialArrangements';

jest.mock('../../../../../main/modules/i18n/languageService', () => ({
  getLanguage: jest.fn().mockReturnValue('en'),
  setLanguage: jest.fn(),
}));

const documentForFinalOrder = {
  id: '1177a9b6-8f66-4241-a00b-0618bfb40733',
  value: {
    createdBy: 'Civil',
    documentLink: {
      category_id: 'finalOrders',
      document_url: 'http://dm-store:8080/documents/20712d13-18c2-4779-b1f4-8b7d3e0312b9',
      document_filename: 'Order_2023-08-17.pdf',
      document_binary_url: 'http://dm-store:8080/documents/20712d13-18c2-4779-b1f4-8b7d3e0312b9/binary'},
    documentName: 'Order_2023-08-17.pdf',
    documentType: DocumentType.JUDGE_FINAL_ORDER,
    documentSize: 21069,
    createdDatetime: FIXED_DATE,
  },
};

const documentTypeAsParameter = new UploadEvidenceDocumentType('type', new Date(0), getMockDocument(), new Date(0));
const witnessAsParameter = new UploadEvidenceWitness('witness name', new Date(0), getMockDocument(), new Date(0));
const expertAsParameter = new UploadEvidenceExpert('expert name', 'expertise','expertises','other party', 'document question', 'document answer', new Date(0), getMockDocument(), new Date(0));

function getTrialArrangement() {
  const defendantTrialArrangement = new TrialArrangements();
  defendantTrialArrangement.hasAnythingChanged = new HasAnythingChangedForm(undefined, undefined),
  defendantTrialArrangement.isCaseReady = undefined,
  defendantTrialArrangement.otherTrialInformation = undefined;
  return defendantTrialArrangement;
}
describe('toCUICaseProgression', () => {
  it('should convert CCDClaim to CaseProgression', () => {
    const ccdClaim: CCDClaim = createCCDClaimForEvidenceUpload();
    ccdClaim.finalOrderDocumentCollection =
      [new FinalOrderDocumentCollection(mockFinalOrderDocument1.id, mockFinalOrderDocument1.value)];
    const expectedOutput = createCUIClaim();
    expectedOutput.defendantTrialArrangements = getTrialArrangement();
    expectedOutput.claimantTrialArrangements = getTrialArrangement();
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
      finalOrderDocumentCollection: undefined,
      trialReadyRespondent1: undefined,
      respondent1RevisedHearingRequirements: undefined,
      respondent1HearingOtherComments: undefined,
    };
    const expectedOutput: CaseProgression = new CaseProgression();
    expectedOutput.caseBundles = [] as Bundle[];
    expectedOutput.claimantUploadDocuments = new UploadDocuments(undefined, undefined, undefined, undefined);
    expectedOutput.defendantUploadDocuments = new UploadDocuments(undefined, undefined, undefined, undefined);
    expectedOutput.defendantLastUploadDate = undefined;
    expectedOutput.claimantLastUploadDate = undefined;
    expectedOutput.claimantUploadDocuments = new UploadDocuments([], [], [], []);
    expectedOutput.defendantUploadDocuments = new UploadDocuments([], [], [], []);
    expectedOutput.finalOrderDocumentCollection = undefined;
    expectedOutput.defendantTrialArrangements = getTrialArrangement();
    expectedOutput.claimantTrialArrangements = getTrialArrangement();
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
      finalOrderDocumentCollection: [mockFinalOrderDocument1, mockFinalOrderDocument2],
    };
    const expectedOutput: CaseProgression = new CaseProgression();
    expectedOutput.caseBundles = [] as Bundle[];
    expectedOutput.defendantLastUploadDate = undefined;
    expectedOutput.claimantDocuments = undefined;
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
      [],
      [new UploadDocumentTypes(false, documentTypeAsParameter, EvidenceUploadTrial.AUTHORITIES, 'Defendant')],
    );
    expectedOutput.finalOrderDocumentCollection = [(new FinalOrderDocumentCollection(mockFinalOrderDocument1.id,  mockFinalOrderDocument1.value)),
      (new FinalOrderDocumentCollection(mockFinalOrderDocument2.id,  mockFinalOrderDocument2.value))];
    expectedOutput.defendantTrialArrangements = getTrialArrangement();
    expectedOutput.claimantTrialArrangements = getTrialArrangement();
    const actualOutput = toCUICaseProgression(ccdClaim);
    expect(actualOutput).toEqual(expectedOutput);
  });
});

function createCUIClaim(): CaseProgression {
  return {
    caseBundles: [] as Bundle[],
    claimantUploadDocuments:
      new UploadDocuments(getUploadDocumentList('disclosure'), getUploadDocumentList('witness'), getUploadDocumentList('expert'), getUploadDocumentList('trial')),
    defendantUploadDocuments:
      new UploadDocuments(getUploadDocumentList('disclosure'), getUploadDocumentList('witness'), getUploadDocumentList('expert'), getUploadDocumentList('trial')),
    claimantLastUploadDate: new Date('1970-01-01T00:00:00.000Z'),
    defendantLastUploadDate: new Date('1970-01-01T00:00:00.000Z'),
    finalOrderDocumentCollection: getFinalOrderDocumentCollection(),
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

function getFinalOrderDocumentCollection() : FinalOrderDocumentCollection[] {
  const finalOrderDocumentCollection = [] as FinalOrderDocumentCollection[];
  finalOrderDocumentCollection.push( new FinalOrderDocumentCollection(documentForFinalOrder.id, documentForFinalOrder.value));
  return finalOrderDocumentCollection;
}
