import config from 'config';
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {runInNewContext} from 'node:vm';
import {ModuleKind, transpileModule} from 'typescript';
import {SpanKind} from '@opentelemetry/api';
import {BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor, SpanProcessor} from '@opentelemetry/sdk-trace-base';
import {InMemoryLogRecordExporter, LoggerProvider, LogRecordProcessor, SimpleLogRecordProcessor} from '@opentelemetry/sdk-logs';
import {credentialLogProcessor, credentialSpanProcessor, _resetRedactionState} from 'modules/appinsights';

jest.mock('config');
jest.mock('applicationinsights', () => ({}));

const azureRoot = dirname(require.resolve('@azure/monitor-opentelemetry'));
const {AzureMonitorSpanProcessor} = require(join(azureRoot, 'traces/spanProcessor.js'));
const {AzureLogRecordProcessor} = require(join(azureRoot, 'logs/logRecordProcessor.js'));
const {LiveMetrics} = require(join(azureRoot, 'metrics/quickpulse/liveMetrics.js'));

interface ProcessorConfiguration {
  spanProcessors: SpanProcessor[];
  logRecordProcessors: LogRecordProcessor[];
}

// Execute the installed distro's startup code, not a reconstructed processor list.
// Replace network/exporter setup and instrumentation; keep the Azure processors
// and Live Metrics document conversion real. Never start the Live Metrics timer.
function createPipeline(format: string) {
  const live = Object.assign(Object.create(LiveMetrics.prototype), {
    isCollectingData: true, documents: [],
    validDocumentFilterConjuctionGroupInfos: new Map(), validDerivedMetrics: new Map(),
    totalRequestCount: 0, totalDependencyCount: 0, totalExceptionCount: 0,
    totalFailedRequestCount: 0, totalFailedDependencyCount: 0,
    requestDuration: 0, dependencyDuration: 0,
  });
  const metricHandler = {
    markSpanAsProcessed: jest.fn(),
    recordSpan: jest.fn(span => live.recordSpan(span)),
    recordLog: jest.fn(log => live.recordLog(log)),
    getMetricReader: jest.fn(),
    getViews: (): unknown[] => [],
  };
  const spans = new InMemorySpanExporter();
  const logs = new InMemoryLogRecordExporter();
  const startup = jest.fn();
  const modules: Record<string, unknown> = {
    '@opentelemetry/api': {metrics: {disable: jest.fn()}, trace: {disable: jest.fn()}},
    '@opentelemetry/api-logs': {logs: {disable: jest.fn()}},
    '@opentelemetry/sdk-node': {NodeSDK: class {
      constructor(options: ProcessorConfiguration) {startup(options);}
      start() { /* Use the captured configuration with in-memory providers below. */ }
    }},
    './shared/config.js': {InternalConfig: class {
      instrumentationOptions = {};
      browserSdkLoaderOptions = {enabled: false};
    }},
    './metrics/index.js': {MetricHandler: jest.fn(() => metricHandler)},
    './traces/handler.js': {TraceHandler: jest.fn(() => ({
      getInstrumentations: (): unknown[] => [], getSampler: jest.fn(),
      getAzureMonitorSpanProcessor: () => new AzureMonitorSpanProcessor(metricHandler),
      getBatchSpanProcessor: () => new SimpleSpanProcessor(spans),
    }))},
    './logs/index.js': {LogHandler: jest.fn(() => ({
      getInstrumentations: (): unknown[] => [],
      getAzureLogRecordProcessor: () => new AzureLogRecordProcessor(metricHandler),
      getBatchLogRecordProcessor: () => new SimpleLogRecordProcessor({exporter: logs}),
    }))},
    './types.js': {},
    './browserSdkLoader/browserSdkLoader.js': {},
    './metrics/quickpulse/utils.js': {setSdkPrefix: jest.fn()},
    './utils/statsbeat.js': {getInstance: () => ({setStatsbeatFeatures: jest.fn()})},
    './utils/opentelemetryInstrumentationPatcher.js': {patchOpenTelemetryInstrumentationEnable: jest.fn()},
    './utils/common.js': {parseResourceDetectorsFromEnvVar: (): unknown[] => []},
    './utils/logUtils.js': {isLogCollectionDisabled: () => false},
    './shared/logging/index.js': {},
  };
  const filename = join(azureRoot, '..', format, 'index.js');
  const source = readFileSync(filename, 'utf8');
  const exports: {useAzureMonitor: (options: ProcessorConfiguration) => void} = {
    useAzureMonitor: () => {throw new Error('SDK not loaded');},
  };
  runInNewContext(format === 'esm' ? transpileModule(source, {compilerOptions: {module: ModuleKind.CommonJS}}).outputText : source, {
    exports, process: {env: {}},
    require: (name: string) => {
      if (!Object.prototype.hasOwnProperty.call(modules, name)) throw new Error(`Unexpected SDK dependency: ${name}`);
      return modules[name];
    },
  }, {filename, timeout: 1000});
  exports.useAzureMonitor({spanProcessors: [credentialSpanProcessor], logRecordProcessors: [credentialLogProcessor]});
  expect(startup).toHaveBeenCalledTimes(1);
  const processors: ProcessorConfiguration = startup.mock.calls[0][0];
  const tracer = new BasicTracerProvider({spanProcessors: processors.spanProcessors});
  const logger = new LoggerProvider({processors: processors.logRecordProcessors});
  return {live, metricHandler, spans, logs, tracer, logger};
}

describe.each(['commonjs', 'esm'])('Live Metrics redaction using the installed %s entry point', format => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetRedactionState();
    (config.has as jest.Mock).mockReturnValue(false);
  });

  it.each([false, true])('protects requests, dependencies, logs and exceptions (redaction failure=%s)', async fail => {
    const {live, metricHandler, spans, logs, tracer, logger} = createPipeline(format);
    try {
      if (fail) (config.has as jest.Mock).mockImplementation(() => {throw new Error('config unavailable');});
      const attributes = {'http.method': 'GET', 'http.url': 'https://example.test/?key=dummySecret', 'http.status_code': 200, count: 2};
      for (const kind of [SpanKind.SERVER, SpanKind.CLIENT]) {
        const span = tracer.getTracer('redaction-test').startSpan('GET /', {kind, attributes});
        span.addEvent('exception', {
          'exception.type': 'Error', 'exception.message': 'password=dummySecret',
          'exception.stacktrace': 'at f (/file?key=dummySecret:12:3)',
        });
        span.end();
      }
      logger.getLogger('redaction-test').emit({body: 'password=dummySecret', attributes: {count: 2}});
      logger.getLogger('redaction-test').emit({body: 'failed', attributes: {
        'exception.type': 'Error', 'exception.message': 'token=dummySecret',
        'exception.stacktrace': 'at f (/file?key=dummySecret:12:3)',
      }});
      await tracer.forceFlush();
      await logger.forceFlush();
      const documents = live.getDocuments();
      const savedSpans = spans.getFinishedSpans();
      const savedLogs = logs.getFinishedLogRecords();
      expect(metricHandler.recordSpan).toHaveBeenCalledTimes(2);
      expect(metricHandler.recordLog).toHaveBeenCalledTimes(2);
      expect(live.totalRequestCount).toBe(1);
      expect(live.totalDependencyCount).toBe(1);
      expect(savedSpans).toHaveLength(2);
      expect(savedLogs).toHaveLength(2);
      expect(documents).toHaveLength(fail ? 4 : 6);
      expect(JSON.stringify(documents)).not.toContain('dummySecret');
      expect(JSON.stringify(savedSpans.map(span => ({name: span.name, attributes: span.attributes, events: span.events})))).not.toContain('dummySecret');
      expect(JSON.stringify(savedLogs.map(log => ({body: log.body, attributes: log.attributes})))).not.toContain('dummySecret');
      expect(attributes['http.url']).toBe('https://example.test/?key=dummySecret');
      if (fail) {
        expect(savedSpans.every(span => span.name === '[REDACTED]' && Object.keys(span.attributes).length === 0)).toBe(true);
        expect(savedLogs.every(log => log.body === '[REDACTED]' && Object.keys(log.attributes).length === 0)).toBe(true);
        expect(live.totalExceptionCount).toBe(0);
      } else {
        expect(documents).toEqual(expect.arrayContaining([
          expect.objectContaining({documentType: 'Request', url: 'https://example.test/?key=[REDACTED]', responseCode: '200'}),
          expect.objectContaining({documentType: 'RemoteDependency', commandName: 'https://example.test/?key=[REDACTED]', resultCode: '200'}),
          expect.objectContaining({documentType: 'Trace', message: 'password=[REDACTED]'}),
          expect.objectContaining({documentType: 'Exception', exceptionMessage: 'token=[REDACTED]', exceptionType: 'Error'}),
          expect.objectContaining({documentType: 'Exception', exceptionMessage: 'password=[REDACTED]', exceptionType: 'Error'}),
        ]));
        expect(live.totalExceptionCount).toBe(3);
        expect(savedSpans[0].attributes).toEqual({...attributes, 'http.url': 'https://example.test/?key=[REDACTED]'});
        expect(savedLogs[0].body).toBe('password=[REDACTED]');
      }
    } finally {
      await tracer.shutdown();
      await logger.shutdown();
    }
  });
});
