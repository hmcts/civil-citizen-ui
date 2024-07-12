import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_CANCEL_JOURNEY,
} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {isCaseProgressionV1Enable} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
describe('Apply for help with fees', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  beforeEach(()=> {
    (isCaseProgressionV1Enable as jest.Mock).mockReturnValueOnce(true);
  });

  describe('on GET', () => {
    it('should return to claimant dashboard', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(HEARING_FEE_CANCEL_JOURNEY)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DASHBOARD_CLAIMANT_URL);
        });
    });
  });
  it('should return http 302 when has error in the get method', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(HEARING_FEE_CANCEL_JOURNEY)
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });
});
