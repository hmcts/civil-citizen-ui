import {hostname} from 'os';
import {Application} from 'express';
import config from 'config';
import {isHmctsAccessMigrationEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';

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
    const hmctsAccessProbe = healthCheck.web(
      config.get('services.idam.hmctsAccessURL') + '/health',
      {
        timeout: config.get('health.timeout'),
        deadline: config.get('health.deadline'),
      },
    );

    // Gate the probe behind the hmcts-access-migration LaunchDarkly flag so it only
    // runs where HMCTS Access is live (non-prod during the migration). When the flag
    // is off (e.g. production until cutover) report UP so pods stay healthy.
    const hmctsAccess = healthCheck.raw(async () => {
      return (await isHmctsAccessMigrationEnabled())
        ? hmctsAccessProbe.call()
        : healthCheck.status(true);
    });

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
