import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  mockCivilClaim,
  mockRedisFailure,
  mockRedisFullAdmission,
} from '../../../../utils/mockDraftStore';
import {UNDERSTANDING_RESPONSE_OPTIONS_URL} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Understanding Your Options Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return understanding you options page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(UNDERSTANDING_RESPONSE_OPTIONS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Understanding your options before respond');
      });
    });

    it('should return understanding you options page when response deadline date is not set', async () => {
      app.locals.draftStoreClient = mockRedisFullAdmission;
      await request(app).get(UNDERSTANDING_RESPONSE_OPTIONS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Understanding your options before respond');
      });
    });

    it('should return an error page if request fails', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app).get(UNDERSTANDING_RESPONSE_OPTIONS_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
});
