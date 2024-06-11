import * as launchDarklyClient from '../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {isMintiEnabled} from '../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');
const mockCheckFlagEnabled = launchDarklyClient.isMintiEnabled as jest.Mock;

describe('isMintiEnabledForCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when minti LD toggle off', async () => {
    mockCheckFlagEnabled.mockReturnValue(false);
    const result = await isMintiEnabled();
    expect(result).toBe(false);
  });

  it('should return true when minti LD toggle on', async () => {
    mockCheckFlagEnabled.mockReturnValue(true);
    const result = await isMintiEnabled();
    expect(result).toBe(true);
  });

});
