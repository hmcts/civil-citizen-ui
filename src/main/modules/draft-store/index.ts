import config from 'config';
import {Application} from 'express';
import {LoggerInstance} from 'winston';

const Redis = require('ioredis');

export class DraftStoreClient {
  public static REDIS_CONNECTION_SUCCESS = 'Connected to Redis instance successfully';

  constructor(private readonly logger: LoggerInstance) {
  }

  public enableFor(app: Application): void {
    const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
    const connectionString = `${protocol}:${config.get('services.draftStore.redis.key')}@${config.get('services.draftStore.redis.host')}:${config.get('services.draftStore.redis.port')}`;
    this.logger.info(`connectionString: ${connectionString}`);
    const client = new Redis(connectionString);

    app.locals.draftStoreClient = client;
    this.logger.info(DraftStoreClient.REDIS_CONNECTION_SUCCESS);

    this.logger.info('I am in draft store index.ts');

    this.logger.info('loading redis data');
    this.logger.info(app.locals.draftStoreClient.ping());
    return app.locals.draftStoreClient.ping()
      .then((pingResponse: string) => {
        this.logger.info('pingResponse: ', pingResponse);
        return true;
      })
      .catch((error: Error) => {
        this.logger.error('Health check failed on redis', error);
        return false;
      });
  }
}
