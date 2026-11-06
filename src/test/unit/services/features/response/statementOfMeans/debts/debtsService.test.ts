import {getDebts, saveDebts} from 'services/features/response/statementOfMeans/debts/debtsService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {Debts} from 'form/models/statementOfMeans/debts/debts';
import {DebtItems} from 'form/models/statementOfMeans/debts/debtItems';
import {YesNo} from 'form/models/yesNo';
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

describe('Debts service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDebts', () => {
    it('should return empty debts when none are set', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const result = await getDebts(mockReq);

      expect(result.option).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return populated debts when option is yes', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.debts = new Debts(YesNo.YES, [new DebtItems('Loan', '100', '10')]);
      mockGetResponseClaimById.mockResolvedValue(claim);

      const result = await getDebts(mockReq);

      expect(result.option).toBe(YesNo.YES);
      expect(result.debtsItems).toHaveLength(1);
      expect(result.debtsItems[0].debt).toBe('Loan');
    });

    it('should return option only when option is no', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.debts = new Debts(YesNo.NO);
      mockGetResponseClaimById.mockResolvedValue(claim);

      const result = await getDebts(mockReq);

      expect(result.option).toBe(YesNo.NO);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getDebts(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveDebts', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveDebts(mockReq, new Debts(YesNo.NO)))
        .rejects.toThrow('[debtsService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save when statement of means does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveDebts(mockReq, new Debts(YesNo.YES, [new DebtItems('Loan', '100', '10')]));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            debts: expect.objectContaining({option: YesNo.YES}),
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

      await saveDebts(mockReq, new Debts(YesNo.NO));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            debts: expect.objectContaining({option: YesNo.NO}),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveDebts(mockReq, new Debts(YesNo.NO))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
