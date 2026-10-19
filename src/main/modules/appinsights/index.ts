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

export const getRedactedKeys = (): string[] => {
  if (config.has('appInsights.redactedKeys')) {
    const configuredKeys = config.get<string[] | string>('appInsights.redactedKeys');
    if (Array.isArray(configuredKeys) && configuredKeys.length > 0) {
      return configuredKeys;
    }
    if (typeof configuredKeys === 'string' && configuredKeys.trim().length > 0) {
      return configuredKeys.split(',').map((k) => k.trim()).filter(Boolean);
    }
  }
  return DEFAULT_REDACTED_KEYS;
};

export const buildSensitiveQueryParamsRegex = (keys: string[] = DEFAULT_REDACTED_KEYS): RegExp => {
  if (!keys || keys.length === 0) {
    return /$^/;
  }
  const escaped = keys
    .filter(Boolean)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  return new RegExp(`((?:^|[?&\\s])(?:${escaped})=)([^&#\\s]+)`, 'gi');
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
    for (const [key, propVal] of Object.entries(baseData.properties)) {
      if (typeof propVal === 'string') {
        baseData.properties[key] = sanitizeCredentials(propVal, regex);
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
  const {baseType, baseData} = envelope.data;
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
