import os from 'os';
import {Application} from 'express';

const healthCheck = require('@hmcts/nodejs-healthcheck');
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('healthCheck');

export class HealthCheck {
  public enableFor(app: Application): void {

    const redis = healthCheck.raw(() => {
      logger.info('about to ping Redis...');
      return app.locals.draftStoreClient.ping()
        .then((pingResponse: string) => {
          logger.info('pingResponse: ', pingResponse);
          return healthCheck.status(pingResponse === 'PONG');
        })
        .catch((error: Error) => {
          logger.error('Health check failed on redis', error);
          return false;
        });
    });

    const healthCheckConfig = {
      checks: {
        'draft-store': redis,
        // add health checks for other application dependency services
      },
      buildInfo: {
        name: 'civil-citizen-ui',
        host: os.hostname(),
        uptime: process.uptime(),
      },
    };

    healthCheck.addTo(app, healthCheckConfig);
  }
}
