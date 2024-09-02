import request from 'supertest';
import { app } from '../../../../../main/app';
import { CONTACT_US_URL } from 'routes/urls';
import { t } from 'i18next';

describe('Contact us page', () => {
  describe('on GET', () => {
    it('should display Contact us page', async () => {
      const res = await request(app).get(CONTACT_US_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CONTACT_US.TITLE'));
    });
  });
});
