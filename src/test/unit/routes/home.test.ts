import request from 'supertest';

import {app} from '../../../main/app';
import nock from 'nock';

const agent = request.agent(app);

function authenticate() {
  return () =>
    agent.get('/oauth2/callback')
      .query('code=ABC')
      .then((res) => {
        expect(res.status).toBe(302);
      });
}


// TODO: replace this sample test with proper route tests for your application
describe('Home page', () => {

  const citizenRoleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NUb2tlbiI6InRva2VuIiwic3ViIjoianNAdGVzdC5jb20iLCJnaXZlbl9uYW1lIjoiSm9obiIsImZhbWlseV9uYW1lIjoiU21pdGgiLCJ1aWQiOiIxMjMiLCJyb2xlcyI6WyJjaXZpbC1jaXRpemVuIl19.Ra3lo2bgl_mmiK8tHMVpBNf6mOTXDXUturb4Wy9ZbJc';

  beforeEach(() => {
    nock('http://localhost:5000')
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    test('Authenticate Callback', authenticate());
    test('should return sample home page', async () => {
      await agent
        .get('/')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Default page template');
        });
    });
  });
});
