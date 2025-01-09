import request from 'supertest';
import { app } from '../../../../../main/app';
import { CONTACT_CNBC_URL } from 'routes/urls';

describe('Contact CNBC page', () => {
  describe('on GET', () => {
    it('should display Contact CNBC page', async () => {
      const res = await request(app).get(CONTACT_CNBC_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Civil National Business Centre');
    });
  });
});
