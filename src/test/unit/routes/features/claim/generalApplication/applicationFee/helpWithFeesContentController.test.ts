import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_APPLY_HELP_WITH_FEES_START} from 'routes/urls';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('General Application - Apply for help with fees', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return Apply for help with fees page', async () => {
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEES_START)
        .query({additionalFeeTypeFlag: 'false'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Application fee');
          expect(res.text).toContain('Apply for help with fees');
        });
    });

    it('should return Apply for help with fees page', async () => {
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEES_START)
        .query({additionalFeeTypeFlag: 'true'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Additional application fee');
          expect(res.text).toContain('Apply for help with fees');
        });
    });
  });
});
