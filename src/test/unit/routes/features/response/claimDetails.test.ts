import request from 'supertest';
import {app} from '../../../../../main/app';
import config from 'config';
import { ClaimMock } from '../../../../utils/claimMock';

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

describe('Claim Details', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    authenticate();
    nock('http://localhost:4000')
      .post('/cases/111')
      .reply(200, ClaimMock.MOCK_RESPONSE);
  });

  //TODO should add the correct call when claim-details will be restore
  it('retrieve claim details', async () => {
    await agent
      .get('/case/111/response/claim-details')
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });
});

