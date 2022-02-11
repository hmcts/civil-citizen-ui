import request from 'supertest';

import {app} from '../../../main/app';
import config from 'config';
const nock = require('nock');

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

  const citizenRoleToken: string = config.get('citizenRoleToken');

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
