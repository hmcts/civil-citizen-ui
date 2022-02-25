import request from 'supertest';
import nock from 'nock';
import config from 'config';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('redis');

const {app} = require('../../../../../../main/app');


describe('Citizen phone number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
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
    test('should accept input with trailing whitespaces', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({ data: {} })),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post('/citizen-phone')
        .send('telephoneNumber= 123 ')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    test('should redirect on correct input', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({ data: {} })),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post('/citizen-phone')
        .send('telephoneNumber=123')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
  });
});
