import {DisabilityService} from 'services/features/response/statementOfMeans/disabilityService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
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

const disabilityService = new DisabilityService();

describe('Disability Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDisability', () => {
    it('should return empty form when disability is not set', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const form = await disabilityService.getDisability(mockReq);

      expect(form.model.option).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return populated form when disability exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.disability = new GenericYesNo(YesNo.YES);
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await disabilityService.getDisability(mockReq);

      expect(form.model.option).toBe(YesNo.YES);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(disabilityService.getDisability(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveDisability', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(disabilityService.saveDisability(mockReq, new GenericForm(new GenericYesNo(YesNo.NO))))
        .rejects.toThrow('[disabilityService] no draft response found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save disability when statement of means does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await disabilityService.saveDisability(mockReq, new GenericForm(new GenericYesNo(YesNo.YES)));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            disability: expect.objectContaining({option: YesNo.YES}),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save disability when statement of means already exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await disabilityService.saveDisability(mockReq, new GenericForm(new GenericYesNo(YesNo.NO)));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            disability: expect.objectContaining({option: YesNo.NO}),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(disabilityService.saveDisability(mockReq, new GenericForm(new GenericYesNo(YesNo.YES))))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
