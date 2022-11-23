import request from 'supertest';
import {app} from '../app';
import config from 'config';
import {AGE_ELIGIBILITY_URL} from 'routes/urls';
jest.mock('modules/oidc');
const nock = require('nock');
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      set: jest.fn(async () => {
        return;
      }),
      on: jest.fn(async () => {
        return;
      }),
    };
  });
});

describe('Under 18 Contact court', ()=> {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    it('should return under 18 contact cort page', async () => {
      await request(app)
        .get(AGE_ELIGIBILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Contact the court');
        });
    });
  });
});
