import config from 'config';

const appInsights = require('applicationinsights');
// @hmcts/nodejs-logging (winston 2) is loaded before Application Insights, from PII
// redaction in server.ts. Its console transport writes to process.stderr, which
// console auto-collection does not see. Requiring winston now that the
// diagnostic-channel publisher is registered patches Logger.prototype, so
// logger.error calls made afterwards are sent as traces. This must happen
// before any logger is created in this process.
require('winston');
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('appInsights');

interface TelemetryEnvelope {
  sampleRate: number;
  data: { baseType: string; baseData: { success?: boolean } };
}

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
        .setAutoCollectConsole(true, true)
        .setSendLiveMetrics(true)
        .start();

      const client = appInsights.defaultClient;
      client.context.tags[client.context.keys.cloudRole] = 'civil-citizen-ui';

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
