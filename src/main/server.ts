#!/usr/bin/env node

import './ts-paths-bootstrap';
import { Logger } from '@hmcts/nodejs-logging';
import { AppInsights } from 'modules/app-insights';
import * as config from 'config';
import * as toBoolean from 'to-boolean';
import { app } from './app';
import { ApplicationCluster } from './applicationCluster';
import { ApplicationRunner } from './applicationRunner';

const logger = Logger.getLogger('server.ts');

// App Insights needs to be enabled as early as possible as it monitors other libraries as well
logger.info('enabling App Insights');
new AppInsights().enable();

logger.info('Loading app context');

if (toBoolean(config.get<boolean>('featureToggles.clusterMode'))) {
  ApplicationCluster.execute(() => ApplicationRunner.run(app));
} else {
  ApplicationRunner.run(app);
}
