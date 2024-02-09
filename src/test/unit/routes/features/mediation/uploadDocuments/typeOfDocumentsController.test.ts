import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {MEDIATION_TYPE_OF_DOCUMENTS, MEDIATION_UPLOAD_DOCUMENTS} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {
  TypeOfDocuments,
  TypeOfMediationDocuments,
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const CONTROLLER_URL = MEDIATION_TYPE_OF_DOCUMENTS;
const TYPE_OF_DOCUMENTS = Array.of(new TypeOfDocuments(1,TypeOfMediationDocuments.YOUR_STATEMENT, true),
  new TypeOfDocuments(2,TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true));
describe('Mediation Type Of Document Controller', () => {
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
    it('should open Mediation type of document page', async () => {
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
    it('should redirect to the mediation Upload documents page ', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({typeOfDocuments: TypeOfMediationDocuments.YOUR_STATEMENT})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(MEDIATION_UPLOAD_DOCUMENTS);
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
