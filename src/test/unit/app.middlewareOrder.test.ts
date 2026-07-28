// Regression guard for DTSCCI-6013.
//
// express.static must be registered BEFORE the express-session middleware. If it is
// registered after session(), static-asset responses pass through express-session and
// pick up a `Set-Cookie: citizen-ui-session` header; when cached by a shared cache/CDN
// the same session id is then served to multiple users (they share a session). PR #7766
// accidentally moved it after session() and caused exactly that on perftest.

const redisData: Record<string, string> = {};
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(async (key: string) => redisData[key]),
    set: jest.fn(async (key: string, value: string) => {
      redisData[key] = value;
    }),
    del: jest.fn(async (key: string) => {
      delete redisData[key];
    }),
    expire: jest.fn(async () => undefined),
    on: jest.fn(async () => undefined),
    ttl: jest.fn(() => Promise.resolve({})),
    expireat: jest.fn(() => Promise.resolve({})),
  }));
});

const {app} = require('../../main/app');

// Express stores registered middleware as ordered layers on the app router. Each layer's
// name is the handler function name: express.static -> 'serveStatic', express-session -> 'session'.
const layerName = (layer: any): string => layer?.handle?.name || layer?.name || '';
const getStack = (): any[] => (app.router ?? app._router).stack;

describe('app middleware order (DTSCCI-6013)', () => {
  it('registers express.static before the session middleware', () => {
    const stack = getStack();
    const staticIndex = stack.findIndex(l => layerName(l) === 'serveStatic');
    const sessionIndex = stack.findIndex(l => layerName(l) === 'session');

    // both middlewares are actually registered
    expect(staticIndex).toBeGreaterThanOrEqual(0);
    expect(sessionIndex).toBeGreaterThanOrEqual(0);

    // static is served before the session layer, so static responses never carry a session cookie
    expect(staticIndex).toBeLessThan(sessionIndex);
  });
});
