const mockVariation = jest.fn();

jest.mock('@launchdarkly/node-server-sdk', () => ({
  init: jest.fn(() => ({
    waitForInitialization: jest.fn(() => Promise.resolve({variation: mockVariation})),
  })),
}));

describe('isCancelUnissuedClaimSpecEnabled', () => {
  const originalSdk = process.env.LAUNCH_DARKLY_SDK;

  const loadFlagFunction = () => {
    let fn: () => Promise<boolean>;
    jest.isolateModules(() => {
      fn = require('../../../../../main/app/auth/launchdarkly/launchDarklyClient').isCancelUnissuedClaimSpecEnabled;
    });
    return fn;
  };

  beforeEach(() => {
    mockVariation.mockReset();
    process.env.LAUNCH_DARKLY_SDK = 'test-sdk-key';
  });

  afterAll(() => {
    if (originalSdk === undefined) {
      delete process.env.LAUNCH_DARKLY_SDK;
    } else {
      process.env.LAUNCH_DARKLY_SDK = originalSdk;
    }
  });

  it('should ask LaunchDarkly with a default of true so the feature is on when the flag is not defined', async () => {
    mockVariation.mockImplementation((key: string, user: unknown, defaultValue: boolean) => Promise.resolve(defaultValue));

    await expect(loadFlagFunction()()).resolves.toBe(true);
    expect(mockVariation).toHaveBeenCalledWith('cui-cancel-unissued-claim-spec', expect.anything(), true);
  });

  it('should return false when the flag is turned off in LaunchDarkly', async () => {
    mockVariation.mockResolvedValue(false);

    await expect(loadFlagFunction()()).resolves.toBe(false);
  });

  it('should return true when LaunchDarkly is not configured', async () => {
    process.env.LAUNCH_DARKLY_SDK = '';
    jest.resetModules();
    jest.doMock('config', () => ({get: jest.fn(() => '')}));

    await expect(loadFlagFunction()()).resolves.toBe(true);
    expect(mockVariation).not.toHaveBeenCalled();
    jest.dontMock('config');
  });
});
