import {app} from '../../app';
import {
  CCDClaim,
  CivilClaimResponse,
} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {isUndefined} from 'lodash';
import {calculateExpireTimeForDraftClaimInSeconds} from 'common/utils/dateUtils';
import {AppRequest} from 'common/models/AppRequest';

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
export const getCaseDataFromStore = async (claimId: string, doNotThrowError = false): Promise<Claim> => {
  const civilClaimResponse = await getDraftClaimFromStore(claimId, doNotThrowError);
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
export const saveDraftClaim =async (claimId: string, claim: Claim, doNotThrowError = false) => {
  let storedClaimResponse = await getDraftClaimFromStore(claimId, doNotThrowError);
  if (isUndefined(storedClaimResponse.case_data)) {
    storedClaimResponse = createNewCivilClaimResponse(claimId);
  }
  storedClaimResponse.case_data = claim;
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

export const deleteDraftClaimFromStore = async (claimId: string): Promise<void> => {
  await app.locals.draftStoreClient.del(claimId);
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
  return req.params.id + req.session.user?.id;
}
