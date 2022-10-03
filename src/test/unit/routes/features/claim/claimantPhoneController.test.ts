import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CLAIMANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL,
} from '../../../../../main/routes/urls';
import {t} from 'i18next';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
//import {getUserId} from '../../../../../main/services/features/claim/claimantPhoneService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
//jest.mock('../../../../../main/services/features/claim/claimantPhoneService');
// jest.mock('../../../../../main/services/features/claim/claimantPhoneService', () => ({
//   ...jest.requireActual('../../../../../main/services/features/claim/claimantPhoneService'),
//   getUserId: jest.fn(),
// }));


const PHONE_NUMBER = '01632960001';
//const mockGetUserId = getUserId as jest.Mock;

describe('Completing Claim', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return on your claimant phone number page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      // mockGetUserId.mockImplementation(async () => {
      //   return '123';
      // });
      await request(app)
        .get(CLAIMANT_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIMANT_PHONE.TITLE'));
        });
    });

    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should redirect to task list when optional phone number provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({phoneNumber: PHONE_NUMBER})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
        });
    });

    it('should redirect to task list when optional phone number is not provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({phoneNumber: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
        });
    });

    it('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({phoneNumber: 'abc'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_PHONE_NUMBER);
        });
    });

    it('should return error on input with interior spaces', async () => {
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({phoneNumber: '123 456'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_PHONE_NUMBER);
        });
    });

    it('should accept input with trailing whitespaces', async () => {
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({phoneNumber: '123 '})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({phoneNumber: PHONE_NUMBER})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
