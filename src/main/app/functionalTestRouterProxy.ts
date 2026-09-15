import {Request} from 'express';

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
