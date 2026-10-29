import config from 'config';
import {isUiPreviewEnabled} from 'common/utils/uiPreviewConfig';

const appInsights = require('applicationinsights');
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('appInsights');

/**
 * Builds an Application Insights connection string from config.
 *
 * @remarks
 * SDK 3.x requires a connection string. Deployments may still store a bare
 * instrumentation key (Key Vault / `APPINSIGHTS_KEY`); wrap that as
 * `InstrumentationKey=...`. Full connection strings are passed through unchanged.
 *
 * @param value - Connection string or instrumentation key from config
 */
export function toConnectionString(value: string): string {
  const trimmed = value.trim();
  if (/InstrumentationKey=|IngestionEndpoint=/i.test(trimmed)) {
    return trimmed;
  }
  return `InstrumentationKey=${trimmed}`;
}

export class AppInsights {
  enable(): void {
    if (isUiPreviewEnabled()) return;
    const instrumentationKey = config.get<string>('appInsights.instrumentationKey');
    if (instrumentationKey) {
      // SDK 3.x: all client config must be applied before start().
      appInsights.setup(toConnectionString(instrumentationKey))
        .setSendLiveMetrics(true);

      const client = appInsights.defaultClient;
      client.context.tags[client.context.keys.cloudRole] = 'civil-citizen-ui';
      // SDK 3 derives the cloud role from the OpenTelemetry resource.
      process.env.OTEL_SERVICE_NAME = 'civil-citizen-ui';
      // Keep the existing percentage policy: SDK 3's default rate limiter
      // otherwise takes precedence over samplingPercentage, including 100%.
      client.config.azureMonitorOpenTelemetryOptions = {
        ...client.config.azureMonitorOpenTelemetryOptions,
        tracesPerSecond: 0,
      };

      // Non-prod only: capture all telemetry to aid diagnosis (e.g. perftest load runs,
      // where default sampling drops most telemetry and hides failures). Prod is left
      // untouched so its telemetry volume/cost is unchanged.
      //
      // Note: addTelemetryProcessor is unsupported in SDK 3.x; samplingPercentage is
      // the supported equivalent for “send everything” in non-prod.
      if (process.env.LAUNCH_DARKLY_ENV && process.env.LAUNCH_DARKLY_ENV !== 'prod') {
        client.config.samplingPercentage = 100;
      }

      appInsights.start();
      client.trackTrace({message: 'App insights activated'});
    } else {
      logger.error('App Insights instrumentation key not set');
    }
  }
}
