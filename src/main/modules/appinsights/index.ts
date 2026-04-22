import config from 'config';

const appInsights = require('applicationinsights');
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('appInsights');

export class AppInsights {
  enable(): void {
    const instrumentationKey = config.get<string>('appInsights.instrumentationKey');
    const keyConfigured = Boolean(instrumentationKey);

    logger.info(`APPINSIGHTS_INIT_START keyConfigured=${keyConfigured}`);

    if (keyConfigured) {
      appInsights.setup(instrumentationKey)
        .setSendLiveMetrics(true)
        .start();

      // Force full telemetry during investigation; ingestion currently reports "Telemetry sampled out."
      appInsights.defaultClient.config.samplingPercentage = 100;
      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'civil-citizen-ui';
      appInsights.defaultClient.trackTrace({message: 'App insights activated'});
      logger.info(
        `APPINSIGHTS_INIT_SUCCESS defaultClientReady=${Boolean(appInsights.defaultClient)} ` +
        `samplingPercentage=${appInsights.defaultClient.config.samplingPercentage}`,
      );
    } else {
      logger.error(
        'APPINSIGHTS_INIT_SKIPPED missing appInsights.instrumentationKey. ' +
        `APPINSIGHTS_KEY_present=${Boolean(process.env.APPINSIGHTS_KEY)} ` +
        `APPINSIGHTS_INSTRUMENTATIONKEY_present=${Boolean(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)}`,
      );
    }
  }
}
