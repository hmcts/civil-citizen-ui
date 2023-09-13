import config from 'config';
import {app} from '../../app';
import {
  CCDClaim,
  CivilClaimResponse,
} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {isUndefined} from 'lodash';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');

const DRAFT_EXPIRE_TIME_IN_DAYS: number = config.get('services.draftStore.redis.expireInDays');
const DAY_TO_SECONDS_UNIT = 86400;
/**
 * Gets civil claim response object with claim from draft store
 * @param claimId
 * @returns claim from redis or undefined when no there is no data for claim id
 */
export const getDraftClaimFromStore = async (claimId: string) => {
  const dataFromRedis = await app.locals.draftStoreClient.get(claimId);
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
  const draftStoreClient = app.locals.draftStoreClient;
  // const expiryTime = await draftStoreClient.ttl(claimId);
  // await draftStoreClient.set(claimId, JSON.stringify(storedClaimResponse));
  // if (expiryTime !== -1) {
  //   await draftStoreClient.expire(claimId, expiryTime);
  // }
  draftStoreClient.set(claimId, JSON.stringify(storedClaimResponse));
};

export const saveDraftClaimX = async (claimId: string, claim: Claim) => {
  const storedClaimResponse = await getDraftClaimFromStore(claimId);
  storedClaimResponse.case_data = claim;
  const draftStoreClient = app.locals.draftStoreClient;
  const expiryTime = await draftStoreClient.ttl(claimId);
  await draftStoreClient.set(claimId, JSON.stringify(storedClaimResponse));
  if (expiryTime !== -1) {
    await draftStoreClient.expire(claimId, expiryTime);
  }
  // draftStoreClient.set(claimId, JSON.stringify(storedClaimResponse));
};

const createNewCivilClaimResponse = (claimId: string) => {
  const storedClaimResponse = new CivilClaimResponse();
  storedClaimResponse.id = claimId;
  return storedClaimResponse;
};

export const deleteDraftClaimFromStore = async (claimId: string): Promise<void> => {
  await app.locals.draftStoreClient.del(claimId);
};

export async function createDraftClaimInStoreWithExpiryTime(claimId: string) {
  const draftClaim = createNewCivilClaimResponse(claimId);
  draftClaim.case_data = {} as unknown as CCDClaim;
  const draftStoreClient = app.locals.draftStoreClient;
  // await draftStoreClient.set(claimId, JSON.stringify(draftClaim), 'EX', DRAFT_EXPIRE_TIME_IN_DAYS * DAY_TO_SECONDS_UNIT);
  await draftStoreClient.set(claimId, JSON.stringify(draftClaim));
  await draftStoreClient.expire(claimId, DRAFT_EXPIRE_TIME_IN_DAYS * DAY_TO_SECONDS_UNIT);
  logger.info(`Draft claim expiry time is set to ${await draftStoreClient.ttl(claimId)} seconds as of ${new Date()}`);
}
