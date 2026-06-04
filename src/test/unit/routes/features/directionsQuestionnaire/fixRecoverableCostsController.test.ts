import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  DQ_FIX_RECOVERABLE_COSTS_URL,
} from 'routes/urls';
import {
  mockCivilClaim,
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('Fixed recoverable costs Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return Fixed recoverable costs page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(DQ_FIX_RECOVERABLE_COSTS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Fixed recoverable costs - Is the claim subject to the Fixed Recoverable Costs Regime?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DQ_FIX_RECOVERABLE_COSTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return Fixed recoverable costs page on empty post', async () => {
      await request(app).post(DQ_FIX_RECOVERABLE_COSTS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Fixed recoverable costs - Is the claim subject to the Fixed Recoverable Costs Regime?');
      });
    });
  });
});
