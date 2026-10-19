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

    it('reuses the same regex for the same keys and rebuilds it when keys change', () => {
      const first = buildSensitiveQueryParamsRegex(['alpha', 'beta']);
      const second = buildSensitiveQueryParamsRegex(['alpha', 'beta']);
      expect(second).toBe(first);

      const third = buildSensitiveQueryParamsRegex(['gamma']);
      expect(third).not.toBe(first);
      expect('https://example.com?gamma=1&alpha=2'.replace(third, '$1[REDACTED]'))
        .toBe('https://example.com?gamma=[REDACTED]&alpha=2');
    });

    it('produces consistent results when the shared regex is used repeatedly', () => {
      const regex = buildSensitiveQueryParamsRegex(['key']);
      const url = 'https://example.com?key=abc';
      expect(url.replace(regex, '$1[REDACTED]')).toBe('https://example.com?key=[REDACTED]');
      expect(url.replace(regex, '$1[REDACTED]')).toBe('https://example.com?key=[REDACTED]');
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

    describe('JSON formats', () => {
      it.each([
        ['compact', '{"key":"abc123"}', '{"key":"[REDACTED]"}'],
        ['with spaces', '{ "key" : "abc123" }', '{ "key" : "[REDACTED]" }'],
        ['among other fields', '{"postcode":"SW1A1AA","key":"abc123","dataset":"DPA"}', '{"postcode":"SW1A1AA","key":"[REDACTED]","dataset":"DPA"}'],
        ['non-string value', '{"token":123456}', '{"token":[REDACTED]}'],
        ['mixed case key', '{"ApiKey":"abc123"}', '{"ApiKey":"[REDACTED]"}'],
        ['single quotes', '{\'password\':\'hunter2\'}', '{\'password\':\'[REDACTED]\'}'],
        ['escaped JSON inside a string', '{\\"key\\":\\"abc123\\",\\"x\\":1}', '{\\"key\\":\\"[REDACTED]\\",\\"x\\":1}'],
        ['nested object', '{"headers":{"authorization":"abc123","accept":"json"}}', '{"headers":{"authorization":"[REDACTED]","accept":"json"}}'],
        ['array of objects', '[{"secret":"abc"},{"secret":"def"}]', '[{"secret":"[REDACTED]"},{"secret":"[REDACTED]"}]'],
      ])('redacts %s', (_name, input, expected) => {
        expect(sanitizeCredentials(input)).toBe(expected);
      });

      it('does not redact JSON keys that merely contain a sensitive word or have no value', () => {
        expect(sanitizeCredentials('{"keyboard":"qwerty","monkey":"banana"}')).toBe('{"keyboard":"qwerty","monkey":"banana"}');
        expect(sanitizeCredentials('{"key":""}')).toBe('{"key":""}');
      });
    });

    describe('header formats', () => {
      it.each([
        ['simple header', 'key: abc123', 'key: [REDACTED]'],
        ['no space after colon', 'key:abc123', 'key:[REDACTED]'],
        ['mixed case header', 'KEY: abc123', 'KEY: [REDACTED]'],
        ['header in a multi-line dump', 'accept: json\nkey: abc123\nhost: api.os.uk', 'accept: json\nkey: [REDACTED]\nhost: api.os.uk'],
        ['Bearer authorization header', 'Authorization: Bearer abc.def.ghi', 'Authorization: Bearer [REDACTED]'],
        ['Basic authorization header', 'authorization: Basic dXNlcjpwYXNz', 'authorization: Basic [REDACTED]'],
        ['Bearer authorization with equals', 'authorization=Bearer abc def', 'authorization=Bearer [REDACTED] def'],
        ['header in an error message', 'Request failed with headers key: abc123, status 401', 'Request failed with headers key: [REDACTED], status 401'],
      ])('redacts %s', (_name, input, expected) => {
        expect(sanitizeCredentials(input)).toBe(expected);
      });

      it('does not consume the next line when the header value is empty', () => {
        expect(sanitizeCredentials('key:\nnext: line')).toBe('key:\nnext: line');
      });
    });

    describe('delimiters', () => {
      it.each([
        ['semicolon separated', 'a=1;key=abc123;b=2', 'a=1;key=[REDACTED];b=2'],
        ['comma separated', 'a=1,key=abc123,b=2', 'a=1,key=[REDACTED],b=2'],
        ['after a space', 'GET /x ; key=abc123', 'GET /x ; key=[REDACTED]'],
        ['cookie style', 'session=1; token=abc123; theme=dark', 'session=1; token=[REDACTED]; theme=dark'],
        ['quoted value', 'key="abc123"', 'key="[REDACTED]"'],
      ])('redacts %s', (_name, input, expected) => {
        expect(sanitizeCredentials(input)).toBe(expected);
      });
    });

    it('does not redact words that only contain a sensitive key', () => {
      const text = 'keyboard=qwerty monkey: banana author=someone tokenizer=abc';
      expect(sanitizeCredentials(text)).toBe(text);
    });

    it('redacts several formats within the same string', () => {
      const text = 'GET /p?key=q1 headers {"authorization":"Bearer j1"} body password: p1';
      expect(sanitizeCredentials(text))
        .toBe('GET /p?key=[REDACTED] headers {"authorization":"Bearer [REDACTED]"} body password: [REDACTED]');
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

    it('redacts JSON and header formatted credentials in messages, exceptions and properties', () => {
      const env = {
        sampleRate: 1,
        data: {
          baseType: 'ExceptionData',
          baseData: {
            message: 'Request failed: {"headers":{"key":"osSecret"}}',
            exceptions: [{
              message: 'Unauthorized, sent headers key: osSecret',
              stack: 'AxiosError: {"config":{"headers":{"Authorization":"Bearer jwt.value"}}}\n at fn()',
            }],
            properties: {requestHeaders: 'accept: json\nkey: osSecret'},
          },
        },
      };
      stripCredentialsTelemetryProcessor(env as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0]);
      expect(env.data.baseData.message).toBe('Request failed: {"headers":{"key":"[REDACTED]"}}');
      expect(env.data.baseData.exceptions[0].message).toBe('Unauthorized, sent headers key: [REDACTED]');
      expect(env.data.baseData.exceptions[0].stack)
        .toBe('AxiosError: {"config":{"headers":{"Authorization":"Bearer [REDACTED]"}}}\n at fn()');
      expect(env.data.baseData.properties.requestHeaders).toBe('accept: json\nkey: [REDACTED]');
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
