import config from 'config';

const appInsights = require('applicationinsights');
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('appInsights');

export class AppInsights {
  enable(): void {
    const instrumentationKey = config.get<string>('appInsights.instrumentationKey');
    if (instrumentationKey) {
      appInsights.setup(instrumentationKey)
        .setSendLiveMetrics(true)
        .start();

      appInsights.defaultClient.config.samplingPercentage = 100;
      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'civil-citizen-ui';
      appInsights.defaultClient.trackTrace({message: 'App insights activated'});
    } else {
      logger.error('App Insights instrumentation key not set');
    }
  }
}
