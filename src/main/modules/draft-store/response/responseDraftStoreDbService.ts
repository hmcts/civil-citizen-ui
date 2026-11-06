import axios, {AxiosResponse} from 'axios';
import config from 'config';
import {DraftClaimRequest, DraftClaimResponse} from 'common/models/draft/draftClaim';
import {Claim} from 'models/claim';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {AppRequest} from 'common/models/AppRequest';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('responseDraftStoreDbService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const draftResponsesUrl = `${civilServiceApiBaseUrl}/dashboard/draft-responses`;

export const CIVIL_SERVICE_DRAFT_DEFENDANT_RESPONSE_RETENTION_DAYS = 180;

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const getHeaders = (req: AppRequest) => {
  const token = req?.session?.user?.accessToken;
  if (!token) {
    throw new Error('[responseDraftStoreDbService] access token is required to communicate with API');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const safeDraftId = /^[A-Za-z0-9_-]+$/;

const draftResponseUrl = (draftId: string): string => {
  const match = draftId.match(safeDraftId);
  if (!match) {
    throw new Error('[responseDraftStoreDbService] invalid draftId');
  }
  return `${draftResponsesUrl}/${encodeURIComponent(match[0])}`;
};

const mapToCivilClaimResponse = (dbDraft: DraftClaimResponse): CivilClaimResponse => {
  const response = new CivilClaimResponse();
  response.id = dbDraft.draftId;
  response.case_data = dbDraft.payload as unknown as CCDClaim;
  return response;
};

const ensureDraftResponseTtl = (claim: Claim): void => {
  claim.draftClaimCacheTtlDays = CIVIL_SERVICE_DRAFT_DEFENDANT_RESPONSE_RETENTION_DAYS;
};

const ccdCaseIdFromClaim = (claim: Claim): string | undefined => {
  if (claim?.id && /^\d+$/.test(String(claim.id))) {
    return String(claim.id);
  }
  return undefined;
};

const toDraftResponseRequest = (claim: Claim): DraftClaimRequest => {
  const caseId = ccdCaseIdFromClaim(claim);
  if (!caseId) {
    throw new Error('[responseDraftStoreDbService] caseId is required');
  }
  return {caseId, payload: claim as unknown as Record<string, unknown>};
};

export const getDraftResponseForCaseFromDb = async (req: AppRequest, caseId: string): Promise<{ claimResponse: CivilClaimResponse; rawResponse: DraftClaimResponse} | null> => {
  if (!/^\d+$/.test(caseId)) {
    throw new Error('[responseDraftStoreDbService] invalid caseId');
  }
  try {
    const response = await axios.get<DraftClaimResponse>(
      `${draftResponsesUrl}/case/${encodeURIComponent(caseId)}`,
      {headers: getHeaders(req)},
    );

    return {
      claimResponse: mapToCivilClaimResponse(response.data),
      rawResponse: response.data,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    logger.error(`[responseDraftStoreDbService] error fetching draft for case ${caseId} from db: ${getErrorMessage(err)}`);
    throw err;
  }
};

export const createOrLoadDraftResponseInDraftStoreDb = async (
  req: AppRequest,
  claim?: Claim,
): Promise<{ claimResponse: CivilClaimResponse; rawResponse: DraftClaimResponse; isNew: boolean}> => {
  const claimToSave = claim || new Claim();
  ensureDraftResponseTtl(claimToSave);
  const payload: DraftClaimRequest = toDraftResponseRequest(claimToSave);

  try {
    const response: AxiosResponse<DraftClaimResponse> = await axios.post<DraftClaimResponse>(
      draftResponsesUrl,
      payload,
      {headers: getHeaders(req)},
    );
    const isNew = response.status === 201;
    if (isNew) {
      logger.info(`[responseDraftStoreDbService] created draft ${response.data.draftId}`);
    }

    return {
      claimResponse: mapToCivilClaimResponse(response.data),
      rawResponse: response.data,
      isNew,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 409 && payload.caseId) {
      const existing = await getDraftResponseForCaseFromDb(req, payload.caseId);
      if (existing) {
        return {...existing, isNew: false};
      }
    }
    logger.error(`[responseDraftStoreDbService] failed to create/load draft in db: ${getErrorMessage(err)}`);
    throw err;
  }
};

export const updateDraftResponseInDb = async (
  req: AppRequest,
  draftId: string,
  claim: Claim,
): Promise<{ claimResponse: CivilClaimResponse; rawResponse: DraftClaimResponse}> => {
  if (!draftId) {
    throw new Error('[responseDraftStoreDbService] draftId is required for PUT update');
  }

  const url = draftResponseUrl(draftId);
  ensureDraftResponseTtl(claim);
  const payload = toDraftResponseRequest(claim);
  logger.info(`[responseDraftStoreDbService] updating draft ${draftId} with CCD caseId=${payload.caseId}`);

  try {
    const response = await axios.put<DraftClaimResponse>(
      url,
      payload,
      {headers: getHeaders(req)},
    );
    return {
      claimResponse: mapToCivilClaimResponse(response.data),
      rawResponse: response.data,
    };
  } catch (err: unknown) {
    logger.error(`[responseDraftStoreDbService] failed to update draft ${draftId} in db: ${getErrorMessage(err)}`);
    throw err;
  }
};

export const deleteDraftResponseFromDb = async (req: AppRequest, draftId: string): Promise<void> => {
  if (!draftId) {
    throw new Error('[responseDraftStoreDbService] draftId is required for deletion');
  }
  const url = draftResponseUrl(draftId);
  logger.info(`[responseDraftStoreDbService] deleting draft ${draftId} from db`);

  try {
    await axios.delete(
      url,
      {headers: getHeaders(req)},
    );
  } catch (err: unknown) {
    if (!axios.isAxiosError(err) || err.response?.status !== 404) {
      logger.error(`[responseDraftStoreDbService] failed to delete ${draftId} from db: ${getErrorMessage(err)}`);
      throw err;
    }
  }
};
