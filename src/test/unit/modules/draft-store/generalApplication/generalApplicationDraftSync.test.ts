import {AppRequest} from 'common/models/AppRequest';
import {GaResponse} from 'common/models/generalApplication/response/gaResponse';
import {generalApplicationRequestContext} from 'modules/draft-store/generalApplication/generalApplicationRequestContext';
import {loadResponseDraft} from 'modules/draft-store/generalApplication/generalApplicationDraftSync';
import {getGeneralApplicationResponseDraft} from 'modules/draft-store/generalApplication/generalApplicationDraftDbService';
import {isGeneralApplicationDraftDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';

jest.mock('modules/draft-store/generalApplication/generalApplicationDraftDbService');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isGeneralApplicationDraftDatabaseEnabled: jest.fn(),
}));

const mockedGetResponse = getGeneralApplicationResponseDraft as jest.MockedFunction<typeof getGeneralApplicationResponseDraft>;
const mockedFlag = isGeneralApplicationDraftDatabaseEnabled as jest.MockedFunction<typeof isGeneralApplicationDraftDatabaseEnabled>;

describe('generalApplicationDraftSync', () => {
  const req = {
    params: {id: '1234567890123456', appId: '9876543210987654'},
    session: {user: {id: 'user-1', accessToken: 'token'}},
  } as unknown as AppRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('falls back to the durable response when Redis has no draft', async () => {
    mockedFlag.mockResolvedValue(true);
    mockedGetResponse.mockResolvedValue({
      draftId: 'draft-1',
      caseId: '1234567890123456',
      applicationId: '9876543210987654',
      payload: {response: {agreeToOrder: 'yes'}},
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
      expiresAt: '2027-05-01T00:00:00.000Z',
    });

    const response = await generalApplicationRequestContext.run(req, () => loadResponseDraft());

    expect(response).toBeInstanceOf(GaResponse);
    expect(response?.agreeToOrder).toBe('yes');
    expect(response?.draftResponseCreatedAt).toEqual(new Date('2026-11-01T00:00:00.000Z'));
    expect(mockedGetResponse).toHaveBeenCalledWith(req, '9876543210987654');
  });

  it('does not read the durable store when the flag is off', async () => {
    mockedFlag.mockResolvedValue(false);

    const response = await generalApplicationRequestContext.run(req, () => loadResponseDraft());

    expect(response).toBeNull();
    expect(mockedGetResponse).not.toHaveBeenCalled();
  });

  it('does not return an expired response draft', async () => {
    mockedFlag.mockResolvedValue(true);
    mockedGetResponse.mockResolvedValue(null);

    const response = await generalApplicationRequestContext.run(req, () => loadResponseDraft());

    expect(response).toBeNull();
  });
});
