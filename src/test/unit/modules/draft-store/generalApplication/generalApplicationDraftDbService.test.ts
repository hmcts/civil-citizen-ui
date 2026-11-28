import axios from 'axios';
import {AppRequest} from 'common/models/AppRequest';
import {
  deleteApplicationDraftForCase,
  deleteApplicationDraftsForUser,
  deleteGeneralApplicationDraft,
  deleteResponseDraftForApplication,
  getGeneralApplicationDraftsForCase,
  getGeneralApplicationResponseDraft,
  saveGeneralApplicationDraft,
  updateGeneralApplicationDraft,
} from 'modules/draft-store/generalApplication/generalApplicationDraftDbService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const axiosError = (status: number) => ({isAxiosError: true, response: {status}});

describe('generalApplicationDraftDbService', () => {
  const req = {
    session: {user: {id: 'user-1', accessToken: 'token'}},
  } as AppRequest;
  const caseId = '1234567890123456';
  const applicationId = '9876543210987654';

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.isAxiosError.mockImplementation((error: unknown) =>
      Boolean(error && typeof error === 'object' && (error as {isAxiosError?: boolean}).isAxiosError));
  });

  it('returns every response draft for a case', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        application: {draftId: 'app-draft', payload: {generalApplication: {applicationTypes: []}}},
        responses: [
          {draftId: 'response-1', applicationId: '111'},
          {draftId: 'response-2', applicationId: '222'},
        ],
      },
    });

    const result = await getGeneralApplicationDraftsForCase(req, caseId);

    expect(result.responses).toHaveLength(2);
    expect(result.application?.draftId).toBe('app-draft');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining(`/dashboard/draft-general-applications/case/${caseId}`),
      expect.objectContaining({headers: expect.objectContaining({Authorization: 'Bearer token'})}),
    );
  });

  it('returns empty drafts when the case response has no body', async () => {
    mockedAxios.get.mockResolvedValueOnce({data: undefined});

    const result = await getGeneralApplicationDraftsForCase(req, caseId);

    expect(result).toEqual({application: null, responses: []});
  });

  it('rethrows when the case lookup fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('unavailable'));

    await expect(getGeneralApplicationDraftsForCase(req, caseId)).rejects.toThrow('unavailable');
  });

  it('returns null when the response draft is missing', async () => {
    mockedAxios.get.mockRejectedValueOnce(axiosError(404));

    await expect(getGeneralApplicationResponseDraft(req, applicationId)).resolves.toBeNull();
  });

  it('rethrows when loading a response draft fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(axiosError(500));

    await expect(getGeneralApplicationResponseDraft(req, applicationId)).rejects.toEqual(axiosError(500));
  });

  it('creates a draft', async () => {
    mockedAxios.post.mockResolvedValueOnce({data: {draftId: 'created', payload: {response: {agreeToOrder: 'yes'}}}});

    const saved = await saveGeneralApplicationDraft(req, caseId, undefined, {response: {agreeToOrder: 'yes'}});

    expect(saved.draftId).toBe('created');
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/dashboard/draft-general-applications'),
      {caseId, applicationId: undefined, payload: {response: {agreeToOrder: 'yes'}}},
      expect.any(Object),
    );
  });

  it('rethrows when create fails for a reason other than a conflict', async () => {
    mockedAxios.post.mockRejectedValueOnce(axiosError(500));

    await expect(saveGeneralApplicationDraft(req, caseId, applicationId, {response: {}})).rejects.toEqual(axiosError(500));
  });

  it('updates the existing response draft when create returns a conflict', async () => {
    mockedAxios.post.mockRejectedValueOnce(axiosError(409));
    mockedAxios.get.mockResolvedValueOnce({
      data: {draftId: 'existing-draft', applicationId, payload: {response: {agreeToOrder: 'yes'}}},
    });
    mockedAxios.put.mockResolvedValueOnce({
      data: {draftId: 'existing-draft', payload: {response: {agreeToOrder: 'no'}}},
    });

    const saved = await saveGeneralApplicationDraft(req, caseId, applicationId, {
      response: {agreeToOrder: 'no'},
    });

    expect(saved.draftId).toBe('existing-draft');
    expect(mockedAxios.put).toHaveBeenCalledWith(
      expect.stringContaining('/dashboard/draft-general-applications/existing-draft'),
      expect.objectContaining({applicationId}),
      expect.any(Object),
    );
  });

  it('updates the existing application draft when create returns a conflict', async () => {
    mockedAxios.post.mockRejectedValueOnce(axiosError(409));
    mockedAxios.get.mockResolvedValueOnce({
      data: {application: {draftId: 'application-draft', payload: {}}, responses: []},
    });
    mockedAxios.put.mockResolvedValueOnce({data: {draftId: 'application-draft', payload: {}}});

    const saved = await saveGeneralApplicationDraft(req, caseId, undefined, {generalApplication: {}});

    expect(saved.draftId).toBe('application-draft');
  });

  it('throws when a conflicting draft cannot be loaded', async () => {
    mockedAxios.post.mockRejectedValueOnce(axiosError(409));
    mockedAxios.get.mockResolvedValueOnce({data: {application: null, responses: []}});

    await expect(saveGeneralApplicationDraft(req, caseId, undefined, {generalApplication: {}}))
      .rejects.toThrow('duplicate draft');
  });

  it('rejects a draft id that is not safe to put in a URL', async () => {
    await expect(updateGeneralApplicationDraft(req, '../other', caseId, applicationId, {}))
      .rejects.toThrow('invalid draftId');
    expect(mockedAxios.put).not.toHaveBeenCalled();
  });

  it('rethrows when an update fails', async () => {
    mockedAxios.put.mockRejectedValueOnce(axiosError(500));

    await expect(updateGeneralApplicationDraft(req, 'existing-draft', caseId, applicationId, {}))
      .rejects.toEqual(axiosError(500));
  });

  it('deletes a draft and ignores a missing draft', async () => {
    mockedAxios.delete.mockResolvedValueOnce({});
    await deleteGeneralApplicationDraft(req, 'existing-draft');

    mockedAxios.delete.mockRejectedValueOnce(axiosError(404));
    await deleteGeneralApplicationDraft(req, 'missing-draft');

    expect(mockedAxios.delete).toHaveBeenCalledTimes(2);
  });

  it('rethrows when deleting a draft fails', async () => {
    mockedAxios.delete.mockRejectedValueOnce(axiosError(500));

    await expect(deleteGeneralApplicationDraft(req, 'existing-draft')).rejects.toEqual(axiosError(500));
  });

  it('deletes the application and response drafts and ignores a missing draft', async () => {
    mockedAxios.delete.mockResolvedValue({});

    await deleteApplicationDraftForCase(req, caseId);
    await deleteResponseDraftForApplication(req, applicationId);
    await deleteApplicationDraftsForUser(req);

    mockedAxios.delete.mockRejectedValueOnce(axiosError(404));
    await deleteApplicationDraftForCase(req, caseId);
    mockedAxios.delete.mockRejectedValueOnce(axiosError(404));
    await deleteResponseDraftForApplication(req, applicationId);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining(`/case/${caseId}`),
      expect.any(Object),
    );
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining(`/application/${applicationId}`),
      expect.any(Object),
    );
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/user-applications'),
      expect.any(Object),
    );
  });

  it('rethrows when deleting an application or response draft fails', async () => {
    mockedAxios.delete.mockRejectedValueOnce(axiosError(500));
    await expect(deleteApplicationDraftForCase(req, caseId)).rejects.toEqual(axiosError(500));

    mockedAxios.delete.mockRejectedValueOnce(new Error('unavailable'));
    await expect(deleteResponseDraftForApplication(req, applicationId)).rejects.toThrow('unavailable');

    mockedAxios.delete.mockRejectedValueOnce({status: 500});
    await expect(deleteApplicationDraftsForUser(req)).rejects.toEqual({status: 500});
  });

  it('requires an access token', async () => {
    const unsigned = {session: {user: {}}} as AppRequest;

    await expect(getGeneralApplicationDraftsForCase(unsigned, caseId)).rejects.toThrow('access token is required');
  });
});
