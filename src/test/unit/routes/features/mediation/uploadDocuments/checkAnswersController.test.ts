import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {

  MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND, MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getTypeOfDocuments} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('services/features/mediation/uploadDocuments/mediationCheckAnswersService');

const CONTROLLER_URL = MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND;

const civilServiceClaim = new Claim();
civilServiceClaim.respondent1 = new Party();
civilServiceClaim.respondent1.partyDetails = {firstName: 'John', lastName: 'Smith'};
civilServiceClaim.mediationUploadDocuments = new UploadDocuments(getTypeOfDocuments());
civilServiceClaim.res1MediationDocumentsReferred = [];
civilServiceClaim.res1MediationNonAttendanceDocs = [];

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
      claim.respondent1.partyDetails = {firstName: 'John', lastName: 'Smith'};
      claim.mediationUploadDocuments = new UploadDocuments(getTypeOfDocuments());
      return claim;
    });

    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockReturnValue(
        new Promise((resolve) => resolve(civilServiceClaim),
        ),
      );
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
    it('should Valid signed is false', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send()
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
        .post(CONTROLLER_URL)
        .send({signed: true})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
