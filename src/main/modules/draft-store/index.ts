import config from 'config';
import {Application} from 'express';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('DraftStoreClient');

const Redis = require('ioredis');

const REDIS_DATA = require('./redisData.json');

export class DraftStoreClient {

  public static REDIS_CONNECTION_SUCCESS = 'Connected to Redis instance successfully';


  public enableFor(app: Application): void {

    const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
    const connectionString = `${protocol}default:${config.get('services.draftStore.redis.key')}@${config.get('services.draftStore.redis.host')}:${config.get('services.draftStore.redis.port')}`;
    logger.info(`connectionString: ${connectionString}`);
    const client = new Redis(connectionString);

    app.locals.draftStoreClient = client;
    logger.info(DraftStoreClient.REDIS_CONNECTION_SUCCESS);

    client.set('1645882162449409', JSON.stringify(REDIS_DATA[0], null, 4)).then(() =>
      logger.info('Mock data 1645882162449409 saved to Redis'),
    );
    client.set('1645882162449408', JSON.stringify(REDIS_DATA[1], null, 4)).then(() =>
      logger.info('Mock data 1645882162449408 saved to Redis'),
    );
  }
}
