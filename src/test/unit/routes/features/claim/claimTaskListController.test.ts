import {app} from '../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {t} from 'i18next';
import nock from 'nock';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

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

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    const createDraftClaimSpy = jest.spyOn(draftStoreService, 'createDraftClaimInStoreWithExpiryTime');
    it('should return claim tasklist page with existing draft claim', async () => {
      (getDraftClaimFromStore as jest.Mock).mockResolvedValue({case_data: new Claim()});
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
        });
      expect(createDraftClaimSpy).toHaveBeenCalledTimes(0);
    });

    it('should create a new draft claim after completing eligibility', async () => {
      app.request.cookies = {eligibilityCompleted: true};
      (getDraftClaimFromStore as jest.Mock).mockResolvedValue({});
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
        });
      expect(createDraftClaimSpy).toBeCalled();
    });
  });
});
