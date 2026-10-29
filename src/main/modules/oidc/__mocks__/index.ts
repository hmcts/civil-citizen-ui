import {Application} from 'express';
import {AppRequest} from 'models/AppRequest';
import Redis from 'ioredis';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

/** Mocked login must still supply the authenticated identity expected by routes. */
export class OidcMiddleware {
  enableFor(app: Application): void {
    // Fully mocked persistence does not exercise the real identity/key contract.
    if (jest.isMockFunction(generateRedisKey)) {
      return;
    }
    // Suites mocking the draft-store bootstrap need an empty authenticated store.
    // The Jest setup replaces ioredis with ioredis-mock.
    if (!app.locals.draftStoreClient) {
      app.locals.draftStoreClient = new Redis();
    }
    app.use((req, _res, next) => {
      const session = (req as AppRequest).session;
      if (session && !session.user) {
        session.user = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          accessToken: 'accessToken',
          idToken: 'idToken',
          email: 'citizen@example.com',
          givenName: 'Test',
          familyName: 'Citizen',
          roles: ['citizen'],
        };
      }
      next();
    });
  }
}
