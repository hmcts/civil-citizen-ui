import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CLAIMANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {t} from 'i18next';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Claim} from 'models/claim';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import * as launchDarklyClient from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const PHONE_NUMBER = '01632960001';

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

const isCarmEnabledSpy = (carmEnabled: boolean) =>
  jest.spyOn(launchDarklyClient, 'isCarmEnabledForCase').mockResolvedValue(carmEnabled);

describe('Completing Claim', () => {
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

  // delete after CARM release
  describe('on GET, CARM off', () => {
    beforeEach(() => {
      isCarmEnabledSpy(false);
    });

    it('should return on your claimant phone number page successfully', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(CLAIMANT_PHONE_NUMBER_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIMANT_PHONE.TITLE'));
        });

      expect(launchDarklyClient.isCarmEnabledForCase).toHaveBeenCalledWith(new Date('2026-08-01T10:00:00.000Z'));
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIMANT_PHONE_NUMBER_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on GET, CARM on', () => {
    beforeEach(() => {
      isCarmEnabledSpy(true);
    });

    it('should return on your claimant phone number page successfully', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(CLAIMANT_PHONE_NUMBER_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIMANT_PHONE.TITLE_MANDATORY'));
        });

      expect(launchDarklyClient.isCarmEnabledForCase).toHaveBeenCalledWith(new Date('2026-08-01T10:00:00.000Z'));
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIMANT_PHONE_NUMBER_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post, CARM on', () => {
    beforeEach(() => {
      isCarmEnabledSpy(true);
    });

    it('should redirect to task list when mandatory phone number provided', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: PHONE_NUMBER})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
        });

      expect(launchDarklyClient.isCarmEnabledForCase).toHaveBeenCalledWith(new Date('2026-08-01T10:00:00.000Z'));
    });

    it('should return error on empty input', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send('telephoneNumber=')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.ENTER_TELEPHONE_NUMBER'));
        });
    });

    it('should return error on input with space', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: ' '})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.ENTER_TELEPHONE_NUMBER'));
        });
    });

    it('should return error on incorrect input', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: 'abc'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_PHONE_NUMBER'));
        });
    });

    it('should return error on input with interior spaces', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send('telephoneNumber=123 456')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_PHONE_NUMBER'));
        });
    });

    it('should accept input with trailing whitespaces', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send('telephoneNumber= 01234567890 ')
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return 500 when no draft exists on GET', async () => {
      isCarmEnabledSpy(false);
      mockGetDraftClaim.mockResolvedValue(null);

      await request(app)
        .get(CLAIMANT_PHONE_NUMBER_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return 500 when no draft exists on POST', async () => {
      isCarmEnabledSpy(true);
      mockGetDraftClaim.mockResolvedValue(null);

      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: PHONE_NUMBER})
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
