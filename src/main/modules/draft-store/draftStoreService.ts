import {app} from '../../app';
import {CivilClaimResponse} from '../../common/models/civilClaimResponse';
import {Claim} from '../../common/models/claim';
import {isUndefined} from 'lodash';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');


/**
 * Gets civil claim response object with claim from draft store
 * @param claimId
 * @returns claim from redis or undefined when no there is no data for claim id
 */
export const getDraftClaimFromStore = async (claimId: string) => {
  const dataFromRedis = await app.locals.draftStoreClient.get(claimId);
  const claim = convertRedisDataToCivilClaimResponse(dataFromRedis);
  return claim;
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
  return Object.assign(new Claim(), civilClaimResponse?.case_data);
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
  draftStoreClient.set(claimId, JSON.stringify(storedClaimResponse));
};

const createNewCivilClaimResponse = (claimId: string) => {
  const storedClaimResponse = new CivilClaimResponse();
  storedClaimResponse.id = claimId;
  return storedClaimResponse;
};
