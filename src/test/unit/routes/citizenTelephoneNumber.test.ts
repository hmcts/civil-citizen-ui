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
  describe('on POST', () => {
    test('should return error on incorrect input', async () => {
      await request(app)
        .post('/citizen-phone')
        .send('telephoneNumber=abc')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('There was a problem. Please enter numeric number');
        });
    });
    test('should not have error oncorrect input', async () => {
      await request(app)
        .post('/citizen-phone')
        .send('telephoneNumber=123')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain('There was a problem. Please enter numeric number');
        });
    });
  });
});
