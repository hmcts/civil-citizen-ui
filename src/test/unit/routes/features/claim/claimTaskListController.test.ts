import {app} from '../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import nock from 'nock';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
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
      const claim = new Claim();
      claim.draftClaimCreatedAt = new Date();
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
        });
      expect(createDraftClaimSpy).not.toBeCalled();
    });

    it('should create a new draft claim after completing eligibility', async () => {
      app.request.cookies = {eligibilityCompleted: true};
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(new Claim());
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
        });
      expect(createDraftClaimSpy).toBeCalled();
    });

    it('should return http 500 when has error in the get method', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(new Error('error'));
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
