import config from 'config';
import {Application} from 'express';
import {LoggerInstance} from 'winston';
const Redis = require('ioredis');

export class DraftStoreClient {

  public static REDIS_CONNECTION_SUCCESS = 'Connected to Redis instance successfully';

  constructor(private readonly logger: LoggerInstance) {
  }

  public enableFor(app: Application): void {
    app.locals.draftStoreClient = new Redis({
      host: config.get('services.draftStore.redis.host'),
      port: config.get('services.draftStore.redis.port'),
      password: config.get('services.draftStore.redis.key'),
      connectTimeout: 15000,
    });

    this.logger.info(DraftStoreClient.REDIS_CONNECTION_SUCCESS);
  }
}
