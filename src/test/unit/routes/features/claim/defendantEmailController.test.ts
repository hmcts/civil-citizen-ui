import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CLAIM_DEFENDANT_EMAIL_URL, CLAIM_DEFENDANT_PHONE_NUMBER_URL,
} from '../../../../../main/routes/urls';
import {t} from 'i18next';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

const EMAIL_ADDRESS = 'test@gmail.com';

describe('Completing Claim', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return on your claimant defendant email page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CLAIM_DEFENDANT_EMAIL_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_JOURNEY.DEFENDANT_EMAIL.TITLE'));
        });
    });

    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIM_DEFENDANT_EMAIL_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should redirect to the their mobile screen when email is provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_DEFENDANT_EMAIL_URL)
        .send({emailAddress: EMAIL_ADDRESS})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_DEFENDANT_PHONE_NUMBER_URL);
        });
    });

    it('should redirect to the their mobile screen when email is not provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_DEFENDANT_EMAIL_URL)
        .send({emailAddress: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_DEFENDANT_PHONE_NUMBER_URL);
        });
    });

    it('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_DEFENDANT_EMAIL_URL)
        .send({emailAddress: 'test'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_EMAIL);
        });
    });

    it('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIM_DEFENDANT_EMAIL_URL)
        .send({emailAddress: EMAIL_ADDRESS})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
