import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getDraftClaimData} from 'services/dashboard/draftClaimService';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.MockedFunction<typeof getDraftClaim>;
const mockRequest = {
  session: {
    user: {
      id: 'userId',
      accessToken: 'userToken',
    },
  },
} as unknown as AppRequest;

describe('cui draft claim service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetDraftClaim.mockResolvedValue(null);
  });

  it('should load the draft claim from the durable draft manager', async () => {
    await getDraftClaimData(mockRequest);

    expect(mockGetDraftClaim).toHaveBeenCalledWith(mockRequest);
  });

  it('should return local eligibility page', async () => {
    const draftClaimData = await getDraftClaimData(mockRequest);

    expect(draftClaimData.claimCreationUrl).toBe('/eligibility');
  });
});
