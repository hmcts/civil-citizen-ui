import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {ASSIGN_CLAIM_URL, DASHBOARD_URL} from 'routes/urls';
import {app} from '../../../../../main/app';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import { CivilServiceClient } from 'client/civilServiceClient';
import { Claim } from 'common/models/claim';
import { Session } from 'express-session';

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
      const spyDel = jest.spyOn(draftStoreService, 'deleteDraftClaimFromStore');
      nock(civilServiceUrl)
        .post('/assignment/case/123/RESPONDENTSOLICITORONE')
        .reply(200);
      request(app).post(ASSIGN_CLAIM_URL+'?123')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.get('location')).toBe(DASHBOARD_URL);
          expect(spyDel).toBeCalled();
        });
    });
    it('should not call civil service api and redirect to dashboard', async () =>{
      request(app).post(ASSIGN_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.get('location')).toBe(DASHBOARD_URL);
        });
    });
    it('on error should redirect to dashboard', async () => {
      const error = new Error('Test error');
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockRejectedValueOnce(error);
      app.request.session = { firstContact: { 'claimId': 123 } } as unknown as Session;
      await request(app).get('/assignclaim')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DASHBOARD_URL);
        });
    });
    it('on success  should redirect to dashboard', async () => {
     
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce({} as Claim);
      app.request.session = { firstContact: { 'claimId': 123 } } as unknown as Session;
      await request(app).get('/assignclaim')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DASHBOARD_URL);
        });
    });
  });
});
