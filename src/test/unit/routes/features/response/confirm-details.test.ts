import request from 'supertest';

import {app} from '../../../../../main/app';
import config from 'config';
const nock = require('nock');

const agent = request.agent(app);

function authenticate() {
  agent.get('/oauth2/callback')
    .query('code=ABC')
    .then((res) => {
      expect(res.status).toBe(302);
    });
}

describe('Confirm Details page', () => {

  const citizenRoleToken: string = config.get('citizenRoleToken');

  beforeEach(() => {
    nock('http://localhost:5000')
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    authenticate();
  });

  describe('on GET', () => {

    test('should return your details page', async () => {
      await agent
        .get('/case/12334/response/your-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Confirm your details');
        });
    });

    test('POST/Citizen details', async () => {
      await agent
        .post('/confirm-your-details')
        .send({ addressLineOne: '38 Highland Road', city: 'Birmingham' })
        .expect(200);
    });
  });
});
