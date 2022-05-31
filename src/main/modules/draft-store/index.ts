import config from 'config';
import {Application} from 'express';

const Redis = require('ioredis');

const REDIS_DATA = require('./redisData.json');

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreIndex');
export class DraftStoreClient {

  public static REDIS_CONNECTION_SUCCESS = 'Connected to Redis instance successfully';


  public enableFor(app: Application): void {

    const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
    const connectionString = `${protocol}default:${config.get('services.draftStore.redis.key')}@${config.get('services.draftStore.redis.host')}:${config.get('services.draftStore.redis.port')}`;
    logger.info(`connectionString: ${connectionString}`);
    const client = new Redis(connectionString);

    app.locals.draftStoreClient = client;
    logger.info(DraftStoreClient.REDIS_CONNECTION_SUCCESS);

    app.locals.draftStoreClient.on('connect', function () {
      REDIS_DATA.forEach((element: any) => {
        client.set(element.id, JSON.stringify(element, null, 4)).then(() =>
          logger.info(`Mock data ${element.id} saved to Redis`),
        );
      });
    });
  }
}