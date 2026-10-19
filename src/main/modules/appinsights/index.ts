import config from 'config';

const appInsights = require('applicationinsights');
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('appInsights');

interface ExceptionDetail {
  message?: string;
  stack?: string;
  [key: string]: unknown;
}

interface TelemetryEnvelope {
  sampleRate: number;
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

export const DEFAULT_REDACTED_KEYS: string[] = [
  'key',
  'apiKey',
  'api_key',
  'token',
  'access_token',
  'secret',
  'client_secret',
  'password',
  'auth',
  'authorization',
];

/**
 * Configured keys (appInsights.redactedKeys / APPINSIGHTS_REDACTED_KEYS) extend the defaults rather
 * than replace them, so a mis-set value can never switch off redaction of the OS key.
 */
export const getRedactedKeys = (): string[] => {
  let extraKeys: string[] = [];
  if (config.has('appInsights.redactedKeys')) {
    const configuredKeys = config.get<string[] | string>('appInsights.redactedKeys');
    if (Array.isArray(configuredKeys)) {
      extraKeys = configuredKeys.map((k) => String(k).trim()).filter(Boolean);
    } else if (typeof configuredKeys === 'string') {
      extraKeys = configuredKeys.split(',').map((k) => k.trim()).filter(Boolean);
    }
  }
  if (extraKeys.length === 0) {
    return DEFAULT_REDACTED_KEYS;
  }
  const seen = new Set<string>();
  return [...DEFAULT_REDACTED_KEYS, ...extraKeys].filter((k) => {
    const lower = k.toLowerCase();
    if (seen.has(lower)) {
      return false;
    }
    seen.add(lower);
    return true;
  });
};

// Matches nothing; used when there are no keys to redact.
const NEVER_MATCH_REGEX = /(?!)/;
let cachedRegexCacheKey: string | undefined;
let cachedRegex: RegExp | undefined;

/**
 * Builds a regex that captures `$1` (everything up to the secret) and `$2` (the secret), so callers
 * can replace with '$1[REDACTED]'. For each sensitive key it matches:
 *  - query strings / form bodies:  `?key=abc`, `&key=abc`, `; key=abc`, `key=abc,`
 *  - JSON (also escaped JSON):     `{"key":"abc"}`, `"key": 123`, `{\"key\":\"abc\"}`
 *  - header style:                 `key: abc`, `Authorization: Bearer abc`
 * An optional auth scheme (Bearer/Basic/Token) is kept in `$1` so the credential after it is redacted.
 * The value ends at whitespace, a quote, or one of `& # ; , } \`.
 *
 * The regex is memoised on the (valid) key list so it is only rebuilt when the keys change,
 * not for every telemetry envelope. Sharing the global regex is safe because
 * String.prototype.replace resets lastIndex before use.
 */
export const buildSensitiveQueryParamsRegex = (keys: string[] = DEFAULT_REDACTED_KEYS): RegExp => {
  const validKeys = (keys || []).filter(Boolean);
  if (validKeys.length === 0) {
    return NEVER_MATCH_REGEX;
  }
  const cacheKey = validKeys.join('\u0000');
  if (cachedRegex && cachedRegexCacheKey === cacheKey) {
    return cachedRegex;
  }
  const escaped = validKeys
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const quote = '(?:\\\\?["\'])?';
  const prefix = `(?:^|[?&;,\\s{\\[(])${quote}(?:${escaped})${quote}[ \\t]*[=:][ \\t]*${quote}(?:(?:Bearer|Basic|Token)[ \\t]+)?`;
  const value = '[^&#;,\\s"\'\\\\}]+';
  cachedRegex = new RegExp(`(${prefix})(${value})`, 'gi');
  cachedRegexCacheKey = cacheKey;
  return cachedRegex;
};

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

  return value.replace(regex, '$1[REDACTED]');
};

export const stripCredentialsTelemetryProcessor = (envelope: TelemetryEnvelope): boolean => {
  const {baseType, baseData} = envelope?.data ?? {};
  if (!baseData) {
    return true;
  }

  const regex = buildSensitiveQueryParamsRegex(getRedactedKeys());

  if (baseType === 'RemoteDependencyData') {
    if (baseData.data) {
      baseData.data = sanitizeCredentials(baseData.data, regex);
    }
    if (baseData.target) {
      baseData.target = sanitizeCredentials(baseData.target, regex);
    }
    if (baseData.name) {
      baseData.name = sanitizeCredentials(baseData.name, regex);
    }
  } else if (baseType === 'RequestData' || baseType === 'PageViewData') {
    if (baseData.url) {
      baseData.url = sanitizeCredentials(baseData.url, regex);
    }
  } else if (baseType === 'MessageData') {
    if (baseData.message) {
      baseData.message = sanitizeCredentials(baseData.message, regex);
    }
  } else if (baseType === 'ExceptionData') {
    if (baseData.message) {
      baseData.message = sanitizeCredentials(baseData.message, regex);
    }
    if (Array.isArray(baseData.exceptions)) {
      for (const exc of baseData.exceptions) {
        if (exc?.message) {
          exc.message = sanitizeCredentials(exc.message, regex);
        }
        if (exc?.stack) {
          exc.stack = sanitizeCredentials(exc.stack, regex);
        }
      }
    }
  }

  if (baseData.properties && typeof baseData.properties === 'object') {
    const sensitiveNames = new Set(getRedactedKeys().map((k) => k.toLowerCase()));
    for (const [key, propVal] of Object.entries(baseData.properties)) {
      if (typeof propVal === 'string') {
        baseData.properties[key] = sensitiveNames.has(key.toLowerCase())
          ? '[REDACTED]'
          : sanitizeCredentials(propVal, regex);
      }
    }
  }

  return true;
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

export class AppInsights {
  enable(): void {
    const instrumentationKey = config.get<string>('appInsights.instrumentationKey');
    if (instrumentationKey) {
      appInsights.setup(instrumentationKey)
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
      logger.error('App Insights instrumentation key not set');
    }
  }
}
