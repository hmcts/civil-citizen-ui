import request from 'supertest';
import config from 'config';
import {createClient} from 'redis';
import {mockCreateClient} from '../../utils/mockCreateClient';

const nock = require('nock');
jest.mock('../../../main/modules/oidc');
jest.mock('redis');
mockCreateClient(createClient);

const {app} = require('../../../main/app');

const agent = request.agent(app);

function authenticate() {
  agent.get('/oauth2/callback')
    .query('code=ABC')
    .then((res) => {
      expect(res.status).toBe(302);
    });
}

describe('Home page', () => {
  const idamUrl: string = config.get('idamUrl');
  const citizenRoleToken: string = config.get('citizenRoleToken');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    authenticate();
  });

  describe('on GET', () => {
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
