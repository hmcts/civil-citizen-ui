import {app} from '../../main/app';

export const INTEGRATION_USER_ID_HEADER = 'x-integration-user-id';

export type SessionUser = {
  accessToken: string;
  idToken: string;
  email: string;
  familyName: string;
  givenName: string;
  roles: string[];
  id: string;
};

export const buildSessionUser = (userId: string): SessionUser => ({
  accessToken: 'token',
  idToken: 'token',
  email: 'integration@test.com',
  familyName: 'User',
  givenName: 'Integration',
  roles: [],
  id: userId,
});

let sessionInjectorInstalled = false;

/**
 * Injects a session user immediately after express-session. The user id is taken
 * from the x-integration-user-id request header when present.
 */
export const installSessionUserInjector = (): void => {
  if (sessionInjectorInstalled) {
    return;
  }
  const expressApp = app as unknown as {
    router?: {stack: Array<{name?: string; handle?: {name?: string}}>};
    _router?: {stack: Array<{name?: string; handle?: {name?: string}}>};
  };
  const router = expressApp.router ?? expressApp._router;
  const stack = router.stack;
  const sessionLayerIndex = stack.findIndex((layer) => (layer.handle?.name ?? layer.name) === 'session');
  const sessionUserInjector = (
    req: {session?: {user?: SessionUser}; headers?: Record<string, string | string[] | undefined>},
    _res: unknown,
    next: () => void,
  ): void => {
    const headerValue = req.headers?.[INTEGRATION_USER_ID_HEADER];
    const userId = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    if (req.session && userId) {
      req.session.user = buildSessionUser(userId);
    }
    next();
  };
  Object.defineProperty(sessionUserInjector, 'name', {value: 'sessionUserInjector'});
  app.use(sessionUserInjector as never);
  const injectorLayer = stack.pop();
  stack.splice(sessionLayerIndex + 1, 0, injectorLayer);
  sessionInjectorInstalled = true;
};

export const asUser = (userId: string): Record<string, string> => ({
  [INTEGRATION_USER_ID_HEADER]: userId,
});
