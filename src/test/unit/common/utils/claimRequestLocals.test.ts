import {Request} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getStashedClaimOrFromStore, stashClaimOnRequest} from 'common/utils/claimRequestLocals';

jest.mock('../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;

describe('claimRequestLocals', () => {
  const mockClaim = new Claim();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
  });

  describe('stashClaimOnRequest', () => {
    it('should set claim on req.locals', () => {
      const req = {method: 'GET', originalUrl: '/test'} as unknown as Request;
      stashClaimOnRequest(req, mockClaim, 'testGuard');
      expect((<AppRequest>req).locals.claim).toBe(mockClaim);
    });
  });

  describe('getStashedClaimOrFromStore', () => {
    it('should return stashed claim without calling Redis', async () => {
      const req = {
        method: 'GET',
        originalUrl: '/test',
        locals: {env: '', lang: '', claim: mockClaim},
      } as unknown as AppRequest;

      const claim = await getStashedClaimOrFromStore(req, 'testController');

      expect(claim).toBe(mockClaim);
      expect(mockGetCaseDataFromStore).not.toHaveBeenCalled();
    });

    it('should fetch from Redis when claim is not stashed', async () => {
      const req = {
        method: 'GET',
        originalUrl: '/test',
        session: {user: {id: 'user-1'}},
        params: {id: 'claim-1'},
        locals: {env: '', lang: ''},
      } as unknown as AppRequest;

      const claim = await getStashedClaimOrFromStore(req, 'testController');

      expect(claim).toBe(mockClaim);
      expect(mockGetCaseDataFromStore).toHaveBeenCalledTimes(1);
    });
  });
});
