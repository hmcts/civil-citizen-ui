import config from 'config';
import {Application} from 'express';
import {Logger} from 'winston';

const Redis = require('ioredis');

const REDIS_DATA = require('./redisData.json');

export class DraftStoreClient {

  public static REDIS_CONNECTION_SUCCESS = 'Connected to Redis instance successfully';

  constructor(private readonly logger: Logger) {
  }

  public enableFor(app: Application): void {

    const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
    const connectionString = `${protocol}default:${config.get('services.draftStore.redis.key')}@${config.get('services.draftStore.redis.host')}:${config.get('services.draftStore.redis.port')}`;
    this.logger.info(`connectionString: ${connectionString}`);
    const client = new Redis(connectionString);

    app.locals.draftStoreClient = client;
    this.logger.info(DraftStoreClient.REDIS_CONNECTION_SUCCESS);

    REDIS_DATA.forEach((element:any) => {
      client.set(element.id, JSON.stringify(element, null, 4)).then(() =>
        this.logger.info(`Mock data ${element.id} saved to Redis`),
      );
    });
    
  }
}
