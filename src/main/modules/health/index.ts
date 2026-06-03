import {hostname} from 'os';
import {Application} from 'express';
import config from 'config';

const healthCheck = require('@hmcts/nodejs-healthcheck');
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('healthCheck');

export class HealthCheck {
  public enableFor(app: Application): void {

    const redis = healthCheck.raw(() => {
      logger.info('About to ping Redis...');
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

    // Probe the HMCTS Access sign-in page reachability. During the IDAM Web Public
    // -> HMCTS Access migration both UIs sit behind the same base URL, so the existing
    // draft-store probe alone can report healthy while the new sign-in page is down.
    // Ref: idam-user-dashboard PR #1087.
    const hmctsAccess = healthCheck.web(
      config.get('services.idam.hmctsAccessURL') + '/health',
      {
        timeout: config.get('health.timeout'),
        deadline: config.get('health.deadline'),
      },
    );

    const healthCheckConfig = {
      checks: {
        'draft-store': redis,
        'hmcts-access': hmctsAccess,
      },
      buildInfo: {
        name: 'civil-citizen-ui',
        host: hostname(),
        uptime: process.uptime(),
      },
    };

    healthCheck.addTo(app, healthCheckConfig);
  }
}
