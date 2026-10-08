import {migrateDbDraftToRedis, migrateRedisDraftToDb} from 'modules/draft-store/draftClaimStoreMigration';
import {createOrLoadDraftClaimInDraftStoreDb, getActiveDraftFromDraftStoreDb} from 'modules/draft-store/draftStoreDbService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {app} from '../../../../main/app-instance';

jest.mock('modules/draft-store/draftStoreDbService');
jest.mock('modules/draft-store/draftStoreService');

const mockCreateOrLoadDraftInDb = createOrLoadDraftClaimInDraftStoreDb as jest.MockedFunction<typeof createOrLoadDraftClaimInDraftStoreDb>;
const mockGetActiveDraftFromDb = getActiveDraftFromDraftStoreDb as jest.MockedFunction<typeof getActiveDraftFromDraftStoreDb>;

describe('draftClaimStoreMigration', () => {
  const userId = 'user-1';
  const req = {
    session: {user: {id: userId, accessToken: 'token'}},
  } as unknown as AppRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('migrateRedisDraftToDb', () => {
    it('returns null when Redis has no draft', async () => {
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(new CivilClaimResponse());

      expect(await migrateRedisDraftToDb(req, userId)).toBeNull();
      expect(mockCreateOrLoadDraftInDb).not.toHaveBeenCalled();
    });

    it('creates a DB draft from Redis answers and deletes the Redis key', async () => {
      const createdAt = new Date('2026-06-15T09:00:00.000Z');
      const redisClaim = Object.assign(new Claim(), {
        totalClaimAmount: 1200,
        draftClaimCreatedAt: createdAt,
      });
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(
        Object.assign(new CivilClaimResponse(), {id: userId, case_data: redisClaim}),
      );
      app.locals.draftStoreClient = {
        ttl: jest.fn().mockResolvedValue(5 * 86400),
      };
      mockCreateOrLoadDraftInDb.mockResolvedValueOnce({
        claimResponse: new CivilClaimResponse(),
        rawResponse: {
          draftId: 'draft-db-1',
          payload: redisClaim as unknown as Record<string, unknown>,
          createdAt: createdAt.toISOString(),
          updatedAt: createdAt.toISOString(),
          expiresAt: new Date(Date.now() + 5 * 86400 * 1000).toISOString(),
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
          draftClaimCacheTtlDays: 5,
        }),
      );
      expect(draftStoreService.deleteDraftClaimFromStore).toHaveBeenCalledWith(userId);
      expect(result?.draftId).toBe('draft-db-1');
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

    it('writes the DB draft into Redis with remaining expiry', async () => {
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

      const result = await migrateDbDraftToRedis(req, userId);

      expect(setMock).toHaveBeenCalledWith(
        userId,
        expect.stringContaining('"totalClaimAmount":450'),
        'EX',
        expect.any(Number),
      );
      expect(result?.case_data).toEqual(expect.objectContaining({totalClaimAmount: 450}));
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
    });

    it('returns null when the DB lookup throws', async () => {
      (draftStoreService.getDraftClaimFromStore as jest.Mock).mockResolvedValueOnce(new CivilClaimResponse());
      mockGetActiveDraftFromDb.mockRejectedValueOnce(new Error('access token is required'));

      expect(await migrateDbDraftToRedis(req, userId)).toBeNull();
    });
  });
});
