import request from 'supertest';
import {app} from '../../../main/app';
import nock from 'nock';
import config from 'config';

jest.mock('../../../main/modules/oidc');
jest.mock('../../../main/modules/draft-store');



describe('Citizen phone number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');

  beforeEach(() => {
    nock('http://localhost:5000')
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});


  });
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
    test('should return error on input with interior spaces', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({ data: {} })),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post('/citizen-phone')
        .send('telephoneNumber=123 456')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('There was a problem. Please enter numeric number');
        });
    });
    test('should not have error, whitespaced input should be trimmed', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({ data: {} })),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post('/citizen-phone')
        .send('telephoneNumber= 123 ')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain('There was a problem. Please enter numeric number');
        });
    });
    test('should not have error on correct input', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({ data: {} })),
      };
      app.locals.draftStoreClient = mockDraftStore;
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
