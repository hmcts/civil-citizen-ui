import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {CLAIM_INTEREST_END_DATE_URL, CLAIM_INTEREST_START_DATE_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

const createMockManagerResult = (claim: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim as unknown as Claim,
  } as CivilClaimResponse,
  rawResponse: {
    draftId: '123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('interest start date', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should return interest start date page empty when dont have information on redis ', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      await request(app)
        .get(CLAIM_INTEREST_START_DATE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.INTEREST_START_DATE);
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_INTEREST_START_DATE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockSaveDraftClaim.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .send('reason=test')
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors on no input', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .send('reason=')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
          expect(res.text).toMatch(/Enter why you(?:'|\u2019|&#39;|&apos;)re claiming from this date/);
        });
    });

    it('should return error on year less than 1872', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=1871')
        .send('month=1')
        .send('day=1')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });

    it('should return error on empty year', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=')
        .send('month=1')
        .send('day=1')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });

    it('should return error on future date', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=2400')
        .send('month=1')
        .send('day=1')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.CORRECT_DATE_NOT_IN_FUTURE'));
        });
    });

    it('should return error 4 digit year', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=22')
        .send('month=1')
        .send('day=1')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });

    it('should accept a valid input', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockSaveDraftClaim.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .send('reason=test')
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect to interest end date page', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockSaveDraftClaim.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=2021')
        .send('month=1')
        .send('day=1')
        .send('reason=test')
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CLAIM_INTEREST_END_DATE_URL}`);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockSaveDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .send('reason=test')
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
