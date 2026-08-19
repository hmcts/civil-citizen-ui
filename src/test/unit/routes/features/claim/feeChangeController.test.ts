import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIM_FEE_CHANGE_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getDraftClaimData} from 'services/dashboard/draftClaimService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {ClaimFee} from 'models/civilClaimResponse';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/dashboard/draftClaimService.ts');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const getData = getDraftClaimData as jest.Mock;
const civilServiceUrl = config.get<string>('services.civilService.url');

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

describe('Claim Fee Change Controller Controller', () => {
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
    it('should claim fee page with no draft claim data', async () => {
      // Given
      const mockClaimFee = {
        calculatedAmountInPence: '8000',
        code: '110',
        version: '1',
      };
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce(mockClaimFee as unknown as ClaimFee);

      nock(civilServiceUrl)
        .get('/fees/claim/110')
        .reply(200, {calculatedAmountInPence: 8000});

      nock(civilServiceUrl)
        .post('/fees/claim/calculate-interest')
        .reply(200, '110');

      getData.mockResolvedValue({
        claimCreationUrl: 'testOcmcUrl',
        draftClaim: undefined,
      });

      // When
      const res = await request(app).get(CLAIM_FEE_CHANGE_URL);

      // Then
      expect(res.status).toBe(200);
      expect(res.text).toContain('Claim fee has changed');
      expect(res.text).toContain('testOcmcUrl');
    });

    it('should claim fee page with claim data', async () => {
      // Given
      const mockClaimFee = {
        calculatedAmountInPence: '8000',
        code: '110',
        version: '1',
      };
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce(mockClaimFee as unknown as ClaimFee);

      nock(civilServiceUrl)
        .get('/fees/claim/110')
        .reply(200, {calculatedAmountInPence: 8000});

      nock(civilServiceUrl)
        .post('/fees/claim/calculate-interest')
        .reply(200, '110');

      getData.mockResolvedValue({
        claimCreationUrl: 'testOcmcUrl',
        draftClaim: {
          claimId: 'draftClaim',
        },
      });

      // When
      const res = await request(app).get(CLAIM_FEE_CHANGE_URL);

      // Then
      expect(res.status).toBe(200);
      expect(res.text).toContain('Claim fee has changed');
      expect(res.text).toContain(CLAIMANT_TASK_LIST_URL);
    });

    it('should return http 500 when has error in the get method', async () => {
      // Given
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      getData.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      // When / Then
      await request(app)
        .get(CLAIM_FEE_CHANGE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
