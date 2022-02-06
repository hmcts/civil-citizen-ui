import express from 'express';

const request = require('supertest');
const nock = require('nock');

const {app} = require('../../../../main/app');

const agent = request.agent(app);

function authenticate() {
  return () =>
    agent.get('/oauth2/callback')
      .query('code=ABC')
      .then((res: express.Response) => {
        expect(res.status).toBe(302);
      });
}

describe('i18n test - Dashboard', () => {

  const citizenRoleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NUb2tlbiI6InRva2VuIiwic3ViIjoianNAdGVzdC5jb20iLCJnaXZlbl9uYW1lIjoiSm9obiIsImZhbWlseV9uYW1lIjoiU21pdGgiLCJ1aWQiOiIxMjMiLCJyb2xlcyI6WyJjaXZpbC1jaXRpemVuIl19.Ra3lo2bgl_mmiK8tHMVpBNf6mOTXDXUturb4Wy9ZbJc';

  beforeEach(() => {
    nock('http://localhost:4000')
      .get('/cases')
      .reply(200, []);
    nock('http://localhost:5000')
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    test('Authenticate Callback', authenticate());
    test('should return English dashboard page, when no lang param', async () => {
      await agent
        .get('/dashboard')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims made against you');
        });
    });
    test('should return English dashboard page, when lang param is en', async () => {
      await agent
        .get('/dashboard/?lang=en')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims made against you');
        });
    });
    test('should return Welsh dashboard page, when lang param is cy', async () => {
      await agent
        .get('/dashboard/?lang=cy')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Smialc edam tsniaga uoy');
        });
    });
  });
});
