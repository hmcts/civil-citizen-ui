import request from 'supertest';
import { app } from '../../../../../main/app';
import { PRIVACY_POLICY_URL } from 'routes/urls';
import { t } from 'i18next';

describe('Privacy policy page', () => {
  describe('on GET', () => {
    it('should display Privacy policy page', async () => {
      const res = await request(app).get(PRIVACY_POLICY_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.PRIVACY_POLICY.TITLE'));
    });
  });
});
