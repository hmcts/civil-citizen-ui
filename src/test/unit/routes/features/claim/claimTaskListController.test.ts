import {app} from '../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import nock from 'nock';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('Claim TaskList page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let renderSpy: jest.SpyInstance;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockReturnValue(null);
  });

  describe('on GET', () => {
    const createDraftClaimSpy = jest.spyOn(draftStoreService, 'createDraftClaimInStoreWithExpiryTime');
    beforeEach(() => {
      jest.clearAllMocks();
      renderSpy = jest.spyOn(app.response, 'render').mockImplementation(function (view: string, options?: object) {
        return this.send({view, options});
      });
    });

    afterEach(() => {
      renderSpy.mockRestore();
    });

    it('should return claim tasklist page with existing draft claim', async () => {
      const claim = new Claim();
      claim.draftClaimCreatedAt = new Date();
      claim.draftClaimCacheTtlDays = 30;
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body.view).toBe('features/claim/task-list');
          expect(res.body.options.pageTitle).toBe('PAGES.CLAIM_TASK_LIST.PAGE_TITLE');
          expect(res.body.options.draftClaimDeletionDate).toBeDefined();
        });
      expect(createDraftClaimSpy).not.toBeCalled();
    });

    it('should create a new draft claim after completing eligibility', async () => {
      app.request.cookies = {eligibilityCompleted: true};
      const emptyClaim = new Claim();
      const draftClaim = new Claim();
      draftClaim.draftClaimCreatedAt = new Date();
      draftClaim.draftClaimCacheTtlDays = 30;
      (getCaseDataFromStore as jest.Mock)
        .mockResolvedValueOnce(emptyClaim)
        .mockResolvedValueOnce(draftClaim);
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body.view).toBe('features/claim/task-list');
          expect(res.body.options.pageTitle).toBe('PAGES.CLAIM_TASK_LIST.PAGE_TITLE');
          expect(res.body.options.draftClaimDeletionDate).toBeDefined();
        });
      expect(createDraftClaimSpy).toBeCalled();
    });

    it('should return http 500 when has error in the get method', async () => {
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(new Error('error'));
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body.view).toBe('error');
        });
    });
  });
});
