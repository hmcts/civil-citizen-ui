import {getRegularIncome, saveRegularIncome} from 'services/features/response/statementOfMeans/income/regularIncomeService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {RegularIncome} from 'form/models/statementOfMeans/expensesAndIncome/regularIncome';
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

const jobIncome = () => new RegularIncome({
  job: Transaction.buildPopulatedForm('job', '2000', TransactionSchedule.MONTH, true),
});

describe('regularIncome service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRegularIncome', () => {
    it('should get empty form when statement of means does not exist', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const form = await getRegularIncome(mockReq);

      expect(form.job?.declared).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should get empty form when no regular income data exist', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getRegularIncome(mockReq);

      expect(form.job?.declared).toBeUndefined();
    });

    it('should return populated form when regular income data exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.regularIncome = jobIncome();
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getRegularIncome(mockReq);

      expect(form.job?.declared).toBeTruthy();
      expect(form.job?.transactionSource?.amount).toBe(2000);
      expect(form.job?.transactionSource?.schedule).toBe(TransactionSchedule.MONTH);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getRegularIncome(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveRegularIncome', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveRegularIncome(mockReq, jobIncome()))
        .rejects.toThrow('[regularIncomeService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save when statement of means does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveRegularIncome(mockReq, jobIncome());

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            regularIncome: expect.objectContaining({
              job: expect.objectContaining({declared: true}),
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

      await saveRegularIncome(mockReq, jobIncome());

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            regularIncome: expect.any(RegularIncome),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveRegularIncome(mockReq, jobIncome())).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
