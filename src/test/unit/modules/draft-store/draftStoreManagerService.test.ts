import {getDraftClaim, updateDraftClaim, createOrLoadDraft, deleteDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {createOrLoadDraftClaimInDraftStoreDb, getActiveDraftFromDraftStoreDb, updateDraftClaimInStore, deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreDbService';
import {getCachedDraft, setCachedDraft, deleteCachedDraft} from 'modules/draft-store/draftClaimRedisCache';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {isDraftClaimDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimResponse} from 'models/draft/draftClaim';

jest.mock('modules/draft-store/draftStoreDbService');
jest.mock('modules/draft-store/draftClaimRedisCache');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient');

const mockIsDraftClaimDatabaseEnabled = isDraftClaimDatabaseEnabled as jest.MockedFunction<typeof isDraftClaimDatabaseEnabled>;

const mockGetCachedDraft = getCachedDraft as jest.MockedFunction<typeof getCachedDraft>;
const mockSetCachedDraft = setCachedDraft as jest.MockedFunction<typeof setCachedDraft>;
const mockDeleteCachedDraft = deleteCachedDraft as jest.MockedFunction<typeof deleteCachedDraft>;

const mockGetActiveDraftFromDb = getActiveDraftFromDraftStoreDb as jest.MockedFunction<typeof getActiveDraftFromDraftStoreDb>;
const mockCreateOrLoadDraftInDb = createOrLoadDraftClaimInDraftStoreDb as jest.MockedFunction<typeof createOrLoadDraftClaimInDraftStoreDb>;
const mockUpdateDraftInDb = updateDraftClaimInStore as jest.MockedFunction<typeof updateDraftClaimInStore>;
const mockDeleteDraftFromDb = deleteDraftClaimFromStore as jest.MockedFunction<typeof deleteDraftClaimFromStore>;

describe('draftStoreManagerService Unit Tests', () => {
  let mockReq: AppRequest;

  const mockUserId = 'user1';
  const mockDraftId = '123';

  const mockRawResponse: DraftClaimResponse = {
    draftId: mockDraftId,
    payload: {claimAmount: 1500},
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z',
    expiresAt: '2026-09-01T10:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDraftClaimDatabaseEnabled.mockResolvedValue(true);

    mockReq = {
      session: {
        user: {
          id: mockUserId,
          accessToken: 'mock-token',
        },
      },
    } as unknown as AppRequest;
  });

  describe('getDraftClaim', () => {
    it('should throw an error if the user session ID is missing', async () => {
      const invalidReq = {session: {}} as AppRequest;
      await expect(getDraftClaim(invalidReq)).rejects.toThrow(
        '[draftStoreManagerService] user Id required to fetch draft',
      );
    });

    it('should throw if setCachedDraft fails after fetching from DB', async() => {
      mockGetCachedDraft.mockResolvedValueOnce(null);
      mockGetActiveDraftFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
      });
      mockSetCachedDraft.mockRejectedValueOnce(new Error('redis write failed'));

      await expect(getDraftClaim(mockReq)).rejects.toThrow('redis write failed');
    });

    it('cache hit: should return manager result directly from redis cache without querying db', async () => {
      mockGetCachedDraft.mockResolvedValueOnce(mockRawResponse);

      const result = await getDraftClaim(mockReq);

      expect(mockGetCachedDraft).toHaveBeenCalledWith(mockUserId);
      expect(mockGetActiveDraftFromDb).not.toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result?.claimResponse.id).toBe(mockDraftId);
      expect(result?.createdAt).toBe(mockRawResponse.createdAt);
      expect(result?.expiresAt).toBe(mockRawResponse.expiresAt);
    });

    it('cache miss should query db api and use redis cache when active draft is found', async() => {
      mockGetCachedDraft.mockResolvedValueOnce(null);
      mockGetActiveDraftFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
      });
      mockSetCachedDraft.mockResolvedValueOnce();
      const result = await getDraftClaim(mockReq);

      expect(mockGetCachedDraft).toHaveBeenCalledWith(mockUserId);
      expect(mockGetActiveDraftFromDb).toHaveBeenCalledWith(mockReq);
      expect(mockSetCachedDraft).toHaveBeenCalledWith(mockUserId, mockRawResponse);
      expect(result?.claimResponse.id).toBe(mockDraftId);
      expect(result?.rawResponse).toEqual(mockRawResponse);
    });

    it('should throw if redis cache throws an exception', async () => {
      mockGetCachedDraft.mockRejectedValueOnce(new Error('Redis error'));

      await expect(getDraftClaim(mockReq)).rejects.toThrow('Redis error');
      expect(mockGetActiveDraftFromDb).not.toHaveBeenCalled();
    });

    it('cache miss and db 404 should return null if not active draft exists in db', async () => {
      mockGetCachedDraft.mockResolvedValueOnce(null);
      mockGetActiveDraftFromDb.mockResolvedValueOnce(null);

      const result = await getDraftClaim(mockReq);

      expect(result).toBeNull();
      expect(mockSetCachedDraft).not.toHaveBeenCalled();
    });

    it('should rethrow database errors', async () => {
      mockGetCachedDraft.mockResolvedValueOnce(null);
      const dbError = new Error('database connection failed');
      mockGetActiveDraftFromDb.mockRejectedValueOnce(dbError);

      await expect(getDraftClaim(mockReq)).rejects.toThrow('database connection failed');
    });
  });

  describe('createOrLoadDraft', () => {
    it('should throw an error if user session id is missing', async () => {
      const invalidReq = {session: {}} as AppRequest;
      await expect(createOrLoadDraft(invalidReq)).rejects.toThrow(
        '[draftStoreManagerService] user id required to create/load draft',
      );
    });

    it('should execute POST db call first, use redis and set isNew to true for 201 created', async () => {
      const mockClaim = new Claim();
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
        isNew: true,
      });
      mockSetCachedDraft.mockResolvedValueOnce();

      const result = await createOrLoadDraft(mockReq, mockClaim);

      expect(mockCreateOrLoadDraftInDb).toHaveBeenCalledWith(mockReq, mockClaim);
      expect(mockSetCachedDraft).toHaveBeenCalledWith(mockUserId, mockRawResponse);
      expect(result.isNew).toBe(true);
      expect(result.claimResponse.id).toBe(mockDraftId);
    });

    it('should set isNew=false when POST loads an existing draft (200)', async () => {
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
        isNew: false,
      });
      mockSetCachedDraft.mockResolvedValueOnce();

      const result = await createOrLoadDraft(mockReq);

      expect(result.isNew).toBe(false);
      expect(mockSetCachedDraft).toHaveBeenCalledWith(mockUserId, mockRawResponse);
    });
  });

  describe('updateDraftClaim', () => {
    it('should throw an error if user session id is missing', async () => {
      const invalidReq = {session: {}} as AppRequest;
      await expect(updateDraftClaim(invalidReq, new Claim(), mockDraftId)).rejects.toThrow(
        '[draftStoreManagerService] user id required to update draft',
      );
    });

    it('should throw an error if draftId is missing', async () => {
      await expect(updateDraftClaim(mockReq, new Claim(), '')).rejects.toThrow(
        '[draftStoreManagerService] draft id required to update draft',
      );
    });

    it('should execute PUT db update first, then use cache', async () => {
      const mockClaim = new Claim();
      mockUpdateDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
      });
      mockSetCachedDraft.mockResolvedValueOnce();
      const result = await updateDraftClaim(mockReq, mockClaim, mockDraftId);
      expect(mockUpdateDraftInDb).toHaveBeenCalledWith(mockReq, mockDraftId, mockClaim);
      expect(mockSetCachedDraft).toHaveBeenCalledWith(mockUserId, mockRawResponse);
      expect(result.claimResponse.id).toBe(mockDraftId);
    });
  });

  describe('deleteDraftClaim', () => {
    it('should throw an error if user session id is missing', async () => {
      const invalidReq = {session: {}} as AppRequest;
      await expect(deleteDraftClaim(invalidReq, mockDraftId)).rejects.toThrow(
        '[draftStoreManagerService] user id required to delete draft',
      );
    });

    it('should execute DELETE from db first and then evict from redis second', async () => {
      mockDeleteDraftFromDb.mockResolvedValueOnce();
      mockDeleteCachedDraft.mockResolvedValueOnce();

      await deleteDraftClaim(mockReq, mockDraftId);

      expect(mockDeleteDraftFromDb).toHaveBeenCalledWith(mockReq, mockDraftId);
      expect(mockDeleteCachedDraft).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('when draft claim database flag is disabled', () => {
    beforeEach(() => {
      mockIsDraftClaimDatabaseEnabled.mockResolvedValue(false);
    });

    it('getDraftClaim should read from redis and not call the db', async () => {
      const stored = Object.assign(new CivilClaimResponse(), {
        id: mockUserId,
        case_data: {claimAmount: 1500},
      });
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(stored);

      const result = await getDraftClaim(mockReq);

      expect(draftStoreService.getDraftClaimFromStore).toHaveBeenCalledWith(mockUserId, true);
      expect(mockGetCachedDraft).not.toHaveBeenCalled();
      expect(mockGetActiveDraftFromDb).not.toHaveBeenCalled();
      expect(result?.claimResponse.id).toBe(mockUserId);
    });

    it('getDraftClaim should return null when redis has no case data', async () => {
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(new CivilClaimResponse());

      const result = await getDraftClaim(mockReq);

      expect(result).toBeNull();
    });

    it('createOrLoadDraft should create a redis draft when none exists', async () => {
      const mockClaim = new Claim();
      (draftStoreService.getDraftClaimFromStore as jest.Mock)
        .mockResolvedValueOnce(new CivilClaimResponse())
        .mockResolvedValueOnce(Object.assign(new CivilClaimResponse(), {
          id: mockUserId,
          case_data: mockClaim,
        }));
      (draftStoreService.createDraftClaimInStoreWithExpiryTime as jest.Mock).mockResolvedValueOnce(undefined);
      (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await createOrLoadDraft(mockReq, mockClaim);

      expect(draftStoreService.createDraftClaimInStoreWithExpiryTime).toHaveBeenCalledWith(mockUserId);
      expect(draftStoreService.saveDraftClaim).toHaveBeenCalledWith(mockUserId, mockClaim, true, mockUserId);
      expect(mockCreateOrLoadDraftInDb).not.toHaveBeenCalled();
      expect(result.isNew).toBe(true);
    });

    it('updateDraftClaim should save to redis and not call the db', async () => {
      const mockClaim = new Claim();
      (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValueOnce(undefined);
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: mockUserId, case_data: mockClaim}),
      );

      await updateDraftClaim(mockReq, mockClaim, mockDraftId);

      expect(draftStoreService.saveDraftClaim).toHaveBeenCalledWith(mockUserId, mockClaim, true, mockUserId);
      expect(mockUpdateDraftInDb).not.toHaveBeenCalled();
    });

    it('deleteDraftClaim should delete from redis and not call the db', async () => {
      (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(undefined);

      await deleteDraftClaim(mockReq, mockDraftId);

      expect(draftStoreService.deleteDraftClaimFromStore).toHaveBeenCalledWith(mockUserId);
      expect(mockDeleteDraftFromDb).not.toHaveBeenCalled();
      expect(mockDeleteCachedDraft).not.toHaveBeenCalled();
    });
  });
});
