import config from 'config';
import {Application} from 'express';
import {LoggerInstance} from 'winston';

const Redis = require('ioredis');

const REDIS_DATA = require('./redisData.json');

export class DraftStoreClient {

  public static REDIS_CONNECTION_SUCCESS = 'Connected to Redis instance successfully';

  constructor(private readonly logger: LoggerInstance) {
  }

  public enableFor(app: Application): void {

    const redisOptions = {
      host: config.get('services.draftStore.redis.host'),
      port: config.get('services.draftStore.redis.port'),
      password: config.get('services.draftStore.redis.key'),
      tls: config.get('services.draftStore.redis.tls') && {
        servername: config.get('services.draftStore.redis.host'),
      },
    };
    const client = new Redis(redisOptions);

    app.locals.draftStoreClient = client;
    this.logger.info(DraftStoreClient.REDIS_CONNECTION_SUCCESS);

    client.set('1645882162449409', JSON.stringify(REDIS_DATA, null, 4)).then(() =>
      this.logger.info('Mock data saved to Redis'),
    );
  }
}
