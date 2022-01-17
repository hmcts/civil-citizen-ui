import os from 'os';
import { Application } from 'express';

const healthCheck = require('@hmcts/nodejs-healthcheck');

export class HealthCheck {
  public enableFor(app: Application): void {
    const healthCheckConfig = {
      checks: {
        // TODO: add proper health checks for the application
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
