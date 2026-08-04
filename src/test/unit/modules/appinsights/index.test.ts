import config from 'config';

const mockStart = jest.fn();
const mockSetSendLiveMetrics = jest.fn(() => ({start: mockStart}));
const mockAddTelemetryProcessor = jest.fn();
const mockTrackTrace = jest.fn();
const mockClient = {
  context: {tags: {} as Record<string, string>, keys: {cloudRole: 'ai.cloud.role'}},
  config: {samplingPercentage: undefined as number | undefined},
  addTelemetryProcessor: mockAddTelemetryProcessor,
  trackTrace: mockTrackTrace,
};

jest.mock('applicationinsights', () => ({
  setup: jest.fn(() => ({setSendLiveMetrics: mockSetSendLiveMetrics})),
  defaultClient: mockClient,
}));

jest.mock('config');

import {AppInsights, keepFailuresTelemetryProcessor} from 'modules/appinsights';

const mockConfigGet = config.get as jest.Mock;

const envelope = (baseType: string, success?: boolean) => ({
  sampleRate: 1,
  data: {baseType, baseData: {success}},
});

describe('AppInsights module', () => {
  const ORIGINAL_ENV = process.env.LAUNCH_DARKLY_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.config.samplingPercentage = undefined;
    mockClient.context.tags = {};
    mockConfigGet.mockReturnValue('test-instrumentation-key');
  });

  afterAll(() => {
    process.env.LAUNCH_DARKLY_ENV = ORIGINAL_ENV;
  });

  describe('keepFailuresTelemetryProcessor', () => {
    it('forces sampleRate to 100 for exceptions', () => {
      const env = envelope('ExceptionData');
      expect(keepFailuresTelemetryProcessor(env)).toBe(true);
      expect(env.sampleRate).toBe(100);
    });

    it('forces sampleRate to 100 for failed requests', () => {
      const env = envelope('RequestData', false);
      keepFailuresTelemetryProcessor(env);
      expect(env.sampleRate).toBe(100);
    });

    it('forces sampleRate to 100 for failed dependencies', () => {
      const env = envelope('RemoteDependencyData', false);
      keepFailuresTelemetryProcessor(env);
      expect(env.sampleRate).toBe(100);
    });

    it('leaves successful requests unchanged', () => {
      const env = envelope('RequestData', true);
      keepFailuresTelemetryProcessor(env);
      expect(env.sampleRate).toBe(1);
    });
  });

  describe('enable', () => {
    it('disables sampling and registers the failure-keeping processor in non-prod', () => {
      process.env.LAUNCH_DARKLY_ENV = 'perftest';
      new AppInsights().enable();
      expect(mockClient.config.samplingPercentage).toBe(100);
      expect(mockAddTelemetryProcessor).toHaveBeenCalledWith(keepFailuresTelemetryProcessor);
      expect(mockTrackTrace).toHaveBeenCalled();
    });

    it('leaves sampling untouched in prod', () => {
      process.env.LAUNCH_DARKLY_ENV = 'prod';
      new AppInsights().enable();
      expect(mockClient.config.samplingPercentage).toBeUndefined();
      expect(mockAddTelemetryProcessor).not.toHaveBeenCalled();
    });

    it('logs an error and does not start when no instrumentation key is set', () => {
      mockConfigGet.mockReturnValue(undefined);
      process.env.LAUNCH_DARKLY_ENV = 'perftest';
      new AppInsights().enable();
      expect(mockStart).not.toHaveBeenCalled();
      expect(mockAddTelemetryProcessor).not.toHaveBeenCalled();
    });
  });
});
