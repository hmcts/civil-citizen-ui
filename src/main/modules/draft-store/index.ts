import config from 'config';
import {createClient} from 'redis';
import {Application} from 'express';

const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('draftStoreClient');
const KEEP_ALIVE_INTERVAL_MS = 30000;

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

    client.connect()
      .then(() => {
        logger.info('Connected to Redis draft store successfully');
        setInterval(() => {
          client.ping()
            .then(() => logger.info('Connection to Redis draft store still alive'))
            .catch((err: Error) => logger.error('Redis draft store keepalive error', err));
        }, KEEP_ALIVE_INTERVAL_MS);
      })
      .catch((err: Error) => {
        logger.error(`An error occurred while attempting to connect to Redis draft store: ${err}`);
      });
  }
}
