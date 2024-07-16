import request from 'supertest';
import { app } from '../../../../../main/app';
import { TERMS_AND_CONDITIONS_URL } from 'routes/urls';
import { t } from 'i18next';

describe('Privacy policy page', () => {
  describe('on GET', () => {
    it('should display Privacy policy page', async () => {
      const res = await request(app).get(TERMS_AND_CONDITIONS_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.TERMS_AND_CONDITIONS.TITLE'));
    });
  });
});
