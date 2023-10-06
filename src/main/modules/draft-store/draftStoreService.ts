import {
  CCDClaim,
  CivilClaimResponse,
} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {isUndefined} from 'lodash';
import {calculateExpireTimeForDraftClaimInSeconds} from 'common/utils/dateUtils';
import DraftStoreClient from './index';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');
const redisModule = new DraftStoreClient();
/**
 * Gets civil claim response object with claim from draft store
 * @param claimId
 * @returns claim from redis or undefined when no there is no data for claim id
 */
export const getDraftClaimFromStore = async (claimId: string) => {
  const dataFromRedis = await redisModule.get(claimId);
  return convertRedisDataToCivilClaimResponse(dataFromRedis);
};

const convertRedisDataToCivilClaimResponse = (data: string) => {
  let jsonData = undefined;
  if (data) {
    try {
      jsonData = JSON.parse(data);
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }
  return Object.assign(new CivilClaimResponse(), jsonData);
};
/**
 * Gets only case data.
 * @param claimId
 */
export const getCaseDataFromStore = async (claimId: string): Promise<Claim> => {
  const civilClaimResponse = await getDraftClaimFromStore(claimId);
  const claim: Claim = new Claim();
  Object.assign(claim, civilClaimResponse?.case_data);
  claim.id = civilClaimResponse?.id;
  return claim;
};

/**
 * Saves claim in Draft store. If the claim does not exist
 * it creates a new CivilClaimResponse object and passes the claim in parameter to it
 * then saves the new data in redis.
 * If claim exists then it updates the claim with the new claim passed in parameter
 * @param claimId
 * @param claim
 */
export const saveDraftClaim = async (claimId: string, claim: Claim) => {
  let storedClaimResponse = await getDraftClaimFromStore(claimId);
  if (isUndefined(storedClaimResponse.case_data)) {
    storedClaimResponse = createNewCivilClaimResponse(claimId);
  }
  storedClaimResponse.case_data = claim;
  // const draftStoreClient = app.locals.draftStoreClient;
  redisModule.setValue(claimId, JSON.stringify(storedClaimResponse));
  if (claim.draftClaimCreatedAt) {
    await redisModule.expireat(claimId, calculateExpireTimeForDraftClaimInSeconds(claim.draftClaimCreatedAt));
  }
};

const createNewCivilClaimResponse = (claimId: string) => {
  const storedClaimResponse = new CivilClaimResponse();
  storedClaimResponse.id = claimId;
  return storedClaimResponse;
};

export const deleteDraftClaimFromStore = async (claimId: string): Promise<void> => {
  await redisModule.del(claimId);
};

export async function createDraftClaimInStoreWithExpiryTime(claimId: string) {
  const draftClaim = createNewCivilClaimResponse(claimId);
  const creationTime = new Date();
  draftClaim.case_data = {
    draftClaimCreatedAt: creationTime,
  } as unknown as CCDClaim;
  redisModule.setValue(claimId, JSON.stringify(draftClaim));
  await redisModule.expireat(claimId, calculateExpireTimeForDraftClaimInSeconds(creationTime));
  logger.info(`Draft claim expiry time is set to ${await redisModule.timeToLive(claimId)} seconds as of ${creationTime}`);
}
