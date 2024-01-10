import request from 'supertest';
import * as claimFeeService from 'services/features/claim/amount/claimFeesService';
const session = require('supertest-session');
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CLAIM_TOTAL_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {
  mockCivilClaimUndefined,
} from '../../../../utils/mockDraftStore';
import {isCUIReleaseTwoEnabled} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('services/features/claim/amount/claimFeesService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

const isReleaseTwo = isCUIReleaseTwoEnabled as jest.Mock;

describe('Total amount', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return total amount page', async () => {
      isReleaseTwo.mockResolvedValue(true);
      nock('http://localhost:4000')
        .get('/fees/hearing/undefined')
        .reply(200, '100');
      nock('http://localhost:4000')
        .get('/fees/claim/undefined')
        .reply(200, {'calculatedAmountInPence': '50'});
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      const spySave = jest.spyOn(claimFeeService, 'saveClaimFee');

      const res = await request(app)
        .get(CLAIM_TOTAL_URL.replace(':id', '5129'));

      expect(res.status).toBe(200);
      expect(res.text).toContain('Total amount you’re claiming');
      expect(spySave).toBeCalled();
    });

    it('should return http 500 when has error in the claim amount fee get method', async () => {
      nock('http://localhost:4000')
        .get('/fees/claim/undefined')
        .reply(500, mockCivilClaimUndefined);
      const res = await request(app)
        .get(CLAIM_TOTAL_URL);

      expect(res.status).toBe(500);
    });

    it('should return http 500 when has error in the hearing fee get method', async () => {
      nock('http://localhost:4000')
        .get('/fees/claim/undefined')
        .reply(200, mockCivilClaimUndefined);
      nock('http://localhost:4000')
        .get('/fees/hearing/undefined')
        .reply(500, mockCivilClaimUndefined);
      const res = await session(app)
        .get(CLAIM_TOTAL_URL);

      expect(res.status).toBe(500);
    });
  });

  describe('on POST', () => {
    it('should redirect to the defendant individual details if individual radio is selected', async () => {
      const res = await request(app).post(CLAIM_TOTAL_URL);
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(CLAIMANT_TASK_LIST_URL);
    });
  });
});
