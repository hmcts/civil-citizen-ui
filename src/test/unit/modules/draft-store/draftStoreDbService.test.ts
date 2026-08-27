import axios from 'axios';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {
  getActiveDraftFromDraftStoreDb,
  createOrLoadDraftClaimInDraftStoreDb,
  updateDraftClaimInStore,
  deleteDraftClaimFromStore,
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

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(result.isNew).toBe(true);
      expect(result.rawResponse).toEqual(mockRawResponse);
      expect(result.claimResponse.id).toBe(mockDraftId);
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

    it('should return rawResponse and set isNew=false when backend returns existing draft (200)', async () => {
      const mockClaim = new Claim();
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: mockRawResponse,
      });

      const result = await createOrLoadDraftClaimInDraftStoreDb(mockReq, mockClaim);

      expect(result.isNew).toBe(false);
      expect(result.rawResponse).toEqual(mockRawResponse);
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

    it('should update draft in backend DB and return updated result', async () => {
      const mockClaim = new Claim();
      mockedAxios.put.mockResolvedValueOnce({
        status: 200,
        data: mockRawResponse,
      });

      const result = await updateDraftClaimInStore(mockReq, mockDraftId, mockClaim);

      expect(mockedAxios.put).toHaveBeenCalled();
      expect(result.rawResponse).toEqual(mockRawResponse);
      expect(result.claimResponse.id).toBe(mockDraftId);
    });

    it('should rethrow backend API errors during update', async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error('Failed to update'));

      await expect(updateDraftClaimInStore(mockReq, mockDraftId, new Claim())).rejects.toThrow('Failed to update');
    });
  });

  describe('deleteDraftClaimFromStore', () => {
    it('should throw error if draftId is empty', async () => {
      await expect(deleteDraftClaimFromStore(mockReq, '')).rejects.toThrow(
        '[draftStoreDbService] draftId is required for deletion',
      );
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
