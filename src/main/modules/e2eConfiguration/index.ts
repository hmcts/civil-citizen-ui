import {Application} from 'express';
import {LoggerInstance} from 'winston';
import RedisStore from 'connect-redis';

const Redis = require('ioredis-mock');
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('e2eConfiguration');

const REDIS_DATA = require('./redisData.json');
const GA_REDIS_DATA = require('./gaRedisData.json');

export class DraftStoreCliente2e {
  public static REDIS_CONNECTION_SUCCESS = 'Connected to Redis instance successfully e2e tests';

  constructor(private readonly logger: LoggerInstance) {
  }

  public enableFor(app: Application): void {
    const client = new Redis();

    app.locals.draftStoreClient = client;
    this.logger.info(DraftStoreCliente2e.REDIS_CONNECTION_SUCCESS);

    app.locals.draftStoreClient.on('connect', () => {
      REDIS_DATA.forEach((element: any) => {
        element.case_data.draftClaimCreatedAt = Date.now();
        client.set(element.id, JSON.stringify(element, null, 4)).then(() =>
          this.logger.info(`Mock data ${element.id} saved to Redis`),
        );
      });
      GA_REDIS_DATA.forEach((element: any) => {
        client.set(element.id, JSON.stringify(element.value, null, 4)).then(() =>
          this.logger.info(`Mock data ${element.id} saved to Redis`),
        );
      });
    });
  }
}

export const getRedisStoreForSessione2e = () => {
  /* istanbul ignore next -- investigation logging for Redis session store */
  logger.info('Redis session store created (e2e mock)', { prefix: 'citizen-ui-session:', ttl: 86400 }); // NOSONAR
  return new RedisStore({
    client: new Redis(),
    prefix: 'citizen-ui-session:',
    ttl: 86400, //prune expired entries every 24h
  });
};
