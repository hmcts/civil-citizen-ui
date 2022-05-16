import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from '../../../../../main/routes/urls';
import {
  mockCivilClaimApplicantCompanyType, mockCivilClaimApplicantIndividualType,
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {REDIS_FAILURE} from '../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Free Telephone Mediation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return free telephone mediation page successfully when applicant is business', async () => {
      app.locals.draftStoreClient = mockCivilClaimApplicantCompanyType;
      await request(app).get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Free telephone mediation');
      });
    });

    it('should return free telephone mediation page successfully when applicant is individual', async () => {
      app.locals.draftStoreClient = mockCivilClaimApplicantIndividualType;
      await request(app).get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Free telephone mediation');
      });
    });

    it('should return status 500 when there is Redis error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app).get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(500);
        expect(res.body).toMatchObject({error: REDIS_FAILURE});
      });
    });
  });
});

