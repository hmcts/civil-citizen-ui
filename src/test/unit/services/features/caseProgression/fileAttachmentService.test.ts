import {CaseProgression} from 'models/caseProgression/caseProgression';
import {
  UploadDocuments,
  UploadDocumentTypes,
  UploadEvidenceExpert,
  UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {EvidenceUploadExpert, EvidenceUploadWitness} from 'models/document/documentType';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Document} from 'models/document/document';
import {
  attachCaseDocuments,
  getUploadDocumentsToProcess,
  remove,
  removeFrom,
  isAttachedTo,
  areEqual,
  getDocument,
  getDocuments,
} from 'services/features/caseProgression/fileAttachmentService';
import {ClaimantOrDefendant} from 'models/partyType';
import * as requestModels from 'models/AppRequest';

jest.mock('client/civilServiceClient');

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;

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

const claimId = '1687172929870397';

function initialiseClaimant() {
  const caseProgression: CaseProgression = new CaseProgression();
  caseProgression.claimantUploadDocuments = new UploadDocuments();
  caseProgression.claimantUploadDocuments.witness = [];
  caseProgression.claimantUploadDocuments.expert = [];
  caseProgression.claimantUploadDocuments.witness
    .push(new UploadDocumentTypes(true, claimantWitnessStatement, EvidenceUploadWitness.WITNESS_STATEMENT));
  caseProgression.claimantUploadDocuments.witness
    .push(new UploadDocumentTypes(true, claimantWitnessSummary, EvidenceUploadWitness.WITNESS_SUMMARY));
  caseProgression.claimantUploadDocuments.expert
    .push(new UploadDocumentTypes(true, claimantAnswersForExpert, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS));
  caseProgression.claimantUploadDocuments.expert
    .push(new UploadDocumentTypes(true, claimantExpertReport, EvidenceUploadExpert.EXPERT_REPORT));
  return caseProgression;
}

function initialiseDefendant() {
  const caseProgression: CaseProgression = new CaseProgression();
  caseProgression.defendantUploadDocuments = new UploadDocuments();
  caseProgression.defendantUploadDocuments.witness = [];
  caseProgression.defendantUploadDocuments.expert = [];
  caseProgression.defendantUploadDocuments.witness
    .push(new UploadDocumentTypes(true, defendantWitnessStatement, EvidenceUploadWitness.WITNESS_STATEMENT));
  caseProgression.defendantUploadDocuments.witness
    .push(new UploadDocumentTypes(true, defendantWitnessSummary, EvidenceUploadWitness.WITNESS_SUMMARY));
  caseProgression.defendantUploadDocuments.expert
    .push(new UploadDocumentTypes(true, defendantAnswersForExpert, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS));
  caseProgression.defendantUploadDocuments.expert
    .push(new UploadDocumentTypes(true, defendantExpertReport, EvidenceUploadExpert.EXPERT_REPORT));
  return caseProgression;
}

describe('File Attachment service', () => {
  describe('attachCaseDocuments', () => {
    it('should attach all claimant case documents', async () => {
      //Given
      const caseProgression: CaseProgression = initialiseClaimant();
      const expectedDocuments: Document[] =
        [claimantWitnessStatement.witnessOptionDocument,
          claimantWitnessSummary.witnessOptionDocument,
          claimantAnswersForExpert.expertDocument,
          claimantExpertReport.expertDocument,
        ];
      jest.spyOn(CivilServiceClient.prototype, 'attachCaseDocuments').mockReturnValue(new Promise((resolve) => resolve(expectedDocuments)));
      const expectedErrors = [];
      //When
      const result = await attachCaseDocuments(claimId, ClaimantOrDefendant.CLAIMANT, caseProgression, mockedAppRequest);
      //Then
      expect(result.caseProgression.claimantUploadDocuments.witness.length).toEqual(caseProgression.claimantUploadDocuments.witness.length);
      expect(result.caseProgression.claimantUploadDocuments.expert.length).toEqual(caseProgression.claimantUploadDocuments.expert.length);
      expect(result.errors.length).toEqual(expectedErrors.length);
    });
    it('should attach all defendant case documents', async () => {
      //Given
      const caseProgression: CaseProgression = initialiseDefendant();
      const expectedDocuments: Document[] =
        [defendantWitnessStatement.witnessOptionDocument,
          defendantWitnessSummary.witnessOptionDocument,
          defendantAnswersForExpert.expertDocument,
          defendantExpertReport.expertDocument,
        ];
      jest.spyOn(CivilServiceClient.prototype, 'attachCaseDocuments').mockReturnValue(new Promise((resolve) => resolve(expectedDocuments)));
      const expectedErrors = [];
      //When
      const result = await attachCaseDocuments(claimId, ClaimantOrDefendant.DEFENDANT, caseProgression, mockedAppRequest);
      //Then
      expect(result.caseProgression.defendantUploadDocuments.witness.length).toEqual(caseProgression.defendantUploadDocuments.witness.length);
      expect(result.caseProgression.defendantUploadDocuments.expert.length).toEqual(caseProgression.defendantUploadDocuments.expert.length);
      expect(result.errors.length).toEqual(expectedErrors.length);
    });
    it('should return errors if only some documents attached to case', async () => {
      //Given
      const caseProgression: CaseProgression = initialiseDefendant();
      const expectedDocuments =
        [defendantWitnessStatement.witnessOptionDocument,
          defendantWitnessSummary.witnessOptionDocument,
          defendantExpertReport.expertDocument,
        ];
      jest.spyOn(CivilServiceClient.prototype, 'attachCaseDocuments').mockReturnValue(new Promise((resolve) => resolve(expectedDocuments)));
      const errorMessage = `${defendantAnswersForExpert.expertDocument.document_filename} has not been attached to the case ${claimId}.`;
      const expectedErrors = [errorMessage];
      //When
      const result = await attachCaseDocuments(claimId, ClaimantOrDefendant.DEFENDANT, caseProgression, mockedAppRequest);
      //Then
      expect(result.caseProgression.defendantUploadDocuments.witness.length).toEqual(2);
      expect(result.caseProgression.defendantUploadDocuments.expert.length).toEqual(1);
      expect(result.errors.length).toEqual(expectedErrors.length);
      expect(result.errors[0]).toEqual(errorMessage);
    });
  });
  describe('getUploadDocumentsToProcess', () => {
    it('should return expected UploadDocumentTypes', () => {
      //Given
      const caseProgression: CaseProgression = initialiseDefendant();
      const uploadDocuments = caseProgression.defendantUploadDocuments;
      //When
      const result = getUploadDocumentsToProcess(uploadDocuments);
      //Then
      expect(result.length).toEqual(2);
      expect(result[0].length).toEqual(2);
      expect(result[1].length).toEqual(2);
    });
  });
  describe('removeFrom', () => {
    it('should remove expected element from upload documents to process', () => {
      //Given
      const caseProgression: CaseProgression = initialiseDefendant();
      const uploadDocuments: UploadDocuments = caseProgression.defendantUploadDocuments;
      const uploadDocumentsToProcess: UploadDocumentTypes[][] = [uploadDocuments.witness, uploadDocuments.expert];
      const elementToRemove: UploadDocumentTypes = uploadDocumentsToProcess[1][0];
      //When
      removeFrom(elementToRemove, uploadDocumentsToProcess);
      //Then
      expect(uploadDocumentsToProcess[0].length).toEqual(2);
      expect(uploadDocumentsToProcess[1].length).toEqual(1);
      expect(uploadDocumentsToProcess[1][0].documentType).toEqual(EvidenceUploadExpert.EXPERT_REPORT);
    });
    it('should not remove an element from upload documents to process even if it has the same properties', () => {
      //Given
      const caseProgression: CaseProgression = initialiseDefendant();
      const uploadDocuments: UploadDocuments = caseProgression.defendantUploadDocuments;
      const uploadDocumentsToProcess: UploadDocumentTypes[][] = [uploadDocuments.witness, uploadDocuments.expert];
      const elementToRemove: UploadDocumentTypes = new UploadDocumentTypes(true, defendantExpertReport, EvidenceUploadExpert.EXPERT_REPORT);
      //When
      removeFrom(elementToRemove, uploadDocumentsToProcess);
      //Then
      expect(uploadDocumentsToProcess[0].length).toEqual(2);
      expect(uploadDocumentsToProcess[1].length).toEqual(2);
    });
  });
  describe('remove', () => {
    it('should remove expected element from upload document types', () => {
      //Given
      const caseProgression: CaseProgression = initialiseDefendant();
      const uploadDocuments: UploadDocuments = caseProgression.defendantUploadDocuments;
      const elementToRemove: UploadDocumentTypes = uploadDocuments.expert[0];
      //When
      remove(elementToRemove, uploadDocuments.expert);
      //Then
      expect(uploadDocuments.expert.length).toEqual(1);
      expect(uploadDocuments.expert[0].documentType).toEqual(EvidenceUploadExpert.EXPERT_REPORT);
    });
    it('should not remove an element from upload documents types even if it has the same properties', () => {
      //Given
      const caseProgression: CaseProgression = initialiseDefendant();
      const uploadDocuments: UploadDocuments = caseProgression.defendantUploadDocuments;
      const elementToRemove: UploadDocumentTypes = new UploadDocumentTypes(true, defendantExpertReport, EvidenceUploadExpert.EXPERT_REPORT);
      //When
      remove(elementToRemove, uploadDocuments.expert);
      //Then
      expect(uploadDocuments.expert.length).toEqual(2);
    });
  });
  describe('isAttachedTo', () => {
    it('should confirm that an expected document is in the collection of attached documents', () => {
      //Given
      const attachedDocuments: Document[] = [defendantExpertReportDocument, defendantAnswersForExpertDocument];
      //When
      const result = isAttachedTo(defendantAnswersForExpertDocument, attachedDocuments);
      //Then
      expect(result).toEqual(true);
    });
    it('should confirm that an unexpected document is not in the collection of attached documents', () => {
      //Given
      const attachedDocuments: Document[] = [defendantExpertReportDocument, defendantAnswersForExpertDocument];
      //When
      const result = isAttachedTo(claimantExpertReportDocument, attachedDocuments);
      //Then
      expect(result).toEqual(false);
    });
  });
  describe('areEqual', () => {
    it('should confirm that two documents are equal if they contain the same data', () => {
      //Given
      const document1 = claimantExpertReportDocument;
      const document2: Document = {
        document_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab3',
        document_filename: 'expert_document.pdf',
        document_binary_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab3/binary',
        document_hash: 'b93759b36e9aaf6ad8aa5b00e1cef537e2fd248d998224e218b678183b417370',
        category_id: '',
      };
      //When
      const result = areEqual(document1, document2);
      //Then
      expect(result).toEqual(true);
    });
    it('should confirm that two documents are not equal if they contain different category id', () => {
      //Given
      const document1 = claimantExpertReportDocument;
      const document2: Document = {
        document_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab3',
        document_filename: 'expert_document.pdf',
        document_binary_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab3/binary',
        document_hash: 'b93759b36e9aaf6ad8aa5b00e1cef537e2fd248d998224e218b678183b417370',
        category_id: '1',
      };
      //When
      const result = areEqual(document1, document2);
      //Then
      expect(result).toEqual(false);
    });
    it('should confirm that two documents are not equal if they contain different document url', () => {
      //Given
      const document1 = claimantExpertReportDocument;
      const document2: Document = {
        document_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab2',
        document_filename: 'expert_document.pdf',
        document_binary_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab3/binary',
        document_hash: 'b93759b36e9aaf6ad8aa5b00e1cef537e2fd248d998224e218b678183b417370',
        category_id: '',
      };
      //When
      const result = areEqual(document1, document2);
      //Then
      expect(result).toEqual(false);
    });
    it('should confirm that two documents are not equal if they contain different document filename', () => {
      //Given
      const document1 = claimantExpertReportDocument;
      const document2: Document = {
        document_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab3',
        document_filename: 'expert_document1.pdf',
        document_binary_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab3/binary',
        document_hash: 'b93759b36e9aaf6ad8aa5b00e1cef537e2fd248d998224e218b678183b417370',
        category_id: '',
      };
      //When
      const result = areEqual(document1, document2);
      //Then
      expect(result).toEqual(false);
    });
    it('should confirm that two documents are not equal if they contain different document binary url', () => {
      //Given
      const document1 = claimantExpertReportDocument;
      const document2: Document = {
        document_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab3',
        document_filename: 'expert_document.pdf',
        document_binary_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab2/binary',
        document_hash: 'b93759b36e9aaf6ad8aa5b00e1cef537e2fd248d998224e218b678183b417370',
        category_id: '',
      };
      //When
      const result = areEqual(document1, document2);
      //Then
      expect(result).toEqual(false);
    });
    it('should confirm that two documents are not equal if they contain different document hash', () => {
      //Given
      const document1 = claimantExpertReportDocument;
      const document2: Document = {
        document_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab3',
        document_filename: 'expert_document.pdf',
        document_binary_url: 'http://dm-store:8080/documents/d3fd1e10-daf3-4d93-dc73-ddeb9f3a2ab3/binary',
        document_hash: 'b93759b36e9aaf6ad8aa5b00e1cef537e2fd248d998224e218b678183b417371',
        category_id: '',
      };
      //When
      const result = areEqual(document1, document2);
      //Then
      expect(result).toEqual(false);
    });
  });
  describe('getDocuments', () => {
    it('should return expected collection of key-value pairs', () => {
      //Given
      const caseProgression: CaseProgression = initialiseDefendant();
      const uploadDocuments: UploadDocuments = caseProgression.defendantUploadDocuments;
      const uploadDocumentsToProcess: UploadDocumentTypes[][] = [uploadDocuments.witness, uploadDocuments.expert];
      const expectedResult: Map<Document, UploadDocumentTypes> = new Map();
      expectedResult.set(defendantWitnessStatementDocument, uploadDocuments.witness[0]);
      expectedResult.set(defendantWitnessSummaryDocument, uploadDocuments.witness[1]);
      expectedResult.set(defendantAnswersForExpertDocument, uploadDocuments.expert[0]);
      expectedResult.set(defendantExpertReportDocument, uploadDocuments.expert[1]);
      //When
      const result = getDocuments(uploadDocumentsToProcess);
      //Then
      expect(result.size).toEqual(expectedResult.size);
      expect(result.get(defendantWitnessStatementDocument).documentType).toEqual(expectedResult.get(defendantWitnessStatementDocument).documentType);
      expect(result.get(defendantWitnessSummaryDocument).documentType).toEqual(expectedResult.get(defendantWitnessSummaryDocument).documentType);
      expect(result.get(defendantAnswersForExpertDocument).documentType).toEqual(expectedResult.get(defendantAnswersForExpertDocument).documentType);
      expect(result.get(defendantExpertReportDocument).documentType).toEqual(expectedResult.get(defendantExpertReportDocument).documentType);
    });
  });
  describe('getDocument', () => {
    it('should return expected document', () => {
      //Given
      const uploadDocumentTypes: UploadDocumentTypes = new UploadDocumentTypes(true, defendantWitnessStatement, EvidenceUploadWitness.WITNESS_STATEMENT);
      //When
      const result = getDocument(uploadDocumentTypes);
      //Then
      expect(result.category_id).toEqual(defendantWitnessStatementDocument.category_id);
      expect(result.document_hash).toEqual(defendantWitnessStatementDocument.document_hash);
      expect(result.document_url).toEqual(defendantWitnessStatementDocument.document_url);
      expect(result.document_binary_url).toEqual(defendantWitnessStatementDocument.document_binary_url);
      expect(result.document_filename).toEqual(defendantWitnessStatementDocument.document_filename);
    });
    it('should return null if argument does not contain Document',() => {
      //Given
      const uploadEvidenceWitness = new UploadEvidenceWitness('', new Date(), null, new Date());
      const uploadDocumentTypes: UploadDocumentTypes = new UploadDocumentTypes(true, uploadEvidenceWitness, EvidenceUploadWitness.WITNESS_STATEMENT);
      //When
      const result = getDocument(uploadDocumentTypes);
      //Then
      expect(result).toBe(null);
    });
  });
});
