import {app} from '../../app';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {isUndefined} from 'lodash';
import {addDaysToDate} from 'common/utils/dateUtils';
import config from 'config';
import {isCUIReleaseTwoEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');

const DRAFT_EXPIRE_TIME_IN_DAYS: number = config.get('services.draftStore.redis.expireInDays');
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
  const isReleasedTwoEnabled: boolean = await isCUIReleaseTwoEnabled();
  if(isReleasedTwoEnabled &&
    (civilClaimResponse == undefined
      || civilClaimResponse.case_data == undefined)) {
    return undefined;
  }
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
  const draftStoreClient = app.locals.draftStoreClient;

  if (isUndefined(storedClaimResponse.case_data)) {
    storedClaimResponse = createNewCivilClaimResponse(claimId);
    draftStoreClient.expire(claimId, addDaysToDate(claim.createAt, DRAFT_EXPIRE_TIME_IN_DAYS).getTime());
  }

  storedClaimResponse.case_data = claim;
  draftStoreClient.set(claimId, JSON.stringify(storedClaimResponse));
};

const createNewCivilClaimResponse = (claimId: string) => {
  const storedClaimResponse = new CivilClaimResponse();
  storedClaimResponse.id = claimId;
  storedClaimResponse.case_data.createAt = new Date();
  return storedClaimResponse;
};

export const deleteDraftClaimFromStore = async (claimId: string): Promise<void> => {
  await app.locals.draftStoreClient.del(claimId);
};
