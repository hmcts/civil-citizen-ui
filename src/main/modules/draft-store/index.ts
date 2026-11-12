import config from 'config';
import {Application} from 'express';
import Redis from 'ioredis';
import {LoggerInstance} from 'winston';

const REDIS_DATA = require('./redisData.json');
const ONE_DAY_IN_SECONDS = 86400;
const {Logger} = require('@hmcts/nodejs-logging');
const redisLogger = Logger.getLogger('redisClient');

/**
 * ioredis emits `error` with no listener as an uncaught exception, and the console
 * collector is off, so a dropped connection never reaches App Insights.
 * The message is plain text: logging the Error object blanks message and stack.
 */
export const attachRedisClientLogging = (client: Redis, name: string): void => {
  client.on('error', (err: Error) => {
    redisLogger.error(`${name} Redis client failed (${err?.message || 'unknown failure'})`);
  });
  client.on('reconnecting', (delay: number) => {
    const wait = typeof delay === 'number' ? delay : 0;
    redisLogger.warn(`${name} Redis client reconnecting after ${wait}ms`);
  });
};

export class DraftStoreClient {
  public static REDIS_CONNECTION_SUCCESS = 'Connected to Redis instance successfully';

  constructor(private readonly logger: LoggerInstance) {
  }

  public enableFor(app: Application): void {
    const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
    const connectionString = `${protocol}:${config.get('services.draftStore.redis.key')}@${config.get('services.draftStore.redis.host')}:${config.get('services.draftStore.redis.port')}`;
    const client = new Redis(connectionString);
    attachRedisClientLogging(client, 'Draft store');

    app.locals.draftStoreClient = client;
    this.logger.info(DraftStoreClient.REDIS_CONNECTION_SUCCESS);

    if(process.env.NODE_ENV !== 'production') {
      app.locals.draftStoreClient.on('connect', () => {
        REDIS_DATA.forEach((element: any) => {
          client.set(element.id, JSON.stringify(element, null, 4)).then(() => {
            this.logger.info(`Mock data ${element.id} saved to Redis`);
            return client.expire(element.id, ONE_DAY_IN_SECONDS);
          });
        });
      });
    }
  }
}
