import {app} from '../../../../../main/app';
import config from 'config';
import Module from 'module';
import {DASHBOARD_URL} from '../../../../../main/routes/urls';
import {CIVIL_SERVICE_CASES_URL} from '../../../../../main/app/client/civilServiceUrls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
const nock = require('nock');

const session = require('supertest-session');
const citizenRoleToken: string = config.get('citizenRoleToken');
const testSession = session(app);

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/services/dashboard/draftClaimService');
jest.mock('../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};

describe('Dashboard page', () => {
  const idamUrl: string = config.get('idamUrl');
  const serviceAuthProviderUrl = config.get<string>('services.serviceAuthProvider.baseUrl');
  const draftStoreUrl = config.get<string>('services.draftStore.legacy.url');
  const civilServiceUrl = config.get<string>('services.civilService.url');
  nock(idamUrl)
    .post('/o/token')
    .reply(200, {id_token: citizenRoleToken});
  nock(civilServiceUrl)
    .post(CIVIL_SERVICE_CASES_URL)
    .reply(200, {});
  nock(serviceAuthProviderUrl)
    .post('/lease')
    .reply(200, {});
  nock(draftStoreUrl)
    .get('/drafts')
    .reply(200, {});
  nock(civilServiceUrl)
    .get(CIVIL_SERVICE_CASES_URL + 'claimant/undefined?page=1')
    .reply(200, {});
  beforeAll((done) => {
    testSession
      .get('/oauth2/callback')
      .query('code=ABC')
      .expect(302)
      .end(function (err: Error) {
        if (err) {
          return done(err);
        }
        return done();
      });
  });

  describe('on GET', () => {
    it('should return dashboard page', async () => {
      const data = {
        claims: [
          {
            'admittedAmount': '200',
            'ccjRequestedDate': '2023-02-24',
            'claimAmount': '1000',
            'claimId': 'string',
            'claimNumber': '256MC007',
            'claimantName': 'Mr Baddy Bad',
            'defendantName': 'Mr Bad Guy',
            'numberOfDays': 0,
            'numberOfDaysOverdue': 45,
            'ocmc': true,
            'paymentDate': '2022-06-21',
            'responseDeadline': '2023-02-05',
            'status': 'SETTLED',
          },
        ],
        totalPages: 1,
      };
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + 'defendant/undefined?page=1')
        .reply(200, data);
      await testSession
        .get(DASHBOARD_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims made against you');
        });
    });
    it('should return error page when there is an error with civil service response', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + 'defendant/undefined?page=1')
        .reply(500, {});
      await testSession
        .get(DASHBOARD_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
