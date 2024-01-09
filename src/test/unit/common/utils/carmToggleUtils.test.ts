import {isCarmApplicableAndSmallClaim, isCarmEnabledForCase} from 'common/utils/carmToggleUtils';
import * as launchDarklyClient from '../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';

jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');
const mockCheckFlagEnabled = launchDarklyClient.isCARMEnabled as jest.Mock;

describe('isCarmEnabledForCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return false when date is before specified date', async () => {
    const date = new Date('2024-01-01T17:59');
    const carmDate = new Date('2024-01-02T17:59');
    mockCheckFlagEnabled.mockReturnValue(true);
    const result = await isCarmEnabledForCase(date, carmDate);
    expect(result).toBe(false);
  });

  it('should return false when date is on specified date but LD toggle off', async () => {
    const date = new Date('2024-01-01T17:59');
    const carmDate = new Date('2024-01-01T17:59');
    mockCheckFlagEnabled.mockReturnValue(false);
    const result = await isCarmEnabledForCase(date, carmDate);
    expect(result).toBe(false);
  });

  it('should return true when date is on specified date', async () => {
    const date = new Date('2023-01-01T17:59');
    const carmDate = new Date('2023-01-01T17:59');
    mockCheckFlagEnabled.mockReturnValue(true);
    const result = await isCarmEnabledForCase(date, carmDate);
    expect(result).toBe(true);
  });

  it('should return true when date is after specified date', async () => {
    const date = new Date('2023-01-02T17:59');
    const carmDate = new Date('2023-01-01T17:59');
    mockCheckFlagEnabled.mockReturnValue(true);
    const result = await isCarmEnabledForCase(date, carmDate);
    expect(result).toBe(true);
  });

  it('should return false when claim submitted date is before specified date', async () => {
    const mockClaim = {
      submittedDate: '2023-01-01T17:59',
    } as unknown as Claim;

    const date = mockClaim.submittedDate;
    const carmDate = new Date('2023-01-02T17:59');
    mockCheckFlagEnabled.mockReturnValue(true);
    const result = await isCarmEnabledForCase(date, carmDate);
    expect(result).toBe(false);
  });

  it('should return true when claim submitted date is after specified date', async () => {
    const mockClaim = {
      submittedDate: '2023-01-02T17:59',
    } as unknown as Claim;

    const date = mockClaim.submittedDate;
    const carmDate = new Date('2023-01-01T17:59');
    mockCheckFlagEnabled.mockReturnValue(true);
    const result = await isCarmEnabledForCase(date, carmDate);
    expect(result).toBe(true);
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
