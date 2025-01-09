import request from 'supertest';
import { app } from '../../../../../main/app';
import { CONTACT_MEDIATION_URL } from 'routes/urls';

describe('Contact Mediation page', () => {
  describe('on GET', () => {
    it('should display Contact Mediation page', async () => {
      const res = await request(app).get(CONTACT_MEDIATION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Small Claims Mediation Service');
    });
  });
});
