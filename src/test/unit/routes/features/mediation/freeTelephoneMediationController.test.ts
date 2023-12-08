import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from '../../../../../main/routes/urls';
import {
  mockCivilClaim, mockCivilClaimUnemploymentRetired,
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');

describe('Free Telephone Mediation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return free telephone mediation page successfully when applicant is business', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Free telephone mediation');
      });
    });

    it('should return free telephone mediation page successfully when applicant is individual', async () => {
      app.locals.draftStoreClient = mockCivilClaimUnemploymentRetired;
      await request(app).get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Free telephone mediation');
      });
    });

    it('should return status 500 when there is Redis error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app).get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
});

afterAll(() => {
  global.gc && global.gc();
});
