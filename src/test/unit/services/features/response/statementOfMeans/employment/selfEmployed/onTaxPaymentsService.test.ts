import {
  getOnTaxPaymentsForm,
  saveTaxPaymentsData,
} from 'services/features/response/statementOfMeans/employment/selfEmployed/onTaxPaymentsService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {YesNo} from 'form/models/yesNo';
import {OnTaxPayments} from 'form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../../../utils/errorMessageTestConstants';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;

const caseId = '1645882162449409';
const AMOUNT_OWED = 22.2;
const REASON = 'reason';
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

describe('On Tax Payments Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOnTaxPaymentsForm', () => {
    it('should return an empty form when no data exists', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const form = await getOnTaxPaymentsForm(mockReq);

      expect(form.model.option).toBeUndefined();
      expect(form.model.reason).toBeUndefined();
      expect(form.model.amountYouOwe).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return an empty form when taxPayments does not exist', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getOnTaxPaymentsForm(mockReq);

      expect(form.model.option).toBeUndefined();
      expect(form.model.reason).toBeUndefined();
      expect(form.model.amountYouOwe).toBeUndefined();
    });

    it('should return populated form when taxPayments exist', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.taxPayments = {owed: true, amountOwed: AMOUNT_OWED, reason: REASON};
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getOnTaxPaymentsForm(mockReq);

      expect(form.model.option).toBe(YesNo.YES);
      expect(form.model.reason).toBe(REASON);
      expect(form.model.amountYouOwe).toBe(AMOUNT_OWED);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getOnTaxPaymentsForm(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveTaxPaymentsData', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveTaxPaymentsData(mockReq, new GenericForm(new OnTaxPayments(YesNo.YES, AMOUNT_OWED, REASON))))
        .rejects.toThrow('[onTaxPaymentsService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save when statement of means does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveTaxPaymentsData(mockReq, new GenericForm(new OnTaxPayments(YesNo.YES, AMOUNT_OWED, REASON)));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            taxPayments: expect.objectContaining({
              owed: true,
              amountOwed: AMOUNT_OWED,
              reason: REASON,
            }),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should clear amount and reason when option is no', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveTaxPaymentsData(mockReq, new GenericForm(new OnTaxPayments(YesNo.NO, AMOUNT_OWED, REASON)));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            taxPayments: expect.objectContaining({
              owed: false,
              amountOwed: undefined,
              reason: undefined,
            }),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveTaxPaymentsData(mockReq, new GenericForm(new OnTaxPayments(YesNo.YES, AMOUNT_OWED, REASON))))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
