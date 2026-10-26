import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {ASSIGN_CLAIM_URL, DASHBOARD_URL} from 'routes/urls';
import {app} from '../../../../../main/app';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as utilityService from 'modules/utilityService';
import { CivilServiceClient } from 'client/civilServiceClient';
import { Claim } from 'common/models/claim';
import {AppSession} from 'common/models/AppRequest';

jest.mock('../../../../../main/modules/oidc');

describe('claim assignment controller', ()=>{
  const originalSession = app.request.session;
  const civilServiceUrl = config.get<string>('services.civilService.url');
  const claim = Object.assign(new Claim(), {respondent1PinToPostLRspec: {accessCode: '123456'}});
  let session: AppSession;

  beforeEach(() => {
    session = {
      firstContact: {claimId: '123'},
      user: {id: 'defendant', accessToken: 'test-token'},
    } as unknown as AppSession;
    app.request.session = session;
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValue(claim);
    jest.spyOn(draftStoreService, 'deleteDraftClaimFromStore').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    nock.cleanAll();
    app.request.session = originalSession;
  });

  describe('on GET', ()=>{
    it('should call civil service api to assign claim to defendant and redirect to dashboard', async () => {
      const assignment = nock(civilServiceUrl)
        .post('/assignment/case/123/DEFENDANT', {pin: '123456'})
        .reply(200);
      await request(app).get(ASSIGN_CLAIM_URL)
        .expect(302)
        .expect('Location', DASHBOARD_URL);
      expect(assignment.isDone()).toBe(true);
      expect(utilityService.getClaimById).toHaveBeenCalledWith('123', expect.anything(), false);
      expect(draftStoreService.deleteDraftClaimFromStore).toHaveBeenCalledWith('123');
      expect(session.firstContact).toEqual({});
    });
    it('should not call civil service api and redirect to dashboard', async () =>{
      session.firstContact = {};
      const assign = jest.spyOn(CivilServiceClient.prototype, 'assignDefendantToClaim');
      await request(app).get(ASSIGN_CLAIM_URL)
        .expect(302)
        .expect('Location', DASHBOARD_URL);
      expect(utilityService.getClaimById).not.toHaveBeenCalled();
      expect(assign).not.toHaveBeenCalled();
      expect(draftStoreService.deleteDraftClaimFromStore).not.toHaveBeenCalled();
    });
    it('on claim retrieval error should redirect to dashboard', async () => {
      const error = new Error('Test error');
      jest.spyOn(utilityService, 'getClaimById').mockRejectedValueOnce(error);
      const assign = jest.spyOn(CivilServiceClient.prototype, 'assignDefendantToClaim');
      await request(app).get(ASSIGN_CLAIM_URL)
        .expect(302)
        .expect('Location', DASHBOARD_URL);
      expect(assign).not.toHaveBeenCalled();
      expect(draftStoreService.deleteDraftClaimFromStore).not.toHaveBeenCalled();
      expect(session.firstContact).toEqual({});
    });
    it('on assignment error should redirect without deleting the draft', async () => {
      const assignment = nock(civilServiceUrl)
        .post('/assignment/case/123/DEFENDANT', {pin: '123456'})
        .reply(500);
      await request(app).get(ASSIGN_CLAIM_URL)
        .expect(302)
        .expect('Location', DASHBOARD_URL);
      expect(assignment.isDone()).toBe(true);
      expect(draftStoreService.deleteDraftClaimFromStore).not.toHaveBeenCalled();
      expect(session.firstContact).toEqual({});
    });
  });
});
