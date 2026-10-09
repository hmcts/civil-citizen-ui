import {getDraftClaim, getDraftClaimForCase, updateDraftClaim, createOrLoadDraft, deleteDraftClaim, applyPaymentRetention} from 'modules/draft-store/draftStoreManagerService';
import {
  CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS,
  createOrLoadDraftClaimInDraftStoreDb,
  getActiveDraftFromDraftStoreDb,
  getDraftForCaseFromDraftStoreDb,
  updateDraftClaimInStore,
  applyPaymentRetentionInDraftStoreDb,
  deleteDraftClaimFromStore,
} from 'modules/draft-store/draftStoreDbService';
import {getCachedDraft, setCachedDraft, deleteCachedDraft} from 'modules/draft-store/draftClaimRedisCache';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {isDraftClaimDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimResponse} from 'models/draft/draftClaim';

jest.mock('modules/draft-store/draftStoreDbService', () => ({
  ...jest.requireActual('modules/draft-store/draftStoreDbService'),
  createOrLoadDraftClaimInDraftStoreDb: jest.fn(),
  getActiveDraftFromDraftStoreDb: jest.fn(),
  getDraftForCaseFromDraftStoreDb: jest.fn(),
  updateDraftClaimInStore: jest.fn(),
  applyPaymentRetentionInDraftStoreDb: jest.fn(),
  deleteDraftClaimFromStore: jest.fn(),
}));
jest.mock('modules/draft-store/draftClaimRedisCache');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient');

const mockIsDraftClaimDatabaseEnabled = isDraftClaimDatabaseEnabled as jest.MockedFunction<typeof isDraftClaimDatabaseEnabled>;

const mockGetCachedDraft = getCachedDraft as jest.MockedFunction<typeof getCachedDraft>;
const mockSetCachedDraft = setCachedDraft as jest.MockedFunction<typeof setCachedDraft>;
const mockDeleteCachedDraft = deleteCachedDraft as jest.MockedFunction<typeof deleteCachedDraft>;

const mockGetActiveDraftFromDb = getActiveDraftFromDraftStoreDb as jest.MockedFunction<typeof getActiveDraftFromDraftStoreDb>;
const mockGetDraftForCaseFromDb = getDraftForCaseFromDraftStoreDb as jest.MockedFunction<typeof getDraftForCaseFromDraftStoreDb>;
const mockCreateOrLoadDraftInDb = createOrLoadDraftClaimInDraftStoreDb as jest.MockedFunction<typeof createOrLoadDraftClaimInDraftStoreDb>;
const mockUpdateDraftInDb = updateDraftClaimInStore as jest.MockedFunction<typeof updateDraftClaimInStore>;
const mockApplyPaymentRetentionInDb = applyPaymentRetentionInDraftStoreDb as jest.MockedFunction<typeof applyPaymentRetentionInDraftStoreDb>;
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
    require('../../../../main/app-instance').app.locals.draftStoreClient = {ttl: jest.fn().mockResolvedValue(-1)};

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
      const result = await getDraftClaim(mockReq);

      expect(mockGetCachedDraft).toHaveBeenCalledWith(mockUserId);
      expect(mockGetActiveDraftFromDb).toHaveBeenCalledWith(mockReq);
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
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(new CivilClaimResponse());

      const result = await getDraftClaim(mockReq);

      expect(result).toBeNull();
      expect(mockSetCachedDraft).not.toHaveBeenCalled();
    });

    it('should migrate a populated Redis draft into the DB when the flag is on and DB is empty', async () => {
      const createdAt = new Date('2026-07-01T10:00:00.000Z');
      const redisClaim = Object.assign(new Claim(), {
        totalClaimAmount: 500,
        draftClaimCreatedAt: createdAt,
      });
      mockGetCachedDraft.mockResolvedValueOnce(null);
      mockGetActiveDraftFromDb.mockResolvedValueOnce(null);
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: mockUserId, case_data: redisClaim}),
      );
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {
          ...mockRawResponse,
          payload: redisClaim as unknown as Record<string, unknown>,
          createdAt: createdAt.toISOString(),
        },
        isNew: true,
      });
      (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await getDraftClaim(mockReq);

      expect(mockCreateOrLoadDraftInDb).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          totalClaimAmount: 500,
          draftClaimCreatedAt: createdAt,
          draftClaimCacheTtlDays: CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS,
        }),
      );
      expect(draftStoreService.deleteDraftClaimFromStore).toHaveBeenCalledWith(mockUserId);
      expect(result?.rawResponse.payload).toEqual(expect.objectContaining({totalClaimAmount: 500}));
      expect(result?.createdAt).toBe(createdAt.toISOString());
    });

    it('should rethrow database errors', async () => {
      mockGetCachedDraft.mockResolvedValueOnce(null);
      const dbError = new Error('database connection failed');
      mockGetActiveDraftFromDb.mockRejectedValueOnce(dbError);

      await expect(getDraftClaim(mockReq)).rejects.toThrow('database connection failed');
    });

    it('should propagate Redis→DB migration failures instead of returning null', async () => {
      mockGetCachedDraft.mockResolvedValueOnce(null);
      mockGetActiveDraftFromDb.mockResolvedValueOnce(null);
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {
          id: mockUserId,
          case_data: {totalClaimAmount: 500},
        }),
      );
      mockCreateOrLoadDraftInDb.mockRejectedValueOnce(new Error('draftClaimCacheTtlDays must be 30'));

      await expect(getDraftClaim(mockReq)).rejects.toThrow('draftClaimCacheTtlDays must be 30');
      expect(draftStoreService.deleteDraftClaimFromStore).not.toHaveBeenCalled();
    });
  });

  describe('getDraftClaimForCase', () => {
    const caseId = '1790252856529614';

    it('should return manager result for the draft linked to the case', async () => {
      mockGetDraftForCaseFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {...mockRawResponse, caseId},
      });

      const result = await getDraftClaimForCase(mockReq, caseId);

      expect(mockGetDraftForCaseFromDb).toHaveBeenCalledWith(mockReq, caseId);
      expect(result?.claimResponse.id).toBe(mockDraftId);
      expect(result?.rawResponse.caseId).toBe(caseId);
    });

    it('should return null when no draft is linked to the case', async () => {
      mockGetDraftForCaseFromDb.mockResolvedValueOnce(null);

      expect(await getDraftClaimForCase(mockReq, caseId)).toBeNull();
    });

    it('should return null without calling the db when the draft database flag is disabled', async () => {
      mockIsDraftClaimDatabaseEnabled.mockResolvedValue(false);

      expect(await getDraftClaimForCase(mockReq, caseId)).toBeNull();
      expect(mockGetDraftForCaseFromDb).not.toHaveBeenCalled();
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
      mockGetActiveDraftFromDb.mockResolvedValueOnce(null);
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(new CivilClaimResponse());
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
        isNew: true,
      });

      const result = await createOrLoadDraft(mockReq, mockClaim);

      expect(mockCreateOrLoadDraftInDb).toHaveBeenCalledWith(mockReq, mockClaim);
      expect(result.isNew).toBe(true);
      expect(result.claimResponse.id).toBe(mockDraftId);
    });

    it('should set isNew=false when POST loads an existing draft (200)', async () => {
      mockGetActiveDraftFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
      });
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: mockRawResponse,
        isNew: false,
      });

      const result = await createOrLoadDraft(mockReq);

      expect(result.isNew).toBe(false);
    });

    it('should migrate Redis answers before creating a blank DB draft', async () => {
      const createdAt = new Date('2026-07-01T10:00:00.000Z');
      const redisClaim = Object.assign(new Claim(), {
        totalClaimAmount: 900,
        draftClaimCreatedAt: createdAt,
      });
      mockGetActiveDraftFromDb.mockResolvedValueOnce(null);
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: mockUserId, case_data: redisClaim}),
      );
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {
          ...mockRawResponse,
          payload: redisClaim as unknown as Record<string, unknown>,
        },
        isNew: true,
      });
      (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await createOrLoadDraft(mockReq);

      expect(mockCreateOrLoadDraftInDb).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          totalClaimAmount: 900,
          draftClaimCacheTtlDays: CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS,
        }),
      );
      expect(result.isNew).toBe(false);
      expect(result.rawResponse.payload).toEqual(expect.objectContaining({totalClaimAmount: 900}));
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
      const result = await updateDraftClaim(mockReq, mockClaim, mockDraftId);
      expect(mockUpdateDraftInDb).toHaveBeenCalledWith(mockReq, mockDraftId, mockClaim);
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

  describe('applyPaymentRetention', () => {
    it('should call db payment retention and clear cache when flag enabled', async () => {
      mockApplyPaymentRetentionInDb.mockResolvedValueOnce({
        claimResponse: Object.assign(new CivilClaimResponse(), {id: mockDraftId}),
        rawResponse: mockRawResponse,
      });
      mockDeleteCachedDraft.mockResolvedValueOnce();

      const result = await applyPaymentRetention(mockReq, mockDraftId);

      expect(mockApplyPaymentRetentionInDb).toHaveBeenCalledWith(mockReq, mockDraftId);
      expect(mockDeleteCachedDraft).toHaveBeenCalledWith(mockUserId);
      expect(result?.expiresAt).toBe(mockRawResponse.expiresAt);
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
      (draftStoreService.getDraftClaimFromStore as jest.Mock)
        .mockResolvedValueOnce(new CivilClaimResponse())
        .mockResolvedValueOnce(new CivilClaimResponse());
      mockGetActiveDraftFromDb.mockResolvedValueOnce(null);

      const result = await getDraftClaim(mockReq);

      expect(result).toBeNull();
    });

    it('should hydrate Redis from the DB when the flag is rolled back and Redis is empty', async () => {
      const createdAt = new Date('2026-07-01T10:00:00.000Z');
      const expiresAt = new Date(Date.now() + 3 * 86400 * 1000).toISOString();
      const dbPayload = {
        totalClaimAmount: 750,
        draftClaimCreatedAt: createdAt.toISOString(),
      };
      mockReq.session.draftId = mockDraftId;
      (draftStoreService.getDraftClaimFromStore as jest.Mock)
        .mockResolvedValueOnce(new CivilClaimResponse())
        .mockResolvedValueOnce(new CivilClaimResponse());
      mockGetActiveDraftFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {
          ...mockRawResponse,
          payload: dbPayload,
          createdAt: createdAt.toISOString(),
          expiresAt,
        },
      });
      mockDeleteDraftFromDb.mockResolvedValueOnce(undefined);

      const setMock = jest.fn().mockResolvedValue('OK');
      const {app} = require('../../../../main/app-instance');
      app.locals.draftStoreClient = {set: setMock, ttl: jest.fn().mockResolvedValue(-1)};

      const result = await getDraftClaim(mockReq);

      expect(mockGetActiveDraftFromDb).toHaveBeenCalledWith(mockReq);
      expect(setMock).toHaveBeenCalledWith(
        mockUserId,
        expect.stringContaining('"totalClaimAmount":750'),
        'EX',
        expect.any(Number),
      );
      expect(mockDeleteDraftFromDb).toHaveBeenCalledWith(mockReq, mockDraftId);
      expect(mockReq.session.draftId).toBeUndefined();
      expect(result?.claimResponse.case_data).toEqual(expect.objectContaining({totalClaimAmount: 750}));
    });

    it('createOrLoadDraft should create a redis draft when none exists', async () => {
      const mockClaim = new Claim();
      (draftStoreService.getDraftClaimFromStore as jest.Mock)
        .mockResolvedValueOnce(new CivilClaimResponse())
        .mockResolvedValueOnce(new CivilClaimResponse())
        .mockResolvedValueOnce(Object.assign(new CivilClaimResponse(), {
          id: mockUserId,
          case_data: mockClaim,
        }));
      mockGetActiveDraftFromDb.mockResolvedValueOnce(null);
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

    it('applyPaymentRetention should no-op and not call the db', async () => {
      const result = await applyPaymentRetention(mockReq, mockDraftId);

      expect(result).toBeNull();
      expect(mockApplyPaymentRetentionInDb).not.toHaveBeenCalled();
    });

    it('deleteDraftClaim should delete from redis and not call the db', async () => {
      (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(undefined);

      await deleteDraftClaim(mockReq, mockDraftId);

      expect(draftStoreService.deleteDraftClaimFromStore).toHaveBeenCalledWith(mockUserId);
      expect(mockDeleteDraftFromDb).not.toHaveBeenCalled();
      expect(mockDeleteCachedDraft).not.toHaveBeenCalled();
    });
  });

  describe('flag round-trip ownership', () => {
    const expiresAt = () => new Date(Date.now() + 3 * 86400 * 1000).toISOString();

    it('keeps rollback edits when the flag is re-enabled', async () => {
      const {app} = require('../../../../main/app-instance');
      const setMock = jest.fn().mockResolvedValue('OK');
      app.locals.draftStoreClient = {set: setMock, ttl: jest.fn().mockResolvedValue(-1)};

      // Flag off: DB has 100, Redis empty → migrate to Redis and retire DB
      mockIsDraftClaimDatabaseEnabled.mockResolvedValue(false);
      (draftStoreService.getDraftClaimFromStore as jest.Mock)
        .mockResolvedValueOnce(new CivilClaimResponse())
        .mockResolvedValueOnce(new CivilClaimResponse());
      mockGetActiveDraftFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {
          ...mockRawResponse,
          payload: {totalClaimAmount: 100},
          expiresAt: expiresAt(),
        },
      });
      mockDeleteDraftFromDb.mockResolvedValueOnce(undefined);

      const rolledBack = await getDraftClaim(mockReq);
      expect(rolledBack?.claimResponse.case_data).toEqual(expect.objectContaining({totalClaimAmount: 100}));
      expect(mockDeleteDraftFromDb).toHaveBeenCalledWith(mockReq, mockDraftId);

      // Flag off: user edits Redis to 200
      const editedClaim = Object.assign(new Claim(), {totalClaimAmount: 200});
      (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValueOnce(undefined);
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: mockUserId, case_data: editedClaim}),
      );
      await updateDraftClaim(mockReq, editedClaim, mockDraftId);

      // Flag on: DB empty (retired), Redis has 200 → migrate edited answers into DB
      mockIsDraftClaimDatabaseEnabled.mockResolvedValue(true);
      mockGetCachedDraft.mockResolvedValueOnce(null);
      mockGetActiveDraftFromDb.mockResolvedValueOnce(null);
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: mockUserId, case_data: editedClaim}),
      );
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {
          ...mockRawResponse,
          draftId: 'draft-new',
          payload: editedClaim as unknown as Record<string, unknown>,
        },
        isNew: true,
      });
      (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(undefined);

      const reEnabled = await getDraftClaim(mockReq);

      expect(mockCreateOrLoadDraftInDb).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({totalClaimAmount: 200}),
      );
      expect(reEnabled?.rawResponse.payload).toEqual(expect.objectContaining({totalClaimAmount: 200}));
    });

    it('does not resurrect a draft deleted while the flag is off', async () => {
      const {app} = require('../../../../main/app-instance');
      app.locals.draftStoreClient = {set: jest.fn().mockResolvedValue('OK'), ttl: jest.fn().mockResolvedValue(-1)};

      // Flag off: migrate DB → Redis and retire DB
      mockIsDraftClaimDatabaseEnabled.mockResolvedValue(false);
      (draftStoreService.getDraftClaimFromStore as jest.Mock)
        .mockResolvedValueOnce(new CivilClaimResponse())
        .mockResolvedValueOnce(new CivilClaimResponse());
      mockGetActiveDraftFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {
          ...mockRawResponse,
          payload: {totalClaimAmount: 100},
          expiresAt: expiresAt(),
        },
      });
      mockDeleteDraftFromDb.mockResolvedValueOnce(undefined);
      await getDraftClaim(mockReq);
      expect(mockDeleteDraftFromDb).toHaveBeenCalledWith(mockReq, mockDraftId);

      // Flag off: user deletes Redis draft
      (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(undefined);
      await deleteDraftClaim(mockReq, mockDraftId);

      // Next flag-off read: Redis empty and DB retired → stays deleted
      (draftStoreService.getDraftClaimFromStore as jest.Mock)
        .mockResolvedValueOnce(new CivilClaimResponse())
        .mockResolvedValueOnce(new CivilClaimResponse());
      mockGetActiveDraftFromDb.mockResolvedValueOnce(null);

      const afterDelete = await getDraftClaim(mockReq);

      expect(afterDelete).toBeNull();
      expect(mockCreateOrLoadDraftInDb).not.toHaveBeenCalled();
    });
  });
});
