import request from 'supertest';
import {app} from '../../../main/app';

describe('Citizen phone number', () => {
  describe('on GET', () => {
    test('should return citizen phone number page', async () => {
      await request(app)
        .get('/citizen-phone')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter a phone number (optional)');
        });
    });
  });
});
