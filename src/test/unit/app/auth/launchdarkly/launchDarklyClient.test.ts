const mockVariation = jest.fn();
const mockWaitForInitialization = jest.fn(async () => ({variation: mockVariation}));
const mockInit = jest.fn((..._args: unknown[]) => ({waitForInitialization: mockWaitForInitialization}));
const mockUpdate = jest.fn();
const mockFlag = jest.fn(() => ({
  booleanFlag() {
    return this;
  },
  variationForAll() {
    return 'flag-update';
  },
}));
const mockGetFactory = jest.fn(() => 'test-data-factory');

jest.mock('@launchdarkly/node-server-sdk', () => ({
  init: (...args: unknown[]) => mockInit(...args),
}));

jest.mock('@launchdarkly/node-server-sdk/integrations', () => ({
  TestData: jest.fn(() => ({
    update: mockUpdate,
    flag: mockFlag,
    getFactory: mockGetFactory,
  })),
}));

const loadClient = async () => {
  jest.resetModules();
  return import('app/auth/launchdarkly/launchDarklyClient');
};

describe('launchDarklyClient', () => {
  const originalSdk = process.env.LAUNCH_DARKLY_SDK;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockVariation.mockReset();
    mockVariation.mockResolvedValue(true);
    mockInit.mockClear();
    mockUpdate.mockReset();
    mockUpdate.mockResolvedValue(undefined);
    mockFlag.mockClear();
    process.env.LAUNCH_DARKLY_SDK = 'sdk-test';
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.LAUNCH_DARKLY_SDK = originalSdk;
    process.env.NODE_ENV = originalEnv;
  });

  it('reads flags from the initialised client', async () => {
    const client = await loadClient();
    const submitted = new Date('2024-01-02T00:00:00.000Z');

    await expect(client.getFlagValue('shutter-cui-service', '1700000000')).resolves.toBe(true);
    await expect(client.getEaFlagValueForGaLips('ea-courts-whitelisted-for-ga-lips', 'London')).resolves.toBe(true);
    await expect(client.isGaForLipsEnabledAndLocationWhiteListed('London')).resolves.toBe(true);
    await expect(client.isServiceShuttered()).resolves.toBe(true);
    await expect(client.isPcqShutterOn()).resolves.toBe(true);
    await expect(client.isGaForLipsEnabled()).resolves.toBe(true);
    await expect(client.isHmctsAccessMigrationEnabled()).resolves.toBe(true);
    await expect(client.isDashboardEnabledForCase(submitted)).resolves.toBe(true);
    await expect(client.isCarmEnabledForCase(submitted)).resolves.toBe(true);
    await expect(client.isMintiEnabledForCase(submitted)).resolves.toBe(true);
    await expect(client.isCaseWorkerEventsEnabled()).resolves.toBe(true);
    await expect(client.isQueryManagementEnabled(submitted)).resolves.toBe(true);
    await expect(client.isWelshEnabledForMainCase()).resolves.toBe(true);
    await expect(client.isDefendantNoCOnlineForCase(submitted)).resolves.toBe(true);
    await expect(client.isCuiGaNroEnabled()).resolves.toBe(true);
    await expect(client.isJudgmentBufferEnabled()).resolves.toBe(true);
    await expect(client.isDraftClaimDatabaseEnabled()).resolves.toBe(true);
    await expect(client.isUserCaseRolesSessionCacheEnabled()).resolves.toBe(true);

    expect(mockInit).toHaveBeenCalledWith('sdk-test');
    expect(mockVariation).toHaveBeenCalled();
  });

  it('initialises the e2e test data source and updates a flag', async () => {
    process.env.NODE_ENV = 'e2eTest';
    const client = await loadClient();

    await client.isServiceShuttered();
    await client.updateE2EKey('shutter-pcq', true);

    expect(mockInit).toHaveBeenCalledWith('sdk-test', {updateProcessor: 'test-data-factory'});
    expect(mockFlag).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith('flag-update');
  });

  it('returns no flag value when the SDK key is missing', async () => {
    delete process.env.LAUNCH_DARKLY_SDK;
    const client = await loadClient();

    await expect(client.getFlagValue('shutter-cui-service')).resolves.toBeUndefined();
    await expect(client.getEaFlagValueForGaLips('ea-courts', 'London')).resolves.toBeUndefined();
    await expect(client.isUserCaseRolesSessionCacheEnabled()).resolves.toBe(true);
    expect(mockInit).not.toHaveBeenCalled();
  });
});
