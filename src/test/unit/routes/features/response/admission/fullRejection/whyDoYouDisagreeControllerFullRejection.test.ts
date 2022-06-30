import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import {CITIZEN_TIMELINE_URL, CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL} from '../../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../utils/mockDraftStore';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Why do you disagree Full Rejection Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on Get', () => {
    test('should return Why do you disagree Full Rejection page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Why do you disagree with the claim amount?');
        });
    });
    test('should return status 500 when there is an error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
  describe('on Post', () => {
    test('should validate when text is not fill', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Why do you disagree with the claim amount?');
        });
    });
    test('should redirect to claim list when text is filled', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL)
        .send('text=Test')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_TIMELINE_URL);
        });
    });
    test('should return 500 status when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL)
        .send('text=Test')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
});
