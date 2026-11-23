import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {GaHelpWithFees} from 'common/models/generalApplication/gaHelpWithFees';
import {GaResponse} from 'common/models/generalApplication/response/gaResponse';
import {UploadGAFiles} from 'common/models/generalApplication/uploadGAFiles';
import {isGeneralApplicationDraftDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {
  bindGeneralApplicationRequest,
  generalApplicationRequestContext,
} from 'modules/draft-store/generalApplication/generalApplicationRequestContext';
import {
  deleteApplicationDraftForCase,
  deleteApplicationDraftsForUser,
  deleteResponseDraftForApplication,
  getGeneralApplicationDraftsForCase,
  getGeneralApplicationResponseDraft,
  saveGeneralApplicationDraft,
  updateGeneralApplicationDraft,
} from 'modules/draft-store/generalApplication/generalApplicationDraftDbService';
import {
  deleteDurableApplicationDraft,
  deleteDurableApplicationDraftsForUser,
  deleteDurableResponseDraft,
  hydrateGeneralApplicationDraft,
  loadDurableGeneralApplication,
  loadHelpWithFeesDraft,
  loadResponseDocuments,
  loadResponseDraft,
  syncGeneralApplicationDraft,
  syncHelpWithFeesDraft,
  syncResponseDocuments,
  syncResponseDraft,
  withoutDurableWrite,
} from 'modules/draft-store/generalApplication/generalApplicationDraftSync';

jest.mock('modules/draft-store/generalApplication/generalApplicationDraftDbService');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isGeneralApplicationDraftDatabaseEnabled: jest.fn(),
}));

const mockedGetResponse = getGeneralApplicationResponseDraft as jest.MockedFunction<typeof getGeneralApplicationResponseDraft>;
const mockedGetCase = getGeneralApplicationDraftsForCase as jest.MockedFunction<typeof getGeneralApplicationDraftsForCase>;
const mockedSave = saveGeneralApplicationDraft as jest.MockedFunction<typeof saveGeneralApplicationDraft>;
const mockedUpdate = updateGeneralApplicationDraft as jest.MockedFunction<typeof updateGeneralApplicationDraft>;
const mockedDeleteResponse = deleteResponseDraftForApplication as jest.MockedFunction<typeof deleteResponseDraftForApplication>;
const mockedDeleteApplication = deleteApplicationDraftForCase as jest.MockedFunction<typeof deleteApplicationDraftForCase>;
const mockedDeleteUser = deleteApplicationDraftsForUser as jest.MockedFunction<typeof deleteApplicationDraftsForUser>;
const mockedFlag = isGeneralApplicationDraftDatabaseEnabled as jest.MockedFunction<typeof isGeneralApplicationDraftDatabaseEnabled>;

const draft = (payload: Record<string, unknown>) => ({
  draftId: 'draft-1',
  caseId: '1234567890123456',
  applicationId: '9876543210987654',
  payload,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  expiresAt: '2027-05-01T00:00:00.000Z',
});

describe('generalApplicationDraftSync', () => {
  const req = {
    params: {id: '1234567890123456', appId: '9876543210987654'},
    session: {user: {id: 'user-1', accessToken: 'token'}},
  } as unknown as AppRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFlag.mockResolvedValue(true);
  });

  const inContext = <T>(work: () => Promise<T>): Promise<T> =>
    generalApplicationRequestContext.run(req, work);

  it('keeps the request available to later draft reads', () => {
    const next = jest.fn(() => {
      expect(generalApplicationRequestContext.getStore()).toBe(req);
    });
    bindGeneralApplicationRequest(req, {} as never, next);
    expect(next).toHaveBeenCalled();
  });

  it('falls back to the durable response when Redis has no draft', async () => {
    mockedGetResponse.mockResolvedValue(draft({response: {agreeToOrder: 'yes'}}));

    const response = await inContext(() => loadResponseDraft());

    expect(response).toBeInstanceOf(GaResponse);
    expect(response?.agreeToOrder).toBe('yes');
    expect(response?.draftResponseCreatedAt).toEqual(new Date('2026-11-01T00:00:00.000Z'));
    expect(mockedGetResponse).toHaveBeenCalledWith(req, '9876543210987654');
  });

  it('does not read the durable store when the flag is off', async () => {
    mockedFlag.mockResolvedValue(false);

    await expect(inContext(() => loadResponseDraft())).resolves.toBeNull();
    await expect(loadResponseDraft()).resolves.toBeNull();
    expect(mockedGetResponse).not.toHaveBeenCalled();
  });

  it('does not return an expired or incomplete response draft', async () => {
    mockedGetResponse.mockResolvedValueOnce(null);
    await expect(inContext(() => loadResponseDraft())).resolves.toBeNull();

    mockedGetResponse.mockResolvedValueOnce(draft({documents: []}));
    await expect(inContext(() => loadResponseDraft())).resolves.toBeNull();

    const withoutDate = draft({response: {agreeToOrder: 'yes'}});
    withoutDate.createdAt = '';
    mockedGetResponse.mockResolvedValueOnce(withoutDate);
    const response = await inContext(() => loadResponseDraft());
    expect(response?.draftResponseCreatedAt).toBeUndefined();
  });

  it('ignores a response draft when the application id is missing', async () => {
    const bareRequest = {params: {id: '1234567890123456'}, session: req.session} as unknown as AppRequest;

    await expect(generalApplicationRequestContext.run(bareRequest, () => loadResponseDraft())).resolves.toBeNull();
    expect(mockedGetResponse).not.toHaveBeenCalled();
  });

  it('creates a response draft and updates it on the next save', async () => {
    mockedGetResponse.mockResolvedValueOnce(null);
    await inContext(() => syncResponseDraft(Object.assign(new GaResponse(), {agreeToOrder: 'yes'})));
    expect(mockedSave).toHaveBeenCalledWith(req, '1234567890123456', '9876543210987654', expect.objectContaining({
      response: expect.objectContaining({agreeToOrder: 'yes'}),
    }));

    mockedGetResponse.mockResolvedValueOnce(draft({response: {agreeToOrder: 'yes'}}));
    await inContext(() => syncResponseDraft(Object.assign(new GaResponse(), {agreeToOrder: 'no'})));
    expect(mockedUpdate).toHaveBeenCalledWith(
      req,
      'draft-1',
      '1234567890123456',
      '9876543210987654',
      expect.objectContaining({response: expect.objectContaining({agreeToOrder: 'no'})}),
    );
  });

  it('does not save a response draft without a request or while a cache write is in progress', async () => {
    await syncResponseDraft(new GaResponse());
    await withoutDurableWrite(() => inContext(() => syncResponseDraft(new GaResponse())));
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it('saves response documents and does not create a draft when they are cleared', async () => {
    mockedGetResponse.mockResolvedValueOnce(null);
    await inContext(() => syncResponseDocuments([]));
    expect(mockedSave).not.toHaveBeenCalled();

    const documents = [{fileName: 'evidence.pdf'}] as UploadGAFiles[];
    mockedGetResponse.mockResolvedValueOnce(null);
    await inContext(() => syncResponseDocuments(documents));
    expect(mockedSave).toHaveBeenCalledWith(req, '1234567890123456', '9876543210987654', {documents});

    mockedGetResponse.mockResolvedValueOnce(draft({documents}));
    await inContext(() => syncResponseDocuments([]));
    expect(mockedUpdate).toHaveBeenCalledWith(req, 'draft-1', '1234567890123456', '9876543210987654', {documents: []});
  });

  it('loads response documents from the durable draft', async () => {
    const documents = [{fileName: 'evidence.pdf'}] as UploadGAFiles[];
    mockedGetResponse.mockResolvedValueOnce(draft({documents}));
    await expect(inContext(() => loadResponseDocuments())).resolves.toEqual(documents);

    mockedGetResponse.mockResolvedValueOnce(draft({response: {}}));
    await expect(inContext(() => loadResponseDocuments())).resolves.toBeNull();

    mockedFlag.mockResolvedValueOnce(false);
    await expect(inContext(() => loadResponseDocuments())).resolves.toBeNull();
  });

  it('saves and loads a help-with-fees draft', async () => {
    const helpWithFees = Object.assign(new GaHelpWithFees(), {helpWithFeesRequested: 'yes'});
    mockedGetResponse.mockResolvedValueOnce(null);
    await inContext(() => syncHelpWithFeesDraft(helpWithFees));
    expect(mockedSave).toHaveBeenCalledWith(req, '1234567890123456', '9876543210987654', {
      helpWithFees: expect.objectContaining({helpWithFeesRequested: 'yes'}),
    });

    mockedGetResponse.mockResolvedValueOnce(draft({helpWithFees: {helpWithFeesRequested: 'yes'}}));
    const loaded = await inContext(() => loadHelpWithFeesDraft());
    expect(loaded).toBeInstanceOf(GaHelpWithFees);
    expect(loaded?.helpWithFeesRequested).toBe('yes');

    mockedGetResponse.mockResolvedValueOnce(draft({}));
    await expect(inContext(() => loadHelpWithFeesDraft())).resolves.toBeNull();
  });

  it('deletes the durable response, application, and user drafts when the flag is on', async () => {
    await inContext(() => deleteDurableResponseDraft());
    await deleteDurableApplicationDraft(req, '1234567890123456');
    await deleteDurableApplicationDraftsForUser(req);

    expect(mockedDeleteResponse).toHaveBeenCalledWith(req, '9876543210987654');
    expect(mockedDeleteApplication).toHaveBeenCalledWith(req, '1234567890123456');
    expect(mockedDeleteUser).toHaveBeenCalledWith(req);
  });

  it('does not delete durable drafts when the flag is off or the id is unusable', async () => {
    mockedFlag.mockResolvedValue(false);
    await inContext(() => deleteDurableResponseDraft());
    await deleteDurableApplicationDraft(req, '1234567890123456');
    await deleteDurableApplicationDraftsForUser(req);
    await deleteDurableApplicationDraft(req, ' ');

    expect(mockedDeleteResponse).not.toHaveBeenCalled();
    expect(mockedDeleteApplication).not.toHaveBeenCalled();
    expect(mockedDeleteUser).not.toHaveBeenCalled();
  });

  it('writes an in-progress application when the redis key belongs to the case', async () => {
    const claim = {generalApplication: {applicationTypes: []}} as unknown as Claim;

    await syncGeneralApplicationDraft('other-key', claim);
    await inContext(() => syncGeneralApplicationDraft('1234567890123456', claim));
    await inContext(() => syncGeneralApplicationDraft('1234567890123456user-1', claim));

    expect(mockedSave).toHaveBeenCalledTimes(2);
    expect(mockedSave).toHaveBeenCalledWith(req, '1234567890123456', undefined, {
      generalApplication: claim.generalApplication,
    });
  });

  it('does not write an application draft when there is nothing to save', async () => {
    await inContext(() => syncGeneralApplicationDraft('1234567890123456', {} as Claim));
    mockedFlag.mockResolvedValue(false);
    await inContext(() => syncGeneralApplicationDraft('1234567890123456', {generalApplication: {}} as Claim));

    expect(mockedSave).not.toHaveBeenCalled();
  });

  it('hydrates an application from the durable store and leaves an existing one in place', async () => {
    const existing = {generalApplication: {applicationTypes: [{option: 'KEEP'}]}} as unknown as Claim;
    await expect(inContext(() => hydrateGeneralApplicationDraft('1234567890123456', existing))).resolves.toBe(false);

    const empty = {} as Claim;
    mockedGetCase.mockResolvedValueOnce({
      application: draft({generalApplication: {applicationTypes: [{option: 'RESTORE'}]}}),
      responses: [],
    });
    await expect(inContext(() => hydrateGeneralApplicationDraft('1234567890123456', empty))).resolves.toBe(true);
    expect(empty.generalApplication?.applicationTypes).toEqual([{option: 'RESTORE'}]);

    mockedGetCase.mockResolvedValueOnce({application: null, responses: []});
    await expect(inContext(() => hydrateGeneralApplicationDraft('1234567890123456', {} as Claim))).resolves.toBe(false);
  });

  it('loads an application for the dashboard', async () => {
    mockedGetCase.mockResolvedValueOnce({
      application: draft({generalApplication: {applicationTypes: [{option: 'RESTORE'}]}}),
      responses: [],
    });

    const loaded = await loadDurableGeneralApplication(req, '1234567890123456');

    expect(loaded?.applicationTypes).toEqual([{option: 'RESTORE'}]);
    mockedGetCase.mockResolvedValueOnce({application: null, responses: []});
    await expect(loadDurableGeneralApplication(req, '1234567890123456')).resolves.toBeNull();
    await expect(loadDurableGeneralApplication(req, ' ')).resolves.toBeNull();
  });
});
