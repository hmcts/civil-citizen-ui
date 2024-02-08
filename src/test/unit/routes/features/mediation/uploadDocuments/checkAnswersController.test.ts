import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  MEDIATION_UPLOAD_DOCUMENTS,
  MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND, MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {
  TypeOfDocuments,
  TypeOfMediationDocuments,
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {TypeOfDocumentYourNameSection} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {TypeOfDocumentSection} from 'models/caseProgression/uploadDocumentsUserForm';
import {
  DocumentType,
  EvidenceUploadDisclosure,
  EvidenceUploadExpert, EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {CaseDocument} from 'models/document/caseDocument';
import {Document} from 'models/document/document';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const CONTROLLER_URL = MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND;

const MOCK_CASE_DOCUMENT: CaseDocument = <CaseDocument>{  createdBy: 'test',
  documentLink: {document_url: 'http://dm-store:8080/documents/757f50dc-6978-4cf8-8fa0-38e05bde2d51', document_binary_url:'http://dm-store:8080/documents/757f50dc-6978-4cf8-8fa0-38e05bde2d51/binary', document_filename:'fileName'},
  documentName: 'name',
  documentType: null,
  documentSize: 12345,
  createdDatetime: new Date()};
const TYPE_OF_DOCUMENT_YOUR_NAME_SECTION = new TypeOfDocumentYourNameSection('1','1', '2024');
TYPE_OF_DOCUMENT_YOUR_NAME_SECTION.yourName = 'John Smith';
TYPE_OF_DOCUMENT_YOUR_NAME_SECTION.caseDocument = MOCK_CASE_DOCUMENT;

const TYPE_OF_DOCUMENT = new TypeOfDocumentSection('1','1', '2024');
TYPE_OF_DOCUMENT.typeOfDocument = 'John Smith';
TYPE_OF_DOCUMENT.caseDocument = MOCK_CASE_DOCUMENT;

const TYPE_OF_DOCUMENTS = Array.of(new TypeOfDocuments(
  1,
  TypeOfMediationDocuments.YOUR_STATEMENT,
  true,
  Array.of(TYPE_OF_DOCUMENT_YOUR_NAME_SECTION),
),
new TypeOfDocuments(
  2,
  TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT,
  true,
  Array.of(TYPE_OF_DOCUMENT),
),
);

TYPE_OF_DOCUMENT.typeOfDocument = 'document type';
TYPE_OF_DOCUMENT.caseDocument = MOCK_CASE_DOCUMENT;
describe('Mediation check and send Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.partyDetails = {individualFirstName: 'John', individualLastName: 'Smith'};
      claim.mediationUploadDocuments = new UploadDocuments(TYPE_OF_DOCUMENTS);

      return claim;
    });
  });

  describe('on GET', () => {
    it('should open Mediation check your answers page', async () => {
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_CHECK_YOUR_ANSWERS);
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    it('should redirect to the confirmation page ', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({signed: true})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION);
        });
    });
    it('should Valid checkbox when they are not checked', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({typeOfDocuments: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_UPLOAD_DOCUMENTS_TITLE_PAGE);
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({alternativeContactPerson: 'Joe Bloggs'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
