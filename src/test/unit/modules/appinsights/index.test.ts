import config from 'config';

const mockStartup = jest.fn();
const mockStart = jest.fn(() => mockStartup({
  samplingPercentage: mockClient.config.samplingPercentage,
  cloudRole: mockClient.context.tags['ai.cloud.role'],
  serviceName: process.env.OTEL_SERVICE_NAME,
  tracesPerSecond: mockClient.config.azureMonitorOpenTelemetryOptions?.tracesPerSecond,
}));
const mockSetSendLiveMetrics = jest.fn(() => ({start: mockStart}));
const mockTrackTrace = jest.fn();
const mockClient = {
  context: {tags: {} as Record<string, string>, keys: {cloudRole: 'ai.cloud.role'}},
  config: {
    samplingPercentage: undefined as number | undefined,
    azureMonitorOpenTelemetryOptions: undefined as {tracesPerSecond?: number} | undefined,
  },
  trackTrace: mockTrackTrace,
};

const mockSetup = jest.fn(() => ({setSendLiveMetrics: mockSetSendLiveMetrics, start: mockStart}));

jest.mock('applicationinsights', () => ({
  setup: mockSetup,
  start: mockStart,
  defaultClient: mockClient,
  get setSendLiveMetrics() {
    return mockSetSendLiveMetrics;
  },
}));

jest.mock('config');

import {AppInsights, toConnectionString} from 'modules/appinsights';

const mockConfigGet = config.get as jest.Mock;

describe('AppInsights module', () => {
  const ORIGINAL_ENV = process.env.LAUNCH_DARKLY_ENV;
  const ORIGINAL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.config.samplingPercentage = undefined;
    mockClient.config.azureMonitorOpenTelemetryOptions = undefined;
    mockClient.context.tags = {};
    mockConfigGet.mockReturnValue('test-instrumentation-key');
    mockSetSendLiveMetrics.mockImplementation(() => ({start: mockStart}));
    mockSetup.mockImplementation(() => ({setSendLiveMetrics: mockSetSendLiveMetrics, start: mockStart}));
  });

  afterEach(() => {
    if (ORIGINAL_ENV === undefined) delete process.env.LAUNCH_DARKLY_ENV;
    else process.env.LAUNCH_DARKLY_ENV = ORIGINAL_ENV;
    if (ORIGINAL_SERVICE_NAME === undefined) delete process.env.OTEL_SERVICE_NAME;
    else process.env.OTEL_SERVICE_NAME = ORIGINAL_SERVICE_NAME;
  });

  describe('toConnectionString', () => {
    it('wraps a bare instrumentation key', () => {
      expect(toConnectionString('abc-123')).toBe('InstrumentationKey=abc-123');
    });

    it('passes through an existing connection string', () => {
      const cs = 'InstrumentationKey=abc;IngestionEndpoint=https://example.in.applicationinsights.azure.com/';
      expect(toConnectionString(cs)).toBe(cs);
    });
  });

  describe('enable', () => {
    it('configures sampling before start in non-prod', () => {
      process.env.LAUNCH_DARKLY_ENV = 'perftest';
      new AppInsights().enable();
      expect(mockSetup).toHaveBeenCalledWith('InstrumentationKey=test-instrumentation-key');
      expect(mockSetSendLiveMetrics).toHaveBeenCalledWith(true);
      expect(mockClient.config.samplingPercentage).toBe(100);
      expect(mockClient.context.tags['ai.cloud.role']).toBe('civil-citizen-ui');
      expect(mockStart).toHaveBeenCalled();
      expect(mockTrackTrace).toHaveBeenCalled();
      // Assert the values at startup: SDK 3 ignores changes made afterwards.
      expect(mockStartup).toHaveBeenCalledWith({samplingPercentage: 100, cloudRole: 'civil-citizen-ui', serviceName: 'civil-citizen-ui', tracesPerSecond: 0});
    });

    it('leaves sampling untouched in prod', () => {
      process.env.LAUNCH_DARKLY_ENV = 'prod';
      new AppInsights().enable();
      expect(mockClient.config.samplingPercentage).toBeUndefined();
      expect(mockStart).toHaveBeenCalled();
    });

    it('preserves an existing production sampling setting at startup', () => {
      process.env.LAUNCH_DARKLY_ENV = 'prod';
      mockClient.config.samplingPercentage = 37;
      new AppInsights().enable();
      expect(mockStartup).toHaveBeenCalledWith({samplingPercentage: 37, cloudRole: 'civil-citizen-ui', serviceName: 'civil-citizen-ui', tracesPerSecond: 0});
    });

    it('logs an error and does not start when no instrumentation key is set', () => {
      mockConfigGet.mockReturnValue(undefined);
      process.env.LAUNCH_DARKLY_ENV = 'perftest';
      new AppInsights().enable();
      expect(mockSetup).not.toHaveBeenCalled();
      expect(mockStart).not.toHaveBeenCalled();
    });
  });
});
