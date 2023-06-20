
import config from 'config';
import {Application} from 'express';

const Redis = require('ioredis');
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('DraftStore Client');
const REDIS_DATA = require('./redisData.json');

const REDIS_CONNECTION_SUCCESS = 'Connected to Redis instance successfully';

export const draftStoreClient = (app: Application) => {

  const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
  const connectionString = `${protocol}:${config.get('services.draftStore.redis.key')}@${config.get('services.draftStore.redis.host')}:${config.get('services.draftStore.redis.port')}`;
  logger.info(`connectionString: ${connectionString}`);
  const client = new Redis(connectionString);

  app.locals.draftStoreClient = client;
  logger.info(REDIS_CONNECTION_SUCCESS);

  app.locals.draftStoreClient.on('connect', () => {
    REDIS_DATA.forEach(async (element: any) => {
      await client.set(element.id, JSON.stringify(element, null, 4));
      logger.info(`Mock data ${element.id} saved to Redis`);
    });
  });

};
