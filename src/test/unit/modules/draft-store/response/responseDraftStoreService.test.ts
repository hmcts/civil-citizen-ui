import {
  getResponseDraft,
  createOrLoadResponse,
  updateResponseDraft,
  deleteResponseDraft,
} from 'modules/draft-store/response/responseDraftStoreService';
import {
  createOrLoadDraftClaimInDraftStoreDb,
  deleteDraftClaimFromStore,
  getDraftForCaseFromDraftStoreDb,
  updateDraftClaimInStore,
} from 'modules/draft-store/draftStoreDbService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {isDraftClaimDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimResponse} from 'models/draft/draftClaim';

jest.mock('modules/draft-store/draftStoreDbService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient');

const mockIsDraftClaimDatabaseEnabled = isDraftClaimDatabaseEnabled as jest.MockedFunction<typeof isDraftClaimDatabaseEnabled>;
const mockGetDraftForCaseFromDb = getDraftForCaseFromDraftStoreDb as jest.MockedFunction<typeof getDraftForCaseFromDraftStoreDb>;
const mockCreateOrLoadDraftInDb = createOrLoadDraftClaimInDraftStoreDb as jest.MockedFunction<typeof createOrLoadDraftClaimInDraftStoreDb>;
const mockUpdateDraftInDb = updateDraftClaimInStore as jest.MockedFunction<typeof updateDraftClaimInStore>;
const mockDeleteDraftFromDb = deleteDraftClaimFromStore as jest.MockedFunction<typeof deleteDraftClaimFromStore>;

describe('responseDraftStoreService Unit Tests', () => {
  let mockReq: AppRequest;

  const mockUserId = 'user1';
  const mockCaseId = '1790252856529614';
  const mockDraftId = 'draft-123';
  const redisKey = `${mockCaseId}${mockUserId}`;

  const mockRawResponse: DraftClaimResponse = {
    draftId: mockDraftId,
    caseId: mockCaseId,
    payload: {claimAmount: 1500},
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z',
    expiresAt: '2026-09-01T10:00:00.000Z',
  };

  const redisStored = Object.assign(new CivilClaimResponse(), {
    id: redisKey,
    case_data: {claimAmount: 500, draftClaimCreatedAt: new Date('2026-08-01T10:00:00.000Z')},
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDraftClaimDatabaseEnabled.mockResolvedValue(true);
    (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValue(new CivilClaimResponse());

    mockReq = {
      session: {
        user: {
          id: mockUserId,
          accessToken: 'mock-token',
        },
      },
    } as unknown as AppRequest;
  });

  describe('getResponseDraft', () => {
    it('should throw if caseId is not numeric', async () => {
      await expect(getResponseDraft(mockReq, 'not-a-case')).rejects.toThrow(
        '[responseDraftStoreService] invalid caseId',
      );
    });

    it('should throw if user session id is missing', async () => {
      const invalidReq = {session: {}} as AppRequest;
      await expect(getResponseDraft(invalidReq, mockCaseId)).rejects.toThrow(
        '[responseDraftStoreService] user id required to fetch response draft',
      );
    });

    it('should return redis draft when flag is off and redis has data', async () => {
      mockIsDraftClaimDatabaseEnabled.mockResolvedValue(false);
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(redisStored);

      const result = await getResponseDraft(mockReq, mockCaseId);

      expect(draftStoreService.getDraftClaimFromStore).toHaveBeenCalledWith(redisKey, true);
      expect(mockGetDraftForCaseFromDb).not.toHaveBeenCalled();
      expect(result?.claimResponse.id).toBe(redisKey);
      expect(result?.rawResponse.payload).toEqual(expect.objectContaining({claimAmount: 500}));
    });

    it('should return null when flag is off and redis is empty', async () => {
      mockIsDraftClaimDatabaseEnabled.mockResolvedValue(false);
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(new CivilClaimResponse());

      expect(await getResponseDraft(mockReq, mockCaseId)).toBeNull();
      expect(mockGetDraftForCaseFromDb).not.toHaveBeenCalled();
    });

    it('should prefer redis when flag is on and a redis working draft exists', async () => {
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(redisStored);

      const result = await getResponseDraft(mockReq, mockCaseId);

      expect(mockGetDraftForCaseFromDb).not.toHaveBeenCalled();
      expect(result?.claimResponse.id).toBe(redisKey);
    });

    it('should load case draft from db when flag is on and redis is empty', async () => {
      mockGetDraftForCaseFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
      });

      const result = await getResponseDraft(mockReq, mockCaseId);

      expect(mockGetDraftForCaseFromDb).toHaveBeenCalledWith(mockReq, mockCaseId);
      expect(result?.claimResponse.id).toBe(mockDraftId);
      expect(result?.rawResponse).toEqual(mockRawResponse);
      expect(result?.expiresAt).toBe(mockRawResponse.expiresAt);
    });

    it('should return null when flag is on and no redis or db draft exists', async () => {
      mockGetDraftForCaseFromDb.mockResolvedValueOnce(null);

      expect(await getResponseDraft(mockReq, mockCaseId)).toBeNull();
    });

    it('should treat redis read errors as a miss and continue to db', async () => {
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockRejectedValueOnce(new Error('redis down'));
      mockGetDraftForCaseFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
      });

      const result = await getResponseDraft(mockReq, mockCaseId);

      expect(mockGetDraftForCaseFromDb).toHaveBeenCalledWith(mockReq, mockCaseId);
      expect(result?.claimResponse.id).toBe(mockDraftId);
    });
  });

  describe('createOrLoadResponse', () => {
    it('should throw if caseId is not numeric', async () => {
      await expect(createOrLoadResponse(mockReq, 'bad-id')).rejects.toThrow(
        '[responseDraftStoreService] invalid caseId',
      );
    });

    it('should throw if user session id is missing', async () => {
      const invalidReq = {session: {}} as AppRequest;
      await expect(createOrLoadResponse(invalidReq, mockCaseId)).rejects.toThrow(
        '[responseDraftStoreService] user id required to create/load draft',
      );
    });

    it('should continue on redis when flag is on and a redis working draft exists', async () => {
      const mockClaim = Object.assign(new Claim(), {claimAmount: 900});
      (draftStoreService.getDraftClaimFromStore as jest.Mock)
        .mockResolvedValueOnce(redisStored)
        .mockResolvedValueOnce(Object.assign(new CivilClaimResponse(), {
          id: redisKey,
          case_data: {...mockClaim, id: mockCaseId},
        }));
      (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await createOrLoadResponse(mockReq, mockCaseId, mockClaim);

      expect(draftStoreService.saveDraftClaim).toHaveBeenCalledWith(
        redisKey,
        expect.objectContaining({id: mockCaseId}),
        true,
        mockUserId,
      );
      expect(mockCreateOrLoadDraftInDb).not.toHaveBeenCalled();
      expect(mockGetDraftForCaseFromDb).not.toHaveBeenCalled();
      expect(result.isNew).toBe(false);
    });

    it('should return existing db draft without updating when no claim is provided', async () => {
      mockGetDraftForCaseFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
      });

      const result = await createOrLoadResponse(mockReq, mockCaseId);

      expect(mockUpdateDraftInDb).not.toHaveBeenCalled();
      expect(mockCreateOrLoadDraftInDb).not.toHaveBeenCalled();
      expect(result.isNew).toBe(false);
      expect(result.claimResponse.id).toBe(mockDraftId);
    });

    it('should update existing db draft when claim is provided', async () => {
      const mockClaim = Object.assign(new Claim(), {claimAmount: 2000});
      mockGetDraftForCaseFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
      });
      mockUpdateDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {...mockRawResponse, payload: {claimAmount: 2000}},
      });

      const result = await createOrLoadResponse(mockReq, mockCaseId, mockClaim);

      expect(mockUpdateDraftInDb).toHaveBeenCalledWith(
        mockReq,
        mockDraftId,
        expect.objectContaining({id: mockCaseId, claimAmount: 2000}),
      );
      expect(mockCreateOrLoadDraftInDb).not.toHaveBeenCalled();
      expect(result.isNew).toBe(false);
      expect(result.rawResponse.payload).toEqual({claimAmount: 2000});
    });

    it('should create a new db draft when none exists for the case', async () => {
      const mockClaim = Object.assign(new Claim(), {claimAmount: 1500});
      mockGetDraftForCaseFromDb.mockResolvedValueOnce(null);
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
        isNew: true,
      });

      const result = await createOrLoadResponse(mockReq, mockCaseId, mockClaim);

      expect(mockCreateOrLoadDraftInDb).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({id: mockCaseId, claimAmount: 1500}),
      );
      expect(result.isNew).toBe(true);
      expect(result.claimResponse.id).toBe(mockDraftId);
    });

    it('should create a redis draft when flag is off and none exists', async () => {
      mockIsDraftClaimDatabaseEnabled.mockResolvedValue(false);
      const mockClaim = Object.assign(new Claim(), {claimAmount: 700});
      (draftStoreService.getDraftClaimFromStore as jest.Mock)
        .mockResolvedValueOnce(new CivilClaimResponse())
        .mockResolvedValueOnce(Object.assign(new CivilClaimResponse(), {
          id: redisKey,
          case_data: {...mockClaim, id: mockCaseId},
        }));
      (draftStoreService.createDraftClaimInStoreWithExpiryTime as jest.Mock).mockResolvedValueOnce(undefined);
      (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await createOrLoadResponse(mockReq, mockCaseId, mockClaim);

      expect(draftStoreService.createDraftClaimInStoreWithExpiryTime).toHaveBeenCalledWith(redisKey);
      expect(draftStoreService.saveDraftClaim).toHaveBeenCalledWith(
        redisKey,
        expect.objectContaining({id: mockCaseId}),
        true,
        mockUserId,
      );
      expect(mockCreateOrLoadDraftInDb).not.toHaveBeenCalled();
      expect(result.isNew).toBe(true);
    });
  });

  describe('updateResponseDraft', () => {
    const mockClaim = Object.assign(new Claim(), {claimAmount: 1200});

    it('should throw if caseId is not numeric', async () => {
      await expect(updateResponseDraft(mockReq, 'bad', mockClaim, mockDraftId)).rejects.toThrow(
        '[responseDraftStoreService] invalid caseId',
      );
    });

    it('should throw if user session id is missing', async () => {
      const invalidReq = {session: {}} as AppRequest;
      await expect(updateResponseDraft(invalidReq, mockCaseId, mockClaim, mockDraftId)).rejects.toThrow(
        '[responseDraftStoreService] user id required to update draft',
      );
    });

    it('should throw if draftId is missing on the db path', async () => {
      await expect(updateResponseDraft(mockReq, mockCaseId, mockClaim)).rejects.toThrow(
        '[responseDraftStoreService] draft id required to update draft',
      );
    });

    it('should update redis when a redis working draft exists', async () => {
      (draftStoreService.getDraftClaimFromStore as jest.Mock)
        .mockResolvedValueOnce(redisStored)
        .mockResolvedValueOnce(Object.assign(new CivilClaimResponse(), {
          id: redisKey,
          case_data: {...mockClaim, id: mockCaseId},
        }));
      (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await updateResponseDraft(mockReq, mockCaseId, mockClaim, mockDraftId);

      expect(draftStoreService.saveDraftClaim).toHaveBeenCalledWith(
        redisKey,
        expect.objectContaining({id: mockCaseId}),
        true,
        mockUserId,
      );
      expect(mockUpdateDraftInDb).not.toHaveBeenCalled();
      expect(result.claimResponse.id).toBe(redisKey);
    });

    it('should put to db when flag is on and redis is empty', async () => {
      mockUpdateDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
      });

      const result = await updateResponseDraft(mockReq, mockCaseId, mockClaim, mockDraftId);

      expect(mockUpdateDraftInDb).toHaveBeenCalledWith(
        mockReq,
        mockDraftId,
        expect.objectContaining({id: mockCaseId, claimAmount: 1200}),
      );
      expect(result.claimResponse.id).toBe(mockDraftId);
    });

    it('should update redis only when flag is off', async () => {
      mockIsDraftClaimDatabaseEnabled.mockResolvedValue(false);
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {
          id: redisKey,
          case_data: {...mockClaim, id: mockCaseId},
        }),
      );
      (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValueOnce(undefined);

      await updateResponseDraft(mockReq, mockCaseId, mockClaim);

      expect(draftStoreService.saveDraftClaim).toHaveBeenCalledWith(
        redisKey,
        expect.objectContaining({id: mockCaseId}),
        true,
        mockUserId,
      );
      expect(mockUpdateDraftInDb).not.toHaveBeenCalled();
    });
  });

  describe('deleteResponseDraft', () => {
    it('should throw if caseId is not numeric', async () => {
      await expect(deleteResponseDraft(mockReq, 'bad', mockDraftId)).rejects.toThrow(
        '[responseDraftStoreService] invalid caseId',
      );
    });

    it('should throw if user session id is missing', async () => {
      const invalidReq = {session: {}} as AppRequest;
      await expect(deleteResponseDraft(invalidReq, mockCaseId, mockDraftId)).rejects.toThrow(
        '[responseDraftStoreService] user id required to delete draft',
      );
    });

    it('should delete redis only when a redis working draft exists', async () => {
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(redisStored);
      (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(undefined);

      await deleteResponseDraft(mockReq, mockCaseId, mockDraftId);

      expect(draftStoreService.deleteDraftClaimFromStore).toHaveBeenCalledWith(redisKey);
      expect(mockDeleteDraftFromDb).not.toHaveBeenCalled();
    });

    it('should delete db draft and clear redis when flag is on and redis is empty', async () => {
      (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
      mockDeleteDraftFromDb.mockResolvedValueOnce(undefined);

      await deleteResponseDraft(mockReq, mockCaseId, mockDraftId);

      expect(mockDeleteDraftFromDb).toHaveBeenCalledWith(mockReq, mockDraftId);
      expect(draftStoreService.deleteDraftClaimFromStore).toHaveBeenCalledWith(redisKey);
    });

    it('should clear redis only when flag is off', async () => {
      mockIsDraftClaimDatabaseEnabled.mockResolvedValue(false);
      (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(undefined);

      await deleteResponseDraft(mockReq, mockCaseId, mockDraftId);

      expect(draftStoreService.deleteDraftClaimFromStore).toHaveBeenCalledWith(redisKey);
      expect(mockDeleteDraftFromDb).not.toHaveBeenCalled();
    });
  });
});
