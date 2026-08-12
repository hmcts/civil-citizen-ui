import {AppRequest} from 'common/models/AppRequest';
import {CaseRole} from 'form/models/caseRoles';
import {
  buildUserCaseRolesCacheKey,
  evictUserCaseRolesFromSession,
  getUserCaseRolesFromSession,
  storeUserCaseRolesInSession,
} from 'client/cache/userCaseRolesSessionCache';
import {isUserCaseRolesSessionCacheEnabled} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const isCacheEnabledMock = isUserCaseRolesSessionCacheEnabled as jest.Mock;

const createReq = (userId = 'user-1'): AppRequest => ({
  session: {
    user: {
      accessToken: 'token',
      idToken: 'id-token',
      id: userId,
      email: 'test@example.com',
      givenName: 'Test',
      familyName: 'User',
      roles: [],
    },
    userCaseRolesCache: undefined,
  },
  locals: {env: 'test', lang: 'en'},
} as unknown as AppRequest);

describe('userCaseRolesSessionCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isCacheEnabledMock.mockResolvedValue(true);
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('buildUserCaseRolesCacheKey', () => {
    it('namespaces key with userId and caseId', () => {
      expect(buildUserCaseRolesCacheKey('u1', 'c1')).toBe('ucr:u1:c1');
    });
  });

  describe('getUserCaseRolesFromSession / storeUserCaseRolesInSession', () => {
    it('returns miss then positive hit after store', async () => {
      const req = createReq();
      expect(await getUserCaseRolesFromSession(req, 'case-1')).toEqual({hit: false});

      await storeUserCaseRolesInSession(req, 'case-1', CaseRole.CLAIMANT);
      const result = await getUserCaseRolesFromSession(req, 'case-1');

      expect(result).toEqual({hit: true, role: CaseRole.CLAIMANT});
    });

    it('negative-caches empty roles and returns hit with undefined role', async () => {
      const req = createReq();
      await storeUserCaseRolesInSession(req, 'case-1', undefined);

      const result = await getUserCaseRolesFromSession(req, 'case-1');
      expect(result).toEqual({hit: true, role: undefined});
      expect(req.session.userCaseRolesCache?.['ucr:user-1:case-1']?.role).toBeNull();
    });

    it('evicts expired entries and returns miss', async () => {
      jest.useFakeTimers();
      const req = createReq();
      await storeUserCaseRolesInSession(req, 'case-1', CaseRole.DEFENDANT);

      jest.advanceTimersByTime(61_000);

      const result = await getUserCaseRolesFromSession(req, 'case-1');
      expect(result).toEqual({hit: false});
      expect(req.session.userCaseRolesCache?.['ucr:user-1:case-1']).toBeUndefined();
    });

    it('uses shorter TTL for negative cache entries', async () => {
      jest.useFakeTimers();
      const req = createReq();
      await storeUserCaseRolesInSession(req, 'case-neg', null);

      jest.advanceTimersByTime(16_000);

      expect(await getUserCaseRolesFromSession(req, 'case-neg')).toEqual({hit: false});
    });

    it('bypasses session cache when kill-switch is off', async () => {
      isCacheEnabledMock.mockResolvedValue(false);
      const req = createReq();
      await storeUserCaseRolesInSession(req, 'case-1', CaseRole.CLAIMANT);

      expect(req.session.userCaseRolesCache).toBeUndefined();
      expect(await getUserCaseRolesFromSession(req, 'case-1')).toEqual({hit: false});
    });

    it('isolates cache entries by userId and caseId', async () => {
      const reqUser1 = createReq('user-1');
      await storeUserCaseRolesInSession(reqUser1, 'case-1', CaseRole.CLAIMANT);

      const reqUser2 = createReq('user-2');
      reqUser2.session.userCaseRolesCache = reqUser1.session.userCaseRolesCache;

      expect(await getUserCaseRolesFromSession(reqUser2, 'case-1')).toEqual({hit: false});
      expect(await getUserCaseRolesFromSession(reqUser1, 'case-2')).toEqual({hit: false});
      expect(await getUserCaseRolesFromSession(reqUser1, 'case-1')).toEqual({
        hit: true,
        role: CaseRole.CLAIMANT,
      });
    });
  });

  describe('evictUserCaseRolesFromSession', () => {
    it('removes the entry for the user and case', async () => {
      const req = createReq();
      await storeUserCaseRolesInSession(req, 'case-1', CaseRole.DEFENDANT);
      await storeUserCaseRolesInSession(req, 'case-2', CaseRole.CLAIMANT);

      evictUserCaseRolesFromSession(req, 'case-1', 'assign_defendant');

      expect(await getUserCaseRolesFromSession(req, 'case-1')).toEqual({hit: false});
      expect(await getUserCaseRolesFromSession(req, 'case-2')).toEqual({
        hit: true,
        role: CaseRole.CLAIMANT,
      });
    });
  });
});
