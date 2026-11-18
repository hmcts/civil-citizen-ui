import {OtherDependantsService} from 'services/features/response/statementOfMeans/otherDependants/otherDependantsService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {OtherDependants} from 'form/models/statementOfMeans/otherDependants';
import {GenericForm} from 'form/models/genericForm';
import {StatementOfMeans} from 'models/statementOfMeans';
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

const otherDependantsService = new OtherDependantsService();

describe('Other dependants service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOtherDependants', () => {
    it('should return empty other dependants when not set', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const result = await otherDependantsService.getOtherDependants(mockReq);

      expect(result).toEqual(new OtherDependants());
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return populated other dependants when they exist', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.otherDependants = new OtherDependants(YesNo.YES, 2, 'details');
      mockGetResponseClaimById.mockResolvedValue(claim);

      const result = await otherDependantsService.getOtherDependants(mockReq);

      expect(result.option).toBe(YesNo.YES);
      expect(result.numberOfPeople).toBe(2);
      expect(result.details).toBe('details');
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(otherDependantsService.getOtherDependants(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveOtherDependants', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(otherDependantsService.saveOtherDependants(mockReq, new GenericForm(new OtherDependants(YesNo.NO))))
        .rejects.toThrow('[otherDependantsService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save other dependants if object is not set', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});
      const dependants = new GenericForm(new OtherDependants(YesNo.YES, 2, 'description'));

      await otherDependantsService.saveOtherDependants(mockReq, dependants);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            otherDependants: expect.objectContaining({
              option: YesNo.YES,
              numberOfPeople: 2,
              details: 'description',
            }),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save other dependants if object is already set and new option is no', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.otherDependants = new OtherDependants(YesNo.YES, 4, 'my details');
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});
      const dependants = new GenericForm(new OtherDependants(YesNo.NO, 2, 'description'));

      await otherDependantsService.saveOtherDependants(mockReq, dependants);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            otherDependants: expect.objectContaining({option: YesNo.NO}),
          }),
        }),
        'draft-123',
      );
    });

    it('should save other dependants if object is already set and new option is yes', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.otherDependants = new OtherDependants(YesNo.NO);
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});
      const dependants = new GenericForm(new OtherDependants(YesNo.YES, 2, 'description'));

      await otherDependantsService.saveOtherDependants(mockReq, dependants);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            otherDependants: expect.objectContaining({
              option: YesNo.YES,
              numberOfPeople: 2,
              details: 'description',
            }),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(otherDependantsService.saveOtherDependants(mockReq, new GenericForm(new OtherDependants(YesNo.NO))))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
