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

    const redisHost = `${config.get('services.draftStore.redis.host')}:${config.get('services.draftStore.redis.port')}`;
    const redisOptions = {
      password: config.get('services.draftStore.redis.key'),
    };
    const client = new Redis(redisHost, redisOptions);

    app.locals.draftStoreClient = client;
    this.logger.info(DraftStoreClient.REDIS_CONNECTION_SUCCESS);

    client.set('1645882162449409', JSON.stringify(REDIS_DATA, null, 4)).then(() =>
      this.logger.info('Mock data saved to Redis'),
    );
  }
}
