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

    this.logger.info(client.ping());
    app.locals.draftStoreClient = client;
    this.logger.info(DraftStoreClient.REDIS_CONNECTION_SUCCESS);
    app.locals.draftStoreClient.on('connect', () => {
      this.logger.info('inside on connect---');
    });
  }
}
