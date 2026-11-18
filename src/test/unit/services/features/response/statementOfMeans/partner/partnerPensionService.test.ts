import {PartnerPensionService} from 'services/features/response/statementOfMeans/partner/partnerPensionService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
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

const partnerPensionService = new PartnerPensionService();

describe('Partner Pension Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPartnerPension', () => {
    it('should return empty form when partner pension is not set', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const form = await partnerPensionService.getPartnerPension(mockReq);

      expect(form.model.option).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return populated form when partner pension exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.partnerPension = new GenericYesNo(YesNo.YES);
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await partnerPensionService.getPartnerPension(mockReq);

      expect(form.model.option).toBe(YesNo.YES);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(partnerPensionService.getPartnerPension(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('savePartnerPension', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(partnerPensionService.savePartnerPension(mockReq, new GenericForm(new GenericYesNo(YesNo.NO))))
        .rejects.toThrow('[partnerPensionService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save when statement of means does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await partnerPensionService.savePartnerPension(mockReq, new GenericForm(new GenericYesNo(YesNo.YES)));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            partnerPension: expect.objectContaining({option: YesNo.YES}),
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

      await partnerPensionService.savePartnerPension(mockReq, new GenericForm(new GenericYesNo(YesNo.NO)));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            partnerPension: expect.objectContaining({option: YesNo.NO}),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(partnerPensionService.savePartnerPension(mockReq, new GenericForm(new GenericYesNo(YesNo.YES))))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
