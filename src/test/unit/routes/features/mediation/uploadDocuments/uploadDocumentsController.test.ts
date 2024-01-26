import {
  MEDIATION_UPLOAD_DOCUMENTS,
  MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND,
} from 'routes/urls';
import config from 'config';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import nock from 'nock';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {
  TypeOfDocuments,
  TypeOfMediationDocuments,
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import express from 'express';
import {CaseDocument} from 'models/document/caseDocument';
import {DateInputFields} from 'models/caseProgression/uploadDocumentsUserForm';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const TYPE_OF_DOCUMENTS = Array.of(new TypeOfDocuments(1,TypeOfMediationDocuments.YOUR_STATEMENT, true),
  new TypeOfDocuments(2,TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true));

const CONTROLLER_URL = MEDIATION_UPLOAD_DOCUMENTS;
const caseDoc = '{"documentLink":{"document_url":"http://test","document_binary_url":"http://test/binary","document_filename":"test.png","document_hash":"test"},"documentName":"test.png","documentSize":86349,"createdDatetime":"2023-06-27T11:32:29","createdBy":"test"}';
const file = {
  fieldname: 'documentsForYourStatement[0][fileUpload]',
  originalname: 'test.txt',
  mimetype: 'text/plain',
  size: 123,
  buffer: Buffer.from('Test file content'),
};

describe('Mediation upload your documents Controller', () => {
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
    it('should open upload your document page', async () => {
      await request(app)
        .get(CONTROLLER_URL)
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
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    it('should valid to the mediation when is documentsForYourStatement Upload documents page ', async () => {

      const documentsForYourStatement = {
        'documentsForYourStatement': [{
          'typeOfDocument': '',
          'dateInputFields': {
            'dateDay': '',
            'dateMonth': '',
            'dateYear': '',
          },
          'fileUpload': '',
        }],
      };
      await request(app)
        .post(CONTROLLER_URL)
        .send(documentsForYourStatement)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_ENTER_NAME);
        });
    });

    it('should redirect to the next page when inputs are validated', async () => {

      const documentsForYourStatement = {
        'documentsForYourStatement': [{
          'typeOfDocument': 'Word',
          'dateInputFields': {
            'dateDay': '14',
            'dateMonth': '10',
            'dateYear': '2020',
          },
          caseDocument: caseDoc,
        }],
      };

      const sections = Object.assign(documentsForYourStatement);

      await request(app)
        .post(CONTROLLER_URL)
        .send(sections)
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND);
        });
    });

    it('should add another yourStatement', async () => {

      const documentsForYourStatement = {
        action: 'add_another-yourStatement',
        'documentsForYourStatement': [{
          'typeOfDocument': 'Word',
          'dateInputFields': {
            'dateDay': '14',
            'dateMonth': '10',
            'dateYear': '2020',
          },
          caseDocument: caseDoc,
        }],
      };

      const sections = Object.assign(documentsForYourStatement);

      await request(app)
        .post(CONTROLLER_URL)
        .send(sections)
        .expect((res: express.Response) => {
          expect(res.status).toBe(200);
        });
    });

    it('should upload file yourStatement', async () => {
      const mockCaseDocument: CaseDocument = <CaseDocument>{  createdBy: 'test',
        documentLink: {document_url: '', document_binary_url:'', document_filename:''},
        documentName: 'name',
        documentType: null,
        documentSize: 12345,
        createdDatetime: new Date()};

      const civilServiceUrl = config.get<string>('services.civilService.url');
      nock(civilServiceUrl)
        .post('/case/document/generateAnyDoc')
        .reply(200, mockCaseDocument);
      const validDate = new DateInputFields('12', '11', '2020');

      await request(app)
        .post(CONTROLLER_URL)
        .field('action', 'documentsForDocumentsReferred[0][uploadButton]')
        .field('documentsForDocumentsReferred[0][dateInputFields]', JSON.stringify(validDate))
        .field('documentsForDocumentsReferred[0][typeOfDocument]', 'test document')
        .attach('documentsForDocumentsReferred[0][fileUpload]', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(200);
        });
    });

    it('should add another documentsReferred', async () => {

      const documentsForYourStatement = {
        action: 'add_another-documentsReferred',
        'documentsForYourStatement': [{
          'typeOfDocument': 'Word',
          'dateInputFields': {
            'dateDay': '14',
            'dateMonth': '10',
            'dateYear': '2020',
          },
          caseDocument: caseDoc,
        }],
      };

      const sections = Object.assign(documentsForYourStatement);

      await request(app)
        .post(CONTROLLER_URL)
        .send(sections)
        .expect((res: express.Response) => {
          expect(res.status).toBe(200);
        });
    });

    it('should remove item documentsReferred', async () => {

      const documentsForYourStatement = {
        action: 'add_another-documentsReferred[removeButton]',
        'documentsReferred': [{
          'typeOfDocument': 'Word',
          'dateInputFields': {
            'dateDay': '14',
            'dateMonth': '10',
            'dateYear': '2020',
          },
          caseDocument: caseDoc,
        }],
      };

      const sections = Object.assign(documentsForYourStatement);

      await request(app)
        .post(CONTROLLER_URL)
        .send(sections)

        .expect((res: express.Response) => {
          expect(res.status).toBe(200);
        });
    });
    it('should remove item documentsForYourStatement', async () => {

      const documentsForYourStatement = {
        action: 'add_another-documentsForYourStatement[removeButton]',
        'documentsForYourStatement': [{
          'typeOfDocument': 'Word',
          'dateInputFields': {
            'dateDay': '14',
            'dateMonth': '10',
            'dateYear': '2020',
          },
          caseDocument: caseDoc,
        }],
      };

      const sections = Object.assign(documentsForYourStatement);

      await request(app)
        .post(CONTROLLER_URL)
        .send(sections)

        .expect((res: express.Response) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
