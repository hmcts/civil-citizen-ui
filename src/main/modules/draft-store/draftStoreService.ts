import {app} from '../../app-instance';
import {
  CCDClaim,
  CivilClaimResponse,
} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {isUndefined} from 'lodash';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {Request} from 'express';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {TTLCategory, getTTLDaysForCategory, reconstructCreationDateFromRemainingTtl} from './ttlConfig';
import {writeWithTTL} from './redisWriteHelper';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');

const USER_ID_SUFFIX_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const resolveUserId = (redisKey: string | undefined, explicitUserId?: string): string | undefined => {
  if (explicitUserId) {
    return explicitUserId;
  }
  if (!redisKey) {
    return undefined;
  }
  const userIdSuffix = redisKey.match(USER_ID_SUFFIX_PATTERN);
  return userIdSuffix ? userIdSuffix[0] : redisKey;
};

/**
 * Gets civil claim response object with claim from draft store
 * @param claimId
 * @returns claim from redis or undefined when no there is no data for claim id
 */
export const getDraftClaimFromStore = async (claimId: string, doNotThrowError = false) => {
  const dataFromRedis = await app.locals.draftStoreClient.get(claimId);
  if (dataFromRedis === null && !doNotThrowError) {
    throw new Error('Case not found...');
  }
  return convertRedisDataToCivilClaimResponse(dataFromRedis);
};

const convertRedisDataToCivilClaimResponse = (data: string): any => {
  let jsonData = undefined;
  if (data) {
    try {
      jsonData = JSON.parse(data);
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }
  const civilClaimResponse = new CivilClaimResponse();
  return Object.assign(civilClaimResponse, jsonData);
};
/**
 * Gets only case data.
 * @param claimId
 */
export const getCaseDataFromStore = async (claimId: string, doNotThrowError = false): Promise<Claim> => {
  const civilClaimResponse = await getDraftClaimFromStore(claimId, doNotThrowError);
  const claim: Claim = new Claim();
  Object.assign(claim, civilClaimResponse?.case_data);
  return claim;
};

/**
 * Saves claim in Draft store. If the claim does not exist,
 * it creates a new CivilClaimResponse object and passes the claim in parameter to it,
 * then saves the new data in redis.
 * If a claim exists, then it updates the claim with the new claim passed in parameter
 * @param claimId
 * @param claim
 * @param doNotThrowError
 * @param userId
 * @param ttlCategory
 */
export const saveDraftClaim = async (
  claimId: string,
  claim: Claim,
  doNotThrowError = false,
  userId?: string,
  ttlCategory: TTLCategory = TTLCategory.DRAFT_CLAIM,
) => {
  const resolvedUserId = resolveUserId(claimId, userId);
  logger.info(`Saving draft claim : userId: ${resolvedUserId}  claimId: ${claimId}`);
  let storedClaimResponse = await getDraftClaimFromStore(claimId, doNotThrowError);
  const isNewDraftClaim = isUndefined(storedClaimResponse.case_data);
  if (isNewDraftClaim) {
    storedClaimResponse = createNewCivilClaimResponse(claimId);
  }
  let prefetchedTTL: number | undefined;
  if (ttlCategory === TTLCategory.DRAFT_CLAIM) {
    const storedCreatedAt = storedClaimResponse.case_data?.draftClaimCreatedAt;
    const storedTtlDays = storedClaimResponse.case_data?.draftClaimCacheTtlDays;
    if (storedTtlDays && !claim.draftClaimCacheTtlDays) {
      claim.draftClaimCacheTtlDays = storedTtlDays;
    }
    if (isNewDraftClaim && !claim.draftClaimCacheTtlDays) {
      claim.draftClaimCacheTtlDays = getTTLDaysForCategory(TTLCategory.DRAFT_CLAIM);
    }
    if (!claim.draftClaimCreatedAt && storedCreatedAt) {
      claim.draftClaimCreatedAt = new Date(storedCreatedAt);
    } else if (!claim.draftClaimCreatedAt) {
      prefetchedTTL = await app.locals.draftStoreClient.ttl(claimId);
      if (prefetchedTTL > 0) {
        claim.draftClaimCreatedAt = reconstructCreationDateFromRemainingTtl(
          prefetchedTTL,
          TTLCategory.DRAFT_CLAIM,
        );
      } else {
        claim.draftClaimCreatedAt = new Date();
      }
    }
  }
  storedClaimResponse.case_data = claim as any;

  const metadata = ttlCategory === TTLCategory.DRAFT_CLAIM && claim.draftClaimCreatedAt
    ? {creationDate: new Date(claim.draftClaimCreatedAt)}
    : undefined;

  await writeWithTTL(claimId, storedClaimResponse, ttlCategory, metadata, prefetchedTTL);
};

const createNewCivilClaimResponse = (claimId: string) => {
  const storedClaimResponse = new CivilClaimResponse();
  storedClaimResponse.id = claimId;
  return storedClaimResponse;
};

export const deleteDraftClaim = async (req: Request, useRedisKey = false): Promise<void> => {
  const claimId = getRouteParam(req, 'id');
  const userId = (<AppRequest>req)?.session?.user?.id;
  const redisKey = useRedisKey && claimId !== userId ? generateRedisKey(<AppRequest>req) : claimId;
  await deleteDraftClaimFromStore(redisKey);
};

export const deleteDraftClaimFromStore = async (claimId: string, field?: string): Promise<void> => {
  await app.locals.draftStoreClient.del(claimId, field);
};

export const deleteFieldDraftClaimFromStore = async (claimId: string, claim: Claim, propertyName: string, userId?: string): Promise<void> => {
  if (Object.prototype.hasOwnProperty.call(claim, propertyName)) {
    delete claim[propertyName];
    await saveDraftClaim(claimId, claim, false, userId);
  }
};

export const updateFieldDraftClaimFromStore = async (claimId: string, req: Request, propertyName: string, newValue: string): Promise<void> => {
  const claim = await getClaimById(claimId, req, true);
  const redisKey = generateRedisKey(<AppRequest>req);
  const userId = (<AppRequest>req).session.user?.id;
  claim[propertyName] = newValue;
  logger.info(`updateFieldDraftClaimFromStore : userId: ${userId} redisKey: ${redisKey} propertyName : ${propertyName} newValue : ${newValue? JSON.stringify(newValue) : 'undefined'}`);
  await saveDraftClaim(redisKey, claim, false, userId);

};

export async function createDraftClaimInStoreWithExpiryTime(claimId: string) {
  const draftClaim = createNewCivilClaimResponse(claimId);
  const creationTime = new Date();
  draftClaim.case_data = {
    draftClaimCreatedAt: creationTime,
    draftClaimCacheTtlDays: getTTLDaysForCategory(TTLCategory.DRAFT_CLAIM),
  } as unknown as CCDClaim;
  await writeWithTTL(claimId, draftClaim, TTLCategory.DRAFT_CLAIM, {creationDate: creationTime});
  logger.info(
    `Draft claim expiry time is set to ${await app.locals.draftStoreClient.ttl(claimId)} seconds as of ${creationTime}`,
  );
}

export function generateRedisKey(req: AppRequest) {
  return getRouteParam(req, 'id') + req.session.user?.id;
}

export function generateRedisKeyForGA(req: AppRequest) {
  return getRouteParam(req, 'appId') + req.session.user?.id;
}

export const findClaimIdsbyUserId = async (userId: string): Promise<any> => {
  try {
    return await app.locals.draftStoreClient.keys('*' + userId);
  } catch (error) {
    logger.error('Failed to find claim IDs by userId', error);
    throw error;
  }
};
