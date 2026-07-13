import {Request} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getStashedClaimOrFromStore, stashClaimOnRequest} from 'common/utils/claimRequestLocals';

jest.mock('../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;

describe('claimRequestLocals', () => {
  const mockClaim = new Claim();
  const anotherClaim = new Claim();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
    mockGenerateRedisKey.mockReturnValue('generated-redis-key');
  });

  describe('stashClaimOnRequest', () => {
    it('should set claim on req.locals', () => {
      const req = {method: 'GET', originalUrl: '/test'} as unknown as Request;
      stashClaimOnRequest(req, mockClaim);
      expect((<AppRequest>req).locals.claim).toBe(mockClaim);
    });

    it('should initialise locals with defaults when locals is undefined', () => {
      const req = {method: 'GET', originalUrl: '/test'} as unknown as Request;
      stashClaimOnRequest(req, mockClaim);
      expect((<AppRequest>req).locals).toEqual({env: '', lang: '', claim: mockClaim});
    });

    it('should preserve existing locals properties when setting claim', () => {
      const req = {
        method: 'GET',
        originalUrl: '/test',
        locals: {env: 'prod', lang: 'en'},
      } as unknown as AppRequest;

      stashClaimOnRequest(req, mockClaim);

      expect(req.locals.env).toBe('prod');
      expect(req.locals.lang).toBe('en');
      expect(req.locals.claim).toBe(mockClaim);
    });

    it('should overwrite an existing stashed claim', () => {
      const req = {
        method: 'GET',
        originalUrl: '/test',
        locals: {env: '', lang: '', claim: mockClaim},
      } as unknown as AppRequest;

      stashClaimOnRequest(req, anotherClaim);

      expect(req.locals.claim).toBe(anotherClaim);
    });
  });

  describe('getStashedClaimOrFromStore', () => {
    it('should return stashed claim without calling Redis', async () => {
      const req = {
        method: 'GET',
        originalUrl: '/test',
        locals: {env: '', lang: '', claim: mockClaim},
      } as unknown as AppRequest;

      const claim = await getStashedClaimOrFromStore(req);

      expect(claim).toBe(mockClaim);
      expect(mockGetCaseDataFromStore).not.toHaveBeenCalled();
      expect(mockGenerateRedisKey).not.toHaveBeenCalled();
    });

    it('should fetch from Redis when locals is undefined', async () => {
      const req = {
        method: 'GET',
        originalUrl: '/test',
        session: {user: {id: 'user-1'}},
        params: {id: 'claim-1'},
      } as unknown as AppRequest;

      const claim = await getStashedClaimOrFromStore(req);

      expect(claim).toBe(mockClaim);
      expect(mockGenerateRedisKey).toHaveBeenCalledWith(req);
      expect(mockGetCaseDataFromStore).toHaveBeenCalledWith('generated-redis-key', false);
    });

    it('should fetch from Redis when claim is not stashed', async () => {
      const req = {
        method: 'GET',
        originalUrl: '/test',
        session: {user: {id: 'user-1'}},
        params: {id: 'claim-1'},
        locals: {env: '', lang: ''},
      } as unknown as AppRequest;

      const claim = await getStashedClaimOrFromStore(req);

      expect(claim).toBe(mockClaim);
      expect(mockGetCaseDataFromStore).toHaveBeenCalledTimes(1);
    });

    it('should fetch using the provided redisKey when claim is not stashed', async () => {
      const req = {
        method: 'GET',
        originalUrl: '/test',
        session: {user: {id: 'user-1'}},
        locals: {env: '', lang: ''},
      } as unknown as AppRequest;

      const claim = await getStashedClaimOrFromStore(req, 'user-1');

      expect(claim).toBe(mockClaim);
      expect(mockGetCaseDataFromStore).toHaveBeenCalledWith('user-1', false);
      expect(mockGenerateRedisKey).not.toHaveBeenCalled();
    });

    it('should pass doNotThrowError through to getCaseDataFromStore', async () => {
      const req = {
        method: 'GET',
        originalUrl: '/test',
        session: {user: {id: 'user-1'}},
        locals: {env: '', lang: ''},
      } as unknown as AppRequest;

      await getStashedClaimOrFromStore(req, 'user-1', true);

      expect(mockGetCaseDataFromStore).toHaveBeenCalledWith('user-1', true);
    });

    it('should propagate errors from Redis', async () => {
      const redisError = new Error('Redis failure');
      mockGetCaseDataFromStore.mockRejectedValue(redisError);
      const req = {
        method: 'GET',
        originalUrl: '/test',
        locals: {env: '', lang: ''},
      } as unknown as AppRequest;

      await expect(getStashedClaimOrFromStore(req, 'user-1')).rejects.toThrow('Redis failure');
    });

    describe('guard-to-controller flow', () => {
      it('should avoid a second Redis read when guard stashes before controller runs', async () => {
        const req = {
          method: 'GET',
          originalUrl: '/case/123/response/check-and-send',
          session: {user: {id: 'user-1'}},
          params: {id: '123'},
        } as unknown as Request;

        stashClaimOnRequest(req, mockClaim);
        const claim = await getStashedClaimOrFromStore(req);

        expect(claim).toBe(mockClaim);
        expect(mockGetCaseDataFromStore).not.toHaveBeenCalled();
      });
    });
  });
});
