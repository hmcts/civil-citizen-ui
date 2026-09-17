import {app} from '../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {t} from 'i18next';
import {CivilServiceClient} from 'client/civilServiceClient';
import {createOrLoadDraft, getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockCreateOrLoadDraft = createOrLoadDraft as jest.Mock;
const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const createMockManagerResult = (claim: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim as unknown as Claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: '123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('Bilingual language preference', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});

    jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockResolvedValue(null as unknown as void);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on Get', () => {
    it('should create a dashboard when the draft is new', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockCreateOrLoadDraft.mockResolvedValue({...createMockManagerResult(mockClaim), isNew: true});
      const createDashboard = jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockResolvedValue(undefined);

      await request(app)
        .get(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
        });

      expect(createDashboard).toHaveBeenCalled();
    });

    it('should return on bilingual language preference page successfully', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockCreateOrLoadDraft.mockResolvedValue({...createMockManagerResult(mockClaim), isNew: false});

      await request(app)
        .get(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_BILINGUAL_LANGUAGE_PREFERENCE.DESCRIPTION_1'));
        });
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockCreateOrLoadDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockCreateOrLoadDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should return errors when option is not selected', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockCreateOrLoadDraft.mockResolvedValue({...createMockManagerResult(mockClaim), isNew: false});

      await request(app)
        .post(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .send({})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
        });
    });

    it('should redirect with bilingual language preference set to ENGLISH and redirect to task list', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockCreateOrLoadDraft.mockResolvedValue({...createMockManagerResult(mockClaim), isNew: false});
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .send({option: ClaimBilingualLanguagePreference.ENGLISH})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
        });
    });

    it('should redirect with with bilingual language preference set to WELSH_AND_ENGLISH and redirect to task list', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockCreateOrLoadDraft.mockResolvedValue({...createMockManagerResult(mockClaim), isNew: false});
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .send({option: ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
        });
    });

    it('should return status 500 when there is error with bilingual language preference set to ENGLISH', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockCreateOrLoadDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .send({option: ClaimBilingualLanguagePreference.ENGLISH})
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return status 500 when there is error with bilingual language preference set to WELSH_AND_ENGLISH', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockCreateOrLoadDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .send({option: ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH})
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  it('should return http 500 when has error in the post method', async () => {
    mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
    mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

    await request(app)
      .post(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL)
      .send({option: ClaimBilingualLanguagePreference.ENGLISH})
      .expect((res: request.Response) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});
