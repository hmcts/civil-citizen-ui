jest.mock('../../../../../main/app', () => ({
  app: require('../../../../../main/app-instance').app,
}));

import {app} from '../../../../../main/app-instance';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {GaResponse} from 'common/models/generalApplication/response/gaResponse';
import {UploadGAFiles} from 'common/models/generalApplication/uploadGAFiles';
import {GaHelpWithFees} from 'common/models/generalApplication/gaHelpWithFees';
import {isGeneralApplicationDraftDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {generalApplicationRequestContext} from 'modules/draft-store/generalApplication/generalApplicationRequestContext';
import {saveGeneralApplicationDraft} from 'modules/draft-store/generalApplication/generalApplicationDraftDbService';
import {saveDraftClaim, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  getDraftGARespondentResponse,
  saveDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {
  getGADocumentsFromDraftStore,
  saveGADocumentsInDraftStore,
} from 'modules/draft-store/draftGADocumentService';
import {getDraftGAHWFDetails, saveDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {getGeneralApplicationDraftsForCase, getGeneralApplicationResponseDraft} from 'modules/draft-store/generalApplication/generalApplicationDraftDbService';

jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isGeneralApplicationDraftDatabaseEnabled: jest.fn(),
}));
jest.mock('modules/draft-store/generalApplication/generalApplicationDraftDbService');

const mockedFlag = isGeneralApplicationDraftDatabaseEnabled as jest.MockedFunction<typeof isGeneralApplicationDraftDatabaseEnabled>;
const mockedSave = saveGeneralApplicationDraft as jest.MockedFunction<typeof saveGeneralApplicationDraft>;
const mockedGetCase = getGeneralApplicationDraftsForCase as jest.MockedFunction<typeof getGeneralApplicationDraftsForCase>;
const mockedGetResponse = getGeneralApplicationResponseDraft as jest.MockedFunction<typeof getGeneralApplicationResponseDraft>;

const caseId = '1645882162449409';
const redis = new Map<string, string>();
const draftStoreClient = {
  get: jest.fn(async (key: string) => redis.get(key) ?? null),
  set: jest.fn(async (key: string, value: string) => {
    redis.set(key, value);
  }),
  del: jest.fn(async (key: string) => {
    redis.delete(key);
  }),
  ttl: jest.fn(async () => -1),
  expireat: jest.fn(async () => 1),
};
app.locals.draftStoreClient = draftStoreClient;

const req = {
  params: {id: caseId, appId: '9876543210987654'},
  session: {user: {id: 'user-1', accessToken: 'token'}},
} as unknown as AppRequest;

const inContext = <T>(work: () => Promise<T>): Promise<T> =>
  generalApplicationRequestContext.run(req, work);

const storedClaim = (generalApplication?: GeneralApplication) => JSON.stringify({
  id: caseId,
  case_data: generalApplication ? {generalApplication} : {},
});

const savedClaim = (): Record<string, unknown> =>
  JSON.parse(draftStoreClient.set.mock.calls.at(-1)?.[1] as string).case_data;

describe('general application draft routing', () => {
  beforeEach(() => {
    redis.clear();
    jest.clearAllMocks();
    mockedFlag.mockResolvedValue(true);
  });

  it('keeps an application draft in Redis when Redis already has one', async () => {
    redis.set(caseId, storedClaim(new GeneralApplication()));
    const claim = new Claim();
    claim.generalApplication = Object.assign(new GeneralApplication(), {applicationFee: {amount: 10}});

    await inContext(() => saveDraftClaim(caseId, claim, true));

    expect(savedClaim().generalApplication).toEqual(expect.objectContaining({applicationFee: {amount: 10}}));
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it('writes a new application draft to the database and leaves it out of Redis', async () => {
    redis.set(caseId, storedClaim());
    const claim = new Claim();
    claim.generalApplication = Object.assign(new GeneralApplication(), {applicationFee: {amount: 20}});

    await inContext(() => saveDraftClaim(caseId, claim, true));

    expect(savedClaim().generalApplication).toBeUndefined();
    expect(mockedSave).toHaveBeenCalledWith(req, caseId, undefined, {
      generalApplication: claim.generalApplication,
    });
  });

  it('keeps a new application draft in Redis when the flag is off', async () => {
    mockedFlag.mockResolvedValue(false);
    redis.set(caseId, storedClaim());
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication();

    await inContext(() => saveDraftClaim(caseId, claim, true));

    expect(savedClaim().generalApplication).toBeDefined();
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it('loads a database application into memory without copying it back to Redis', async () => {
    redis.set(caseId, storedClaim());
    mockedGetCase.mockResolvedValue({
      application: {
        draftId: 'draft-1',
        caseId,
        payload: {generalApplication: {applicationFee: {amount: 30}}},
        createdAt: '2026-11-01T00:00:00.000Z',
        updatedAt: '2026-11-01T00:00:00.000Z',
        expiresAt: '2027-05-01T00:00:00.000Z',
      },
      responses: [],
    });

    const claim = await inContext(() => getCaseDataFromStore(caseId, true));

    expect(claim.generalApplication?.applicationFee).toEqual({amount: 30});
    expect(draftStoreClient.set).not.toHaveBeenCalled();
  });

  it('continues a response draft in Redis when Redis already has it', async () => {
    const responseKey = '9876543210987654user-1';
    redis.set(responseKey, JSON.stringify({agreeToOrder: 'yes'}));
    const response = Object.assign(new GaResponse(), {agreeToOrder: 'no', draftResponseCreatedAt: new Date()});

    await inContext(() => saveDraftGARespondentResponse(responseKey, response));

    expect(JSON.parse(redis.get(responseKey) as string).agreeToOrder).toBe('no');
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it('writes a new response draft to the database and does not create a Redis key', async () => {
    const responseKey = '9876543210987654user-1';
    const response = Object.assign(new GaResponse(), {agreeToOrder: 'yes'});

    await inContext(() => saveDraftGARespondentResponse(responseKey, response));

    expect(redis.has(responseKey)).toBe(false);
    expect(mockedSave).toHaveBeenCalledWith(req, caseId, '9876543210987654', expect.objectContaining({
      response: expect.objectContaining({agreeToOrder: 'yes'}),
    }));
  });

  it('reads a database response without copying it into Redis', async () => {
    const responseKey = '9876543210987654user-1';
    mockedGetResponse.mockResolvedValue({
      draftId: 'draft-1',
      caseId,
      applicationId: '9876543210987654',
      payload: {response: {agreeToOrder: 'yes'}},
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
      expiresAt: '2027-05-01T00:00:00.000Z',
    });

    const loaded = await inContext(() => getDraftGARespondentResponse(responseKey));

    expect(loaded.agreeToOrder).toBe('yes');
    expect(redis.has(responseKey)).toBe(false);
  });

  it('keeps documents in Redis when the response draft is already there', async () => {
    const responseKey = '9876543210987654user-1';
    redis.set(responseKey, JSON.stringify({agreeToOrder: 'yes'}));
    const documents = [new UploadGAFiles()];

    await inContext(() => saveGADocumentsInDraftStore(responseKey, documents));

    expect(redis.has(responseKey + 'DOCKEY')).toBe(true);
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it('writes new documents to the database when neither Redis key exists', async () => {
    const responseKey = '9876543210987654user-1';
    const documents = [new UploadGAFiles()];
    mockedGetResponse.mockResolvedValue(null);

    await inContext(() => saveGADocumentsInDraftStore(responseKey, documents));

    expect(redis.has(responseKey + 'DOCKEY')).toBe(false);
    expect(mockedSave).toHaveBeenCalledWith(req, caseId, '9876543210987654', {documents});
  });

  it('reads database documents without copying them into Redis', async () => {
    const responseKey = '9876543210987654user-1';
    const documents = [new UploadGAFiles()];
    mockedGetResponse.mockResolvedValue({
      draftId: 'draft-1',
      caseId,
      applicationId: '9876543210987654',
      payload: {documents},
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
      expiresAt: '2027-05-01T00:00:00.000Z',
    });

    await expect(inContext(() => getGADocumentsFromDraftStore(responseKey))).resolves.toEqual(documents);
    expect(redis.has(responseKey + 'DOCKEY')).toBe(false);
  });

  it('continues help-with-fees in Redis when Redis already has it', async () => {
    const responseKey = '9876543210987654user-1';
    redis.set(responseKey, JSON.stringify({helpWithFeesRequested: 'yes'}));
    const helpWithFees = Object.assign(new GaHelpWithFees(), {helpWithFeesRequested: 'no'});

    await inContext(() => saveDraftGAHWFDetails(responseKey, helpWithFees));

    expect(JSON.parse(redis.get(responseKey) as string).helpWithFeesRequested).toBe('no');
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it('writes new help-with-fees details to the database', async () => {
    const responseKey = '9876543210987654user-1';
    const helpWithFees = Object.assign(new GaHelpWithFees(), {helpWithFeesRequested: 'yes'});
    mockedGetResponse.mockResolvedValue(null);

    await inContext(() => saveDraftGAHWFDetails(responseKey, helpWithFees));

    expect(redis.has(responseKey)).toBe(false);
    expect(mockedSave).toHaveBeenCalledWith(req, caseId, '9876543210987654', {
      helpWithFees: expect.objectContaining({helpWithFeesRequested: 'yes'}),
    });
  });

  it('reads database help-with-fees details without copying them into Redis', async () => {
    const responseKey = '9876543210987654user-1';
    mockedGetResponse.mockResolvedValue({
      draftId: 'draft-1',
      caseId,
      applicationId: '9876543210987654',
      payload: {helpWithFees: {helpWithFeesRequested: 'yes'}},
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
      expiresAt: '2027-05-01T00:00:00.000Z',
    });

    const loaded = await inContext(() => getDraftGAHWFDetails(responseKey));

    expect(loaded.helpWithFeesRequested).toBe('yes');
    expect(redis.has(responseKey)).toBe(false);
  });
});
