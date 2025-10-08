import {hostname} from 'os';
import {Application, Response} from 'express';
import {Logger} from '@hmcts/nodejs-logging';

const logger = Logger.getLogger('healthCheck');
const HEALTH_ENDPOINT = '/health';

interface HealthPayload {
  status: 'UP' | 'DOWN';
  checks: {
    'draft-store': {
      status: 'UP' | 'DOWN';
    };
  };
  buildInfo: {
    name: string;
    host: string;
    uptime: number;
  };
}

export class HealthCheck {
  public enableFor(app: Application): void {
    app.get(HEALTH_ENDPOINT, async (_req, res) => {
      const buildInfo: HealthPayload['buildInfo'] = {
        name: 'civil-citizen-ui',
        host: hostname(),
        uptime: process.uptime(),
      };

      try {
        logger.info('About to ping Redis...');
        const pingResponse: unknown = await app.locals?.draftStoreClient?.ping?.();
        const isHealthy = pingResponse === 'PONG';

        if (!isHealthy) {
          logger.error('Unexpected Redis ping response', pingResponse);
          return this.sendDown(res, buildInfo);
        }

        return res.status(200).json(this.buildPayload('UP', buildInfo));
      } catch (error) {
        logger.error('Health check failed on redis', error);
        return this.sendDown(res, buildInfo);
      }
    });
  }

  private buildPayload(status: 'UP' | 'DOWN', buildInfo: HealthPayload['buildInfo']): HealthPayload {
    return {
      status,
      checks: {
        'draft-store': {
          status,
        },
      },
      buildInfo,
    };
  }

  private sendDown(res: Response, buildInfo: HealthPayload['buildInfo']): void {
    res.status(503).json(this.buildPayload('DOWN', buildInfo));
  }
}
