import {UnemploymentService} from 'services/features/response/statementOfMeans/unemployment/unemploymentService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {Unemployment} from 'form/models/statementOfMeans/unemployment/unemployment';
import {UnemploymentDetails} from 'form/models/statementOfMeans/unemployment/unemploymentDetails';
import {OtherDetails} from 'form/models/statementOfMeans/unemployment/otherDetails';
import {UnemploymentCategory} from 'form/models/statementOfMeans/unemployment/unemploymentCategory';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;

const caseId = '1645882162449409';
const mockReq = {
  params: {id: caseId},
  session: {user: {id: 'user-1', accessToken: 'token'}},
} as unknown as AppRequest;

const mockDraftResult = (claim: Claim) => ({
  claimResponse: {id: 'draft-123', case_data: claim},
  rawResponse: {draftId: 'draft-123', payload: claim},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '',
  expiresAt: '',
});

const unemploymentService = new UnemploymentService();

describe('Unemployment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUnemployment', () => {
    it('should return empty unemployment when none is set', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const result = await unemploymentService.getUnemployment(mockReq);

      expect(result.option).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return unemployed details when set', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.unemployment = new Unemployment(
        UnemploymentCategory.UNEMPLOYED,
        new UnemploymentDetails('2', '3'),
      );
      mockGetResponseClaimById.mockResolvedValue(claim);

      const result = await unemploymentService.getUnemployment(mockReq);

      expect(result.option).toBe(UnemploymentCategory.UNEMPLOYED);
      expect(result.unemploymentDetails.years).toBe(2);
      expect(result.unemploymentDetails.months).toBe(3);
    });

    it('should return other details when set', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.unemployment = new Unemployment(
        UnemploymentCategory.OTHER,
        undefined,
        new OtherDetails('looking for work'),
      );
      mockGetResponseClaimById.mockResolvedValue(claim);

      const result = await unemploymentService.getUnemployment(mockReq);

      expect(result.option).toBe(UnemploymentCategory.OTHER);
      expect(result.otherDetails.details).toBe('looking for work');
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(unemploymentService.getUnemployment(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveUnemployment', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(unemploymentService.saveUnemployment(mockReq, new Unemployment(UnemploymentCategory.RETIRED)))
        .rejects.toThrow('[unemploymentService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save when statement of means does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await unemploymentService.saveUnemployment(
        mockReq,
        new Unemployment(UnemploymentCategory.UNEMPLOYED, new UnemploymentDetails('1', '2')),
      );

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            unemployment: expect.objectContaining({
              option: UnemploymentCategory.UNEMPLOYED,
            }),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save when statement of means already exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await unemploymentService.saveUnemployment(mockReq, new Unemployment(UnemploymentCategory.RETIRED));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            unemployment: expect.objectContaining({
              option: UnemploymentCategory.RETIRED,
            }),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(unemploymentService.saveUnemployment(mockReq, new Unemployment(UnemploymentCategory.RETIRED)))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
