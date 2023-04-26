import {app} from '../../../../../../main/app';
import config from 'config';
import Module from 'module';
import {CIVIL_SERVICE_CASES_URL} from '../../../../../../main/app/client/civilServiceUrls';
import {isCaseProgressionV1Enable} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CaseState} from 'form/models/claimDetails';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

const nock = require('nock');
const session = require('supertest-session');
const citizenRoleToken: string = config.get('citizenRoleToken');
const testSession = session(app);
const isCaseProgressionV1EnableMock = isCaseProgressionV1Enable as jest.Mock;

jest.mock('../../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};

describe('Claim Summary Controller Defendant', () => {
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

  const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  const claimId = claim.id;
  const claimWithSdo = {
    ...claim,
    state: CaseState.AWAITING_APPLICANT_INTENTION,
    case_data: {
      ...claim.case_data,
      sdoOrderDocument: {
        value: {
          createdBy: 'test',
          documentLink: 'test',
          documentName: 'test',
          documentSize: 'test',
          documentType: 'test',
          createdDatetime: 'test',
        },
        classification: 'test',
      },
    },
  };

  describe('on GET', () => {
    it('should return evidence upload content when flag is enabled and hasSDODocument', async () => {
      //given
      isCaseProgressionV1EnableMock.mockResolvedValue(true);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithSdo);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Upload documents');
        });
    });

    it('should not return evidence upload content when flag is disabled', async () => {
      //given
      isCaseProgressionV1EnableMock.mockResolvedValue(false);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithSdo);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain('Upload documents');
        });
    });

    it('should not return evidence upload content when flag is enabled and no hasSDODocument', async () => {
      //given
      isCaseProgressionV1EnableMock.mockResolvedValue(true);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain('Upload documents');
          expect(res.text).toContain('latest-update');
        });
    });

    it('should return status 500 when error thrown', async () => {
      //given
      isCaseProgressionV1EnableMock.mockRejectedValue(new Error('Mocked error'));
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
