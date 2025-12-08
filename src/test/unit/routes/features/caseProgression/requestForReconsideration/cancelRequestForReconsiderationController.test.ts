import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, REQUEST_FOR_RECONSIDERATION_CANCEL_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as utilityService from 'modules/utilityService';
import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/utilityService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const mockGetClaimById = utilityService.getClaimById as jest.Mock;

const CONTROLLER_URL = REQUEST_FOR_RECONSIDERATION_CANCEL_URL;

describe('Cancel controller ', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should redirect to the Claimant dashboard', async () => {
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.caseRole = CaseRole.CLAIMANT;
        return claim;
      });

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DASHBOARD_CLAIMANT_URL);

        });
    });

    it('should redirect to the defendant dashboard', async () => {
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.caseRole = CaseRole.DEFENDANT;
        return claim;
      });

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DEFENDANT_SUMMARY_URL);

        });
    });

    it('should return http 500 when has error', async () => {
      mockGetClaimById.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

});
