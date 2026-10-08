import axios from 'axios';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {
  getActiveDraftFromDraftStoreDb,
  getDraftForCaseFromDraftStoreDb,
  createOrLoadDraftClaimInDraftStoreDb,
  updateDraftClaimInStore,
  applyPaymentRetentionInDraftStoreDb,
  deleteDraftClaimFromStore,
  CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS,
} from 'modules/draft-store/draftStoreDbService';
import {DraftClaimResponse} from 'common/models/draft/draftClaim';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('draftStoreDbService Unit Tests', () => {
  let mockReq: AppRequest;
  const mockUserId = 'user-123';
  const mockDraftId = 'draft-456';
  const mockUserToken = 'mock-user-token';

  const mockRawResponse: DraftClaimResponse = {
    draftId: mockDraftId,
    payload: { applicant1: { type: 'INDIVIDUAL' } },
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
    expiresAt: '2026-09-01T10:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      session: {
        user: {
          id: mockUserId,
          accessToken: mockUserToken,
        },
      },
    } as unknown as AppRequest;
  });

  describe('getHeaders Validation', () => {
    it('should throw an error when access token is missing in session', async () => {
      const invalidReq = { session: {} } as AppRequest;
      await expect(getActiveDraftFromDraftStoreDb(invalidReq)).rejects.toThrow(
        '[draftStoreDbService] access token is required to communicate with API',
      );
    });
  });

  describe('getDraftForCaseFromDraftStoreDb', () => {
    const caseId = '1790252856529614';

    it('should return the draft linked to the case when backend API responds with 200', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {...mockRawResponse, caseId},
      });

      const result = await getDraftForCaseFromDraftStoreDb(mockReq, caseId);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/dashboard/draft-claims/case/${caseId}`),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockUserToken}`,
          }),
        }),
      );
      expect(result?.rawResponse.caseId).toBe(caseId);
      expect(result?.claimResponse.id).toBe(mockDraftId);
    });

    it('should return null when backend API responds with 404 (no draft for case)', async () => {
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      mockedAxios.get.mockRejectedValueOnce({isAxiosError: true, response: {status: 404}});

      const result = await getDraftForCaseFromDraftStoreDb(mockReq, caseId);

      expect(result).toBeNull();
    });

    it('should rethrow non-404 errors from backend API', async () => {
      mockedAxios.isAxiosError.mockReturnValueOnce(false);
      mockedAxios.get.mockRejectedValueOnce(new Error('Internal Server Error'));

      await expect(getDraftForCaseFromDraftStoreDb(mockReq, caseId)).rejects.toThrow('Internal Server Error');
    });

    it('should throw for a non-numeric caseId without calling the API', async () => {
      await expect(getDraftForCaseFromDraftStoreDb(mockReq, '../active')).rejects.toThrow(
        '[draftStoreDbService] invalid caseId',
      );
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('getActiveDraftFromDraftStoreDb', () => {
    it('should return active draft when backend API responds with 200', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: mockRawResponse,
      });

      const result = await getActiveDraftFromDraftStoreDb(mockReq);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard/draft-claims/active'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockUserToken}`,
          }),
        }),
      );
      expect(result?.rawResponse).toEqual(mockRawResponse);
      expect(result?.claimResponse.id).toBe(mockDraftId);
    });

    it('should return null when backend API responds with 404 (no active draft)', async () => {
      const error404 = {
        isAxiosError: true,
        response: { status: 404 },
      };
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      mockedAxios.get.mockRejectedValueOnce(error404);

      const result = await getActiveDraftFromDraftStoreDb(mockReq);

      expect(result).toBeNull();
    });

    it('should rethrow non-404 errors from backend API', async () => {
      const error500 = new Error('Internal Server Error');
      mockedAxios.isAxiosError.mockReturnValueOnce(false);
      mockedAxios.get.mockRejectedValueOnce(error500);

      await expect(getActiveDraftFromDraftStoreDb(mockReq)).rejects.toThrow('Internal Server Error');
    });
  });

  describe('createOrLoadDraftClaimInDraftStoreDb', () => {
    it('should return rawResponse and set isNew=true when backend creates draft (201)', async () => {
      const mockClaim = new Claim();
      mockedAxios.post.mockResolvedValueOnce({
        status: 201,
        data: mockRawResponse,
      });

      const result = await createOrLoadDraftClaimInDraftStoreDb(mockReq, mockClaim);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard/draft-claims'),
        expect.objectContaining({
          payload: expect.objectContaining({
            draftClaimCacheTtlDays: CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS,
          }),
        }),
        expect.anything(),
      );
      expect(result.isNew).toBe(true);
      expect(result.rawResponse).toEqual(mockRawResponse);
      expect(result.claimResponse.id).toBe(mockDraftId);
    });

    it('should preserve an already-set draftClaimCacheTtlDays on create', async () => {
      const mockClaim = new Claim();
      mockClaim.draftClaimCacheTtlDays = 180;
      mockedAxios.post.mockResolvedValueOnce({
        status: 201,
        data: mockRawResponse,
      });

      await createOrLoadDraftClaimInDraftStoreDb(mockReq, mockClaim);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard/draft-claims'),
        expect.objectContaining({
          payload: expect.objectContaining({
            draftClaimCacheTtlDays: 180,
          }),
        }),
        expect.anything(),
      );
    });

    it('should default to new Claim() when claim parameter is undefined', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 201,
        data: mockRawResponse,
      });

      const result = await createOrLoadDraftClaimInDraftStoreDb(mockReq);

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(result.isNew).toBe(true);
    });

    it('should load the active draft and set isNew=false when backend returns 409 (draft already exists)', async () => {
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      mockedAxios.post.mockRejectedValueOnce({isAxiosError: true, response: {status: 409}});
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: mockRawResponse,
      });

      const result = await createOrLoadDraftClaimInDraftStoreDb(mockReq, new Claim());

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard/draft-claims/active'),
        expect.anything(),
      );
      expect(result.isNew).toBe(false);
      expect(result.rawResponse).toEqual(mockRawResponse);
      expect(result.claimResponse.id).toBe(mockDraftId);
    });

    it('should rethrow the 409 when no active draft can be loaded', async () => {
      const error409 = {isAxiosError: true, response: {status: 409}};
      mockedAxios.isAxiosError.mockReturnValueOnce(true).mockReturnValueOnce(true);
      mockedAxios.post.mockRejectedValueOnce(error409);
      mockedAxios.get.mockRejectedValueOnce({isAxiosError: true, response: {status: 404}});

      await expect(createOrLoadDraftClaimInDraftStoreDb(mockReq, new Claim())).rejects.toBe(error409);
    });

    it('should rethrow backend API errors during createOrLoad', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Bad Request'));

      await expect(createOrLoadDraftClaimInDraftStoreDb(mockReq, new Claim())).rejects.toThrow('Bad Request');
    });
  });

  describe('updateDraftClaimInStore', () => {
    it('should throw error if draftId is empty', async () => {
      await expect(updateDraftClaimInStore(mockReq, '', new Claim())).rejects.toThrow(
        '[draftStoreDbService] draftId is required for PUT update',
      );
    });

    it('should throw error if draftId contains unsafe characters', async () => {
      await expect(updateDraftClaimInStore(mockReq, '../evil', new Claim())).rejects.toThrow(
        '[draftStoreDbService] invalid draftId',
      );
      expect(mockedAxios.put).not.toHaveBeenCalled();
    });

    it('should update draft in backend DB and return updated result', async () => {
      const mockClaim = new Claim();
      mockedAxios.put.mockResolvedValueOnce({
        status: 200,
        data: mockRawResponse,
      });

      const result = await updateDraftClaimInStore(mockReq, mockDraftId, mockClaim);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/dashboard/draft-claims/${mockDraftId}`),
        expect.objectContaining({
          payload: expect.objectContaining({
            draftClaimCacheTtlDays: CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS,
          }),
        }),
        expect.anything(),
      );
      expect(mockedAxios.put.mock.calls[0][1]).not.toHaveProperty('caseId');
      expect(result.rawResponse).toEqual(mockRawResponse);
      expect(result.claimResponse.id).toBe(mockDraftId);
    });

    it('should send CCD caseId on PUT after the claim has been submitted', async () => {
      const mockClaim = new Claim();
      mockClaim.id = '1790322528949860';
      mockedAxios.put.mockResolvedValueOnce({
        status: 200,
        data: mockRawResponse,
      });

      await updateDraftClaimInStore(mockReq, mockDraftId, mockClaim);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/dashboard/draft-claims/${mockDraftId}`),
        expect.objectContaining({
          caseId: '1790322528949860',
          payload: expect.objectContaining({id: '1790322528949860'}),
        }),
        expect.anything(),
      );
    });

    it('should preserve an already-set draftClaimCacheTtlDays on update', async () => {
      const mockClaim = new Claim();
      mockClaim.draftClaimCacheTtlDays = 180;
      mockedAxios.put.mockResolvedValueOnce({
        status: 200,
        data: mockRawResponse,
      });

      await updateDraftClaimInStore(mockReq, mockDraftId, mockClaim);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/dashboard/draft-claims/${mockDraftId}`),
        expect.objectContaining({
          payload: expect.objectContaining({
            draftClaimCacheTtlDays: 180,
          }),
        }),
        expect.anything(),
      );
    });

    it('should rethrow backend API errors during update', async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error('Failed to update'));

      await expect(updateDraftClaimInStore(mockReq, mockDraftId, new Claim())).rejects.toThrow('Failed to update');
    });
  });

  describe('applyPaymentRetentionInDraftStoreDb', () => {
    it('should throw error if draftId is empty', async () => {
      await expect(applyPaymentRetentionInDraftStoreDb(mockReq, '')).rejects.toThrow(
        '[draftStoreDbService] draftId is required for payment retention',
      );
    });

    it('should call payment-retention endpoint on backend DB', async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 200,
        data: mockRawResponse,
      });

      const result = await applyPaymentRetentionInDraftStoreDb(mockReq, mockDraftId);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/dashboard/draft-claims/${mockDraftId}/payment-retention`),
        undefined,
        expect.anything(),
      );
      expect(result.rawResponse).toEqual(mockRawResponse);
    });
  });

  describe('deleteDraftClaimFromStore', () => {
    it('should throw error if draftId is empty', async () => {
      await expect(deleteDraftClaimFromStore(mockReq, '')).rejects.toThrow(
        '[draftStoreDbService] draftId is required for deletion',
      );
    });

    it('should throw error if draftId contains unsafe characters', async () => {
      await expect(deleteDraftClaimFromStore(mockReq, 'http://evil')).rejects.toThrow(
        '[draftStoreDbService] invalid draftId',
      );
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });

    it('should call DELETE endpoint on backend DB', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ status: 200 });

      await deleteDraftClaimFromStore(mockReq, mockDraftId);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining(`/dashboard/draft-claims/${mockDraftId}`),
        expect.any(Object),
      );
    });

    it('should swallow 404 errors on deletion gracefully', async () => {
      const error404 = {
        isAxiosError: true,
        response: { status: 404 },
      };
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      mockedAxios.delete.mockRejectedValueOnce(error404);

      await expect(deleteDraftClaimFromStore(mockReq, mockDraftId)).resolves.not.toThrow();
    });

    it('should rethrow non-404 errors on deletion', async () => {
      const error500 = new Error('Delete failed');
      mockedAxios.isAxiosError.mockReturnValueOnce(false);
      mockedAxios.delete.mockRejectedValueOnce(error500);

      await expect(deleteDraftClaimFromStore(mockReq, mockDraftId)).rejects.toThrow('Delete failed');
    });
  });
});
