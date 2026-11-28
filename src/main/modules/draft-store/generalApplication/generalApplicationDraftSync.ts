import {AsyncLocalStorage} from 'node:async_hooks';
import {isGeneralApplicationDraftDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam, isUsablePathSegment} from 'common/utils/routeParamUtils';
import {GeneralApplication, toGeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {GaResponse} from 'common/models/generalApplication/response/gaResponse';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {Claim} from 'models/claim';
import {generalApplicationRequestContext} from './generalApplicationRequestContext';
import {
  deleteApplicationDraftForCase,
  deleteApplicationDraftsForUser,
  deleteResponseDraftForApplication,
  GeneralApplicationDraftPayload,
  getGeneralApplicationDraftsForCase,
  getGeneralApplicationResponseDraft,
  saveGeneralApplicationDraft,
  updateGeneralApplicationDraft,
} from './generalApplicationDraftDbService';

const skipDurableWrite = new AsyncLocalStorage<true>();

export const withoutDurableWrite = <T>(work: () => Promise<T>): Promise<T> =>
  skipDurableWrite.run(true, work);

const writesAreSkipped = (): boolean => skipDurableWrite.getStore() === true;

const databaseEnabled = async (): Promise<boolean> =>
  Boolean(await isGeneralApplicationDraftDatabaseEnabled());

const requestFor = (redisKey: string): {req: AppRequest; caseId: string} | null => {
  const req = generalApplicationRequestContext.getStore();
  if (!req) {
    return null;
  }
  const caseId = getRouteParam(req, 'id');
  const userId = req.session?.user?.id ?? '';
  if (!isUsablePathSegment(caseId)) {
    return null;
  }
  if (redisKey !== caseId && redisKey !== `${caseId}${userId}`) {
    return null;
  }
  return {req, caseId};
};

export const syncGeneralApplicationDraft = async (redisKey: string, claim: Claim): Promise<void> => {
  if (writesAreSkipped() || !claim?.generalApplication) {
    return;
  }
  const current = requestFor(redisKey);
  if (!current || !(await databaseEnabled())) {
    return;
  }
  await saveGeneralApplicationDraft(current.req, current.caseId, undefined, {
    generalApplication: claim.generalApplication as unknown as Record<string, unknown>,
  });
};

export const hydrateGeneralApplicationDraft = async (redisKey: string, claim: Claim): Promise<boolean> => {
  if (claim?.generalApplication) {
    return false;
  }
  const current = requestFor(redisKey);
  if (!current || !(await databaseEnabled())) {
    return false;
  }
  const drafts = await getGeneralApplicationDraftsForCase(current.req, current.caseId);
  const stored = drafts.application?.payload?.generalApplication;
  if (!stored) {
    return false;
  }
  claim.generalApplication = toGeneralApplication(stored as Partial<GeneralApplication>);
  return true;
};

export const loadDurableGeneralApplication = async (
  req: AppRequest,
  caseId: string,
): Promise<GeneralApplication | null> => {
  if (!isUsablePathSegment(caseId) || !(await databaseEnabled())) {
    return null;
  }
  const drafts = await getGeneralApplicationDraftsForCase(req, caseId);
  const stored = drafts.application?.payload?.generalApplication;
  return stored ? toGeneralApplication(stored as Partial<GeneralApplication>) : null;
};

const upsertResponsePayload = async (
  req: AppRequest,
  patch: GeneralApplicationDraftPayload,
): Promise<void> => {
  if (!(await databaseEnabled())) {
    return;
  }
  const caseId = getRouteParam(req, 'id');
  const applicationId = getRouteParam(req, 'appId');
  if (!isUsablePathSegment(caseId) || !isUsablePathSegment(applicationId)) {
    return;
  }
  const existing = await getGeneralApplicationResponseDraft(req, applicationId);
  const payload = existing?.payload ? {...existing.payload, ...patch} : patch;
  if (existing?.draftId) {
    await updateGeneralApplicationDraft(req, existing.draftId, caseId, applicationId, payload);
    return;
  }
  const documentsOnly = patch.response === undefined && patch.helpWithFees === undefined;
  if (documentsOnly && (!Array.isArray(patch.documents) || patch.documents.length === 0)) {
    return;
  }
  await saveGeneralApplicationDraft(req, caseId, applicationId, payload);
};

export const syncResponseDraft = async (response: GaResponse): Promise<void> => {
  const req = generalApplicationRequestContext.getStore();
  if (!req || writesAreSkipped()) {
    return;
  }
  await upsertResponsePayload(req, {response: response as unknown as Record<string, unknown>});
};

export const loadResponseDraft = async (): Promise<GaResponse | null> => {
  const req = generalApplicationRequestContext.getStore();
  if (!req || !(await databaseEnabled())) {
    return null;
  }
  const applicationId = getRouteParam(req, 'appId');
  if (!isUsablePathSegment(applicationId)) {
    return null;
  }
  const draft = await getGeneralApplicationResponseDraft(req, applicationId);
  if (!draft?.payload?.response) {
    return null;
  }
  const response = Object.assign(new GaResponse(), draft.payload.response);
  if (!response.draftResponseCreatedAt && draft.createdAt) {
    response.draftResponseCreatedAt = new Date(draft.createdAt);
  }
  return response;
};

export const syncResponseDocuments = async (documents: UploadGAFiles[]): Promise<void> => {
  const req = generalApplicationRequestContext.getStore();
  if (!req || writesAreSkipped()) {
    return;
  }
  await upsertResponsePayload(req, {documents});
};

export const loadResponseDocuments = async (): Promise<UploadGAFiles[] | null> => {
  const req = generalApplicationRequestContext.getStore();
  if (!req || !(await databaseEnabled())) {
    return null;
  }
  const applicationId = getRouteParam(req, 'appId');
  if (!isUsablePathSegment(applicationId)) {
    return null;
  }
  const draft = await getGeneralApplicationResponseDraft(req, applicationId);
  const documents = draft?.payload?.documents;
  return Array.isArray(documents) ? documents as UploadGAFiles[] : null;
};

export const syncHelpWithFeesDraft = async (helpWithFees: GaHelpWithFees): Promise<void> => {
  const req = generalApplicationRequestContext.getStore();
  if (!req || writesAreSkipped()) {
    return;
  }
  await upsertResponsePayload(req, {helpWithFees: helpWithFees as unknown as Record<string, unknown>});
};

export const loadHelpWithFeesDraft = async (): Promise<GaHelpWithFees | null> => {
  const req = generalApplicationRequestContext.getStore();
  if (!req || !(await databaseEnabled())) {
    return null;
  }
  const applicationId = getRouteParam(req, 'appId');
  if (!isUsablePathSegment(applicationId)) {
    return null;
  }
  const draft = await getGeneralApplicationResponseDraft(req, applicationId);
  if (!draft?.payload?.helpWithFees) {
    return null;
  }
  return Object.assign(new GaHelpWithFees(), draft.payload.helpWithFees);
};

export const deleteDurableResponseDraft = async (): Promise<void> => {
  const req = generalApplicationRequestContext.getStore();
  if (!req || !(await databaseEnabled())) {
    return;
  }
  const applicationId = getRouteParam(req, 'appId');
  if (!isUsablePathSegment(applicationId)) {
    return;
  }
  await deleteResponseDraftForApplication(req, applicationId);
};

export const deleteDurableApplicationDraft = async (req: AppRequest, caseId: string): Promise<void> => {
  if (!isUsablePathSegment(caseId) || !(await databaseEnabled())) {
    return;
  }
  await deleteApplicationDraftForCase(req, caseId);
};

export const deleteDurableApplicationDraftsForUser = async (req: AppRequest): Promise<void> => {
  if (!(await databaseEnabled())) {
    return;
  }
  await deleteApplicationDraftsForUser(req);
};
