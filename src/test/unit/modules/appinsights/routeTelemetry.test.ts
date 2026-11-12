import {execFileSync} from 'node:child_process';
import * as path from 'node:path';

interface RequestTelemetry {
  name: string;
  route: string;
  status: number;
  responseCode: string;
  requestName: string;
  operationName: string;
  url: string;
  spanId: string;
  traceId: string;
}

interface RouteTelemetry {
  requests: RequestTelemetry[];
  dependencies: Array<{name: string; parentSpanId: string; traceId: string}>;
  spanCount: number;
  processedSpanCount: number;
  internalSpanCount: number;
}

const nameFields = ['name', 'requestName', 'operationName'] as const;

describe('Express route telemetry', () => {
  let telemetry: RouteTelemetry;

  beforeAll(() => {
    const output = execFileSync(process.execPath, [
      path.join(__dirname, '../../../fixtures/appinsights/routeTelemetry.cjs'),
    ], {encoding: 'utf8', timeout: 20000, env: {...process.env, NODE_ENV: 'test'}});
    telemetry = JSON.parse(output);
  });

  function requestAt(pathname: string): RequestTelemetry {
    const request = telemetry.requests.find(request => new URL(request.url).pathname === pathname);
    if (!request) throw new Error(`No request telemetry for ${pathname}`);
    return request;
  }

  it('names server spans using route templates, including nested routers and failures', () => {
    const {requests, dependencies} = telemetry;
    const expectedNames = [
      'GET /dashboard',
      'GET /login',
      'POST /oauth2/callback',
      'GET /health/liveness',
      'GET /case/:id/details',
      'GET /case/:id/details',
      'GET /case/:id/failure',
      'GET /case/:id/first/:documentId',
      'GET /case/:id/second/:documentId',
      'GET /case/:id/redirect-first/:documentId',
      'GET /case/:id/redirect-second/:documentId',
      'GET /case/:id/error-first/:documentId',
      'GET /case/:id/error-second/:documentId',
      'GET /case/:id/fall-first/:documentId/done',
      'GET /case/:id/fall-second/:documentId/done',
      'GET /case/:id/recovery/broken',
      'GET /early-first/:id',
      'GET /early-second/:id',
      'GET /early-first/:id',
      'GET /early-second/:id',
      'GET /with-dependency',
      'GET /',
    ];
    for (const field of nameFields) {
      expect(requests.slice(0, expectedNames.length).map(span => span[field])).toEqual(expectedNames);
    }
    expect(requests[4].route).toBe('/case/:id/details');
    expect(requests[5].route).toBe('/case/:id/details');
    expect(requests[6].status).toBe(2); // OTel ERROR for the async handler's 500 response.
    expect(requests[4].url).toContain('/case/123/details');
    expect(requests[5].url).toContain('/case/456/details');
    expect(requests[11].status).toBe(2);
    expect(requests[12].status).toBe(2);
    expect(dependencies).toContainEqual({
      name: 'real dependency',
      parentSpanId: requests[20].spanId,
      traceId: requests[20].traceId,
    });
  });

  it('creates only the request spans and intentional dependencies, regardless of router count', () => {
    expect(telemetry.requests).toHaveLength(30);
    expect(telemetry.dependencies).toHaveLength(3);
    expect(telemetry.spanCount).toBe(33);
    expect(telemetry.processedSpanCount).toBe(33); // Layer spans must never reach metrics processors.
    expect(telemetry.internalSpanCount).toBe(0);
  });

  it.each([
    ['sync-error', '/sync-error', '/sync-error', '500'],
    ['sync-recover', '/sync-recover', '/sync-recover', '201'],
    ['next-error', '/next-error', '/next-error', '500'],
    ['next-recover', '/next-recover', '/next-recover', '201'],
    ['next(route)', '/skip/fallback', '/skip/fallback', '202'],
    ['next(router)', '/exit/111/done', '/exit/:documentId/done', '203'],
  ])('preserves response handling and route cleanup for %s', (_scenario, pathname, template, responseCode) => {
    const request = requestAt(`/case/123/flow${pathname}`);
    const route = `/case/:id/flow${template}`;
    expect(request.responseCode).toBe(responseCode);
    expect(request.status).toBe(responseCode === '500' ? 2 : 0);
    expect(request.route).toBe(route);
    for (const field of nameFields) expect(request[field]).toBe(`GET ${route}`);
  });

  it('keeps route names and dependency context separate for overlapping requests', () => {
    const first = requestAt('/case/123/concurrent/first/111');
    const second = requestAt('/case/456/concurrent/second/222');
    expect(first.traceId).not.toBe(second.traceId);
    expect(first.spanId).not.toBe(second.spanId);
    for (const [request, alias, documentId] of [[first, 'first', '111'], [second, 'second', '222']] as const) {
      const route = `/case/:id/concurrent/${alias}/:documentId`;
      expect(request.responseCode).toBe('200');
      expect(request.route).toBe(route);
      for (const field of nameFields) expect(request[field]).toBe(`GET ${route}`);
      expect(telemetry.dependencies).toContainEqual({
        name: `concurrent dependency ${documentId}`,
        parentSpanId: request.spanId,
        traceId: request.traceId,
      });
    }
  });
});
