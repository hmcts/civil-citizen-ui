import {app} from '../../../../../main/app';
import config from 'config';
import request from 'supertest';
import nock from 'nock';
import {DASHBOARD_URL} from 'routes/urls';
import {CIVIL_SERVICE_CASES_URL} from '../../../../../main/app/client/civilServiceUrls';
import {
  mockCivilClaim,
} from '../../../../utils/mockDraftStore';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/oidc');

const mockClaimWithStatus = (stat: string) => {
  nock('http://localhost:4000')
    .get(CIVIL_SERVICE_CASES_URL + 'defendant/undefined')
    .reply(200, [
      {
        claimId: '1645882162449409',
        claimNumber: '000MC009',
        claimantName: 'John Test',
        claimAmount: '1000',
        responseDeadline: '2023-09-25T13:46:07.287',
        defendantResponseStatus: stat,
        respondent1ResponseDeadline: '2023-09-25T13:46:07.287',
      },
    ]);
};

describe('Dashboard page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return dashboard page', async () => {
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Claims made by or against you');
    });

    it('should have proper text for NO_RESPONSE status', async () => {
      mockClaimWithStatus('NO_RESPONSE');
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Response to claim.');
    });
  });
});
