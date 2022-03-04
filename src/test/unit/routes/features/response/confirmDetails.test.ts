import request from 'supertest';
import {app} from '../../../../../main/app';
import config from 'config';

const nock = require('nock');
const agent = request.agent(app);

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      ping: jest.fn(async () => 'PONG'),
      set: jest.fn(async () => ''),
      get: jest.fn(async () => {return JSON.stringify({});}),
    };
  });
});

function authenticate() {
  return () =>
    agent.get('/oauth2/callback')
      .query('code=ABC')
      .then((res) => {
        expect(res.status).toBe(302);
      });
}

describe('Confirm Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  test('Authenticate Callback', authenticate());
  test('should return your details page', async () => {
    await agent
      .get('/case/12334/response/your-details')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });

  test('Authenticate Callback', authenticate());
  test('POST/Citizen details', async () => {
    await agent
      .post('/confirm-your-details')
      .send({addressLineOne: '38 Highland Road', city: 'Birmingham'})
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toContain('case/1643033241924739/response/your-dob');
      });
  });
});
