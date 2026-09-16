import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CLAIM_DEFENDANT_EMAIL_URL, CLAIM_DEFENDANT_PHONE_NUMBER_URL} from 'routes/urls';
import {t} from 'i18next';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {Claim} from 'models/claim';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const EMAIL_ADDRESS = 'test@gmail.com';

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

  describe('on GET', () => {
    it('should return on your claimant defendant email page successfully', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(CLAIM_DEFENDANT_EMAIL_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_JOURNEY.DEFENDANT_EMAIL.TITLE'));
        });
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_DEFENDANT_EMAIL_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should redirect to the their mobile screen when email is provided', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIM_DEFENDANT_EMAIL_URL)
        .send({emailAddress: EMAIL_ADDRESS})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_DEFENDANT_PHONE_NUMBER_URL);
        });
    });

    it('should redirect to the their mobile screen when email is not provided', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIM_DEFENDANT_EMAIL_URL)
        .send({emailAddress: ''})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_DEFENDANT_PHONE_NUMBER_URL);
        });
    });

    it('should return error on incorrect input', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIM_DEFENDANT_EMAIL_URL)
        .send({emailAddress: 'test'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_EMAIL);
        });
    });

    it('should return error on input too long', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      const greaterThan320CharsEmail = 'x'.repeat(311) + '@gmail.com';
      await request(app)
        .post(CLAIM_DEFENDANT_EMAIL_URL)
        .send({emailAddress: greaterThan320CharsEmail})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_EMAIL);
        });
    });

    it('should return error on invalid email domain', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIM_DEFENDANT_EMAIL_URL)
        .send({emailAddress: 'underscoreindomain@gmail_.com'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_EMAIL);
        });
    });

    it('should return status 500 when there is error', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_DEFENDANT_EMAIL_URL)
        .send({emailAddress: EMAIL_ADDRESS})
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
