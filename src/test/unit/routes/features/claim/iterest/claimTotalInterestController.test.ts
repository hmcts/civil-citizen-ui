import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIM_HELP_WITH_FEES_URL, CLAIM_INTEREST_TOTAL_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {Claim} from 'models/claim';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/claim/interest/interestService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const getInterestMock = getInterest as jest.Mock;
const saveInterestMock = saveInterest as jest.Mock;

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

describe('Claim Total Interest Controller', () => {
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
    it('should render total claim interest controller', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      getInterestMock.mockResolvedValue(mockClaim);

      await request(app).get(CLAIM_INTEREST_TOTAL_URL).expect((res: request.Response) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What is the total interest for your claim?');
      });
    });

    it('should render total claim interest controller with set data', async () => {
      const claim = new Claim();
      claim.interest = {
        totalInterest: {
          amount: 8,
          reason: '99 reasons',
        },
      };
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockGetCaseDataFromStore.mockResolvedValue(claim);
      getInterestMock.mockResolvedValue(claim);

      await request(app).get(CLAIM_INTEREST_TOTAL_URL).expect((res: request.Response) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What is the total interest for your claim?');
      });
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      getInterestMock.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app).get(CLAIM_INTEREST_TOTAL_URL).expect((res: request.Response) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });

  describe('on POST', () => {
    it('should render page with errors', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      getInterestMock.mockResolvedValue(mockClaim);

      await request(app).post(CLAIM_INTEREST_TOTAL_URL).send({amount: '', reason: ''}).expect((res: request.Response) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter total interest amount');
        expect(res.text).toContain('Enter how you calculated the amount');
      });
    });

    it('should redirect to the continue claiming interest page', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockSaveDraftClaim.mockResolvedValue(undefined);
      getInterestMock.mockResolvedValue(mockClaim);
      saveInterestMock.mockResolvedValue(undefined);

      await request(app).post(CLAIM_INTEREST_TOTAL_URL).send({amount: '8', reason: '99 reasons'}).expect((res: request.Response) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_HELP_WITH_FEES_URL);
      });
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockSaveDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      saveInterestMock.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app).post(CLAIM_INTEREST_TOTAL_URL).send({amount: '321', reason: 'my reason'}).expect((res: request.Response) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
});