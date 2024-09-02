import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {GA_RESPONSE_CONFIRMATION_URL} from 'routes/urls';
import {app} from '../../../../../../../main/app';
import {t} from 'i18next';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../../main/modules/oidc');

describe('GA response submission confirmation controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return ga submit confirmation page', async () => {
      const res = await request(app).get(GA_RESPONSE_CONFIRMATION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.RESPONSE_CONFIRMATION.JUDGE_WILL_CONSIDER'));
    });

  });
});
