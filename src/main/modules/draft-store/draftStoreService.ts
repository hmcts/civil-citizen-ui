import {app} from '../../app';
import {
  CCDClaim,
  CivilClaimResponse,
} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {isUndefined} from 'lodash';
import {calculateExpireTimeForDraftClaimInSeconds} from 'common/utils/dateUtils';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {Request} from 'express';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');

/**
 * Gets civil claim response object with claim from draft store
 * @param claimId
 * @returns claim from redis or undefined when no there is no data for claim id
 */
export const getDraftClaimFromStore = async (claimId: string, doNotThrowErrror = false) => {
  const dataFromRedis = await app.locals.draftStoreClient.get(claimId);
  if (dataFromRedis === null && !doNotThrowErrror) {
    throw new Error('Case not found...');
  }
  return convertRedisDataToCivilClaimResponse(dataFromRedis);
};

const convertRedisDataToCivilClaimResponse = (data: string): CivilClaimResponse => {
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
 */
export const saveDraftClaim =async (claimId: string, claim: Claim, doNotThrowError = false) => {
  let storedClaimResponse = await getDraftClaimFromStore(claimId, doNotThrowError);
  if (isUndefined(storedClaimResponse.case_data)) {
    storedClaimResponse = createNewCivilClaimResponse(claimId);
  }
  storedClaimResponse.case_data = claim as any;
  const draftStoreClient = app.locals.draftStoreClient;
  draftStoreClient.set(claimId, JSON.stringify(storedClaimResponse));
  if (claim.draftClaimCreatedAt) {
    await draftStoreClient.expireat(claimId, calculateExpireTimeForDraftClaimInSeconds(claim.draftClaimCreatedAt));
  }
};
const createNewCivilClaimResponse = (claimId: string) => {
  const storedClaimResponse = new CivilClaimResponse();
  storedClaimResponse.id = claimId;
  return storedClaimResponse;
};

export const deleteDraftClaim = async (req: Request, useRedisKey = false): Promise<void> => {
  const claimId = req.params.id;
  const userId = (<AppRequest>req)?.session?.user?.id;
  const redisKey = useRedisKey && claimId !== userId ? generateRedisKey(<AppRequest>req) : claimId;
  await deleteDraftClaimFromStore(redisKey);
};

export const deleteDraftClaimFromStore = async (claimId: string, field?: string): Promise<void> => {
  await app.locals.draftStoreClient.del(claimId, field);
};

export const deleteFieldDraftClaimFromStore = async (claimId: string, claim: Claim, propertyName: string): Promise<void> => {
  if (Object.prototype.hasOwnProperty.call(claim, propertyName)) {
    delete claim[propertyName];
    await saveDraftClaim(claimId, claim);
  }
};

export const updateFieldDraftClaimFromStore = async (claimId: string, req: Request, propertyName: string, newValue: string): Promise<void> => {
  const claim = await getClaimById(claimId, req, true);
  const redisKey = generateRedisKey(<AppRequest>req);
  claim[propertyName] = newValue;
  await saveDraftClaim(redisKey, claim);

};

export async function createDraftClaimInStoreWithExpiryTime(claimId: string) {
  const draftClaim = createNewCivilClaimResponse(claimId);
  const creationTime = new Date();
  draftClaim.case_data = {
    draftClaimCreatedAt: creationTime,
  } as unknown as CCDClaim;
  const draftStoreClient = app.locals.draftStoreClient;
  draftStoreClient.set(claimId, JSON.stringify(draftClaim));
  await draftStoreClient.expireat(claimId, calculateExpireTimeForDraftClaimInSeconds(creationTime));
  logger.info(`Draft claim expiry time is set to ${await draftStoreClient.ttl(claimId)} seconds as of ${creationTime}`);
}

export function generateRedisKey(req: AppRequest) {
  return req.params?.id + req.session.user?.id;
}

export function generateRedisKeyForGA(req: AppRequest) {
  return req.params.appId + req.session.user?.id;
}

export const findClaimIdsbyUserId = async (userId: string): Promise<any> => {
  try {
    return await app.locals.draftStoreClient.keys('*' + userId);
  } catch (error) {
    logger.error('Failed to find claim IDs by userId', error);
    throw error;
  }
};
