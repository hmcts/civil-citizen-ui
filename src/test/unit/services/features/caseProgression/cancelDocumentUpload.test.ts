import {Claim} from 'models/claim';
import {ClaimantOrDefendant} from 'models/partyType';
import {
  UploadDocuments,
  UploadDocumentTypes,
  UploadEvidenceExpert,
  UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {EvidenceUploadExpert, EvidenceUploadWitness} from 'models/document/documentType';
import {Document} from 'models/document/document';
import {cancelDocumentUpload} from 'services/features/caseProgression/cancelDocumentUpload';
import {app} from '../../../../../main/app';

const REDIS_DATA = require('../../../../../main/modules/draft-store/redisData.json');

const claimantWitnessStatementDocument: Document = {
  document_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
  document_filename: 'witness_document.pdf',
  document_binary_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
  document_hash: 'bfb0337b6b922c16bda85adf37807cbc70ab2cc15399c5532a92d3ac0ce22561',
  category_id: '',
};

const claimantWitnessStatement: UploadEvidenceWitness = {
  witnessOptionName: 'witness name',
  witnessOptionUploadDate: new Date(0),
  witnessOptionDocument: claimantWitnessStatementDocument,
  createdDateTime: new Date(0),
};

const claimantWitnessSummaryDocument: Document = {
  document_url: 'http://dm-store:8080/documents/e9fd1e11-bbf2-4d95-bc79-beeb9f3a2ab6',
  document_filename: 'witness_document.pdf',
  document_binary_url: 'http://dm-store:8080/documents/e9fd1e11-bbf2-4d95-bc79-beeb9f3a2ab6/binary',
  document_hash: '7770bacecebc447caa0e7c7eda65b603f822ef41695f89e495da9d826454346b',
  category_id: '',
};

const claimantWitnessSummary: UploadEvidenceWitness = {
  witnessOptionName: 'witness name',
  witnessOptionUploadDate: new Date(0),
  witnessOptionDocument: claimantWitnessSummaryDocument,
  createdDateTime: new Date(0),
};

const defendantWitnessStatementDocument: Document = {
  document_url: 'http://dm-store:8080/documents/a9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
  document_filename: 'witness_document.pdf',
  document_binary_url: 'http://dm-store:8080/documents/a9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
  document_hash: '2e84809a242c21c42efdafb5742c85ed6fdd7660012c0b55d13476a6d1d8cc1d',
  category_id: '',
};

const defendantWitnessStatement: UploadEvidenceWitness = {
  witnessOptionName: 'witness name',
  witnessOptionUploadDate: new Date(0),
  witnessOptionDocument: defendantWitnessStatementDocument,
  createdDateTime: new Date(0),
};

const defendantWitnessSummaryDocument: Document = {
  document_url: 'http://dm-store:8080/documents/e9fd1e11-bbf2-4d95-bc79-beeb9f3a2ab6',
  document_filename: 'witness_document.pdf',
  document_binary_url: 'http://dm-store:8080/documents/e9fd1e11-bbf2-4d95-bc79-beeb9f3a2ab6/binary',
  document_hash: 'd64a8f6cbc6fcf56dbf5ea29fc620c650f2570e88f32a9b97d80989e4cd70402',
  category_id: '',
};

const defendantWitnessSummary: UploadEvidenceWitness = {
  witnessOptionName: 'witness name',
  witnessOptionUploadDate: new Date(0),
  witnessOptionDocument: defendantWitnessSummaryDocument,
  createdDateTime: new Date(0),
};

const claimantAnswersForExpertDocument: Document = {
  document_url: 'http://dm-store:8080/documents/d9fd1e10-daf2-4d95-dc79-ddeb9f3a2ab6',
  document_filename: 'expert_document.pdf',
  document_binary_url: 'http://dm-store:8080/documents/d9fd1e10-daf2-4d95-dc79-ddeb9f3a2ab6/binary',
  document_hash: 'ecada475a75cb334c769e40bf694b7cfccd82804e0e1edb9f95d08c6357e56c2',
  category_id: '',
};

const claimantAnswersForExpert: UploadEvidenceExpert = {
  expertOptionName: 'expert name',
  expertOptionExpertise: 'expertise',
  expertOptionExpertises: 'expertises',
  expertOptionOtherParty: 'other party',
  expertDocumentQuestion: 'document question',
  expertDocumentAnswer: 'document answer',
  expertOptionUploadDate: new Date(0),
  expertDocument: claimantAnswersForExpertDocument,
  createdDateTime: new Date(0),
};

const claimantExpertReportDocument: Document = {
  document_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab3',
  document_filename: 'expert_document.pdf',
  document_binary_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab3/binary',
  document_hash: 'b93759b36e9aaf6ad8aa5b00e1cef537e2fd248d998224e218b678183b417370',
  category_id: '',
};

const claimantExpertReport: UploadEvidenceExpert = {
  expertOptionName: 'expert name',
  expertOptionExpertise: 'expertise',
  expertOptionExpertises: 'expertises',
  expertOptionOtherParty: 'other party',
  expertDocumentQuestion: 'document question',
  expertDocumentAnswer: 'document answer',
  expertOptionUploadDate: new Date(0),
  expertDocument: claimantExpertReportDocument,
  createdDateTime: new Date(0),
};

const defendantAnswersForExpertDocument: Document = {
  document_url: 'http://dm-store:8080/documents/d91d1e10-d1f2-4195-dc79-d1eb9f3a2ab6',
  document_filename: 'expert_document.pdf',
  document_binary_url: 'http://dm-store:8080/documents/d91d1e10-d1f2-4195-dc79-d1eb9f3a2ab6/binary',
  document_hash: 'bfcbc3cf3ca59a0b4b8223cb7c30588bdfa0402bc99bf546f2d8b6a0ca59b2ce',
  category_id: '',
};

const defendantAnswersForExpert: UploadEvidenceExpert = {
  expertOptionName: 'expert name',
  expertOptionExpertise: 'expertise',
  expertOptionExpertises: 'expertises',
  expertOptionOtherParty: 'other party',
  expertDocumentQuestion: 'document question',
  expertDocumentAnswer: 'document answer',
  expertOptionUploadDate: new Date(0),
  expertDocument: defendantAnswersForExpertDocument,
  createdDateTime: new Date(0),
};

const defendantExpertReportDocument: Document = {
  document_url: 'http://dm-store:8080/documents/d3fd1410-da43-4d43-dc73-ddeb9f3a2ab3',
  document_filename: 'expert_document.pdf',
  document_binary_url: 'http://dm-store:8080/documents/d3fd1410-da43-4d43-dc73-ddeb9f3a2ab3/binary',
  document_hash: '0333a79ddc0e56576612a4fc6ede898bd300b786e28db10bd50063a16329c8cc',
  category_id: '',
};

const defendantExpertReport: UploadEvidenceExpert = {
  expertOptionName: 'expert name',
  expertOptionExpertise: 'expertise',
  expertOptionExpertises: 'expertises',
  expertOptionOtherParty: 'other party',
  expertDocumentQuestion: 'document question',
  expertDocumentAnswer: 'document answer',
  expertOptionUploadDate: new Date(0),
  expertDocument: defendantExpertReportDocument,
  createdDateTime: new Date(0),
};

const claimId = '1645882162449409';

function initialiseClaimant() {
  const caseProgression: CaseProgression = new CaseProgression();
  caseProgression.claimantUploadDocuments = new UploadDocuments();
  caseProgression.claimantUploadDocuments.witness = [];
  caseProgression.claimantUploadDocuments.expert = [];
  caseProgression.claimantUploadDocuments.checkboxGrp = [true, true, true, true];
  caseProgression.claimantUploadDocuments.witness
    .push(new UploadDocumentTypes(true, claimantWitnessStatement, EvidenceUploadWitness.WITNESS_STATEMENT));
  caseProgression.claimantUploadDocuments.witness
    .push(new UploadDocumentTypes(true, claimantWitnessSummary, EvidenceUploadWitness.WITNESS_SUMMARY));
  caseProgression.claimantUploadDocuments.expert
    .push(new UploadDocumentTypes(true, claimantAnswersForExpert, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS));
  caseProgression.claimantUploadDocuments.expert
    .push(new UploadDocumentTypes(true, claimantExpertReport, EvidenceUploadExpert.EXPERT_REPORT));
  const claim: Claim = new Claim();
  claim.id = claimId;
  claim.caseProgression = caseProgression;
  return claim;
}

function initialiseDefendant() {
  const caseProgression: CaseProgression = new CaseProgression();
  caseProgression.defendantUploadDocuments = new UploadDocuments();
  caseProgression.defendantUploadDocuments.witness = [];
  caseProgression.defendantUploadDocuments.expert = [];
  caseProgression.defendantUploadDocuments.checkboxGrp = [true, true, true, true];
  caseProgression.defendantUploadDocuments.witness
    .push(new UploadDocumentTypes(true, defendantWitnessStatement, EvidenceUploadWitness.WITNESS_STATEMENT));
  caseProgression.defendantUploadDocuments.witness
    .push(new UploadDocumentTypes(true, defendantWitnessSummary, EvidenceUploadWitness.WITNESS_SUMMARY));
  caseProgression.defendantUploadDocuments.expert
    .push(new UploadDocumentTypes(true, defendantAnswersForExpert, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS));
  caseProgression.defendantUploadDocuments.expert
    .push(new UploadDocumentTypes(true, defendantExpertReport, EvidenceUploadExpert.EXPERT_REPORT));
  const claim: Claim = new Claim();
  claim.id = claimId;
  claim.caseProgression = caseProgression;
  return claim;
}

function createMockDraftStore(returnData: unknown) {
  return {
    get: jest.fn(async () => JSON.stringify(returnData)),
    set: jest.fn(async () => {
      return;
    }),
  };
}
describe('cancelDocumentUpload', () => {
  it('should remove all elements from claimant upload documents', async () => {
    //Given
    const claim: Claim = initialiseClaimant();
    const claimantOrDefendant: ClaimantOrDefendant = ClaimantOrDefendant.CLAIMANT;
    app.locals.draftStoreClient = createMockDraftStore(REDIS_DATA[0]);
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    const spySet = jest.spyOn(app.locals.draftStoreClient, 'set');
    //When
    await cancelDocumentUpload(claimId, claim, claimantOrDefendant);
    //Then
    expect(claim.caseProgression.claimantUploadDocuments.checkboxGrp.length).toEqual(0);
    expect(claim.caseProgression.claimantUploadDocuments.witness.length).toEqual(0);
    expect(claim.caseProgression.claimantUploadDocuments.expert.length).toEqual(0);
    expect(spyGet).toBeCalled();
    expect(spySet).toBeCalled();
  });
  it('should remove all elements from defendant upload documents', async () => {
    //Given
    const claim: Claim = initialiseDefendant();
    const claimantOrDefendant: ClaimantOrDefendant = ClaimantOrDefendant.DEFENDANT;
    app.locals.draftStoreClient = createMockDraftStore(REDIS_DATA[0]);
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    const spySet = jest.spyOn(app.locals.draftStoreClient, 'set');
    //When
    await cancelDocumentUpload(claimId, claim, claimantOrDefendant);
    //Then
    expect(claim.caseProgression.defendantUploadDocuments.checkboxGrp.length).toEqual(0);
    expect(claim.caseProgression.defendantUploadDocuments.witness.length).toEqual(0);
    expect(claim.caseProgression.defendantUploadDocuments.expert.length).toEqual(0);
    expect(spyGet).toBeCalled();
    expect(spySet).toBeCalled();
  });
});
