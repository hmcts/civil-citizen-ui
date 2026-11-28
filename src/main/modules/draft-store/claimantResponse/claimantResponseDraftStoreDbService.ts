import axios, {AxiosResponse} from 'axios';
import config from 'config';
import {DraftClaimRequest, DraftClaimResponse} from 'common/models/draft/draftClaim';
import {Claim} from 'models/claim';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {AppRequest} from 'common/models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseDraftStoreDbService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const draftResponsesUrl = `${civilServiceApiBaseUrl}/dashboard/draft-claimant-responses`;

export const CIVIL_SERVICE_DRAFT_CLAIMANT_RESPONSE_RETENTION_DAYS = 30;

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const getHeaders = (req: AppRequest) => {
  const token = req?.session?.user?.accessToken;
  if (!token) {
    throw new Error('[claimantResponseDraftStoreDbService] access token is required to communicate with API');
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
    throw new Error('[claimantResponseDraftStoreDbService] invalid draftId');
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
  claim.draftClaimCacheTtlDays = CIVIL_SERVICE_DRAFT_CLAIMANT_RESPONSE_RETENTION_DAYS;
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
    throw new Error('[claimantResponseDraftStoreDbService] caseId is required');
  }
  return {caseId, payload: claim as unknown as Record<string, unknown>};
};

export const getDraftResponseForCaseFromDb = async (
  req: AppRequest,
  caseId: string,
): Promise<{ claimResponse: CivilClaimResponse; rawResponse: DraftClaimResponse} | null> => {
  if (!/^\d+$/.test(caseId)) {
    throw new Error('[claimantResponseDraftStoreDbService] invalid caseId');
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
    logger.error(`[claimantResponseDraftStoreDbService] error fetching draft for case ${caseId} from db: ${getErrorMessage(err)}`);
    throw err;
  }
};

export const createOrLoadDraftResponseInDraftStoreDb = async (
  req: AppRequest,
  claim: Claim,
): Promise<{ claimResponse: CivilClaimResponse; rawResponse: DraftClaimResponse; isNew: boolean}> => {
  ensureDraftResponseTtl(claim);
  const payload: DraftClaimRequest = toDraftResponseRequest(claim);

  try {
    const response: AxiosResponse<DraftClaimResponse> = await axios.post<DraftClaimResponse>(
      draftResponsesUrl,
      payload,
      {headers: getHeaders(req)},
    );
    const isNew = response.status === 201;
    if (isNew) {
      logger.info(`[claimantResponseDraftStoreDbService] created draft ${response.data.draftId}`);
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
    logger.error(`[claimantResponseDraftStoreDbService] failed to create/load draft in db: ${getErrorMessage(err)}`);
    throw err;
  }
};

export const updateDraftResponseInDb = async (
  req: AppRequest,
  draftId: string,
  claim: Claim,
): Promise<{ claimResponse: CivilClaimResponse; rawResponse: DraftClaimResponse}> => {
  if (!draftId) {
    throw new Error('[claimantResponseDraftStoreDbService] draftId is required for PUT update');
  }
  ensureDraftResponseTtl(claim);
  const payload = toDraftResponseRequest(claim);
  logger.info(`[claimantResponseDraftStoreDbService] updating draft ${draftId} with CCD caseId=${payload.caseId}`);
  try {
    const response = await axios.put<DraftClaimResponse>(
      draftResponseUrl(draftId),
      payload,
      {headers: getHeaders(req)},
    );
    return {
      claimResponse: mapToCivilClaimResponse(response.data),
      rawResponse: response.data,
    };
  } catch (err: unknown) {
    logger.error(`[claimantResponseDraftStoreDbService] failed to update draft ${draftId} in db: ${getErrorMessage(err)}`);
    throw err;
  }
};

export const deleteDraftResponseFromDb = async (req: AppRequest, draftId: string): Promise<void> => {
  if (!draftId) {
    throw new Error('[claimantResponseDraftStoreDbService] draftId is required for deletion');
  }
  logger.info(`[claimantResponseDraftStoreDbService] deleting draft ${draftId} from db`);
  try {
    await axios.delete(draftResponseUrl(draftId), {headers: getHeaders(req)});
  } catch (err: unknown) {
    if (!axios.isAxiosError(err) || err.response?.status !== 404) {
      logger.error(`[claimantResponseDraftStoreDbService] failed to delete ${draftId} from db: ${getErrorMessage(err)}`);
      throw err;
    }
  }
};
