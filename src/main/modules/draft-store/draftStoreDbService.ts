import axios from 'axios';
import config from 'config';
import {DraftClaimRequest, DraftClaimResponse} from 'common/models/draft/draftClaim';
import {Claim} from 'models/claim';
import {app} from '../../app-instance';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {AppRequest} from 'common/models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreDbService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');

const getHeaders = (req?: AppRequest) => ({
  'Content-Type': 'application/json',
  'Authorization': req?.session?.user?.accessToken ? `Bearer ${req.session.user.accessToken}` : '',
})

const getCacheKey = (req?: AppRequest, draftId?: string): string => {
  const userId = req?.session?.user?.id;
  return draftId ? `${draftId}_${userId}` : `draft_${userId}`;
};

export const createDraftClaimInStore = async (
  req: AppRequest,
  claim: Claim,
): Promise<CivilClaimResponse> => {
  const payload: DraftClaimRequest = {
    payload: claim as unknown as Record<string, unknown>,
  };

  logger.info('[draftStoreDbService] creating draft only in db for user: ${req.session?.user?.id}');

  let dbDraft: DraftClaimResponse;

  try {
    const response = await axios.post<DraftClaimResponse>(
      `${civilServiceApiBaseUrl}/dashboard/draft-claims`,
      payload,
      {headers: getHeaders(req)},
    );
    dbDraft = response.data;
  } catch (err: any) {
    logger.error('[draftStoreDbService] failed to create draft in db: ${err.message}');
    throw err;
  }

  const savedClaimResponse = new CivilClaimResponse();
  savedClaimResponse.id = dbDraft.draftId;
  savedClaimResponse.case_data = dbDraft.payload as unknown as CCDClaim;
  return savedClaimResponse;
};

export const getActiveDraftFromStore = async (req: AppRequest): Promise<CivilClaimResponse | null> => {
  const cacheKey = getCacheKey(req);

  try {
    const cachedData = await app.locals.draftStoreClient.get(cacheKey);
    if (cachedData) {
      logger.info(`[draftStoreDbService] Redis cache hit for key: ${cacheKey}`);
      const parsed = JSON.parse(cachedData);
      return Object.assign(new CivilClaimResponse(), parsed);
    }
  } catch (redisError) {
    logger.warn(`[draftStoreDbService] Redis read error, falling back to DB: ${(redisError as Error).message}`);
  }

  logger.info('[DraftStoreDbService] fetching active draft from Draft Store Db');
  try {
    const response = await axios.get<DraftClaimResponse>(
      `${civilServiceApiBaseUrl}/dashboard/draft-claims/active`,
      {headers: getHeaders(req)}
    );

    const dbDraft = response.data;
    const civilClaimResponse = new CivilClaimResponse();
    civilClaimResponse.id = dbDraft.draftId;
    civilClaimResponse.case_data = dbDraft.payload as unknown as CCDClaim;

    const dbCacheKey = getCacheKey(req, dbDraft.draftId);
    try {
      await app.locals.draftStoreClient.set(dbCacheKey, JSON.stringify(civilClaimResponse));
    } catch (redisError) {
      logger.warn(`[draftStoreDbService] failure to populate Redis cache: ${(redisError as Error).message}`);
    }
    return civilClaimResponse;
  } catch (err: any) {
    if (err.response?.status === 404) {
      logger.info('[draftStoreDbService] active draft claim not found or expired in Db (404)');
      return null;
    }
    logger.error(`[draftStoreDbService] error fetching active draft: ${err.message}`);
    throw err;
  }
};

export const updateDraftClaimInStore = async (
  req: AppRequest,
  draftId: string,
  claim: Claim,
): Promise<CivilClaimResponse> => {
  if(!draftId) {
    throw new Error('[draftStoreDbService] cannot save draft without a valid draftId');
  }

  const payload: DraftClaimRequest = {
    payload: claim as unknown as Record<string, unknown>,
  };
  logger.info(`[draftStoreDbService] saving draft ${draftId} in db`);

  let dbDraft: DraftClaimResponse;
  try {
    const response = await axios.put<DraftClaimResponse>(
      `${civilServiceApiBaseUrl}/dashboard/draft-claims/${draftId}`,
      payload,
      {headers: getHeaders(req) },
    );
    dbDraft = response.data;
  } catch (err: any) {
    logger.error(`[draftStoreDbService] failed to save draft ${draftId} in db: ${err.message}`);
    throw err;
  }

  const savedClaimResponse = new CivilClaimResponse();
  savedClaimResponse.id = dbDraft.draftId;
  savedClaimResponse.case_data = dbDraft.payload as unknown as CCDClaim;

  const cacheKey = getCacheKey(req, dbDraft.draftId);
  try {
    await app.locals.draftStoreClient.set(cacheKey, JSON.stringify(savedClaimResponse));
  } catch (redisError) {
    logger.warn('[draftStoreDbService saved in db, but failed to update redis cache: ${(redisError as Error).message}');
  }
  return savedClaimResponse;
};

export const deleteDraftClaimFromStore = async (req: AppRequest, draftId: string): Promise<void> => {

  try {
    await axios.delete(
      `${civilServiceApiBaseUrl}/dashboard/draft-claims/${draftId}`,
      {headers: getHeaders(req)},
    );
    logger.info('[draftStoreDbService] deleted draft ${draftId} from db');
  } catch (err: any) {
    if (err.response?.status !== 404) {
      logger.error('[draftStoreDbService] failed to delete ${draftId} from db: ${err.message}');
      throw err;
    }
  }

  const cacheKey = getCacheKey(req, draftId);
  try {
    await app.locals.draftStoreClient.del(cacheKey);
    logger.info('[draftStoreDbService] cleared redis cache key: ${cacheKey}');
  } catch (redisError) {
    logger.warn('[draftStoreDbService] deleted from db but failed to clear redis cache: ${(redisError as Error).message}');
  }
};

