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
  _resetRedactionState,
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
    _resetRedactionState();
    mockClient.config.samplingPercentage = undefined;
    mockClient.context.tags = {};
    mockConfigHas.mockImplementation((key: string) => key === 'appInsights.instrumentationKey');
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

    it('returns the same memoized key array reference on subsequent calls with unchanged config', () => {
      mockConfigHas.mockReturnValue(true);
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'appInsights.redactedKeys') {
          return ['customSecret', 'customToken'];
        }
        return undefined;
      });
      const first = getRedactedKeys();
      const second = getRedactedKeys();
      expect(second).toBe(first);
    });

    it('returns DEFAULT_REDACTED_KEYS without reallocation when config has no extra keys', () => {
      mockConfigHas.mockReturnValue(false);
      const first = getRedactedKeys();
      const second = getRedactedKeys();
      expect(first).toBe(DEFAULT_REDACTED_KEYS);
      expect(second).toBe(DEFAULT_REDACTED_KEYS);
    });

    it('extends the defaults with configured keys array', () => {
      mockConfigHas.mockReturnValue(true);
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'appInsights.redactedKeys') {
          return ['customSecret', 'customToken'];
        }
        return undefined;
      });
      expect(getRedactedKeys()).toEqual([...DEFAULT_REDACTED_KEYS, 'customSecret', 'customToken']);
      expect(getRedactedKeys()).toContain('key');
    });

    it('extends the defaults with comma-separated configured keys, ignoring duplicates', () => {
      mockConfigHas.mockReturnValue(true);
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'appInsights.redactedKeys') {
          return 'customSecret, customToken, KEY';
        }
        return undefined;
      });
      expect(getRedactedKeys()).toEqual([...DEFAULT_REDACTED_KEYS, 'customSecret', 'customToken']);
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
      expect(sanitizeCredentials('https://example.com?gamma=1&alpha=2', third))
        .toBe('https://example.com?gamma=[REDACTED]&alpha=2');
    });

    it('produces consistent results when the shared regex is used repeatedly', () => {
      const regex = buildSensitiveQueryParamsRegex(['key']);
      const url = 'https://example.com?key=abc';
      expect(sanitizeCredentials(url, regex)).toBe('https://example.com?key=[REDACTED]');
      expect(sanitizeCredentials(url, regex)).toBe('https://example.com?key=[REDACTED]');
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
        ['passphrase with spaces in JSON', '{"password":"correct horse battery staple"}', '{"password":"[REDACTED]"}'],
        ['credential with punctuation in JSON', '{"secret":"abc,def;ghi"}', '{"secret":"[REDACTED]"}'],
        ['escaped quotes in JSON value', '{"password":"secret\\"with\\"quotes"}', '{"password":"[REDACTED]"}'],
        ['escaped JSON with spaces and punctuation', '{\\"password\\":\\"correct horse, battery; staple\\",\\"x\\":1}', '{\\"password\\":\\"[REDACTED]\\",\\"x\\":1}'],
        ['passphrase with spaces in single quotes', '{\'password\':\'correct horse battery staple\'}', '{\'password\':\'[REDACTED]\'}'],
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

    describe('double-encoded JSON', () => {
      it.each([
        ['a quote in the secret', {password: 'abc"def ghi'}],
        ['a backslash in the secret', {password: 'abc\\def ghi'}],
        ['an escaped newline in the secret', {password: 'abc\ndef'}],
        ['an auth scheme', {authorization: 'Bearer abc "def"'}],
      ])('redacts the whole value with %s', (_name, payload) => {
        const input = JSON.stringify(JSON.stringify({...payload, x: 1}));
        const sanitized = sanitizeCredentials(input);
        const [[key, value]] = Object.entries(payload);
        const scheme = value.startsWith('Bearer ') ? 'Bearer ' : '';
        expect(sanitized).toBe(JSON.stringify(JSON.stringify({[key]: `${scheme}[REDACTED]`, x: 1})));
        expect(JSON.parse(JSON.parse(sanitized))).toEqual({[key]: `${scheme}[REDACTED]`, x: 1});
      });
    });

    describe('unquoted values', () => {
      it.each([
        ['a colon (basic credentials)', 'auth=user:pa55word&x=1', 'auth=[REDACTED]&x=1'],
        ['a colon in a password', 'password=abc:def', 'password=[REDACTED]'],
        ['a closing bracket', 'password=abc)def', 'password=[REDACTED]'],
        ['a greater-than sign', 'token=abc>def', 'token=[REDACTED]'],
        ['a trailing stack frame position', 'at q (/app/db.js?key=s3cr3t:25:12)', 'at q (/app/db.js?key=[REDACTED]:25:12)'],
        ['a stack frame position in a full stack', 'Error\n    at q (/app/db.js?key=s3cr3t:25:12)\n    at r', 'Error\n    at q (/app/db.js?key=[REDACTED]:25:12)\n    at r'],
      ])('redacts a value containing %s', (_name, input, expected) => {
        expect(sanitizeCredentials(input)).toBe(expected);
      });

      it('redacts everything after an unterminated quote', () => {
        expect(sanitizeCredentials('{"password":"abc def, next field')).toBe('{"password":"[REDACTED]');
      });
    });

    describe('keys and formats used by this service', () => {
      it.each([
        ['s2s ServiceAuthorization header', 'ServiceAuthorization: Bearer s2s.jwt.token', 'ServiceAuthorization: Bearer [REDACTED]'],
        ['refresh_token query parameter', '?refresh_token=rt123&x=1', '?refresh_token=[REDACTED]&x=1'],
        ['id_token in JSON', '{"id_token":"abc.def.ghi","x":1}', '{"id_token":"[REDACTED]","x":1}'],
        ['camelCase accessToken', '{"accessToken":"at123"}', '{"accessToken":"[REDACTED]"}'],
        ['camelCase refreshToken and idToken', 'refreshToken=r1&idToken=i1', 'refreshToken=[REDACTED]&idToken=[REDACTED]'],
        ['camelCase clientSecret', '{"clientSecret":"cs123"}', '{"clientSecret":"[REDACTED]"}'],
        ['x-api-key header', 'x-api-key: abc123', 'x-api-key: [REDACTED]'],
        ['subscription key header', 'Ocp-Apim-Subscription-Key: abc123', 'Ocp-Apim-Subscription-Key: [REDACTED]'],
        ['dotted key', 'config.password=pw1', 'config.password=[REDACTED]'],
        ['Azure SAS signature', 'https://a.blob.core.windows.net/c/f?sv=2020&sig=SIG%2B123', 'https://a.blob.core.windows.net/c/f?sv=2020&sig=[REDACTED]'],
        ['storage connection string', 'Server=x;AccountKey=AK+/==;Password=pw1;', 'Server=x;AccountKey=[REDACTED];Password=[REDACTED];'],
        ['util.inspect style headers', '{ headers: { Authorization: \'Bearer abc.def\', accept: \'json\' } }', '{ headers: { Authorization: \'Bearer [REDACTED]\', accept: \'json\' } }'],
        ['Digest authorization header', 'Authorization: Digest username="u", response="r"\nHost: x', 'Authorization: Digest [REDACTED]\nHost: x'],
        ['Digest authorization in JSON', '{"authorization":"Digest username=\\"u\\", response=\\"r\\""}', '{"authorization":"Digest [REDACTED]"}'],
        ['Cookie header', 'Cookie: __auth-token=eyJabc; session=xyz\nHost: x', 'Cookie: [REDACTED]\nHost: x'],
        ['Set-Cookie header', 'set-cookie: s=abc; Path=/; HttpOnly', 'set-cookie: [REDACTED]'],
        ['cookie in JSON', '{"cookie":"a=b; c=d","x":1}', '{"cookie":"[REDACTED]","x":1}'],
      ])('redacts %s', (_name, input, expected) => {
        expect(sanitizeCredentials(input)).toBe(expected);
      });
    });

    describe('credentials without a key', () => {
      it.each([
        ['redis URL password', 'Error: connect redis://:redisPass@cache.redis:6380', 'Error: connect redis://:[REDACTED]@cache.redis:6380'],
        ['URL user and password', 'GET https://user:p%40ss@host/path?x=1', 'GET https://user:[REDACTED]@host/path?x=1'],
        ['bare JWT', 'Token rejected: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abcDEF-_1 retrying', 'Token rejected: [REDACTED] retrying'],
      ])('redacts %s', (_name, input, expected) => {
        expect(sanitizeCredentials(input)).toBe(expected);
      });

      it.each([
        ['a URL with a port and an @ in the path', 'http://host:8080/users/@me'],
        ['an email address', 'mailto:someone@example.com'],
        ['a URL with only a username', 'https://user@host/path'],
        ['a dotted identifier starting with eyJ', 'eyJ.config.value'],
        ['a stack frame in a file named after a key', 'at Auth.login (/app/auth/token.js:3:4)'],
      ])('does not redact %s', (_name, input) => {
        expect(sanitizeCredentials(input)).toBe(input);
      });
    });

    it('applies the keyless rules even when a custom key list is used', () => {
      expect(sanitizeCredentials('redis://:pw@h?myKey=1&key=2', ['myKey'])).toBe('redis://:[REDACTED]@h?myKey=[REDACTED]&key=2');
    });

    it('handles large and pathological input in linear time', () => {
      const inputs = [
        '{"password":"' + 'a\\'.repeat(100000),
        'key=' + ' '.repeat(100000),
        '?'.repeat(100000) + 'x',
        'key=' + 'a:1'.repeat(50000),
        'redis://:' + 'a'.repeat(100000),
        'Cookie: ' + '\\'.repeat(100000),
        'a'.repeat(100000),
        'a.'.repeat(50000),
        'eyJ' + 'a'.repeat(100000),
      ];
      const start = Date.now();
      inputs.forEach((input) => sanitizeCredentials(input));
      expect(Date.now() - start).toBeLessThan(1000);
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

    it('redacts property values by sensitive property name', () => {
      const env = {
        sampleRate: 1,
        data: {
          baseType: 'MessageData',
          baseData: {
            message: 'hello',
            properties: {key: 'osSecret', Authorization: 'abc', postcode: 'SW1A1AA'},
          },
        },
      };
      stripCredentialsTelemetryProcessor(env as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0]);
      expect(env.data.baseData.properties).toEqual({key: '[REDACTED]', Authorization: '[REDACTED]', postcode: 'SW1A1AA'});
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

    it('redacts sensitive query parameters from parsedStack in ExceptionData', () => {
      const env = {
        sampleRate: 1,
        data: {
          baseType: 'ExceptionData',
          baseData: {
            message: 'Error calling service',
            exceptions: [
              {
                message: 'DB connection error',
                parsedStack: [
                  {
                    assembly: 'at Object.query (/app/src/db.js?key=secretInFileName:25:12)',
                    fileName: '/app/src/db.js?key=secretInFileName',
                    method: 'Object.query?token=secretInMethod',
                  },
                  {
                    assembly: 'at run (/app/src/index.js?access_token=secretInAssembly:10:5)',
                    fileName: '/app/src/index.js?access_token=secretInAssembly',
                    method: 'run',
                  },
                ],
              },
            ],
          },
        },
      };
      stripCredentialsTelemetryProcessor(env as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0]);
      const frames = env.data.baseData.exceptions[0].parsedStack;
      expect(frames[0].assembly).toBe('at Object.query (/app/src/db.js?key=[REDACTED]:25:12)');
      expect(frames[0].fileName).toBe('/app/src/db.js?key=[REDACTED]');
      expect(frames[0].method).toBe('Object.query?token=[REDACTED]');
      expect(frames[1].assembly).toBe('at run (/app/src/index.js?access_token=[REDACTED]:10:5)');
      expect(frames[1].fileName).toBe('/app/src/index.js?access_token=[REDACTED]');
      expect(frames[1].method).toBe('run');
    });

    it('redacts sensitive query parameters from SDK-generated ExceptionData envelope', () => {
      const EnvelopeFactory = require('applicationinsights/out/Library/EnvelopeFactory');
      const err = new Error('Database connection failed to https://api.os.uk?key=secretInMessage');
      err.stack = 'Error: Database connection failed\n    at Object.query (/app/src/db.js?key=secretInFileName:25:12)\n    at run (/app/src/index.js?token=secretInAssembly:10:5)';

      const envelope = EnvelopeFactory.createExceptionData({ exception: err });
      const env = {
        sampleRate: 1,
        data: envelope,
      };

      stripCredentialsTelemetryProcessor(env as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0]);

      expect(envelope.baseData.exceptions[0].message).toBe('Database connection failed to https://api.os.uk?key=[REDACTED]');
      const frames = envelope.baseData.exceptions[0].parsedStack;
      expect(frames).toHaveLength(2);
      expect(frames[0].assembly).toBe('at Object.query (/app/src/db.js?key=[REDACTED]:25:12)');
      expect(frames[0].fileName).toBe('/app/src/db.js?key=[REDACTED]');
      expect(frames[0].line).toBe(25);
      expect(frames[1].assembly).toBe('at run (/app/src/index.js?token=[REDACTED]:10:5)');
      expect(frames[1].fileName).toBe('/app/src/index.js?token=[REDACTED]');
      expect(JSON.stringify(envelope)).not.toMatch(/secretIn/);
    });

    it('redacts the exception type name', () => {
      const env = {
        sampleRate: 1,
        data: {baseType: 'ExceptionData', baseData: {exceptions: [{typeName: 'Error?token=t1', message: 'x'}]}},
      };
      stripCredentialsTelemetryProcessor(env as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0]);
      expect(env.data.baseData.exceptions[0].typeName).toBe('Error?token=[REDACTED]');
    });

    it.each([
      ['EventData', 'name', 'login?token=evt123', 'login?token=[REDACTED]'],
      ['AvailabilityData', 'message', 'probe failed ?key=av123', 'probe failed ?key=[REDACTED]'],
      ['AvailabilityData', 'name', 'ping?key=av123', 'ping?key=[REDACTED]'],
      ['RequestData', 'name', 'GET /callback?code=1&access_token=a1', 'GET /callback?code=1&access_token=[REDACTED]'],
      ['PageViewData', 'name', '/dashboard?token=p1', '/dashboard?token=[REDACTED]'],
      ['RemoteDependencyData', 'resultCode', 'redis://:pw@host', 'redis://:[REDACTED]@host'],
      ['SomeFutureData', 'message', 'password=f1', 'password=[REDACTED]'],
    ])('redacts %s.%s', (baseType, field, input, expected) => {
      const env = {sampleRate: 1, data: {baseType, baseData: {[field]: input, duration: 12}}};
      stripCredentialsTelemetryProcessor(env as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0]);
      expect(env.data.baseData[field]).toBe(expected);
      expect(env.data.baseData.duration).toBe(12);
    });

    it('redacts envelope tags', () => {
      const env = {
        sampleRate: 1,
        tags: {'ai.operation.name': 'GET /oauth2/callback?code=c1&token=t1', 'ai.cloud.role': 'civil-citizen-ui', 'ai.internal.sdkVersion': 'node:2.9.8'},
        data: {baseType: 'RequestData', baseData: {url: 'http://x'}},
      };
      stripCredentialsTelemetryProcessor(env as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0]);
      expect(env.tags).toEqual({
        'ai.operation.name': 'GET /oauth2/callback?code=c1&token=[REDACTED]',
        'ai.cloud.role': 'civil-citizen-ui',
        'ai.internal.sdkVersion': 'node:2.9.8',
      });
    });

    describe('properties', () => {
      const runWithProperties = (properties: Record<string, unknown>) => {
        const env = {sampleRate: 1, data: {baseType: 'MessageData', baseData: {message: 'm', properties}}};
        expect(stripCredentialsTelemetryProcessor(env as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0])).toBe(true);
        return env.data.baseData.properties;
      };

      it('serialises and redacts objects and arrays before the SDK stringifies them', () => {
        const props = runWithProperties({
          cfg: {headers: {Authorization: 'Bearer obj.jwt', accept: 'json'}},
          list: ['password=p1', 'ok'],
          err: Object.assign(new Error('failed ?key=e1'), {code: 'ECONNREFUSED'}),
          when: new Date('2026-01-01T00:00:00.000Z'),
        });
        expect(props).toEqual({
          cfg: '{"headers":{"Authorization":"[REDACTED]","accept":"json"}}',
          list: '["password=[REDACTED]","ok"]',
          err: '{"message":"failed ?key=[REDACTED]","code":"ECONNREFUSED"}',
          when: '2026-01-01T00:00:00.000Z',
        });
      });

      it('replaces values that cannot be serialised', () => {
        const circular: Record<string, unknown> = {token: 't1'};
        circular.self = circular;
        expect(runWithProperties({circular}).circular).toBe('[UNSERIALISABLE]');
      });

      describe('nested sensitive values', () => {
        it('redacts array values of sensitive header names such as Set-Cookie and Authorization', () => {
          const props = runWithProperties({
            headers: {
              'Set-Cookie': ['session=abc123; Path=/; HttpOnly', 'other=def456'],
              Authorization: ['Bearer jwt.value.here'],
              accept: ['application/json'],
            },
          });
          expect(JSON.parse(props.headers as string)).toEqual({
            'Set-Cookie': '[REDACTED]',
            Authorization: '[REDACTED]',
            accept: ['application/json'],
          });
          expect(props.headers).not.toContain('abc123');
          expect(props.headers).not.toContain('def456');
          expect(props.headers).not.toContain('jwt.value.here');
        });

        it('redacts nested properties whose names end in a sensitive key (userPassword, dbSecret, apiToken)', () => {
          const props = runWithProperties({
            payload: {
              user: {userPassword: 'secret-password', name: 'Jo'},
              list: [{dbSecret: 'database-secret'}, {apiToken: 'jwt-token'}],
              keyboard: 'qwerty',
            },
          });
          expect(JSON.parse(props.payload as string)).toEqual({
            user: {userPassword: '[REDACTED]', name: 'Jo'},
            list: [{dbSecret: '[REDACTED]'}, {apiToken: '[REDACTED]'}],
            keyboard: 'qwerty',
          });
        });

        it('redacts nested values in an SDK-generated envelope', () => {
          const appInsightsSdk = jest.requireActual('applicationinsights');
          const client = new appInsightsSdk.TelemetryClient('00000000-0000-0000-0000-000000000000');
          const captured: Array<Parameters<typeof stripCredentialsTelemetryProcessor>[0]> = [];
          client.addTelemetryProcessor((envelope: Parameters<typeof stripCredentialsTelemetryProcessor>[0]) => {
            captured.push(envelope);
            return false;
          });
          client.trackEvent({
            name: 'login',
            properties: {
              response: {headers: {'set-cookie': ['sid=abc123'], authorization: ['Bearer jwt.value.here']}},
              user: {userPassword: 'secret-password'},
            },
          });
          expect(captured).toHaveLength(1);
          expect(stripCredentialsTelemetryProcessor(captured[0])).toBe(true);
          const serialised = JSON.stringify(captured[0].data.baseData.properties);
          expect(serialised).not.toContain('abc123');
          expect(serialised).not.toContain('jwt.value.here');
          expect(serialised).not.toContain('secret-password');
        });

        it('still replaces circular structures nested below a property', () => {
          const inner: Record<string, unknown> = {userPassword: 'p1'};
          inner.self = inner;
          expect(runWithProperties({outer: {inner}}).outer).toBe('[UNSERIALISABLE]');
        });

        it('does not treat a repeated (non-circular) object as circular', () => {
          const shared = {userPassword: 'p1', name: 'n'};
          const props = runWithProperties({both: {a: shared, b: shared}});
          expect(JSON.parse(props.both as string)).toEqual({
            a: {userPassword: '[REDACTED]', name: 'n'},
            b: {userPassword: '[REDACTED]', name: 'n'},
          });
        });

        it('does not mutate the original property object', () => {
          const original = {headers: {authorization: ['Bearer x.y.z']}};
          runWithProperties({original});
          expect(original.headers.authorization).toEqual(['Bearer x.y.z']);
        });
      });

      it('keeps primitives and empty values, but redacts any value of a sensitive property', () => {
        const fn = () => 'x';
        expect(runWithProperties({count: 3, flag: true, nothing: null, missing: undefined, fn, token: 12345}))
          .toEqual({count: 3, flag: true, nothing: null, missing: undefined, fn, token: '[REDACTED]'});
      });

      it('matches sensitive property names on camelCase boundaries and delimiters', () => {
        expect(runWithProperties({
          'x-api-key': 'a',
          'db.password': 'b',
          refresh_token: 'c',
          userPassword: 'secret-password',
          dbSecret: 'database-secret',
          apiToken: 'jwt-token',
          myApiKey: 'api-key-123',
          keyboard: 'd',
          monkey: 'e',
          donkey: 'f',
          author: 'g',
          tokenizer: 'h',
        })).toEqual({
          'x-api-key': '[REDACTED]',
          'db.password': '[REDACTED]',
          refresh_token: '[REDACTED]',
          userPassword: '[REDACTED]',
          dbSecret: '[REDACTED]',
          apiToken: '[REDACTED]',
          myApiKey: '[REDACTED]',
          keyboard: 'd',
          monkey: 'e',
          donkey: 'f',
          author: 'g',
          tokenizer: 'h',
        });
      });
    });

    it('resets failure reporting flag and memoized caches via _resetRedactionState', () => {
      mockConfigHas.mockImplementation(() => {
        throw new Error('config unavailable');
      });
      const env = {sampleRate: 1, data: {baseType: 'MessageData', baseData: {message: 'password=p1'}}};
      const asEnvelope = env as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0];
      expect(stripCredentialsTelemetryProcessor(asEnvelope)).toBe(false);

      _resetRedactionState();
      mockConfigHas.mockReturnValue(false);
      expect(stripCredentialsTelemetryProcessor(asEnvelope)).toBe(true);
    });

    it('drops the telemetry item instead of sending it unredacted when redaction fails', () => {
      mockConfigHas.mockImplementation(() => {
        throw new Error('config unavailable');
      });
      const env = {sampleRate: 1, data: {baseType: 'MessageData', baseData: {message: 'password=p1'}}};
      const asEnvelope = env as unknown as Parameters<typeof stripCredentialsTelemetryProcessor>[0];
      expect(stripCredentialsTelemetryProcessor(asEnvelope)).toBe(false);
      expect(stripCredentialsTelemetryProcessor(asEnvelope)).toBe(false);
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
    it('sets up appInsights using connection string when connection string is configured', () => {
      const appInsightsSdk = require('applicationinsights');
      mockConfigHas.mockImplementation((key: string) => key === 'appInsights.connectionString');
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'appInsights.connectionString') {
          return 'InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://northeurope.in.applicationinsights.azure.com/';
        }
        return undefined;
      });
      new AppInsights().enable();
      expect(appInsightsSdk.setup).toHaveBeenCalledWith(
        'InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://northeurope.in.applicationinsights.azure.com/',
      );
      expect(mockStart).toHaveBeenCalled();
    });

    it('prefers connection string over instrumentation key when both are provided', () => {
      const appInsightsSdk = require('applicationinsights');
      mockConfigHas.mockReturnValue(true);
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'appInsights.connectionString') {
          return 'InstrumentationKey=connection-string-key;IngestionEndpoint=https://azure.com/';
        }
        if (key === 'appInsights.instrumentationKey') {
          return 'fallback-instrumentation-key';
        }
        return undefined;
      });
      new AppInsights().enable();
      expect(appInsightsSdk.setup).toHaveBeenCalledWith(
        'InstrumentationKey=connection-string-key;IngestionEndpoint=https://azure.com/',
      );
    });

    it('falls back to instrumentation key when connection string is not configured', () => {
      const appInsightsSdk = require('applicationinsights');
      mockConfigHas.mockImplementation((key: string) => key === 'appInsights.instrumentationKey');
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'appInsights.instrumentationKey') {
          return 'test-instrumentation-key';
        }
        return undefined;
      });
      new AppInsights().enable();
      expect(appInsightsSdk.setup).toHaveBeenCalledWith('test-instrumentation-key');
    });

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

    it('logs an error and does not start when no instrumentation key or connection string is set', () => {
      mockConfigHas.mockReturnValue(false);
      mockConfigGet.mockReturnValue(undefined);
      process.env.LAUNCH_DARKLY_ENV = 'perftest';
      new AppInsights().enable();
      expect(mockStart).not.toHaveBeenCalled();
      expect(mockAddTelemetryProcessor).not.toHaveBeenCalled();
    });
  });
});
