import config from 'config';
import {createClient} from 'redis';
import {Application} from 'express';

const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('draftStoreClient');
const KEEP_ALIVE_INTERVAL_MS = 60 * 1000;

const client = createClient({
  socket: {
    host: config.get('services.draftStore.redis.host'),
    port: config.get('services.draftStore.redis.port'),
    connectTimeout: 15000,
  },
  password: config.get('services.draftStore.redis.key'),
});

client.connect().then(() => {
  logger.info('Connected to Redis draft store successfully');
});

client.on('connect', () => {
  logger.info('Connected to Redis draft store successfully');
});

client.on('error', error => {
  logger.error('Error connecting to Redis draft store', error);
});

function pingRedis() {
  logger.info('Sending Ping to Redis draft store ...');
  client.ping()
    .then(() => logger.info('Connection to Redis draft store still alive'))
    .catch((error: Error) => logger.error('Redis draft store keepalive error', error));
}

setInterval(pingRedis, KEEP_ALIVE_INTERVAL_MS);

export class DraftStoreClient {
  public enableFor(app: Application): void {
    app.locals.draftStoreClient = client;
  }
}
