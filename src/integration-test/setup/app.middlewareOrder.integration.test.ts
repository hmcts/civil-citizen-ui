// Regression guard for DTSCCI-6013.
//
// express.static must be registered BEFORE the express-session middleware. If it is
// registered after session(), static-asset responses pass through express-session and
// pick up a `Set-Cookie: citizen-ui-session` header; when cached by a shared cache/CDN
// the same session id is then served to multiple users (they share a session). PR #7766
// accidentally moved it after session() and caused exactly that on perftest.

import {app} from '../../main/app';

type StackLayer = {handle?: {name?: string}; name?: string};

const layerName = (layer: StackLayer): string => layer.handle?.name || layer.name || '';

const getStack = (): StackLayer[] => {
  const application = app as unknown as {router?: {stack: StackLayer[]}; _router: {stack: StackLayer[]}};
  return (application.router ?? application._router).stack;
};

describe('app middleware order (DTSCCI-6013)', () => {
  it('registers express.static before the session middleware', () => {
    const stack = getStack();
    const staticIndex = stack.findIndex(layer => layerName(layer) === 'serveStatic');
    const sessionIndex = stack.findIndex(layer => layerName(layer) === 'session');

    expect(staticIndex).toBeGreaterThanOrEqual(0);
    expect(sessionIndex).toBeGreaterThanOrEqual(0);
    expect(staticIndex).toBeLessThan(sessionIndex);
  });
});
