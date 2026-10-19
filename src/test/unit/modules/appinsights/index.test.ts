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

import {
  AppInsights,
  DEFAULT_REDACTED_KEYS,
  buildSensitiveQueryParamsRegex,
  getRedactedKeys,
  keepFailuresTelemetryProcessor,
  sanitizeCredentials,
  stripCredentialsTelemetryProcessor,
} from 'modules/appinsights';

const mockConfigGet = config.get as jest.Mock;
const mockConfigHas = config.has as jest.Mock;

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
    mockConfigHas.mockReturnValue(false);
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'appInsights.instrumentationKey') {
        return 'test-instrumentation-key';
      }
      return undefined;
    });
  });

  afterAll(() => {
    process.env.LAUNCH_DARKLY_ENV = ORIGINAL_ENV;
  });

  describe('getRedactedKeys and buildSensitiveQueryParamsRegex', () => {
    it('returns DEFAULT_REDACTED_KEYS when config is not set', () => {
      mockConfigHas.mockReturnValue(false);
      expect(getRedactedKeys()).toEqual(DEFAULT_REDACTED_KEYS);
    });

    it('returns configured keys array when config has array', () => {
      mockConfigHas.mockReturnValue(true);
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'appInsights.redactedKeys') {
          return ['customSecret', 'customToken'];
        }
        return undefined;
      });
      expect(getRedactedKeys()).toEqual(['customSecret', 'customToken']);
    });

    it('returns configured keys split by comma when config has comma-separated string', () => {
      mockConfigHas.mockReturnValue(true);
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'appInsights.redactedKeys') {
          return 'customSecret, customToken, customKey';
        }
        return undefined;
      });
      expect(getRedactedKeys()).toEqual(['customSecret', 'customToken', 'customKey']);
    });

    it('falls back to default keys when config has empty array or string', () => {
      mockConfigHas.mockReturnValue(true);
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'appInsights.redactedKeys') {
          return '';
        }
        return undefined;
      });
      expect(getRedactedKeys()).toEqual(DEFAULT_REDACTED_KEYS);
    });

    it('builds a non-matching regex when keys array is empty', () => {
      const regex = buildSensitiveQueryParamsRegex([]);
      expect('https://example.com?key=123'.match(regex)).toBeNull();
    });
  });

  describe('sanitizeCredentials', () => {
    it('redacts sensitive query parameters and preserves non-sensitive parameters', () => {
      const url = 'https://api.os.uk/search/places/v1/postcode?dataset=DPA,LPI&postcode=SW1A1AA&key=32charSecretKey1234567890';
      const sanitized = sanitizeCredentials(url);
      expect(sanitized).toBe('https://api.os.uk/search/places/v1/postcode?dataset=DPA,LPI&postcode=SW1A1AA&key=[REDACTED]');
    });

    it('redacts multiple sensitive parameters in a single URL', () => {
      const url = 'https://example.com/api?token=secretToken&user=citizen&secret=hiddenPass&access_token=jwt123#frag';
      const sanitized = sanitizeCredentials(url);
      expect(sanitized).toBe('https://example.com/api?token=[REDACTED]&user=citizen&secret=[REDACTED]&access_token=[REDACTED]#frag');
    });

    it('leaves URLs with no sensitive parameters untouched', () => {
      const url = 'https://api.os.uk/search/places/v1/postcode?dataset=DPA,LPI&postcode=SW1A1AA';
      const sanitized = sanitizeCredentials(url);
      expect(sanitized).toBe(url);
    });

    it('returns non-string or undefined values as is', () => {
      expect(sanitizeCredentials(undefined)).toBeUndefined();
      expect(sanitizeCredentials(null as unknown as string)).toBeNull();
    });

    it('accepts custom regex or custom keys list', () => {
      const url = 'https://example.com?myCustomSecret=12345&key=normalKey';
      const sanitizedWithCustomKeys = sanitizeCredentials(url, ['myCustomSecret']);
      expect(sanitizedWithCustomKeys).toBe('https://example.com?myCustomSecret=[REDACTED]&key=normalKey');
    });
  });

  describe('stripCredentialsTelemetryProcessor', () => {
    it('redacts sensitive query parameters from RemoteDependencyData', () => {
      const env = {
        sampleRate: 1,
        data: {
          baseType: 'RemoteDependencyData',
          baseData: {
            data: 'https://api.os.uk/search/places/v1/postcode?dataset=DPA,LPI&postcode=SW1A1AA&key=32charSecretKey1234567890',
            target: 'api.os.uk?auth=token123',
            name: 'GET /search/places/v1/postcode?key=secret',
          },
        },
      };

      expect(stripCredentialsTelemetryProcessor(env as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0])).toBe(true);
      expect(env.data.baseData.data).toBe('https://api.os.uk/search/places/v1/postcode?dataset=DPA,LPI&postcode=SW1A1AA&key=[REDACTED]');
      expect(env.data.baseData.target).toBe('api.os.uk?auth=[REDACTED]');
      expect(env.data.baseData.name).toBe('GET /search/places/v1/postcode?key=[REDACTED]');
    });

    it('redacts sensitive query parameters from RequestData and PageViewData', () => {
      const reqEnv = {
        sampleRate: 1,
        data: {
          baseType: 'RequestData',
          baseData: {
            url: 'http://localhost:3001/postcode-lookup?postcode=SW1A1AA&token=userToken123',
          },
        },
      };
      stripCredentialsTelemetryProcessor(reqEnv as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0]);
      expect(reqEnv.data.baseData.url).toBe('http://localhost:3001/postcode-lookup?postcode=SW1A1AA&token=[REDACTED]');

      const pageEnv = {
        sampleRate: 1,
        data: {
          baseType: 'PageViewData',
          baseData: {
            url: 'http://localhost:3001/dashboard?access_token=sessionToken',
          },
        },
      };
      stripCredentialsTelemetryProcessor(pageEnv as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0]);
      expect(pageEnv.data.baseData.url).toBe('http://localhost:3001/dashboard?access_token=[REDACTED]');
    });

    it('redacts sensitive query parameters from MessageData', () => {
      const msgEnv = {
        sampleRate: 1,
        data: {
          baseType: 'MessageData',
          baseData: {
            message: 'AxiosError: GET https://api.os.uk/search/places/v1/postcode?key=mySecret failed with 401',
          },
        },
      };
      stripCredentialsTelemetryProcessor(msgEnv as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0]);
      expect(msgEnv.data.baseData.message).toBe('AxiosError: GET https://api.os.uk/search/places/v1/postcode?key=[REDACTED] failed with 401');
    });

    it('redacts sensitive query parameters from ExceptionData and custom properties', () => {
      const excEnv = {
        sampleRate: 1,
        data: {
          baseType: 'ExceptionData',
          baseData: {
            message: 'Error calling https://api.os.uk/search/places/v1/postcode?key=secretInMessage',
            exceptions: [
              {
                message: 'Failed request https://api.os.uk?key=secretInExc',
                stack: 'Error at https://api.os.uk?apiKey=secretInStack\n at fn()',
              },
            ],
            properties: {
              requestUrl: 'https://api.os.uk?token=secretInProp',
              nonStringProp: 12345,
            },
          },
        },
      };
      stripCredentialsTelemetryProcessor(excEnv as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0]);
      expect(excEnv.data.baseData.message).toBe('Error calling https://api.os.uk/search/places/v1/postcode?key=[REDACTED]');
      expect(excEnv.data.baseData.exceptions[0].message).toBe('Failed request https://api.os.uk?key=[REDACTED]');
      expect(excEnv.data.baseData.exceptions[0].stack).toBe('Error at https://api.os.uk?apiKey=[REDACTED]\n at fn()');
      expect(excEnv.data.baseData.properties.requestUrl).toBe('https://api.os.uk?token=[REDACTED]');
      expect(excEnv.data.baseData.properties.nonStringProp).toBe(12345);
    });

    it('handles envelope with missing baseData gracefully', () => {
      const env = {sampleRate: 1, data: {} as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0]['data']};
      expect(stripCredentialsTelemetryProcessor(env as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0])).toBe(true);
    });
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
    it('registers credential processor and failure-keeping processor in non-prod', () => {
      process.env.LAUNCH_DARKLY_ENV = 'perftest';
      new AppInsights().enable();
      expect(mockClient.config.samplingPercentage).toBe(100);
      expect(mockAddTelemetryProcessor).toHaveBeenCalledWith(stripCredentialsTelemetryProcessor);
      expect(mockAddTelemetryProcessor).toHaveBeenCalledWith(keepFailuresTelemetryProcessor);
      expect(mockTrackTrace).toHaveBeenCalled();
    });

    it('registers credential processor but leaves sampling untouched in prod', () => {
      process.env.LAUNCH_DARKLY_ENV = 'prod';
      new AppInsights().enable();
      expect(mockClient.config.samplingPercentage).toBeUndefined();
      expect(mockAddTelemetryProcessor).toHaveBeenCalledWith(stripCredentialsTelemetryProcessor);
      expect(mockAddTelemetryProcessor).not.toHaveBeenCalledWith(keepFailuresTelemetryProcessor);
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
