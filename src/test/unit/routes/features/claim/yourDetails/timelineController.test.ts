import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIM_EVIDENCE_URL, CLAIM_TIMELINE_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getClaimDetails} from 'services/features/claim/details/claimDetailsService';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('services/features/claim/details/claimDetailsService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetClaimDetails = getClaimDetails as jest.Mock;
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

describe('Claimant Timeline Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render timeline page', async () => {
      mockGetClaimDetails.mockResolvedValue(new ClaimDetails());
      await request(app).get(CLAIM_TIMELINE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Timeline of events');
      });
      expect(mockGetClaimDetails).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should use query lang when provided', async () => {
      mockGetClaimDetails.mockResolvedValue(new ClaimDetails());
      await request(app).get(`${CLAIM_TIMELINE_URL}?lang=en`).expect((res) => {
        expect(res.status).toBe(200);
      });
    });

    it('should return 500 page on redis failure', async () => {
      mockGetClaimDetails.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      await request(app).get(CLAIM_TIMELINE_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });

  describe('on POST', () => {
    it('should render timeline page if there are validation errors', async () => {
      await request(app).post(`${CLAIM_TIMELINE_URL}?lang=en`).send({rows: []}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.AT_LEAST_ONE_ROW);
      });
    });

    it('should return 500 page if there are errors', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      await request(app).post(CLAIM_TIMELINE_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });

    it('should update data and redirect to evidence page if all required details are provided', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue(undefined);
      const mockData = [{
        day: 1,
        month: 3,
        year: 2023,
        description: 'Raised an issue with Mr. Smith',
      }];
      await request(app).post(CLAIM_TIMELINE_URL).send({rows: mockData}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_EVIDENCE_URL);
      });
    });

    it('should save data if applicant doesn\'t exist and redirect to evidence page', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue(undefined);
      const mockData = [{
        day: 1,
        month: 3,
        year: 2023,
        description: 'Raised an issue with Mr. Smith',
      }];
      await request(app).post(CLAIM_TIMELINE_URL).send({rows: mockData}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_EVIDENCE_URL);
      });
    });
  });
});
