import config from 'config';
import {createClient} from 'redis';
import {Application} from 'express';

const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('draftStoreClient');

export class DraftStoreClient {
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

    client.connect().then(() => {
      logger.info('Connected to Redis instance successfully');
    });
  }
}
