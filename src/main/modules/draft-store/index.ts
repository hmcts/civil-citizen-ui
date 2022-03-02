import config from 'config';
import {createClient} from 'redis';
import {Application} from 'express';
import {LoggerInstance} from 'winston';
import {REDIS_DATA} from './redisData';


export class DraftStoreClient {

  constructor(private readonly logger: LoggerInstance) {}

  public enableFor(app: Application): void {
    const client = createClient({
      socket: {
        host: config.get('services.draftStore.redis.host'),
        port: config.get('services.draftStore.redis.port'),
        connectTimeout: 15000,
      },
      password: config.get('services.draftStore.redis.key'),
    });
    app.locals.draftStoreClient = client;

    client.connect()
      .then(() => {
        this.logger.info('Connected to Redis instance successfully');
        client.set('1645882162449409', JSON.stringify(REDIS_DATA, null, 4)).then(() =>
          this.logger.info('Create data on Redis'),
        );
      })
      .catch((error: Error) => {
        this.logger.error('Error connecting to Redis instance', error);
      });
  }


}
