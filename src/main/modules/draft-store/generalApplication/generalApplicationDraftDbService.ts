import axios from 'axios';
import config from 'config';
import {AppRequest} from 'common/models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('generalApplicationDraftDbService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const draftsUrl = `${civilServiceApiBaseUrl}/dashboard/draft-general-applications`;

export const GENERAL_APPLICATION_DRAFT_RETENTION_DAYS = 180;

export interface GeneralApplicationDraftPayload {
  generalApplication?: Record<string, unknown>;
  response?: Record<string, unknown>;
  documents?: unknown;
  helpWithFees?: Record<string, unknown>;
}

export interface GeneralApplicationDraft {
  draftId: string;
  caseId?: string;
  applicationId?: string;
  draftType?: string;
  payload: GeneralApplicationDraftPayload;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface GeneralApplicationCaseDrafts {
  application: GeneralApplicationDraft | null;
  responses: GeneralApplicationDraft[];
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const headers = (req: AppRequest) => {
  const token = req?.session?.user?.accessToken;
  if (!token) {
    throw new Error('[generalApplicationDraftDbService] access token is required to communicate with API');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const isNotFound = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;

const isConflict = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 409;

export const getGeneralApplicationDraftsForCase = async (
  req: AppRequest,
  caseId: string,
): Promise<GeneralApplicationCaseDrafts> => {
  try {
    const response = await axios.get<GeneralApplicationCaseDrafts>(
      `${draftsUrl}/case/${encodeURIComponent(caseId)}`,
      {headers: headers(req)},
    );
    return {
      application: response.data?.application ?? null,
      responses: response.data?.responses ?? [],
    };
  } catch (error: unknown) {
    logger.error(`[generalApplicationDraftDbService] failed to load drafts for case ${caseId}: ${getErrorMessage(error)}`);
    throw error;
  }
};

export const getGeneralApplicationResponseDraft = async (
  req: AppRequest,
  applicationId: string,
): Promise<GeneralApplicationDraft | null> => {
  try {
    const response = await axios.get<GeneralApplicationDraft>(
      `${draftsUrl}/application/${encodeURIComponent(applicationId)}`,
      {headers: headers(req)},
    );
    return response.data;
  } catch (error: unknown) {
    if (isNotFound(error)) {
      return null;
    }
    logger.error(`[generalApplicationDraftDbService] failed to load response draft ${applicationId}: ${getErrorMessage(error)}`);
    throw error;
  }
};

export const saveGeneralApplicationDraft = async (
  req: AppRequest,
  caseId: string,
  applicationId: string | undefined,
  payload: GeneralApplicationDraftPayload,
): Promise<GeneralApplicationDraft> => {
  const body = {caseId, applicationId: applicationId || undefined, payload};
  try {
    const response = await axios.post<GeneralApplicationDraft>(draftsUrl, body, {headers: headers(req)});
    return response.data;
  } catch (error: unknown) {
    if (!isConflict(error)) {
      logger.error(`[generalApplicationDraftDbService] failed to create draft for case ${caseId}: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  const existing = applicationId
    ? await getGeneralApplicationResponseDraft(req, applicationId)
    : (await getGeneralApplicationDraftsForCase(req, caseId)).application;
  if (!existing?.draftId) {
    throw new Error(`[generalApplicationDraftDbService] duplicate draft for case ${caseId} could not be loaded`);
  }
  return updateGeneralApplicationDraft(req, existing.draftId, caseId, applicationId, payload);
};

export const updateGeneralApplicationDraft = async (
  req: AppRequest,
  draftId: string,
  caseId: string,
  applicationId: string | undefined,
  payload: GeneralApplicationDraftPayload,
): Promise<GeneralApplicationDraft> => {
  try {
    const response = await axios.put<GeneralApplicationDraft>(
      `${draftsUrl}/${encodeURIComponent(draftId)}`,
      {caseId, applicationId: applicationId || undefined, payload},
      {headers: headers(req)},
    );
    return response.data;
  } catch (error: unknown) {
    logger.error(`[generalApplicationDraftDbService] failed to update draft ${draftId}: ${getErrorMessage(error)}`);
    throw error;
  }
};

export const deleteGeneralApplicationDraft = async (req: AppRequest, draftId: string): Promise<void> => {
  try {
    await axios.delete(`${draftsUrl}/${encodeURIComponent(draftId)}`, {headers: headers(req)});
  } catch (error: unknown) {
    if (!isNotFound(error)) {
      logger.error(`[generalApplicationDraftDbService] failed to delete draft ${draftId}: ${getErrorMessage(error)}`);
      throw error;
    }
  }
};

export const deleteApplicationDraftForCase = async (req: AppRequest, caseId: string): Promise<void> => {
  try {
    await axios.delete(`${draftsUrl}/case/${encodeURIComponent(caseId)}`, {headers: headers(req)});
  } catch (error: unknown) {
    if (!isNotFound(error)) {
      logger.error(`[generalApplicationDraftDbService] failed to delete application draft for case ${caseId}: ${getErrorMessage(error)}`);
      throw error;
    }
  }
};

export const deleteResponseDraftForApplication = async (req: AppRequest, applicationId: string): Promise<void> => {
  try {
    await axios.delete(`${draftsUrl}/application/${encodeURIComponent(applicationId)}`, {headers: headers(req)});
  } catch (error: unknown) {
    if (!isNotFound(error)) {
      logger.error(`[generalApplicationDraftDbService] failed to delete response draft ${applicationId}: ${getErrorMessage(error)}`);
      throw error;
    }
  }
};

export const deleteApplicationDraftsForUser = async (req: AppRequest): Promise<void> => {
  try {
    await axios.delete(`${draftsUrl}/user-applications`, {headers: headers(req)});
  } catch (error: unknown) {
    logger.error(`[generalApplicationDraftDbService] failed to delete application drafts for user: ${getErrorMessage(error)}`);
    throw error;
  }
};
