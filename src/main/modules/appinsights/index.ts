import config from 'config';

const appInsights = require('applicationinsights');
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('appInsights');

interface StackFrame {
  assembly?: string;
  fileName?: string;
  method?: string;
  [key: string]: unknown;
}

interface ExceptionDetail {
  message?: string;
  typeName?: string;
  stack?: string;
  parsedStack?: StackFrame[];
  [key: string]: unknown;
}

interface TelemetryEnvelope {
  sampleRate: number;
  tags?: Record<string, unknown>;
  data: {
    baseType: string;
    baseData: {
      success?: boolean;
      data?: string;
      target?: string;
      name?: string;
      url?: string;
      message?: string;
      exceptions?: ExceptionDetail[];
      properties?: Record<string, unknown>;
      [key: string]: unknown;
    };
  };
}

const REDACTED = '[REDACTED]';

export const DEFAULT_REDACTED_KEYS: string[] = [
  'key',
  'apiKey',
  'api_key',
  'token',
  'access_token',
  'accessToken',
  'refresh_token',
  'refreshToken',
  'id_token',
  'idToken',
  'secret',
  'client_secret',
  'clientSecret',
  'password',
  'passphrase',
  'auth',
  'authorization',
  'serviceAuthorization',
  'cookie',
  'sig',
  'AccountKey',
];

let cachedRawConfigKeys: string | undefined;
let cachedResolvedKeys: string[] | undefined;

/**
 * Configured keys (appInsights.redactedKeys / APPINSIGHTS_REDACTED_KEYS) extend the defaults rather
 * than replace them, so a mis-set value can never switch off redaction of the OS key.
 */
export const getRedactedKeys = (): string[] => {
  let extraKeys: string[] = [];
  let rawKey = '';
  if (config.has('appInsights.redactedKeys')) {
    const configuredKeys = config.get<string[] | string>('appInsights.redactedKeys');
    if (Array.isArray(configuredKeys)) {
      rawKey = configuredKeys.join('\u0000');
      extraKeys = configuredKeys.map((k) => String(k).trim()).filter(Boolean);
    } else if (typeof configuredKeys === 'string') {
      rawKey = configuredKeys;
      extraKeys = configuredKeys.split(',').map((k) => k.trim()).filter(Boolean);
    }
  }
  if (extraKeys.length === 0) {
    cachedRawConfigKeys = '';
    cachedResolvedKeys = DEFAULT_REDACTED_KEYS;
    return DEFAULT_REDACTED_KEYS;
  }
  if (cachedResolvedKeys && cachedRawConfigKeys === rawKey) {
    return cachedResolvedKeys;
  }
  const seen = new Set<string>();
  const resolved = [...DEFAULT_REDACTED_KEYS, ...extraKeys].filter((k) => {
    const lower = k.toLowerCase();
    if (seen.has(lower)) {
      return false;
    }
    seen.add(lower);
    return true;
  });
  cachedRawConfigKeys = rawKey;
  cachedResolvedKeys = resolved;
  return resolved;
};

// A key must start the string or follow one of these, so `keyboard` or `monkey` never match but
// `x-api-key`, `refresh_token` and `config.password` do.
const KEY_BOUNDARY = '(?:^|[?&;,\\s{\\[(._-])';
// Optional quote around the key: `"key"`, `'key'` or escaped JSON `\"key\"`.
const OPTIONAL_KEY_QUOTE = '(?:\\\\?["\'])?';
// An auth scheme is kept so only the credential after it is redacted.
const AUTH_SCHEME = '(?:(?:Bearer|Basic|Token|Digest|Negotiate|NTLM)[ \\t]+)?';

/**
 * Value formats, tried in order. Each entry is [opening quote and scheme that are kept, secret value].
 */
const VALUE_BRANCHES: ReadonlyArray<readonly [string, string]> = [
  // Escaped (double-encoded) JSON: \"key\":\"value\". Inside it a quote is written \\\" and a backslash \\\\.
  [`\\\\"${AUTH_SCHEME}`, '(?:[^"\\\\]|\\\\[^"\\\\]|\\\\\\\\(?:\\\\.|[^\\\\]))*'],
  // Double quotes: "key":"value" or key="value". Consumes the whole string, including escapes.
  [`"${AUTH_SCHEME}`, '(?:[^"\\\\]|\\\\.)*'],
  // Single quotes: 'key':'value' or key='value' (e.g. util.inspect output).
  [`'${AUTH_SCHEME}`, '(?:[^\'\\\\]|\\\\.)*'],
  // Digest parameter lists (`Digest username="u", response="r"`) run to the end of the line.
  ['Digest[ \\t]+', '[^\\r\\n]+'],
  // Unquoted: key=value or key: value. Ends at a delimiter, or before a trailing `:line:col` of a stack frame.
  [AUTH_SCHEME, '[^&#;,\\s"\'\\\\}]+?(?=:\\d+:\\d+\\)?(?:\\s|$)|[&#;,\\s"\'\\\\}]|$)'],
];

// Cookie headers carry many name=value pairs, so the whole unquoted header value is redacted.
const COOKIE_HEADER_REGEX = /(\bcookie[ \t]*:[ \t]*)(?!\\?["'])(?:[^\r\n\\]|\\(?![rn]))+/gi;
// Passwords in URLs, e.g. redis://:password@host:6380 or https://user:password@host.
// The lookbehind only lets a match start at the beginning of a scheme, keeping long words linear.
const URL_PASSWORD_REGEX = /(?<![a-z0-9+.-])([a-z][a-z0-9+.-]*:\/\/[^\s:/@]*:)[^\s@/]+(?=@)/gi;
// JWTs that appear without a key in front of them, e.g. `Token rejected: eyJ...`.
const JWT_REGEX = /\beyJ[\w-]{5,}\.[\w-]{5,}\.[\w-]*/g;

// Matches nothing; used when there are no keys to redact.
const NEVER_MATCH_REGEX = /(?!)/;

interface RedactionRules {
  regex: RegExp;
  // Property names whose whole value is redacted: `token`, `x-api-key`, `db.password`, `userPassword`, but not `keyboard`.
  sensitiveName: {test: (str: string) => boolean};
}

let cachedRulesKey: string | undefined;
let cachedRules: RedactionRules | undefined;

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Builds the key-based redaction rules, memoised on the (valid) key list so they are only rebuilt
 * when the keys change, not for every telemetry envelope.
 */
const buildRedactionRules = (keys: string[] = DEFAULT_REDACTED_KEYS): RedactionRules => {
  const validKeys = (keys || []).filter(Boolean);
  if (validKeys.length === 0) {
    return {regex: NEVER_MATCH_REGEX, sensitiveName: NEVER_MATCH_REGEX};
  }
  const cacheKey = validKeys.join('\u0000');
  if (cachedRules && cachedRulesKey === cacheKey) {
    return cachedRules;
  }
  const escaped = validKeys
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const capitalizedEscaped = validKeys
    .map((k) => capitalize(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const keyPart = `${KEY_BOUNDARY}${OPTIONAL_KEY_QUOTE}(?:${escaped})${OPTIONAL_KEY_QUOTE}[ \\t]*[=:][ \\t]*`;
  const values = VALUE_BRANCHES.map(([opener, value]) => `(${opener})(${value})`).join('|');
  const delimitedName = new RegExp(`(?:^|[._-])(?:${escaped})$`, 'i');
  const camelCaseName = new RegExp(`[a-z0-9](?:${capitalizedEscaped})$`);

  cachedRules = {
    regex: new RegExp(`(${keyPart})(?:${values})`, 'gi'),
    sensitiveName: {
      test: (name: string): boolean => delimitedName.test(name) || camelCaseName.test(name),
    },
  };
  cachedRulesKey = cacheKey;
  return cachedRules;
};

/**
 * Builds a regex that matches each sensitive key and its value in these forms:
 *  - query strings / form bodies:  `?key=abc`, `&key=abc`, `; key=abc`, `key=abc,`
 *  - JSON:                         `{"key":"a b, c"}`, `"key": 123`, `{\"key\":\"abc\"}` (escaped JSON)
 *  - single quotes:                `{key: 'abc'}`
 *  - header style:                 `key: abc`, `Authorization: Bearer abc`, `Authorization: Digest ...`
 * Quoted values are consumed in full, including spaces, punctuation and escaped characters.
 * Unquoted values end at whitespace, a quote, one of `& # ; , } \`, or a trailing stack frame `:line:col`.
 *
 * Group 1 is the key prefix; each value format then adds a pair of groups (kept opener, secret).
 * Use it through {@link sanitizeCredentials}. The regex is shared and has the `g` flag, so calling
 * `test()` or `exec()` on it directly carries `lastIndex` between calls; `String.prototype.replace`
 * resets it.
 */
export const buildSensitiveQueryParamsRegex = (keys: string[] = DEFAULT_REDACTED_KEYS): RegExp =>
  buildRedactionRules(keys).regex;

export const sanitizeCredentials = (
  value?: string,
  regexOrKeys?: RegExp | string[],
): string | undefined => {
  if (!value || typeof value !== 'string') {
    return value;
  }
  let regex: RegExp;
  if (regexOrKeys instanceof RegExp) {
    regex = regexOrKeys;
  } else if (Array.isArray(regexOrKeys)) {
    regex = buildSensitiveQueryParamsRegex(regexOrKeys);
  } else {
    regex = buildSensitiveQueryParamsRegex(getRedactedKeys());
  }

  return value
    .replace(COOKIE_HEADER_REGEX, `$1${REDACTED}`)
    .replace(regex, (match: string, keyPrefix: string, ...groups: unknown[]) => {
      for (let i = 0; i < VALUE_BRANCHES.length * 2; i += 2) {
        const secret = groups[i + 1];
        // Groups of the branches that did not match are undefined.
        if (typeof secret === 'string') {
          return secret ? `${keyPrefix}${groups[i]}${REDACTED}` : match;
        }
      }
      return match;
    })
    .replace(URL_PASSWORD_REGEX, `$1${REDACTED}`)
    .replace(JWT_REGEX, REDACTED);
};

const sanitizeStringFields = (target: Record<string, unknown> | undefined, regex: RegExp): void => {
  if (!target || typeof target !== 'object') {
    return;
  }
  for (const [field, fieldValue] of Object.entries(target)) {
    if (typeof fieldValue === 'string' && fieldValue) {
      target[field] = sanitizeCredentials(fieldValue, regex);
    }
  }
};

/**
 * Converts an object property to the string the SDK will send (see applicationinsights Util.validateStringMap),
 * so it can be sanitised before the SDK serialises it after the telemetry processors have run.
 */
const serialiseProperty = (propVal: object): string => {
  try {
    let target: unknown = propVal;
    if (propVal instanceof Error) {
      const {message, code, id} = propVal as Error & {code?: unknown; id?: unknown};
      target = {message, code: code || id || ''};
    } else if (!Array.isArray(propVal) && typeof (propVal as {toJSON?: unknown}).toJSON === 'function') {
      target = (propVal as {toJSON: () => unknown}).toJSON();
    }
    return target !== null && typeof target === 'object' ? JSON.stringify(target) : String(target);
  } catch {
    return '[UNSERIALISABLE]';
  }
};

const redactProperties = (properties: Record<string, unknown>, rules: RedactionRules): void => {
  for (const [name, propVal] of Object.entries(properties)) {
    if (propVal === null || propVal === undefined || typeof propVal === 'function') {
      continue;
    }
    if (rules.sensitiveName.test(name)) {
      properties[name] = REDACTED;
    } else if (typeof propVal === 'string') {
      properties[name] = sanitizeCredentials(propVal, rules.regex);
    } else if (typeof propVal === 'object') {
      properties[name] = sanitizeCredentials(serialiseProperty(propVal), rules.regex);
    }
  }
};

const redactEnvelope = (envelope: TelemetryEnvelope): void => {
  const rules = buildRedactionRules(getRedactedKeys());
  // Tags such as ai.operation.name can carry the request URL.
  sanitizeStringFields(envelope?.tags, rules.regex);

  const baseData = envelope?.data?.baseData;
  if (!baseData) {
    return;
  }
  // Every top-level string on every telemetry type: name, url, data, target, message, ...
  sanitizeStringFields(baseData, rules.regex);

  if (Array.isArray(baseData.exceptions)) {
    for (const exc of baseData.exceptions) {
      // message, typeName and stack
      sanitizeStringFields(exc, rules.regex);
      // The SDK sends exception stacks as parsedStack frames rather than a stack string.
      if (Array.isArray(exc?.parsedStack)) {
        for (const frame of exc.parsedStack) {
          sanitizeStringFields(frame, rules.regex);
        }
      }
    }
  }

  if (baseData.properties && typeof baseData.properties === 'object') {
    redactProperties(baseData.properties, rules);
  }
};

let redactionFailureReported = false;

export const _resetRedactionState = (): void => {
  redactionFailureReported = false;
  cachedRawConfigKeys = undefined;
  cachedResolvedKeys = undefined;
  cachedRulesKey = undefined;
  cachedRules = undefined;
};

export const stripCredentialsTelemetryProcessor = (envelope: TelemetryEnvelope): boolean => {
  try {
    redactEnvelope(envelope);
    return true;
  } catch (err) {
    // Fail closed: if a processor throws, the SDK sends the item anyway, unredacted. Drop it instead.
    // Only the first failure is logged, and without the envelope, so the log cannot leak or recurse.
    if (!redactionFailureReported) {
      redactionFailureReported = true;
      logger.error(`Credential redaction failed (${(err as Error)?.name}); dropping telemetry item`);
    }
    return false;
  }
};

/**
 * Belt-and-braces: never sample out failures, even if a workspace/component data cap re-imposes
 * sampling. The SDK's sampling processor keeps anything with sampleRate >= 100.
 */
export const keepFailuresTelemetryProcessor = (envelope: TelemetryEnvelope): boolean => {
  const {baseType, baseData} = envelope?.data ?? {};
  if (baseType === 'ExceptionData'
    || (baseType === 'RequestData' && baseData?.success === false)
    || (baseType === 'RemoteDependencyData' && baseData?.success === false)) {
    envelope.sampleRate = 100;
  }
  return true;
};

const getConfigValue = (key: string): string | undefined => {
  try {
    return config.has(key) ? config.get<string>(key) : undefined;
  } catch {
    return undefined;
  }
};

export class AppInsights {
  enable(): void {
    const connectionString = getConfigValue('appInsights.connectionString');
    const instrumentationKey = getConfigValue('appInsights.instrumentationKey');
    const setupKey = connectionString || instrumentationKey;
    if (setupKey) {
      appInsights.setup(setupKey)
        .setSendLiveMetrics(true)
        .start();

      const client = appInsights.defaultClient;
      client.context.tags[client.context.keys.cloudRole] = 'civil-citizen-ui';

      client.addTelemetryProcessor(stripCredentialsTelemetryProcessor);

      // Non-prod only: capture all telemetry to aid diagnosis (e.g. perftest load runs,
      // where default sampling drops ~99% of telemetry and hides failures). Prod is left
      // untouched so its telemetry volume/cost is unchanged.
      if (process.env.LAUNCH_DARKLY_ENV && process.env.LAUNCH_DARKLY_ENV !== 'prod') {
        client.config.samplingPercentage = 100;
        client.addTelemetryProcessor(keepFailuresTelemetryProcessor);
      }

      client.trackTrace({message: 'App insights activated'});
    } else {
      logger.error('App Insights connection string or instrumentation key not set');
    }
  }
}
