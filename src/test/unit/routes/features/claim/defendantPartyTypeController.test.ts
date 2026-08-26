import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {PartyType} from 'models/partyType';
import {
  DELAYED_FLIGHT_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_PARTY_TYPE_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../main/modules/oidc');
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
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: '123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('Defendant party type controller', () => {
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
    it('should display defendant party type page', async () => {
      const mockClaim = new Claim();
      mockClaim.respondent1 = {type: PartyType.INDIVIDUAL} as Party;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      const response = await request(app).get(CLAIM_DEFENDANT_PARTY_TYPE_URL);
      expect(response.status).toBe(200);
      expect(response.text).toContain('Who are you making the claim against?');
    });

    it('should return status 500 when error is thrown', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_DEFENDANT_PARTY_TYPE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should display defendant party type page if there is no selection', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      const response = await request(app).post(CLAIM_DEFENDANT_PARTY_TYPE_URL);
      expect(response.status).toBe(200);
      expect(response.text).toContain('Who are you making the claim against?');
    });

    it('should redirect to the defendant individual details if individual radio is selected', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockSaveDraftClaim.mockResolvedValue(undefined);

      const response = await request(app)
        .post(CLAIM_DEFENDANT_PARTY_TYPE_URL)
        .send({option: PartyType.INDIVIDUAL});
      expect(response.status).toBe(302);
      expect(response.header.location).toBe(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL);
    });

    it('should redirect to the defendant company details if company radio is selected', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockSaveDraftClaim.mockResolvedValue(undefined);

      const response = await request(app)
        .post(CLAIM_DEFENDANT_PARTY_TYPE_URL)
        .send({option: PartyType.COMPANY});
      expect(response.status).toBe(302);
      expect(response.header.location).toBe(DELAYED_FLIGHT_URL);
    });

    it('should redirect to the sole trader details if sole trader radio is selected', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockSaveDraftClaim.mockResolvedValue(undefined);

      const response = await request(app)
        .post(CLAIM_DEFENDANT_PARTY_TYPE_URL)
        .send({option: PartyType.SOLE_TRADER});
      expect(response.status).toBe(302);
      expect(response.header.location).toBe(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL);
    });

    it('should redirect to the organisation details if organisation radio is selected', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockSaveDraftClaim.mockResolvedValue(undefined);

      const response = await request(app)
        .post(CLAIM_DEFENDANT_PARTY_TYPE_URL)
        .send({option: PartyType.ORGANISATION});
      expect(response.status).toBe(302);
      expect(response.header.location).toBe(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL);
    });

    it('should render page if non-existent party type is provided', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      await request(app)
        .post(CLAIM_DEFENDANT_PARTY_TYPE_URL)
        .send({foo: 'blah'})
        .expect((response: request.Response) => {
          expect(response.status).toBe(200);
          expect(response.text).toContain(TestMessages.DEFENDANT_PARTY_TYPE_REQUIRED);
        });
    });

    it('should return something went wrong page if redis failure occurs', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockSaveDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_DEFENDANT_PARTY_TYPE_URL)
        .send({option: PartyType.ORGANISATION})
        .expect((response: request.Response) => {
          expect(response.status).toBe(500);
          expect(response.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
