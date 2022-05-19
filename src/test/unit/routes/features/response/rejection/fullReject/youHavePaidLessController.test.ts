import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../../main/app';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {REDIS_FAILURE} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {CITIZEN_FULL_REJECTION_YOU_PAID_LESS, CLAIM_TASK_LIST_URL} from '../../../../../../../main/routes/urls';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('You Have Paid Less Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    it('should return you have paid less page successfully', async () => {
      await request(app).get(CITIZEN_FULL_REJECTION_YOU_PAID_LESS).expect((res) => {
        expect(res.status).toBe(200);
        // &#39; is apostrophe (') when escaped in the HTML
        expect(res.text).toContain('You&#39;ve paid less than the total claim amount');
      });
    });

    it('should return status 500 when there is an error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_FULL_REJECTION_YOU_PAID_LESS).expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: REDIS_FAILURE});
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to claim task list', async () => {
      await request(app)
        .post(CITIZEN_FULL_REJECTION_YOU_PAID_LESS)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
  });
});
