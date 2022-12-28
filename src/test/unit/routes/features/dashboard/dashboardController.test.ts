import {app} from '../../../../../main/app';
import config from 'config';
import Module from 'module';
import {DASHBOARD_URL} from '../../../../../main/routes/urls';
import {CIVIL_SERVICE_CASES_URL} from '../../../../../main/app/client/civilServiceUrls';
// import {DashboardStatus} from 'common/models/dashboard/dashboardStatus';
// import {DashboardDefendantItem} from 'common/models/dashboard/dashboardItem';
// import {updateStatus} from 'routes/features/dashboard/dashboardController';
// import {t} from 'i18next';
const nock = require('nock');

const session = require('supertest-session');
const citizenRoleToken: string = config.get('citizenRoleToken');
const testSession = session(app);

jest.mock('../../../../../main/modules/draft-store');
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

  nock(idamUrl)
    .post('/o/token')
    .reply(200, {id_token: citizenRoleToken});
  nock('http://localhost:4000')
    .post(CIVIL_SERVICE_CASES_URL)
    .reply(200, {});
  nock(serviceAuthProviderUrl)
    .post('/lease')
    .reply(200, {});
  nock(draftStoreUrl)
    .get('/drafts')
    .reply(200, {});
  nock('http://localhost:4000')
    .get(CIVIL_SERVICE_CASES_URL + 'defendant/undefined')
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
      await testSession
        .get(DASHBOARD_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims made against you');
        });
    });
  });

  // describe('updateStatus', () => {
  //   // const claimsAsDefendantMock: DashboardDefendantItem[] = [
  //   const claimsAsDefendantMock = [
  //     { claimantName: 'Jon Doe', status: DashboardStatus.CLAIMANT_ACCEPTED_STATES_PAID },
  //     { claimantName: 'Jon Doe', status: DashboardStatus.PAID_IN_FULL_CCJ_CANCELLED },
  //     { claimantName: 'Jon Doe', status: DashboardStatus.PAID_IN_FULL_CCJ_SATISFIED },
  //     { claimantName: 'Jon Doe', status: DashboardStatus.REDETERMINATION_BY_JUDGE },
  //     { claimantName: 'Jon Doe', status: DashboardStatus.TRANSFERRED },
  //   ];

  //   const expectedStatus = [
  //     { status: t('PAGES.DASHBOARD.CLAIM_SETTLED') },
  //     { status: t('PAGES.DASHBOARD.CONFIRMED_PAID', { claimantName: 'Jon Doe' }) },
  //     { status: t('PAGES.DASHBOARD.CONFIRMED_PAID', { claimantName: 'Jon Doe' }) },
  //     { status: t('PAGES.DASHBOARD.REQUESTED_CCJ', { claimantName: 'Jon Doe' }) },
  //     { status: t('PAGES.DASHBOARD.CASE_SENT_COURT') },
  //   ];

  //   it('should return dashboard page', async () => {
  //     const result = updateStatus(claimsAsDefendantMock as DashboardDefendantItem[]);
  //     result.forEach((item, index) => {
  //       expect(item.status).toBe(expectedStatus[index].status);
  //     });
  //   });
  // });
});
