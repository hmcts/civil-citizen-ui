import axios from 'axios';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {DraftClaimResponse} from 'common/models/draft/draftClaim';
import {
  CIVIL_SERVICE_DRAFT_DEFENDANT_RESPONSE_RETENTION_DAYS,
  createOrLoadDraftResponseInDraftStoreDb,
  deleteDraftResponseFromDb,
  getDraftResponseForCaseFromDb,
  updateDraftResponseInDb,
} from 'modules/draft-store/response/responseDraftStoreDbService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('responseDraftStoreDbService Unit Tests', () => {
  let mockReq: AppRequest;
  const mockUserToken = 'mock-user-token';
  const mockDraftId = 'draft-456';
  const mockCaseId = '1790252856529614';

  const mockRawResponse: DraftClaimResponse = {
    draftId: mockDraftId,
    caseId: mockCaseId,
    payload: {totalClaimAmount: 1500},
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
    expiresAt: '2027-01-28T10:00:00.000Z',
  };

  const claimForCase = (): Claim => Object.assign(new Claim(), {id: mockCaseId, totalClaimAmount: 1500});

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      session: {
        user: {
          id: 'user-123',
          accessToken: mockUserToken,
        },
      },
    } as unknown as AppRequest;
  });

  describe('getDraftResponseForCaseFromDb', () => {
    it('should throw when the access token is missing', async () => {
      const invalidReq = {session: {}} as AppRequest;

      await expect(getDraftResponseForCaseFromDb(invalidReq, mockCaseId)).rejects.toThrow(
        '[responseDraftStoreDbService] access token is required to communicate with API',
      );
    });

    it('should return the draft linked to the case when the API responds with 200', async () => {
      mockedAxios.get.mockResolvedValueOnce({status: 200, data: mockRawResponse});

      const result = await getDraftResponseForCaseFromDb(mockReq, mockCaseId);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/dashboard/draft-responses/case/${mockCaseId}`),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockUserToken}`,
          }),
        }),
      );
      expect(result?.rawResponse.caseId).toBe(mockCaseId);
      expect(result?.claimResponse.id).toBe(mockDraftId);
    });

    it('should return null when the API responds with 404', async () => {
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      mockedAxios.get.mockRejectedValueOnce({isAxiosError: true, response: {status: 404}});

      await expect(getDraftResponseForCaseFromDb(mockReq, mockCaseId)).resolves.toBeNull();
    });

    it('should rethrow non-404 errors', async () => {
      mockedAxios.isAxiosError.mockReturnValueOnce(false);
      mockedAxios.get.mockRejectedValueOnce(new Error('Internal Server Error'));

      await expect(getDraftResponseForCaseFromDb(mockReq, mockCaseId)).rejects.toThrow('Internal Server Error');
    });

    it('should throw for a non-numeric caseId without calling the API', async () => {
      await expect(getDraftResponseForCaseFromDb(mockReq, '../active')).rejects.toThrow(
        '[responseDraftStoreDbService] invalid caseId',
      );
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('createOrLoadDraftResponseInDraftStoreDb', () => {
    it('should post a case-linked draft with 180 day retention', async () => {
      mockedAxios.post.mockResolvedValueOnce({status: 201, data: mockRawResponse});

      const result = await createOrLoadDraftResponseInDraftStoreDb(mockReq, claimForCase());

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard/draft-responses'),
        expect.objectContaining({
          caseId: mockCaseId,
          payload: expect.objectContaining({
            id: mockCaseId,
            draftClaimCacheTtlDays: CIVIL_SERVICE_DRAFT_DEFENDANT_RESPONSE_RETENTION_DAYS,
          }),
        }),
        expect.anything(),
      );
      expect(result.isNew).toBe(true);
      expect(result.rawResponse).toEqual(mockRawResponse);
      expect(result.claimResponse.id).toBe(mockDraftId);
    });

    it('should overwrite a different TTL with the response retention on create', async () => {
      const claim = claimForCase();
      claim.draftClaimCacheTtlDays = 30;
      mockedAxios.post.mockResolvedValueOnce({status: 201, data: mockRawResponse});

      await createOrLoadDraftResponseInDraftStoreDb(mockReq, claim);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard/draft-responses'),
        expect.objectContaining({
          payload: expect.objectContaining({
            draftClaimCacheTtlDays: CIVIL_SERVICE_DRAFT_DEFENDANT_RESPONSE_RETENTION_DAYS,
          }),
        }),
        expect.anything(),
      );
    });

    it('should throw when the claim has no case id and not call the API', async () => {
      await expect(createOrLoadDraftResponseInDraftStoreDb(mockReq, new Claim())).rejects.toThrow(
        '[responseDraftStoreDbService] caseId is required',
      );
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should load the case draft and set isNew=false when the API returns 409', async () => {
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      mockedAxios.post.mockRejectedValueOnce({isAxiosError: true, response: {status: 409}});
      mockedAxios.get.mockResolvedValueOnce({status: 200, data: mockRawResponse});

      const result = await createOrLoadDraftResponseInDraftStoreDb(mockReq, claimForCase());

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/dashboard/draft-responses/case/${mockCaseId}`),
        expect.anything(),
      );
      expect(result.isNew).toBe(false);
      expect(result.rawResponse).toEqual(mockRawResponse);
    });

    it('should rethrow the 409 when the existing case draft cannot be loaded', async () => {
      const error409 = {isAxiosError: true, response: {status: 409}};
      mockedAxios.isAxiosError.mockReturnValueOnce(true).mockReturnValueOnce(true);
      mockedAxios.post.mockRejectedValueOnce(error409);
      mockedAxios.get.mockRejectedValueOnce({isAxiosError: true, response: {status: 404}});

      await expect(createOrLoadDraftResponseInDraftStoreDb(mockReq, claimForCase())).rejects.toBe(error409);
    });

    it('should rethrow other create errors', async () => {
      mockedAxios.isAxiosError.mockReturnValueOnce(false);
      mockedAxios.post.mockRejectedValueOnce(new Error('Bad Request'));

      await expect(createOrLoadDraftResponseInDraftStoreDb(mockReq, claimForCase())).rejects.toThrow('Bad Request');
    });
  });

  describe('updateDraftResponseInDb', () => {
    it('should throw when draftId is empty', async () => {
      await expect(updateDraftResponseInDb(mockReq, '', claimForCase())).rejects.toThrow(
        '[responseDraftStoreDbService] draftId is required for PUT update',
      );
    });

    it('should throw when draftId contains unsafe characters', async () => {
      await expect(updateDraftResponseInDb(mockReq, '../evil', claimForCase())).rejects.toThrow(
        '[responseDraftStoreDbService] invalid draftId',
      );
      expect(mockedAxios.put).not.toHaveBeenCalled();
    });

    it('should throw when the claim has no case id', async () => {
      await expect(updateDraftResponseInDb(mockReq, mockDraftId, new Claim())).rejects.toThrow(
        '[responseDraftStoreDbService] caseId is required',
      );
      expect(mockedAxios.put).not.toHaveBeenCalled();
    });

    it('should put the case-linked payload with 180 day retention', async () => {
      const claim = claimForCase();
      claim.draftClaimCacheTtlDays = 30;
      mockedAxios.put.mockResolvedValueOnce({status: 200, data: mockRawResponse});

      const result = await updateDraftResponseInDb(mockReq, mockDraftId, claim);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/dashboard/draft-responses/${mockDraftId}`),
        expect.objectContaining({
          caseId: mockCaseId,
          payload: expect.objectContaining({
            id: mockCaseId,
            draftClaimCacheTtlDays: CIVIL_SERVICE_DRAFT_DEFENDANT_RESPONSE_RETENTION_DAYS,
          }),
        }),
        expect.anything(),
      );
      expect(result.rawResponse).toEqual(mockRawResponse);
      expect(result.claimResponse.id).toBe(mockDraftId);
    });

    it('should rethrow update errors', async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error('Failed to update'));

      await expect(updateDraftResponseInDb(mockReq, mockDraftId, claimForCase())).rejects.toThrow('Failed to update');
    });
  });

  describe('deleteDraftResponseFromDb', () => {
    it('should throw when draftId is empty', async () => {
      await expect(deleteDraftResponseFromDb(mockReq, '')).rejects.toThrow(
        '[responseDraftStoreDbService] draftId is required for deletion',
      );
    });

    it('should throw when draftId contains unsafe characters', async () => {
      await expect(deleteDraftResponseFromDb(mockReq, 'http://evil')).rejects.toThrow(
        '[responseDraftStoreDbService] invalid draftId',
      );
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });

    it('should call DELETE for the response draft', async () => {
      mockedAxios.delete.mockResolvedValueOnce({status: 204});

      await deleteDraftResponseFromDb(mockReq, mockDraftId);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining(`/dashboard/draft-responses/${mockDraftId}`),
        expect.any(Object),
      );
    });

    it('should ignore a 404 on delete', async () => {
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      mockedAxios.delete.mockRejectedValueOnce({isAxiosError: true, response: {status: 404}});

      await expect(deleteDraftResponseFromDb(mockReq, mockDraftId)).resolves.toBeUndefined();
    });

    it('should rethrow non-404 delete errors', async () => {
      mockedAxios.isAxiosError.mockReturnValueOnce(false);
      mockedAxios.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(deleteDraftResponseFromDb(mockReq, mockDraftId)).rejects.toThrow('Delete failed');
    });
  });
});
