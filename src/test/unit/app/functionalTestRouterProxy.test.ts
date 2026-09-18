import {Request} from 'express';
import {functionalTestRouterJsonBody, isMockedFunctionalRequest, mockedFunctionalServiceUrl, runWithFunctionalTestRoute} from '../../../main/app/functionalTestRouterProxy';

describe('functionalTestRouterJsonBody', () => {
  it('does not add an empty body to a bodyless admin request', () => {
    expect(functionalTestRouterJsonBody(false, {})).toBeUndefined();
    expect(functionalTestRouterJsonBody(true, {})).toBeUndefined();
  });

  it('serializes a JSON mapping payload', () => {
    expect(functionalTestRouterJsonBody(true, {priority: 0})).toBe('{"priority":0}');
  });
});

describe('mocked functional request boundary', () => {
  const originalEnv = {...process.env};
  afterEach(() => { process.env = {...originalEnv}; });
  const request = (header?: string, cookie?: string) => ({
    get: () => header,
    cookies: {'functional-test-router-token': cookie},
  } as unknown as Request);

  it('keeps ordinary requests on the standard application path', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.FUNCTIONAL_TEST_ROUTER_URL;
    process.env.FUNCTIONAL_TEST_ROUTER_TOKEN = 'preview-control';
    expect(isMockedFunctionalRequest(request('preview-control', 'preview-control'))).toBe(false);
    process.env.FUNCTIONAL_TEST_ROUTER_URL = 'http://wiremock';
    expect(isMockedFunctionalRequest(request())).toBe(false);
    expect(isMockedFunctionalRequest(request('wrong', 'wrong'))).toBe(false);
  });

  it('requires the configured preview control for browser and setup requests', () => {
    process.env.NODE_ENV = 'test';
    process.env.FUNCTIONAL_TEST_ROUTER_URL = 'http://wiremock';
    process.env.FUNCTIONAL_TEST_ROUTER_TOKEN = 'preview-control';
    expect(isMockedFunctionalRequest(request('preview-control'))).toBe(true);
    expect(isMockedFunctionalRequest(request(undefined, 'preview-control'))).toBe(true);
  });

  it('routes only an authorized request to WireMock across async work', async () => {
    process.env.NODE_ENV = 'test';
    process.env.FUNCTIONAL_TEST_ROUTER_URL = 'http://wiremock';
    process.env.FUNCTIONAL_TEST_ROUTER_TOKEN = 'preview-control';

    const route = (header?: string) => new Promise<string | undefined>(resolve => {
      runWithFunctionalTestRoute(request(header), () => {
        setImmediate(() => resolve(mockedFunctionalServiceUrl()));
      });
    });

    expect(await Promise.all([route(), route('preview-control')]))
      .toEqual([undefined, 'http://wiremock']);
    expect(mockedFunctionalServiceUrl()).toBeUndefined();
  });
});
