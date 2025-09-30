import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {GA_COSC_CONFIRM_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('GA submission confirmation controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return cosc ga submit confirmation page', async () => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationFee = {
        calculatedAmountInPence: 100,
        code: 'test',
        version: 1,
      };
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
      const res = await request(app).get(GA_COSC_CONFIRM_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Application created');
      expect(res.text).toContain('You need to pay the application fee to submit the application');
      expect(res.text).toContain('Pay the fee');
    });

    it('should return http 500 when has error in the get method', async () => {
      (getClaimById as jest.Mock).mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      const res = await request(app).get(GA_COSC_CONFIRM_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
