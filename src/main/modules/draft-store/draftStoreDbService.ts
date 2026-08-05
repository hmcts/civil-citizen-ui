import axios, {AxiosResponse} from 'axios';
import config from 'config';
import {DraftClaimRequest, DraftClaimResponse} from 'common/models/draft/draftClaim';
import {Claim} from 'models/claim';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {AppRequest} from 'common/models/AppRequest';

import {Logger} from '@hmcts/nodejs-logging';
const logger = Logger.getLogger('draftStoreDbService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const getHeaders = (req: AppRequest) => {
  const token = req?.session?.user?.accessToken;
  if (!token) {
    throw new Error('[draftStoreDbService access token is required to communicate with API');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const mapToCivilClaimResponse = (dbDraft: DraftClaimResponse): CivilClaimResponse => {
  const response = new CivilClaimResponse();
  response.id = dbDraft.draftId;
  response.case_data = dbDraft.payload as unknown as CCDClaim;
  return response;
};

export const createDraftClaimInDraftStoreDb = async (
  req: AppRequest,
  claim: Claim,
): Promise<{ claimResponse: CivilClaimResponse; rawResponse: DraftClaimResponse}> => {
  const payload: DraftClaimRequest = {
    payload: claim as unknown as Record<string, unknown>,
  };

  logger.info(`[draftStoreDbService] creating draft in db for user: ${req.session?.user?.id}`);

  let response: AxiosResponse<DraftClaimResponse>;
  try {
    response = await axios.post<DraftClaimResponse>(
      `${civilServiceApiBaseUrl}/dashboard/draft-claims`,
      payload,
      {headers: getHeaders(req)},
    );
  } catch (err: unknown) {
    logger.error(`[draftStoreDbService] failed to create draft in db: ${getErrorMessage(err)}`);
    throw err;
  }

  if (response.status !== 200 && response.status !== 201) {
    const errorMessage = `unexpected status code received on draft creation: ${response.status}`;
    logger.error(`[draftStoreDbService] ${errorMessage}`);
    throw new Error(errorMessage);
  }

  logger.info(`[draftStoreDbService] draft created successfully with status: ${response.status}`);
  return {
    claimResponse: mapToCivilClaimResponse(response.data),
    rawResponse: response.data,
  };
};

export const getActiveDraftFromDraftStoreDb = async (req: AppRequest): Promise<{ claimResponse: CivilClaimResponse; rawResponse: DraftClaimResponse} | null> => {
  const userId = req.session?.user?.id;
  logger.info(`[DraftStoreDbService] fetching active draft from Draft Store Db for user ${userId}`);

  try {
    const response = await axios.get<DraftClaimResponse>(
      `${civilServiceApiBaseUrl}/dashboard/draft-claims/active`,
      {headers: getHeaders(req)},
    );

    return {
      claimResponse: mapToCivilClaimResponse(response.data),
      rawResponse: response.data,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      logger.info(`[draftStoreDbService] no active draft from db found for user: ${userId}`);
      return null;
    }
    logger.info(`[draftStoreDbService] error fetching active draft from db: ${getErrorMessage(err)}`);
    throw err;
  }
};

export const updateDraftClaimInStore = async (
  req: AppRequest,
  draftId: string,
  claim: Claim,
): Promise<{ claimResponse: CivilClaimResponse; rawResponse: DraftClaimResponse}> => {
  if (!draftId) {
    throw new Error('[draftStoreDbService] draftId is required for update');
  }

  const payload: DraftClaimRequest = {
    payload: claim as unknown as Record<string, unknown>,
  };
  logger.info(`[draftStoreDbService] updating draft ${draftId} in db`);

  try {
    const response = await axios.put<DraftClaimResponse>(
      `${civilServiceApiBaseUrl}/dashboard/draft-claims/${draftId}`,
      payload,
      {headers: getHeaders(req)},
    );
    return {
      claimResponse: mapToCivilClaimResponse(response.data),
      rawResponse: response.data,
    };
  } catch (err: unknown) {
    logger.error(`[draftStoreDbService] failed to update draft ${draftId} in db: ${getErrorMessage(err)}`);
    throw err;
  }
};

export const deleteDraftClaimFromStore = async (req: AppRequest, draftId: string): Promise<void> => {
  if (!draftId) {
    throw new Error('[draftStoreDbService] draftId is required for deletion');
  }
  logger.info(`[draftStoreDbService] deleting draft ${draftId} from db`);

  try {
    await axios.delete(
      `${civilServiceApiBaseUrl}/dashboard/draft-claims/${draftId}`,
      {headers: getHeaders(req)},
    );
  } catch (err: unknown) {
    if (!axios.isAxiosError(err) || err.response?.status !== 404) {
      logger.error(`[draftStoreDbService] failed to delete ${draftId} from db: ${getErrorMessage(err)}`);
      throw err;
    }
  }
};
