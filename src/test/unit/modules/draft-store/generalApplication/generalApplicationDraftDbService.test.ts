import axios from 'axios';
import {AppRequest} from 'common/models/AppRequest';
import {
  getGeneralApplicationDraftsForCase,
  getGeneralApplicationResponseDraft,
  saveGeneralApplicationDraft,
} from 'modules/draft-store/generalApplication/generalApplicationDraftDbService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('generalApplicationDraftDbService', () => {
  const req = {
    session: {user: {id: 'user-1', accessToken: 'token'}},
  } as AppRequest;

  beforeEach(() => {
    jest.clearAllMocks();
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

    const result = await getGeneralApplicationDraftsForCase(req, '1234567890123456');

    expect(result.responses).toHaveLength(2);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/dashboard/draft-general-applications/case/1234567890123456'),
      expect.objectContaining({headers: expect.objectContaining({Authorization: 'Bearer token'})}),
    );
  });

  it('returns null when the response draft is missing', async () => {
    mockedAxios.isAxiosError.mockReturnValueOnce(true);
    mockedAxios.get.mockRejectedValueOnce({isAxiosError: true, response: {status: 404}});

    await expect(getGeneralApplicationResponseDraft(req, '9876543210987654')).resolves.toBeNull();
  });

  it('updates the existing draft when create returns a conflict', async () => {
    mockedAxios.isAxiosError.mockReturnValueOnce(true);
    mockedAxios.post.mockRejectedValueOnce({isAxiosError: true, response: {status: 409}});
    mockedAxios.get.mockResolvedValueOnce({
      data: {draftId: 'existing-draft', applicationId: '9876543210987654', payload: {response: {agreeToOrder: 'yes'}}},
    });
    mockedAxios.put.mockResolvedValueOnce({
      data: {draftId: 'existing-draft', payload: {response: {agreeToOrder: 'no'}}},
    });

    const saved = await saveGeneralApplicationDraft(req, '1234567890123456', '9876543210987654', {
      response: {agreeToOrder: 'no'},
    });

    expect(saved.draftId).toBe('existing-draft');
    expect(mockedAxios.put).toHaveBeenCalledWith(
      expect.stringContaining('/dashboard/draft-general-applications/existing-draft'),
      expect.objectContaining({applicationId: '9876543210987654'}),
      expect.any(Object),
    );
  });
});
