import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {ASSIGN_CLAIM_URL, DASHBOARD_URL} from 'routes/urls';
import {app} from '../../../../../main/app';

jest.mock('../../../../../main/modules/oidc');

describe('claim assignment controller', ()=>{
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', ()=>{
    const civilServiceUrl = config.get<string>('services.civilService.url');
    it('should call civil service api to assign claim to defendant and redirect to dashboard', async () => {
      nock(civilServiceUrl)
        .post('/assignment/case/123/RESPONDENTSOLICITORONE')
        .reply(200);
      request(app).post(ASSIGN_CLAIM_URL+'?123')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.get('location')).toBe(DASHBOARD_URL);
        });
    });
    it('should not call civil service api and redirect to dashboard', async () =>{
      request(app).post(ASSIGN_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.get('location')).toBe(DASHBOARD_URL);
        });
    });
  });
});
