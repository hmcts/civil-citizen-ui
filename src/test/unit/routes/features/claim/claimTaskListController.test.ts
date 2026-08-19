import {app} from '../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import nock from 'nock';
import {getDraftClaim, createOrLoadDraft} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockCreateOrLoadDraft = createOrLoadDraft as jest.Mock;

const createMockManagerResult = (claim: Claim, isNew = false): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim as unknown as Claim,
  } as CivilClaimResponse,
  rawResponse: {
    draftId: 'draft-123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  isNew,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('Claim TaskList page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should return claim tasklist page with existing draft claim', async () => {
      const createDashboardSpy = jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockResolvedValue(null);
      const claim = new Claim();
      claim.draftClaimCreatedAt = new Date('2026-08-01T10:00:00.000Z');

      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
        });

      expect(mockCreateOrLoadDraft).not.toHaveBeenCalled();
      expect(createDashboardSpy).not.toHaveBeenCalled();
    });

    it('should call createOrLoadDraft and createDashboard when draft claim does not exist and draft is new', async () => {
      const createDashboardSpy = jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockResolvedValue(null);

      mockGetDraftClaim.mockResolvedValue(null);
      mockCreateOrLoadDraft.mockResolvedValue(createMockManagerResult(new Claim(), true));

      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
        });

      expect(mockCreateOrLoadDraft).toHaveBeenCalled();
      expect(createDashboardSpy).toHaveBeenCalled();
    });

    it('should return http 500 when error is thrown in getDraftClaim', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error('Draft store failure'));

      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
