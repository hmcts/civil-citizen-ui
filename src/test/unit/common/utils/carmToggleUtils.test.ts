import {isCarmApplicableAndSmallClaim} from 'common/utils/carmToggleUtils';
import {Claim} from 'models/claim';

jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('isCarmEnabledForCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when carmApplicable is true and the claim is smallClaim', async () => {
    const mockClaim = {
      isSmallClaimsTrackDQ: true,
    } as unknown as Claim;
    const result = await isCarmApplicableAndSmallClaim(true, mockClaim);
    expect(result).toBe(true);
  });

  it('should return false when carmApplicable is true and the claim is not smallClaim', async () => {
    const mockClaim = {
      isSmallClaimsTrackDQ: false,
    } as unknown as Claim;
    const result = await isCarmApplicableAndSmallClaim(true, mockClaim);
    expect(result).toBe(false);
  });

  it('should return false when carmApplicable is false and the claim is not smallClaim', async () => {
    const mockClaim = {
      isSmallClaimsTrackDQ: false,
    } as unknown as Claim;
    const result = await isCarmApplicableAndSmallClaim(false, mockClaim);
    expect(result).toBe(false);
  });
});
