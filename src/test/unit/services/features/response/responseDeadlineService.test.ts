import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {ResponseDeadlineService} from 'services/features/response/responseDeadlineService';
import {ResponseOptions} from 'form/models/responseDeadline';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {AdditionalTimeOptions} from 'form/models/additionalTime';
import {AppRequest} from 'models/AppRequest';

jest.mock('modules/draft-store/response/responseDraftStoreService');

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

const responseDeadlineService = new ResponseDeadlineService();

describe('Response Deadline Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveDeadlineResponse', () => {
    it('should save when response deadline already exists', async () => {
      const claim = new Claim();
      claim.responseDeadline = {option: undefined};
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await responseDeadlineService.saveDeadlineResponse(mockReq, ResponseOptions.YES);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          responseDeadline: expect.objectContaining({option: ResponseOptions.YES}),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save when response deadline does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await responseDeadlineService.saveDeadlineResponse(mockReq, ResponseOptions.NO);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          responseDeadline: expect.objectContaining({option: ResponseOptions.NO}),
        }),
        'draft-123',
      );
    });

    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(responseDeadlineService.saveDeadlineResponse(mockReq, ResponseOptions.YES))
        .rejects.toThrow('[responseDeadlineService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(responseDeadlineService.saveDeadlineResponse(mockReq, ResponseOptions.NO))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('getAdditionalTime', () => {
    it('should return valid option if "more-than-28-days"', () => {
      expect(responseDeadlineService.getAdditionalTime('more-than-28-days'))
        .toEqual(AdditionalTimeOptions.MORE_THAN_28_DAYS);
    });

    it('should return valid option if "up-to-28-days"', () => {
      expect(responseDeadlineService.getAdditionalTime('up-to-28-days'))
        .toEqual(AdditionalTimeOptions.UP_TO_28_DAYS);
    });

    it('should return undefined if invalid string is provided', () => {
      expect(responseDeadlineService.getAdditionalTime('blah'))
        .toBeUndefined();
    });
  });

  describe('saveAdditionalTime', () => {
    it('should save when response deadline already exists', async () => {
      const claim = new Claim();
      claim.responseDeadline = {option: undefined, additionalTime: undefined};
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await responseDeadlineService.saveAdditionalTime(mockReq, AdditionalTimeOptions.MORE_THAN_28_DAYS);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          responseDeadline: expect.objectContaining({additionalTime: AdditionalTimeOptions.MORE_THAN_28_DAYS}),
        }),
        'draft-123',
      );
    });

    it('should save when response deadline does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await responseDeadlineService.saveAdditionalTime(mockReq, AdditionalTimeOptions.UP_TO_28_DAYS);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          responseDeadline: expect.objectContaining({additionalTime: AdditionalTimeOptions.UP_TO_28_DAYS}),
        }),
        'draft-123',
      );
    });

    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(responseDeadlineService.saveAdditionalTime(mockReq, AdditionalTimeOptions.UP_TO_28_DAYS))
        .rejects.toThrow('[responseDeadlineService] no response draft found');
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(responseDeadlineService.saveAdditionalTime(mockReq, AdditionalTimeOptions.UP_TO_28_DAYS))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('getAgreedResponseDeadline', () => {
    it('should return undefined when empty claim retrieved', () => {
      const claim = new Claim();
      const agreedResponseDeadline = responseDeadlineService.getAgreedResponseDeadline(claim);
      expect(agreedResponseDeadline).toBeUndefined();
    });

    it('should return agreedResponseDeadline when date retrieved', () => {
      const mockAgreedResponseDeadline = new Date('2022-05-15T02:59:59');
      const claim = new Claim();
      claim.responseDeadline = {agreedResponseDeadline: mockAgreedResponseDeadline};

      const agreedResponseDeadline = responseDeadlineService.getAgreedResponseDeadline(claim);

      expect(agreedResponseDeadline).not.toBeNull();
      expect(agreedResponseDeadline.date).toEqual(mockAgreedResponseDeadline);
      expect(agreedResponseDeadline.year).toEqual(mockAgreedResponseDeadline.getFullYear());
      expect(agreedResponseDeadline.month).toEqual(mockAgreedResponseDeadline.getMonth() + 1);
      expect(agreedResponseDeadline.day).toEqual(mockAgreedResponseDeadline.getDate());
    });
  });

  describe('saveAgreedResponseDeadline', () => {
    const mockAgreedResponseDeadline = new Date('2022-01-24T15:59:59');

    it('should save when response deadline does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await responseDeadlineService.saveAgreedResponseDeadline(mockReq, mockAgreedResponseDeadline);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          responseDeadline: expect.objectContaining({agreedResponseDeadline: mockAgreedResponseDeadline}),
        }),
        'draft-123',
      );
    });

    it('should save when response deadline already exists', async () => {
      const claim = new Claim();
      claim.responseDeadline = {agreedResponseDeadline: undefined};
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await responseDeadlineService.saveAgreedResponseDeadline(mockReq, mockAgreedResponseDeadline);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          responseDeadline: expect.objectContaining({agreedResponseDeadline: mockAgreedResponseDeadline}),
        }),
        'draft-123',
      );
    });

    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(responseDeadlineService.saveAgreedResponseDeadline(mockReq, mockAgreedResponseDeadline))
        .rejects.toThrow('[responseDeadlineService] no response draft found');
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(responseDeadlineService.saveAgreedResponseDeadline(mockReq, mockAgreedResponseDeadline))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
