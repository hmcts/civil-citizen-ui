import {RequestHandler, Router} from 'express';
import {AppSession} from 'models/AppRequest';

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

const pathMatches = (routePath: unknown, path: string): boolean => {
  if (Array.isArray(routePath)) {
    return routePath.includes(path);
  }
  return routePath === path;
};

export const getRouteHandler = (router: Router, method: HttpMethod, path?: string): RequestHandler => {
  const layer = (router as unknown as {stack: Array<{
    route?: {methods?: Record<string, boolean>; path?: unknown; stack: Array<{handle: RequestHandler}>};
  }>;}).stack.find((candidate) => {
    if (!candidate.route?.methods?.[method]) {
      return false;
    }
    if (!path) {
      return true;
    }
    return pathMatches(candidate.route.path, path);
  });

  if (!layer?.route) {
    throw new Error(`No ${method.toUpperCase()} handler found${path ? ` for ${path}` : ''}`);
  }

  const handlers = layer.route.stack;
  return handlers[handlers.length - 1].handle;
};

export const createMockResponse = (): {
  render: jest.Mock;
  redirect: jest.Mock;
  cookie: jest.Mock;
} => ({
  render: jest.fn(),
  redirect: jest.fn(),
  cookie: jest.fn(),
});

export const createMockSession = (overrides: Record<string, unknown> = {}): AppSession =>
  overrides as unknown as AppSession;

/**
 * Express-free stand-in for `src/main/app-instance`.
 *
 *   jest.mock('<path-to>/app-instance', () => jest.requireActual('<path-to>/utils/getRouteHandler'));
 *
 * Do not mock this globally: `src/main/app` builds on the real instance.
 */
export const app = {
  locals: {
    draftStoreClient: {} as Record<string, unknown>,
  },
};
