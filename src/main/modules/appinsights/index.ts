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
  'SharedAccessKey',
  'pwd',
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
  // JSON arrays are consumed in full; optional closers also redact an unterminated value to end of input.
  ['', '\\[(?:[^"\\\\\\]]|\\\\.|"(?:[^"\\\\]|\\\\.)*"?)*\\]?'],
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
  camelRegex: RegExp;
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
    return {regex: NEVER_MATCH_REGEX, camelRegex: NEVER_MATCH_REGEX, sensitiveName: NEVER_MATCH_REGEX};
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
  const camelKeyPart = `(?<=[a-z0-9])(?:${capitalizedEscaped})${OPTIONAL_KEY_QUOTE}[ \\t]*[=:][ \\t]*`;
  const values = VALUE_BRANCHES.map(([opener, value]) => `(${opener})(${value})`).join('|');
  const delimitedName = new RegExp(`(?:^|[._-])(?:${escaped})$`, 'i');
  const camelCaseName = new RegExp(`[a-z0-9](?:${capitalizedEscaped})$`);

  cachedRules = {
    regex: new RegExp(`(${keyPart})(?:${values})`, 'gi'),
    camelRegex: new RegExp(`(${camelKeyPart})(?:${values})`, 'g'),
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

const replaceSensitiveValues = (value: string, regex: RegExp): string => value.replace(
  regex,
  (match: string, keyPrefix: string, ...groups: unknown[]) => {
    for (let i = 0; i < VALUE_BRANCHES.length * 2; i += 2) {
      const secret = groups[i + 1];
      if (typeof secret === 'string') {
        return secret ? `${keyPrefix}${groups[i]}${REDACTED}` : match;
      }
    }
    return match;
  },
);

const sanitizeWithRules = (value: string, rules: RedactionRules): string => {
  const credentialSafe = replaceSensitiveValues(
    replaceSensitiveValues(value.replace(COOKIE_HEADER_REGEX, `$1${REDACTED}`), rules.regex),
    rules.camelRegex,
  );
  return credentialSafe.replace(URL_PASSWORD_REGEX, `$1${REDACTED}`).replace(JWT_REGEX, REDACTED);
};

const sanitizeWithRegex = (value: string, regex: RegExp): string => replaceSensitiveValues(
  value.replace(COOKIE_HEADER_REGEX, `$1${REDACTED}`),
  regex,
).replace(URL_PASSWORD_REGEX, `$1${REDACTED}`).replace(JWT_REGEX, REDACTED);

export const sanitizeCredentials = (
  value?: string,
  regexOrKeys?: RegExp | string[],
): string | undefined => {
  if (!value || typeof value !== 'string') {
    return value;
  }
  if (regexOrKeys instanceof RegExp) {
    return sanitizeWithRegex(value, regexOrKeys);
  }
  const keys = Array.isArray(regexOrKeys) ? regexOrKeys : getRedactedKeys();
  return sanitizeWithRules(value, buildRedactionRules(keys));
};

const sanitizeStringFields = (target: Record<string, unknown> | undefined, rules: RedactionRules): void => {
  if (!target || typeof target !== 'object') {
    return;
  }
  for (const [field, fieldValue] of Object.entries(target)) {
    if (typeof fieldValue === 'string' && fieldValue) {
      target[field] = redactString(fieldValue, rules);
    }
  }
};

/**
 * Reduces an object to what JSON.stringify would see (see applicationinsights Util.validateStringMap):
 * errors become {message, code} and toJSON() is honoured.
 */
const toSerialisable = (value: object): unknown => {
  if (value instanceof Error) {
    const {message, code, id} = value as Error & {code?: unknown; id?: unknown};
    return {message, code: code || id || ''};
  }
  if (!Array.isArray(value) && typeof (value as {toJSON?: unknown}).toJSON === 'function') {
    return (value as {toJSON: () => unknown}).toJSON();
  }
  return value;
};

const MAX_REDACTION_DEPTH = 100;
const MAX_REDACTION_INPUT_LENGTH = 256 * 1024;
const MAX_JSON_FRAGMENTS = 1000;

interface JsonFragment {
  start: number;
  end: number;
  tooDeep: boolean;
}

interface JsonFrame {
  start: number;
  closer: '}' | ']';
  maxDepth: number;
  end?: number;
}

interface JsonScan {
  fragments: JsonFragment[];
  unclosedStart?: number;
}

const scanJsonFragments = (value: string): JsonScan => {
  const stack: JsonFrame[] = [];
  const frames: JsonFrame[] = [];
  let inString = false;
  let escaped = false;
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (stack.length > 0) {
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === '"') {
          inString = false;
        }
        continue;
      }
      if (character === '"') {
        inString = true;
        continue;
      }
    }
    if (character === '{' || character === '[') {
      const frame: JsonFrame = {start: index, closer: character === '{' ? '}' : ']', maxDepth: 1};
      frames.push(frame);
      stack.push(frame);
    } else if (stack.length > 0 && (character === '}' || character === ']')) {
      const frame = stack.pop() as JsonFrame;
      if (frame.closer !== character) {
        // A mismatched closer invalidates every currently open candidate.
        stack.length = 0;
        continue;
      }
      frame.end = index + 1;
      const parent = stack[stack.length - 1];
      if (parent) {
        parent.maxDepth = Math.max(parent.maxDepth, frame.maxDepth + 1);
      }
    }
  }
  return {
    fragments: frames
      .filter((frame): frame is JsonFrame & {end: number} => frame.end !== undefined)
      .map((frame) => ({
        start: frame.start,
        end: frame.end,
        tooDeep: frame.maxDepth > MAX_REDACTION_DEPTH,
      })),
    unclosedStart: stack[0]?.start,
  };
};

/**
 * The SDK stringifies object properties before the telemetry processors run, so nested values often arrive
 * as JSON text. A string holding a JSON object or array is parsed, redacted by property name and
 * re-serialised; any other string, or text that is not valid JSON, is sanitised with the key patterns.
 */
const isTruncationBoundary = (character: string): boolean => /[\s&;,}"'\]]/.test(character);

const getTruncationPoint = (value: string): number => {
  let end = MAX_REDACTION_INPUT_LENGTH;
  while (end > 0 && !isTruncationBoundary(value[end - 1])) {
    end--;
  }
  return end;
};

const redactString = (value: string, rules: RedactionRules, depth = 0): string => {
  try {
    const truncated = value.length > MAX_REDACTION_INPUT_LENGTH;
    const source = truncated ? value.slice(0, getTruncationPoint(value)) : value;
    const {fragments, unclosedStart} = scanJsonFragments(source);
    // If the ceiling cut through a JSON value, discard that entire fragment rather than
    // allowing its remaining text to fall back to key-pattern-only redaction.
    const sourceEnd = truncated && unclosedStart !== undefined ? unclosedStart : source.length;
    let result = '';
    let cursor = 0;
    let fragmentAttempts = 0;
    for (const fragment of fragments) {
      if (fragment.start >= sourceEnd || fragment.start < cursor) {
        continue;
      }
      if (fragmentAttempts++ >= MAX_JSON_FRAGMENTS) {
        break;
      }
      const raw = source.slice(fragment.start, fragment.end);
      if (fragment.tooDeep) {
        result += source.slice(cursor, fragment.start) + '[UNSERIALISABLE]';
        cursor = fragment.end;
        continue;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        continue;
      }
      if (parsed === null || typeof parsed !== 'object') {
        continue;
      }
      result += source.slice(cursor, fragment.start);
      const changed = {value: false};
      try {
        const redacted = redactValue(parsed, rules, new Set<object>(), depth + 1, changed);
        result += changed.value ? JSON.stringify(redacted) : raw;
      } catch {
        result += '[UNSERIALISABLE]';
      }
      cursor = fragment.end;
    }
    const withFragments = result + source.slice(cursor, sourceEnd);
    const sanitised = sanitizeWithRules(withFragments, rules);
    return truncated ? `${sanitised}[TRUNCATED]` : sanitised;
  } catch {
    return '[UNSERIALISABLE]';
  }
};

/**
 * Returns a redacted deep copy of a value without mutating the original. Strings are sanitised, and the
 * whole value of any property with a sensitive name is replaced, however deeply it is nested and whether
 * it is a string, array or object. Throws on a circular structure, so the caller can drop that property.
 */
const redactValue = (
  value: unknown,
  rules: RedactionRules,
  ancestors: Set<object>,
  depth = 0,
  changed: {value: boolean} = {value: false},
): unknown => {
  if (depth > MAX_REDACTION_DEPTH) {
    throw new TypeError('Maximum redaction depth exceeded');
  }
  if (typeof value === 'string') {
    const redacted = redactString(value, rules, depth);
    changed.value ||= redacted !== value;
    return redacted;
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (ancestors.has(value)) {
    throw new TypeError('Circular structure');
  }
  ancestors.add(value);
  try {
    const source = toSerialisable(value);
    if (source === null || typeof source !== 'object') {
      return redactValue(source, rules, ancestors, depth + 1, changed);
    }
    if (Array.isArray(source)) {
      const isHeaderList = source.length % 2 === 0 && source.every((item) => typeof item === 'string');
      return source.map((item, index) => {
        if (isHeaderList && index % 2 === 1 && rules.sensitiveName.test(source[index - 1] as string)) {
          changed.value = true;
          return REDACTED;
        }
        return redactValue(item, rules, ancestors, depth + 1, changed);
      });
    }
    return Object.fromEntries(Object.entries(source).map(([name, child]) => {
      const isEmpty = child === null || child === undefined || typeof child === 'function';
      if (rules.sensitiveName.test(name) && !isEmpty) {
        changed.value = true;
        return [name, REDACTED];
      }
      return [name, redactValue(child, rules, ancestors, depth + 1, changed)];
    }));
  } finally {
    ancestors.delete(value);
  }
};

/**
 * Converts an object property to the string the SDK will send, redacting it first, because the SDK
 * serialises it after the telemetry processors have run.
 */
const serialiseProperty = (propVal: object, rules: RedactionRules): string => {
  try {
    const redacted = redactValue(propVal, rules, new Set<object>());
    return redacted !== null && typeof redacted === 'object' ? JSON.stringify(redacted) : String(redacted);
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
      properties[name] = redactString(propVal, rules);
    } else if (typeof propVal === 'object') {
      properties[name] = sanitizeWithRules(serialiseProperty(propVal, rules), rules);
    }
  }
};

const redactEnvelope = (envelope: TelemetryEnvelope): void => {
  const rules = buildRedactionRules(getRedactedKeys());
  // Tags such as ai.operation.name can carry the request URL.
  sanitizeStringFields(envelope?.tags, rules);

  const baseData = envelope?.data?.baseData;
  if (!baseData) {
    return;
  }
  // Every top-level string on every telemetry type: name, url, data, target, message, ...
  sanitizeStringFields(baseData, rules);

  if (Array.isArray(baseData.exceptions)) {
    for (const exc of baseData.exceptions) {
      // message, typeName and stack
      sanitizeStringFields(exc, rules);
      // The SDK sends exception stacks as parsedStack frames rather than a stack string.
      if (Array.isArray(exc?.parsedStack)) {
        for (const frame of exc.parsedStack) {
          sanitizeStringFields(frame, rules);
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
