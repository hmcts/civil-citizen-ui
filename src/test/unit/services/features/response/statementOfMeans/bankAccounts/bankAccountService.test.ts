import {BankAccountService} from 'services/features/response/statementOfMeans/bankAccounts/bankAccountService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {BankAccounts} from 'form/models/bankAndSavings/bankAccounts';
import {BankAccount} from 'form/models/bankAndSavings/bankAccount';
import {StatementOfMeans} from 'models/statementOfMeans';
import {CitizenBankAccount} from 'models/citizenBankAccount';
import {Claim} from 'models/claim';
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

const bankAccountService = new BankAccountService();

describe('Bank account service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBankAccounts', () => {
    it('should return empty bank account rows when bank accounts do not exist', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const result = await bankAccountService.getBankAccounts(mockReq);

      expect(result.accounts.length).toBe(2);
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return populated bank accounts when data exists', async () => {
      mockGetResponseClaimById.mockResolvedValue(createClaim());

      const result = await bankAccountService.getBankAccounts(mockReq);

      expect(result.accounts.length).toBe(2);
      expect(result.accounts[0].typeOfAccount).toBe('OTHER');
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(bankAccountService.getBankAccounts(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveBankAccounts', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(bankAccountService.saveBankAccounts(mockReq, new BankAccounts([new BankAccount('OTHER', 'true', '123')])))
        .rejects.toThrow('[bankAccountService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save when statement of means does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await bankAccountService.saveBankAccounts(mockReq, new BankAccounts([new BankAccount('OTHER', 'true', '123')]));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            bankAccounts: expect.any(Array),
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

      await bankAccountService.saveBankAccounts(mockReq, new BankAccounts([new BankAccount('CURRENT_ACCOUNT', 'false', '456')]));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            bankAccounts: expect.any(Array),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(bankAccountService.saveBankAccounts(mockReq, new BankAccounts([new BankAccount('OTHER', 'true', '123')])))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});

function createClaim() {
  const claim = new Claim();
  const statementOfMeans = new StatementOfMeans();
  statementOfMeans.bankAccounts = [new CitizenBankAccount('OTHER', 'true', '2342')];
  claim.statementOfMeans = statementOfMeans;
  return claim;
}
