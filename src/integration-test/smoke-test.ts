const request = require('supertest');
import {app} from '../main/app';
const nock = require('nock');
const config = require('config');

const agent = request.agent(app);

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      ping: jest.fn(async () => 'PONG'),
      set: jest.fn(async () => {return;}),
    };
  });
});

function authenticate() {
  agent.get('/oauth2/callback')
    .query('code=ABC')
    .then((res: Response) => {
      expect(res.status).toBe(302);
    });
}

// TODO: replace this sample test with proper smoke tests later
describe('Dummy Smoke test - Home page', () => {
  describe('on GET', () => {
    const citizenRoleToken = config.get('citizenRoleToken');
    beforeEach(() => {
      nock('http://localhost:5000')
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      authenticate();
    });

    test('should return sample home page', async () => {
      await agent
        .get('/')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Default page template');
        });
    });
  });
});
