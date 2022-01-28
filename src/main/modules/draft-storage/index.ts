import config from 'config';
import {createClient} from 'redis';
import {Application} from 'express';

export class DraftStorageClient {
  public enableFor(app: Application): void {
    const client = createClient({
      socket: {
        host: config.get('draftStorage.redis.host'),
        port: config.get('draftStorage.redis.port'),
      },
    });

    client.connect().then(() => app.locals.draftStorageClient = client);
  }
}
