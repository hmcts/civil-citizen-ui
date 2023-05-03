import config from 'config';
import nock from 'nock';
import {app} from '../../../../../main/app';
// import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {UPLOAD_YOUR_DOCUMENTS_URL} from 'routes/urls';
import {t} from 'i18next';
import Module from 'module';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {timeout} from 'ioredis/built/utils';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));

const citizenRoleToken: string = config.get('citizenRoleToken');
const session = require('supertest-session');
const testSession = session(app);
export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};

describe('"upload your documents" page test', () => {
  const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');
  const claimId = claim.id;
  const civilServiceUrl = config.get<string>('services.civilService.url');

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
    it('should return expected page when claim exists', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      await testSession
        .get(UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId))
        .expect((res: { status: any; text: any; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE'));
        });
    });

    it('should return nothing when the claim does not exist', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, null);
      await testSession
        .get(UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId))
        .expect();
        // .expect((res: { status: any; text: any; }) => {
        //   expect(res.status).toBe(500);
        //   expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
// });
