import config from 'config';
import {createClient} from 'redis';
import {Application} from 'express';

export class DraftStoreClient {
  public enableFor(app: Application): void {
    const client = createClient({
      socket: {
        host: config.get('draftStore.redis.host'),
        port: config.get('draftStore.redis.port'),
      },
    });

    client.connect().then(() => app.locals.draftStoreClient = client);
  }
}
