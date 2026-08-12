/**
 * Session-scoped cache for civil-service GET /cases/:id/userCaseRoles (DTSCCI-5946).
 *
 * Security / design notes (for sign-off):
 * - Stores short-TTL authorisation data (CaseRole) in the Redis-backed Express session.
 * - Cache key (namespaced, inside session map): `ucr:${userId}:${caseId}`
 *   Dimensions: userId (roles are per-user), caseId (roles are per-case), `ucr` namespace
 *   (avoids collisions with other session fields). Access token is intentionally not part of
 *   the key — the session already binds the authenticated user.
 * - Positive TTL default 60s; negative (empty/no-roles) TTL default 15s. Never cache errors.
 * - Invalidation flows:
 *   1. assignDefendantToClaim success (assignClaimController) — user gains case roles
 *   2. logout (session.destroy) — whole session cleared
 * - Kill-switch: LaunchDarkly `cui-user-case-roles-session-cache-enabled` (+ config gate).
 * - Metrics/logs must not include role values, emails, or tokens.
 */
import config from 'config';
import {AppRequest, AppSession, UserCaseRolesCacheEntry} from 'common/models/AppRequest';
import {CaseRole} from 'form/models/caseRoles';
import {isUserCaseRolesSessionCacheEnabled} from '../../auth/launchdarkly/launchDarklyClient';

const {Logger} = require('@hmcts/nodejs-logging');
const appInsights = require('applicationinsights');
const logger = Logger.getLogger('userCaseRolesSessionCache');

const KEY_PREFIX = 'ucr';
const DEFAULT_TTL_SECONDS = 60;
const DEFAULT_NEGATIVE_TTL_SECONDS = 15;

export type UserCaseRolesCacheType = 'positive' | 'negative';
export type {UserCaseRolesCacheEntry};

type CacheMetricEvent =
  | 'hit'
  | 'miss'
  | 'eviction'
  | 'bypass'
  | 'store'
  | 'invalidate';

function trackCacheEvent(event: CacheMetricEvent, properties: Record<string, string> = {}): void {
  logger.info(`[userCaseRolesCache] ${event}${formatProps(properties)}`);
  appInsights.defaultClient?.trackEvent({
    name: `userCaseRolesCache.${event}`,
    properties,
  });
}

function formatProps(properties: Record<string, string>): string {
  const entries = Object.entries(properties);
  if (!entries.length) {
    return '';
  }
  return ' ' + entries.map(([key, value]) => `${key}=${value}`).join(' ');
}

export function buildUserCaseRolesCacheKey(userId: string, caseId: string): string {
  return `${KEY_PREFIX}:${userId}:${caseId}`;
}

function getPositiveTtlSeconds(): number {
  try {
    return config.get<number>('caches.userCaseRoles.ttlSeconds') ?? DEFAULT_TTL_SECONDS;
  } catch {
    return DEFAULT_TTL_SECONDS;
  }
}

function getNegativeTtlSeconds(): number {
  try {
    return config.get<number>('caches.userCaseRoles.negativeTtlSeconds') ?? DEFAULT_NEGATIVE_TTL_SECONDS;
  } catch {
    return DEFAULT_NEGATIVE_TTL_SECONDS;
  }
}

function getSessionCacheMap(req: AppRequest): Record<string, UserCaseRolesCacheEntry> | undefined {
  return (req.session as AppSession | undefined)?.userCaseRolesCache;
}

function ensureSessionCacheMap(req: AppRequest): Record<string, UserCaseRolesCacheEntry> | undefined {
  const session = req.session as AppSession | undefined;
  if (!session) {
    return undefined;
  }
  if (!session.userCaseRolesCache) {
    session.userCaseRolesCache = {};
  }
  return session.userCaseRolesCache;
}

/**
 * Returns a cached role when the kill-switch is on and a fresh entry exists.
 * Returns undefined on miss / expiry / bypass (caller should fetch).
 * Distinguishes negative cache via `{ hit: true, role: undefined }`.
 */
export async function getUserCaseRolesFromSession(
  req: AppRequest,
  caseId: string,
): Promise<{hit: true; role: CaseRole | undefined} | {hit: false}> {
  const enabled = await isUserCaseRolesSessionCacheEnabled();
  if (!enabled) {
    trackCacheEvent('bypass', {reason: 'kill_switch'});
    return {hit: false};
  }

  const userId = req.session?.user?.id ?? '';
  if (!userId || !caseId) {
    trackCacheEvent('miss');
    return {hit: false};
  }

  const cacheKey = buildUserCaseRolesCacheKey(userId, caseId);
  const cacheMap = getSessionCacheMap(req);
  const entry = cacheMap?.[cacheKey];
  if (!entry) {
    trackCacheEvent('miss');
    return {hit: false};
  }

  if (Date.now() >= entry.expiresAt) {
    delete cacheMap[cacheKey];
    trackCacheEvent('eviction', {reason: 'ttl'});
    trackCacheEvent('miss');
    return {hit: false};
  }

  const cacheType: UserCaseRolesCacheType = entry.role === null ? 'negative' : 'positive';
  trackCacheEvent('hit', {cacheType});
  return {hit: true, role: entry.role ?? undefined};
}

/**
 * Stores a successful roles result. Pass null/undefined role for negative cache.
 * No-ops when kill-switch is off. Never call this for thrown errors.
 */
export async function storeUserCaseRolesInSession(
  req: AppRequest,
  caseId: string,
  role: CaseRole | null | undefined,
): Promise<void> {
  const enabled = await isUserCaseRolesSessionCacheEnabled();
  if (!enabled) {
    return;
  }

  const userId = req.session?.user?.id ?? '';
  if (!userId || !caseId) {
    return;
  }

  const cacheMap = ensureSessionCacheMap(req);
  if (!cacheMap) {
    return;
  }

  const isNegative = role === null || role === undefined;
  const ttlSeconds = isNegative ? getNegativeTtlSeconds() : getPositiveTtlSeconds();
  const cacheKey = buildUserCaseRolesCacheKey(userId, caseId);
  cacheMap[cacheKey] = {
    role: isNegative ? null : role,
    expiresAt: Date.now() + ttlSeconds * 1000,
  };
  trackCacheEvent('store', {cacheType: isNegative ? 'negative' : 'positive'});
}

/**
 * Evicts the session cache entry for a user+case after role-mutating actions.
 */
export function evictUserCaseRolesFromSession(
  req: AppRequest,
  caseId: string,
  reason = 'role_mutation',
): void {
  const userId = req.session?.user?.id ?? '';
  if (!userId || !caseId) {
    return;
  }
  const cacheMap = getSessionCacheMap(req);
  if (!cacheMap) {
    return;
  }
  const cacheKey = buildUserCaseRolesCacheKey(userId, caseId);
  if (cacheMap[cacheKey] !== undefined) {
    delete cacheMap[cacheKey];
    trackCacheEvent('invalidate', {reason});
  }
}
