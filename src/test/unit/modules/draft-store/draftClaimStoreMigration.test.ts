import {migrateDbDraftToRedis, migrateRedisDraftToDb} from 'modules/draft-store/draftClaimStoreMigration';
import {
  CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS,
  createOrLoadDraftClaimInDraftStoreDb,
  getActiveDraftFromDraftStoreDb,
  deleteDraftClaimFromStore as deleteDraftClaimFromDb,
} from 'modules/draft-store/draftStoreDbService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {app} from '../../../../main/app-instance';

jest.mock('modules/draft-store/draftStoreDbService', () => ({
  ...jest.requireActual('modules/draft-store/draftStoreDbService'),
  createOrLoadDraftClaimInDraftStoreDb: jest.fn(),
  getActiveDraftFromDraftStoreDb: jest.fn(),
  deleteDraftClaimFromStore: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService');

const mockCreateOrLoadDraftInDb = createOrLoadDraftClaimInDraftStoreDb as jest.MockedFunction<typeof createOrLoadDraftClaimInDraftStoreDb>;
const mockGetActiveDraftFromDb = getActiveDraftFromDraftStoreDb as jest.MockedFunction<typeof getActiveDraftFromDraftStoreDb>;
const mockDeleteDraftFromDb = deleteDraftClaimFromDb as jest.MockedFunction<typeof deleteDraftClaimFromDb>;

describe('draftClaimStoreMigration', () => {
  const userId = 'user-1';
  let req: AppRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      session: {user: {id: userId, accessToken: 'token'}, draftId: 'draft-db-1'},
    } as unknown as AppRequest;
    app.locals.draftStoreClient = {
      set: jest.fn().mockResolvedValue('OK'),
      ttl: jest.fn().mockResolvedValue(-1),
    };
  });

  const dbDraftResult = (payload: Claim, isNew: boolean) => ({
    claimResponse: new CivilClaimResponse(),
    rawResponse: {
      draftId: 'draft-db-1',
      payload: payload as unknown as Record<string, unknown>,
      createdAt: '2026-06-15T09:00:00.000Z',
      updatedAt: '2026-06-15T09:00:00.000Z',
      expiresAt: new Date(Date.now() + 20 * 86400 * 1000).toISOString(),
    },
    isNew,
  });

  describe('migrateRedisDraftToDb', () => {
    it('returns null when Redis has no draft', async () => {
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(new CivilClaimResponse());

      expect(await migrateRedisDraftToDb(req, userId)).toBeNull();
      expect(mockCreateOrLoadDraftInDb).not.toHaveBeenCalled();
    });

    it('creates a DB draft with server retention 30 and original createdAt, then deletes Redis', async () => {
      const createdAt = new Date('2026-06-15T09:00:00.000Z');
      const redisClaim = Object.assign(new Claim(), {
        totalClaimAmount: 1200,
        draftClaimCreatedAt: createdAt,
      });
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: userId, case_data: redisClaim}),
      );
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {
          draftId: 'draft-db-1',
          payload: redisClaim as unknown as Record<string, unknown>,
          createdAt: createdAt.toISOString(),
          updatedAt: createdAt.toISOString(),
          expiresAt: new Date(Date.now() + 20 * 86400 * 1000).toISOString(),
        },
        isNew: true,
      });
      (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await migrateRedisDraftToDb(req, userId);

      expect(mockCreateOrLoadDraftInDb).toHaveBeenCalledWith(
        req,
        expect.objectContaining({
          totalClaimAmount: 1200,
          draftClaimCreatedAt: createdAt,
          draftClaimCacheTtlDays: CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS,
        }),
      );
      expect(draftStoreService.deleteDraftClaimFromStore).toHaveBeenCalledWith(userId);
      expect(req.session.draftId).toBe('draft-db-1');
      expect(result?.draftId).toBe('draft-db-1');
    });

    it('propagates create failures instead of treating them as absence', async () => {
      const redisClaim = Object.assign(new Claim(), {totalClaimAmount: 1200});
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: userId, case_data: redisClaim}),
      );
      mockCreateOrLoadDraftInDb.mockRejectedValueOnce(
        Object.assign(new Error('Request failed with status code 400'), {
          isAxiosError: true,
          response: {status: 400, data: {message: 'draftClaimCacheTtlDays must be 30'}},
        }),
      );

      await expect(migrateRedisDraftToDb(req, userId)).rejects.toThrow('Request failed with status code 400');
      expect(draftStoreService.deleteDraftClaimFromStore).not.toHaveBeenCalled();
    });

    it('sends the remaining Redis expiry so civil-service keeps a legacy draft\'s original expiry', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-10-08T10:00:00.000Z'));
      const legacyRemainingSeconds = 100 * 86400;
      app.locals.draftStoreClient.ttl.mockResolvedValueOnce(legacyRemainingSeconds);
      const redisClaim = Object.assign(new Claim(), {
        totalClaimAmount: 1200,
        draftClaimCreatedAt: new Date('2026-07-01T10:00:00.000Z'),
        draftClaimCacheTtlDays: 180,
      });
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: userId, case_data: redisClaim}),
      );
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce(dbDraftResult(redisClaim, true));

      await migrateRedisDraftToDb(req, userId);
      jest.useRealTimers();

      expect(app.locals.draftStoreClient.ttl).toHaveBeenCalledWith(userId);
      expect(mockCreateOrLoadDraftInDb).toHaveBeenCalledWith(
        req,
        expect.objectContaining({
          draftClaimCacheTtlDays: CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS,
          draftClaimExpiresAt: new Date('2027-01-16T10:00:00.000Z'),
        }),
      );
    });

    it('does not send an expiry when the Redis draft has none', async () => {
      const redisClaim = Object.assign(new Claim(), {totalClaimAmount: 1200});
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: userId, case_data: redisClaim}),
      );
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce(dbDraftResult(redisClaim, true));

      await migrateRedisDraftToDb(req, userId);

      expect(mockCreateOrLoadDraftInDb.mock.calls[0][1].draftClaimExpiresAt).toBeUndefined();
    });

    it('undoes the new DB copy and throws when the Redis draft cannot be deleted', async () => {
      const redisClaim = Object.assign(new Claim(), {totalClaimAmount: 1200});
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: userId, case_data: redisClaim}),
      );
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce(dbDraftResult(redisClaim, true));
      (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockRejectedValueOnce(new Error('redis down'));

      await expect(migrateRedisDraftToDb(req, userId)).rejects.toThrow('redis down');
      expect(mockDeleteDraftFromDb).toHaveBeenCalledWith(req, 'draft-db-1');
      expect(req.session.draftId).toBe('draft-db-1');
    });

    it('keeps an existing DB draft it did not create when the Redis draft cannot be deleted', async () => {
      const redisClaim = Object.assign(new Claim(), {totalClaimAmount: 1200});
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: userId, case_data: redisClaim}),
      );
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce(dbDraftResult(redisClaim, false));
      (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockRejectedValueOnce(new Error('redis down'));

      await expect(migrateRedisDraftToDb(req, userId)).rejects.toThrow('redis down');
      expect(mockDeleteDraftFromDb).not.toHaveBeenCalled();
    });
  });

  describe('migrateDbDraftToRedis', () => {
    it('returns null when Redis already has a draft', async () => {
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: userId, case_data: {totalClaimAmount: 1}}),
      );

      expect(await migrateDbDraftToRedis(req, userId)).toBeNull();
      expect(mockGetActiveDraftFromDb).not.toHaveBeenCalled();
    });

    it('writes the DB draft into Redis and retires the DB row', async () => {
      const createdAt = new Date('2026-06-15T09:00:00.000Z');
      const expiresAt = new Date(Date.now() + 4 * 86400 * 1000).toISOString();
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(new CivilClaimResponse());
      mockGetActiveDraftFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {
          draftId: 'draft-db-1',
          payload: {
            totalClaimAmount: 450,
            draftClaimCreatedAt: createdAt.toISOString(),
          },
          createdAt: createdAt.toISOString(),
          updatedAt: createdAt.toISOString(),
          expiresAt,
        },
      });
      const setMock = jest.fn().mockResolvedValue('OK');
      app.locals.draftStoreClient = {set: setMock};
      mockDeleteDraftFromDb.mockResolvedValueOnce(undefined);

      const result = await migrateDbDraftToRedis(req, userId);

      expect(setMock).toHaveBeenCalledWith(
        userId,
        expect.stringContaining('"totalClaimAmount":450'),
        'EX',
        expect.any(Number),
      );
      expect(mockDeleteDraftFromDb).toHaveBeenCalledWith(req, 'draft-db-1');
      expect(req.session.draftId).toBeUndefined();
      expect(result?.case_data).toEqual(expect.objectContaining({totalClaimAmount: 450}));
    });

    it('undoes the Redis copy and throws when the DB draft cannot be deleted', async () => {
      const expiresAt = new Date(Date.now() + 4 * 86400 * 1000).toISOString();
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(new CivilClaimResponse());
      mockGetActiveDraftFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {
          draftId: 'draft-db-1',
          payload: {totalClaimAmount: 450},
          createdAt: '2026-06-15T09:00:00.000Z',
          updatedAt: '2026-06-15T09:00:00.000Z',
          expiresAt,
        },
      });
      const setMock = jest.fn().mockResolvedValue('OK');
      app.locals.draftStoreClient = {set: setMock};
      mockDeleteDraftFromDb.mockRejectedValueOnce(new Error('delete failed'));

      await expect(migrateDbDraftToRedis(req, userId)).rejects.toThrow('delete failed');

      expect(setMock).toHaveBeenCalled();
      expect(draftStoreService.deleteDraftClaimFromStore).toHaveBeenCalledWith(userId);
      expect(req.session.draftId).toBe('draft-db-1');
    });

    it('returns null when the DB draft has already expired', async () => {
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(new CivilClaimResponse());
      mockGetActiveDraftFromDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {
          draftId: 'draft-db-1',
          payload: {totalClaimAmount: 450},
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          expiresAt: '2026-01-02T00:00:00.000Z',
        },
      });

      expect(await migrateDbDraftToRedis(req, userId)).toBeNull();
      expect(mockDeleteDraftFromDb).not.toHaveBeenCalled();
    });

    it('propagates DB lookup failures instead of treating them as absence', async () => {
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(new CivilClaimResponse());
      mockGetActiveDraftFromDb.mockRejectedValueOnce(new Error('access token is required'));

      await expect(migrateDbDraftToRedis(req, userId)).rejects.toThrow('access token is required');
    });
  });
});
