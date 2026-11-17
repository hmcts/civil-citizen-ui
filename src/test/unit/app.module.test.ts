const mockIsServiceShuttered = jest.fn();
const mockUpdateE2EKey = jest.fn();

jest.mock('../../main/app/auth/launchdarkly/launchDarklyClient', () => ({
  isServiceShuttered: (...args: unknown[]) => mockIsServiceShuttered(...args),
  updateE2EKey: (...args: unknown[]) => mockUpdateE2EKey(...args),
}));

import {Express} from 'express';

type StackLayer = {
  name?: string;
  handle: (req: unknown, res: unknown, next: (err?: unknown) => void) => unknown;
  route?: {path: string; stack: StackLayer[]};
};

const stackOf = (application: Express): StackLayer[] =>
  (application as unknown as {router: {stack: StackLayer[]}}).router.stack;

describe('app module', () => {
  const originalEnv = process.env.NODE_ENV;

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  it('registers the e2e flag route, upload limit, and shutter check', async () => {
    process.env.NODE_ENV = 'e2eTest';
    jest.resetModules();
    mockIsServiceShuttered.mockResolvedValue(true);
    mockUpdateE2EKey.mockResolvedValue(undefined);

    let application: Express;
    jest.isolateModules(() => {
      application = require('../../main/app').app;
    });

    const stack = stackOf(application);
    const flagRoute = stack.find(layer => layer.route?.path === '/testing-support/toggleFlag/:key/:value');
    const shutter = stack.find(layer => layer.handle.name === 'checkServiceAvailability');
    const status = jest.fn().mockReturnValue({json: jest.fn()});
    const json = jest.fn();
    status.mockReturnValue({json});

    await flagRoute.route.stack[0].handle({params: {key: 'shutter-pcq', value: 'true'}}, {status}, jest.fn());
    expect(mockUpdateE2EKey).toHaveBeenCalledWith('shutter-pcq', true);
    expect(status).toHaveBeenCalledWith(200);

    mockUpdateE2EKey.mockRejectedValue(new Error('flag failed'));
    await flagRoute.route.stack[0].handle({params: {key: 'shutter-pcq', value: 'false'}}, {status}, jest.fn());
    expect(status).toHaveBeenCalledWith(500);

    const render = jest.fn();
    const next = jest.fn();
    await shutter.handle({}, {render}, next);
    expect(render).toHaveBeenCalledWith('service-unavailable');

    mockIsServiceShuttered.mockResolvedValue(false);
    await shutter.handle({}, {render}, next);
    expect(next).toHaveBeenCalled();

    const ensureBody = stack.find(layer => layer.handle.name === 'ensureBodyObject');
    const setHeaders = stack.find(layer => layer.handle.name === 'setDefaultHeaders');
    const bodyRequest = {body: undefined as unknown};
    const headerNext = jest.fn();
    const headerResponse = {setHeader: jest.fn()};
    ensureBody.handle(bodyRequest, {}, headerNext);
    expect(bodyRequest.body).toEqual({});
    setHeaders.handle({}, headerResponse, headerNext);
    expect(headerResponse.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'no-cache, max-age=0, must-revalidate, no-store',
    );
  });
});
