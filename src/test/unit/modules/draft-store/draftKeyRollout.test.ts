jest.mock('../../../../main/app-instance', () => jest.requireActual('../../../utils/getRouteHandler'));
jest.mock('app/auth/launchdarkly/launchDarklyClient');
jest.mock('modules/draft-store/draftStoreDbService');
jest.mock('modules/draft-store/draftClaimRedisCache');

import Redis from 'ioredis';
import {app} from '../../../../main/app-instance';
import {AppRequest} from 'models/AppRequest';
import {isDraftClaimDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {getActiveDraftFromDraftStoreDb} from 'modules/draft-store/draftStoreDbService';
import {getCachedDraft} from 'modules/draft-store/draftClaimRedisCache';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {generateRedisKey, generateRedisKeyForGA, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const CASE_ID = '1645882162449409';
const req = {params: {id: CASE_ID}, session: {user: {id: USER_ID}}} as unknown as AppRequest;
// Jest's Redis setup supplies ioredis-mock, including real key/expiry behaviour.
const redis = new Redis();

beforeEach(async () => {
  jest.clearAllMocks();
  await redis.flushall();
  app.locals.draftStoreClient = redis;
  (getCachedDraft as jest.Mock).mockResolvedValue(null);
});

afterAll(() => redis.disconnect());

it.each([false, true])('resumes an in-flight Redis claim independently of composite keys (database flag %p)', async (enabled) => {
  (isDraftClaimDatabaseEnabled as jest.Mock).mockResolvedValue(enabled);
  await redis.set(USER_ID, JSON.stringify({id: USER_ID, case_data: {totalClaimAmount: 100}}), 'EX', 120);
  const key = generateRedisKey(req);
  expect(key).toBe(CASE_ID + USER_ID);
  await redis.set(key, JSON.stringify({id: CASE_ID, case_data: {totalClaimAmount: 200}}), 'EX', 60);

  const draft = await getDraftClaim(req);

  expect(draft.claimResponse.case_data.totalClaimAmount).toBe(100);
  expect((await getCaseDataFromStore(key)).totalClaimAmount).toBe(200);
  expect(getActiveDraftFromDraftStoreDb).not.toHaveBeenCalled();
  expect(await redis.ttl(USER_ID)).toBeGreaterThan(110);
  expect(await redis.ttl(key)).toBeLessThanOrEqual(60);
});

it('loads a CMC-backed draft when the flag is on, independently of a Redis case-response draft', async () => {
  (isDraftClaimDatabaseEnabled as jest.Mock).mockResolvedValue(true);
  (getActiveDraftFromDraftStoreDb as jest.Mock).mockResolvedValue({rawResponse: {
    draftId: 'database-draft', payload: {totalClaimAmount: 300},
    createdAt: '', updatedAt: '', expiresAt: '',
  }});
  const key = generateRedisKey(req);
  await redis.set(key, JSON.stringify({id: CASE_ID, case_data: {totalClaimAmount: 200}}), 'EX', 60);

  const draft = await getDraftClaim(req);

  expect(draft.claimResponse.id).toBe('database-draft');
  expect(draft.claimResponse.case_data.totalClaimAmount).toBe(300);
  expect(getActiveDraftFromDraftStoreDb).toHaveBeenCalledWith(req);
  expect((await getCaseDataFromStore(key)).totalClaimAmount).toBe(200);
  expect(await redis.get(USER_ID)).toBeNull();
});

it('keeps the local e2e seed keys compatible with both generators', () => {
  const claims = require('../../../../main/modules/e2eConfiguration/redisData.json');
  const applications = require('../../../../main/modules/e2eConfiguration/gaRedisData.json');
  const entries = [...claims, ...applications] as {id: string | number}[];
  expect(entries.some(entry => String(entry.id).endsWith(USER_ID))).toBe(true);
  for (const entry of entries) {
    expect(String(entry.id)).not.toContain('someID');
    if (typeof entry.id === 'string' && entry.id.endsWith(USER_ID) && entry.id !== USER_ID) {
      const resourceId = entry.id.slice(0, -USER_ID.length);
      const request = {params: {id: resourceId, appId: resourceId}, session: req.session} as unknown as AppRequest;
      expect(generateRedisKey(request)).toBe(entry.id);
      expect(generateRedisKeyForGA(request)).toBe(entry.id);
    }
  }
});
