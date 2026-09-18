import {Request} from 'express';
import {AsyncLocalStorage} from 'async_hooks';

const mockedRequestContext = new AsyncLocalStorage<boolean>();

export const runWithFunctionalTestRoute = (req: Request, next: () => void): void => {
  mockedRequestContext.run(isMockedFunctionalRequest(req), next);
};

export const mockedFunctionalServiceUrl = (): string | undefined =>
  mockedRequestContext.getStore() ? process.env.FUNCTIONAL_TEST_ROUTER_URL : undefined;

export const isMockedFunctionalRequest = (req: Request): boolean => {
  if (process.env.NODE_ENV === 'e2eTest') {
    return true;
  }
  const token = process.env.FUNCTIONAL_TEST_ROUTER_TOKEN;
  return Boolean(process.env.FUNCTIONAL_TEST_ROUTER_URL && token
    && (req.get('x-functional-test-router-token') === token
      || req.cookies?.['functional-test-router-token'] === token));
};

export const functionalTestRouterJsonBody = (
  isJson: boolean,
  body: unknown,
): string | undefined => {
  if (!isJson || !body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return undefined;
  }
  return JSON.stringify(body);
};
