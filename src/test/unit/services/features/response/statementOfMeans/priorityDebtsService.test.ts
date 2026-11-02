import {getPriorityDebts, savePriorityDebts} from 'services/features/response/statementOfMeans/priorityDebtsService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Transaction} from 'common/form/models/statementOfMeans/expensesAndIncome/transaction';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {PriorityDebts} from 'common/form/models/statementOfMeans/priorityDebts';
import {Claim} from 'common/models/claim';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

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

const mortgageDebt = () => new PriorityDebts({
  mortgage: Transaction.buildPopulatedForm('Mortgage', '2000', TransactionSchedule.MONTH),
});

describe('priority Debts service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPriorityDebts', () => {
    it('should get empty form when statement of means does not exist', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const form = await getPriorityDebts(mockReq);

      expect(form.mortgage?.declared).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should get empty form when no priority debts data exist', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getPriorityDebts(mockReq);

      expect(form.mortgage?.declared).toBeUndefined();
    });

    it('should return populated form when priority debts data exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.priorityDebts = mortgageDebt();
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getPriorityDebts(mockReq);

      expect(form.mortgage?.declared).toBeTruthy();
      expect(form.mortgage?.transactionSource?.amount).toBe(2000);
      expect(form.mortgage?.transactionSource?.schedule).toBe(TransactionSchedule.MONTH);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getPriorityDebts(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('savePriorityDebts', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(savePriorityDebts(mockReq, mortgageDebt()))
        .rejects.toThrow('[priorityDebtsService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save when statement of means does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await savePriorityDebts(mockReq, mortgageDebt());

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            priorityDebts: expect.objectContaining({
              mortgage: expect.objectContaining({declared: true}),
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

      await savePriorityDebts(mockReq, mortgageDebt());

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            priorityDebts: expect.any(PriorityDebts),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(savePriorityDebts(mockReq, mortgageDebt())).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
