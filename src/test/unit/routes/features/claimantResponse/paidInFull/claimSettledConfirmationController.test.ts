import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {DATE_PAID_CONFIRMATION_URL} from '../../../../../../main/routes/urls';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');

describe('Claim settled confirmation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});

    it('should render cliam settled confirmation page', async () => {
      const res = await request(app).get(DATE_PAID_CONFIRMATION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.SUBMIT_CONFIRMATION.YOU_SETTLED_CLAIM'));
    });
  });
});
