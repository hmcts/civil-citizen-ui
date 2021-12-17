import config from 'config';
import { Configuration, DistributedTracingModes, TelemetryClient, defaultClient, setup, start } from 'applicationinsights';
import { errorLogger, operationNameUUIDHider } from './telemetryProcessors';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';

const logger: LoggerInstance = Logger.getLogger('customEventTracker');

export class AppInsights {
  private readonly instrumentationKey: string;
  private client: TelemetryClient;

  constructor(instrumentationKey?: string, client?: TelemetryClient) {
    this.instrumentationKey = instrumentationKey || config.get<string>('secrets.cmc.AppInsightsInstrumentationKey');
    this.client = client || defaultClient;
  }

  enable() {
    this.setup();
    this.prepareClientContext(config.get<string>('appInsights.roleName'));
    this.prepareTelemetryProcessors();
    this.start();
  }

  setup(): typeof Configuration {
    // eslint-disable-next-line mocha/no-top-level-hooks,mocha/no-hooks-for-single-case
    return setup(this.instrumentationKey)
      .setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C)
      .setSendLiveMetrics(true)
      .setAutoCollectConsole(true, true);
  }

  getClient() {
    if (!this.client) {
      this.client = defaultClient;
    }
    return this.client;
  }

  prepareClientContext(cloudRole: string) {
    this.getClient().context.tags[this.client.context.keys.cloudRole] = cloudRole;
  }

  prepareTelemetryProcessors() {
    this.getClient().addTelemetryProcessor(operationNameUUIDHider());
    if (this.instrumentationKey === 'STDOUT') {
      this.client.addTelemetryProcessor(errorLogger(logger));
    }
  }

  start() {
    start();
  }
}
