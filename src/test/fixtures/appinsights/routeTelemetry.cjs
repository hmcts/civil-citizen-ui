// Run outside Jest's module loader: require hooks must see Express's first load.
// HTTP requests use in-memory streams. No listening socket, client connection or Azure exporter.
const assert = require('node:assert/strict');
const path = require('node:path');
const {Duplex} = require('node:stream');
const {NodeTracerProvider} = require('@opentelemetry/sdk-trace-node');
const {InMemorySpanExporter, SimpleSpanProcessor} = require('@opentelemetry/sdk-trace-base');
const {LoggerProvider, InMemoryLogRecordExporter, SimpleLogRecordProcessor} = require('@opentelemetry/sdk-logs');
const {registerInstrumentations} = require('@opentelemetry/instrumentation');
const {HttpInstrumentation} = require('@opentelemetry/instrumentation-http');
const {SpanKind, context, trace, propagation} = require('@opentelemetry/api');

require('ts-node/register/transpile-only');
require('tsconfig-paths/register');

const exporter = new InMemorySpanExporter();
const logExporter = new InMemoryLogRecordExporter();
const loggerProvider = new LoggerProvider({processors: [new SimpleLogRecordProcessor({exporter: logExporter})]});
// Observe the SDK processor boundary, before any exporter filtering could hide layer spans
// from these assertions. Azure metrics processors receive spans at this same boundary.
const processedSpans = [];
const provider = new NodeTracerProvider({spanProcessors: [{
  onStart() {},
  onEnd(span) {processedSpans.push(span);},
  async forceFlush() {},
  async shutdown() {},
}, new SimpleSpanProcessor(exporter)]});
const main = path.resolve(__dirname, '../../../main');
let unregisterHttp;

function replaceModule(filename, exports) {
  const id = require.resolve(filename);
  require.cache[id] = {id, filename: id, loaded: true, exports};
}

// Replace only environment/SDK startup, retaining the production bootstrap's registration.
replaceModule(path.join(main, 'common/logging/piiRedaction'), {installPiiLoggingRedaction() {}});
replaceModule(path.join(main, 'modules/properties-volume'), {PropertiesVolume: {enable() {}}});
replaceModule('@hmcts/nodejs-logging', {Logger: {getLogger: () => ({error() {}, warn() {}})}});
replaceModule(path.join(main, 'modules/appinsights/index'), {AppInsights: class {
  enable() {
    provider.register();
    unregisterHttp = registerInstrumentations({instrumentations: [new HttpInstrumentation()]});
    const {LogApi} = require('applicationinsights/out/src/shim/logsApi');
    // Give startup a distinct context so accidentally retaining it is detectable. No SDK span
    // is created, and request/exception IDs are left entirely to HTTP instrumentation and LogApi.
    const startupSpan = trace.wrapSpanContext({
      traceId: '11111111111111111111111111111111', spanId: '1111111111111111', traceFlags: 1,
    });
    context.with(trace.setSpan(context.active(), startupSpan), () => {
      const client = new LogApi(loggerProvider.getLogger('ApplicationInsightsLogger'));
      client.flush = () => loggerProvider.forceFlush();
      replaceModule('applicationinsights', {defaultClient: client});
      client.trackTrace({message: 'App insights activated'});
    });
    return true;
  }
}});
require(path.join(main, 'modules/appinsights/bootstrap'));
assert.equal(require.cache[require.resolve('express')], undefined, 'Bootstrap must not load Express');

const express = require('express');
const axios = require('axios');
const {executeRequest} = require(path.join(main, 'app/client/common/civilServiceRequest'));
const {ErrorHandler} = require(path.join(main, 'modules/error'));
const {createServer, IncomingMessage, ServerResponse} = require('node:http');
const app = express();
app.use((_req, res, next) => {
  // Exercise the production error handler without requiring its template engine.
  res.render = view => res.end(view);
  next();
});
// Match the application's array of controller routers mounted at '/'. All are traversed.
app.use(Array.from({length: 358}, (_, index) => {
  const router = express.Router();
  router.get(`/unused-${index}`, (_req, res) => res.end('unused'));
  return router;
}));
app.get('/dashboard', (_req, res) => res.end('dashboard'));
app.get('/login', (_req, res) => res.redirect('/dashboard'));
app.post('/oauth2/callback', (_req, res) => res.end('callback'));
const health = express.Router();
health.get('/liveness', (_req, res) => res.end('UP'));
app.use('/health', health);
const cases = express.Router({mergeParams: true});
cases.use((_req, _res, next) => next());
cases.get('/details', async (_req, res) => {
  await Promise.resolve();
  res.end('details');
});
cases.get('/failure', async () => {
  await Promise.resolve();
  throw new Error('Test failure');
});
cases.get(['/first/:documentId', '/second/:documentId'], (_req, res) => res.end('alias'));
cases.use(['/redirect-first/:documentId', '/redirect-second/:documentId'], (_req, res) => res.redirect('/dashboard'));
cases.use(['/error-first/:documentId', '/error-second/:documentId'], async () => {
  await Promise.resolve();
  throw new Error('Early middleware failure');
});
// A nonmatching child router must unwind its mount prefix before a sibling router runs.
const fallThrough = express.Router();
fallThrough.get('/never', (_req, res) => res.end('unused'));
cases.use(['/fall-first/:documentId', '/fall-second/:documentId'], fallThrough);
const destination = express.Router();
destination.get('/done', (_req, res) => res.end('fall-through'));
cases.use(['/fall-first/:documentId', '/fall-second/:documentId'], destination);
const recover = express.Router();
recover.use('/broken', async () => {throw new Error('Recoverable middleware failure');});
recover.use((_error, _req, _res, next) => next());
recover.get('/broken', (_req, res) => res.end('recovered'));
cases.use('/recovery', recover);
const controlFlow = express.Router();
const syncFailure = new Error('Synchronous middleware failure');
const callbackFailure = new Error('Callback middleware failure');
controlFlow.use(['/sync-error', '/sync-recover'], () => {throw syncFailure;});
controlFlow.use(['/next-error', '/next-recover'], (_req, _res, next) => next(callbackFailure));
controlFlow.use((error, req, _res, next) => {
  assert.equal(error, req.originalUrl.includes('/sync-') ? syncFailure : callbackFailure);
  next(req.originalUrl.endsWith('-recover') ? undefined : error);
});
controlFlow.get(['/sync-recover', '/next-recover'], (_req, res) => res.status(201).end('recovered'));
controlFlow.get('/skip/:documentId', (_req, _res, next) => next('route'),
  () => assert.fail('next(route) must skip the remaining route handlers'));
controlFlow.get('/skip/fallback', (_req, res) => res.status(202).end('next route'));
const exitRouter = express.Router();
exitRouter.use((_req, _res, next) => next('router'));
exitRouter.use(() => assert.fail('next(router) must skip the remaining router handlers'));
controlFlow.use('/exit/:documentId', exitRouter);
controlFlow.get('/exit/:documentId/done', (_req, res) => res.status(203).end('parent router'));
cases.use('/flow', controlFlow);

const concurrent = express.Router({mergeParams: true});
let waitingRequests = 0;
let releaseRequests;
const bothRequestsMatched = new Promise(resolve => {releaseRequests = resolve;});
concurrent.param('documentId', async (_req, _res, next) => {
  // Hold both requests after Express matches their shared layer but before its handler runs.
  // The layer's mutable path now belongs to the second request; telemetry must use request-local data.
  if (++waitingRequests === 2) releaseRequests();
  await bothRequestsMatched;
  next();
});
concurrent.get(['/first/:documentId', '/second/:documentId'], async (req, res) => {
  await Promise.resolve();
  trace.getTracer('test-client').startSpan(`concurrent dependency ${req.params.documentId}`, {kind: SpanKind.CLIENT}).end();
  res.end('concurrent');
});
cases.use('/concurrent', concurrent);
let failingRequests = 0;
let releaseFailures;
const bothFailuresStarted = new Promise(resolve => {releaseFailures = resolve;});
cases.post('/exceptions/:status', async req => {
  const status = Number(req.params.status);
  await executeRequest(() => axios.put(`/cases/${req.params.id}/event?pin=test-pin`, undefined, {
    // Replace only Axios transport: real Axios errors flow through the civil-service helper
    // and Express's global error handler, including the 4xx duplicate-tracking guard.
    adapter: async function failCivilServiceRequest(config) {
      if (++failingRequests === 2) releaseFailures();
      await bothFailuresStarted;
      throw new axios.AxiosError(`Request failed with status code ${status}`, undefined, config, undefined, {
        status, statusText: 'Fixture failure', data: {}, headers: {}, config,
      });
    },
  }), 'Civil-service fixture failure');
});
app.use('/case/:id', cases);
// Direct Router.use(), because app.use() splits callbacks into separate Router.use() calls.
const early = express.Router();
early.use(['/early-first/:id', '/early-second/:id'],
  (req, res, next) => req.query.pass ? next() : res.redirect('/dashboard'),
  (_req, res) => res.status(201).end('second callback'));
app.use(early);
app.get('/with-dependency', (_req, res) => {
  trace.getTracer('test-client').startSpan('real dependency', {kind: SpanKind.CLIENT}).end();
  res.end('dependency retained');
});
new ErrorHandler().enableFor(app);
const server = createServer(app);

async function request(method, url, status) {
  const socket = new Duplex({read() {}, write(_chunk, _encoding, done) {done();}});
  const req = new IncomingMessage(socket);
  Object.assign(req, {method, url, headers: {host: 'localhost'}, httpVersion: '1.1', complete: true});
  const res = new ServerResponse(req);
  res.assignSocket(socket);
  const finished = new Promise((resolve, reject) => {
    res.on('error', reject);
    res.on('finish', () => {
      // A real HTTP server emits close after finishing the response. Drive the same event
      // here so HTTP instrumentation ends its span, without a TCP connection.
      res.emit('close');
      resolve();
    });
  });
  req.push(null);
  server.emit('request', req, res);
  await finished;
  assert.equal(res.statusCode, status);
  res.detachSocket(socket);
  socket.destroy();
  await provider.forceFlush();
}

async function run() {
  for (const args of [
    ['GET', '/dashboard', 200],
    ['GET', '/login', 302],
    ['POST', '/oauth2/callback', 200],
    ['GET', '/health/liveness', 200],
    ['GET', '/case/123/details?tab=one', 200],
    ['GET', '/case/456/details?tab=two', 200],
    ['GET', '/case/789/failure', 500],
    ['GET', '/case/123/first/111', 200],
    ['GET', '/case/456/second/222', 200],
    ['GET', '/case/123/redirect-first/111', 302],
    ['GET', '/case/456/redirect-second/222', 302],
    ['GET', '/case/123/error-first/111', 500],
    ['GET', '/case/456/error-second/222', 500],
    ['GET', '/case/123/fall-first/111/done', 200],
    ['GET', '/case/456/fall-second/222/done', 200],
    ['GET', '/case/123/recovery/broken', 200],
    ['GET', '/early-first/123', 302],
    ['GET', '/early-second/456', 302],
    ['GET', '/early-first/123?pass=1', 201],
    ['GET', '/early-second/456?pass=1', 201],
    ['GET', '/with-dependency', 200],
    ['GET', '/unknown/123', 404],
    ['GET', '/case/123/flow/sync-error', 500],
    ['GET', '/case/123/flow/sync-recover', 201],
    ['GET', '/case/123/flow/next-error', 500],
    ['GET', '/case/123/flow/next-recover', 201],
    ['GET', '/case/123/flow/skip/fallback', 202],
    ['GET', '/case/123/flow/exit/111/done', 203],
  ]) await request(...args);
  await Promise.all([
    request('GET', '/case/123/concurrent/first/111', 200),
    request('GET', '/case/456/concurrent/second/222', 200),
  ]);
  await Promise.all([
    request('POST', '/case/123/exceptions/409', 409),
    request('POST', '/case/456/exceptions/503', 503),
  ]);
  await loggerProvider.forceFlush();

  const spans = exporter.getFinishedSpans();
  // Exercise Azure's real conversion too, without creating an exporter or starting its timers.
  const exporterRoot = path.dirname(require.resolve('@azure/monitor-opentelemetry-exporter'));
  const {readableSpanToEnvelope} = require(path.join(exporterRoot, 'utils/spanUtils.js'));
  const {logToEnvelope} = require(path.join(exporterRoot, 'utils/logUtils.js'));
  const telemetry = spans.map(span => ({
    span, envelope: readableSpanToEnvelope(span, '00000000-0000-0000-0000-000000000000'),
  }));
  const requests = telemetry.filter(({span}) => span.kind === SpanKind.SERVER).map(({span, envelope}) => {
    return {
      name: span.name,
      route: span.attributes['http.route'],
      status: span.status.code,
      responseCode: envelope.data.baseData.responseCode,
      requestName: envelope.data.baseData.name,
      operationName: envelope.tags['ai.operation.name'],
      operationId: envelope.tags['ai.operation.id'],
      url: envelope.data.baseData.url,
      spanId: span.spanContext().spanId,
      traceId: span.spanContext().traceId,
    };
  });
  const dependencies = telemetry.filter(({envelope}) => envelope.data.baseType === 'RemoteDependencyData')
    .map(({span, envelope}) => ({
      name: envelope.data.baseData.name,
      parentSpanId: span.parentSpanContext?.spanId,
      traceId: span.spanContext().traceId,
    }));
  const logs = logExporter.getFinishedLogRecords()
    .map(record => logToEnvelope(record, '00000000-0000-0000-0000-000000000000'));
  const startup = logs.find(envelope => envelope.data.baseData.message === 'App insights activated');
  const exceptions = logs.filter(envelope => envelope.data.baseType === 'ExceptionData').map(envelope => ({
    operationId: envelope.tags['ai.operation.id'],
    parentId: envelope.tags['ai.operation.parentId'],
    properties: envelope.data.baseData.properties,
    ...envelope.data.baseData.exceptions[0],
  }));
  process.stdout.write(JSON.stringify({requests, dependencies, exceptions,
    startupOperationId: startup.tags['ai.operation.id'], spanCount: spans.length,
    processedSpanCount: processedSpans.length,
    internalSpanCount: processedSpans.filter(span => span.kind === SpanKind.INTERNAL).length,
  }));
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  unregisterHttp();
  await loggerProvider.shutdown();
  await provider.shutdown();
  context.disable();
  trace.disable();
  propagation.disable();
});
