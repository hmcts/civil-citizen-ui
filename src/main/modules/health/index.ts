import os from 'os';
import { Application } from 'express';

const healthCheck = require('@hmcts/nodejs-healthcheck');

export class HealthCheck {
  public enableFor(app: Application): void {

    // const redis = app.locals.draftStoreClient
    //   ? healthCheck.raw(() => app.locals.draftStoreClient.ping()
    //     .then(() => healthCheck.up())
    //     .catch(() => healthCheck.down()))
    //   : null;

    const healthCheckConfig = {
      checks: {
        // 'draft-store': redis,
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
