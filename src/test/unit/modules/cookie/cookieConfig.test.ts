const mockCookieManager = {
  on: jest.fn(),
  init: jest.fn(),
};

jest.mock('@hmcts/cookie-manager', () => ({
  __esModule: true,
  default: mockCookieManager,
}));

describe('cookieConfig dynatrace preference handling', () => {
  const buildMockWindow = () => ({
    dataLayer: [] as Record<string, unknown>[],
    setTimeout: setTimeout as unknown as Window['setTimeout'],
    clearTimeout: clearTimeout as unknown as Window['clearTimeout'],
  });

  const assignMockWindow = () => {
    (global as unknown as { window: Window & typeof globalThis }).window = buildMockWindow() as Window & typeof globalThis;
  };

  const cleanupWindow = () => {
    delete (global as { window?: Window & typeof globalThis }).window;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockCookieManager.on.mockClear();
    mockCookieManager.init.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    cleanupWindow();
    jest.resetModules();
  });

  it('retries enabling dynatrace until the script is ready', () => {
    jest.isolateModules(() => {
      assignMockWindow();
      const {updateDynatracePreference} = require('../../../../main/modules/cookie/cookieConfig');

      const enable = jest.fn();
      const enableSessionReplay = jest.fn();
      const disable = jest.fn();
      const disableSessionReplay = jest.fn();

      updateDynatracePreference({analytics: 'on', apm: 'on'});

      expect(enable).not.toHaveBeenCalled();

      (global as typeof globalThis & { window: Window & typeof globalThis }).window.dtrum = {
        enable,
        enableSessionReplay,
        disable,
        disableSessionReplay,
      } as unknown as Window['dtrum'];

      jest.runOnlyPendingTimers();

      expect(enable).toHaveBeenCalledTimes(1);
      expect(enableSessionReplay).toHaveBeenCalledTimes(1);
      expect(disable).not.toHaveBeenCalled();
    });
  });

  it('applies the latest pending preference when dynatrace becomes ready', () => {
    jest.isolateModules(() => {
      assignMockWindow();
      const {updateDynatracePreference} = require('../../../../main/modules/cookie/cookieConfig');

      const enable = jest.fn();
      const enableSessionReplay = jest.fn();
      const disable = jest.fn();
      const disableSessionReplay = jest.fn();

      updateDynatracePreference({analytics: 'on', apm: 'on'});
      updateDynatracePreference({analytics: 'on', apm: 'off'});

      (global as typeof globalThis & { window: Window & typeof globalThis }).window.dtrum = {
        enable,
        enableSessionReplay,
        disable,
        disableSessionReplay,
      } as unknown as Window['dtrum'];

      jest.runOnlyPendingTimers();

      expect(disable).toHaveBeenCalledTimes(1);
      expect(disableSessionReplay).toHaveBeenCalledTimes(1);
      expect(enable).not.toHaveBeenCalled();
    });
  });
});
