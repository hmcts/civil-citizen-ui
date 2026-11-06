'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const {pipeline} = require('stream');

const BUCKET_SECONDS = 5;
const DEFAULT_NFR_MS = 1500;
const FAILURE_GAP_SECONDS = 10;
const MAX_KEY_ENDPOINTS = 3;
const DASH = '–';
const MINUS = '−';
const IGNORED_THRESHOLD = /count>=0|max>=0/;
const HIGHLIGHT_KINDS = ['trend', 'rate-failures', 'count'];

const RAW_FILES = [
  ['k6-dashboard.html', 'k6 web dashboard (interactive)'],
  ['summary.json', 'k6 end-of-test summary'],
  ['junit.xml', 'Threshold results as JUnit'],
  ['k6-console.log', 'Console output'],
  ['timeseries.csv.gz', 'Every request and metric sample (gzip CSV)'],
  ['server-metrics.csv', 'Pod CPU and memory, Postgres counters (every 5 s)'],
  ['suite.json', 'What the suite tests: endpoints, traffic and highlights'],
  ['run-info.json', 'Run settings'],
];

const PROFILE_DESCRIPTIONS = {
  smoke: 'Script and environment check at a trickle',
  nfr: 'The NFR target load held for 5 minutes',
  load: 'Twice the NFR load held for 10 minutes',
  stress: 'Steps of 1x to 5x the NFR load to find where it bends',
  spike: 'Sudden 5x burst, then back to the NFR load to check recovery',
  soak: 'NFR load held for an hour (leaks, connection build-up)',
  breakpoint: 'Ramp to 10x the NFR load; stops once the first key endpoint passes 5s at p95',
};

const ERROR_CODE_NAMES = {
  1000: 'unspecified request error',
  1010: 'network error',
  1020: 'invalid URL',
  1050: 'request timed out',
  1100: 'DNS error',
  1101: 'host not found',
  1200: 'TCP error',
  1201: 'connection closed by the server',
  1202: 'unknown TCP error',
  1210: 'connection error',
  1211: 'connection timed out',
  1212: 'connection refused',
  1213: 'unknown connection error',
};

const ERROR_CODE_FAMILIES = [[1600, 'HTTP/2 error'], [1300, 'TLS error'], [1200, 'TCP error'], [1100, 'DNS error']];

const STATUS_NAMES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

const SERVER_FIELDS = {
  service_cpu_m: 'serviceCpu',
  service_mem_mi: 'serviceMem',
  db_cpu_m: 'dbCpu',
  db_mem_mi: 'dbMem',
  db_open_connections: 'dbOpen',
  db_sessions_total: 'dbSessions',
  db_transactions_total: 'dbTransactions',
  db_active_queries: 'dbActive',
  all_db_open_connections: 'allDbOpen',
};

const LEGACY_ENDPOINTS = ['create_draft', 'read_active', 'read_by_id', 'read_by_case', 'save_draft', 'link_case', 'payment_retention', 'delete_draft'];

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const sumOf = (values) => values.reduce((total, value) => total + value, 0);

const meanOf = (values) => (values.length ? sumOf(values) / values.length : null);

const maxOf = (values) => values.reduce((best, value) => (value > best ? value : best), -Infinity);

const maxOrNull = (values) => (values.length ? maxOf(values) : null);

const extent = (items, key) => {
  let min = Infinity;
  let max = -Infinity;
  for (const item of items) {
    min = item[key] < min ? item[key] : min;
    max = item[key] > max ? item[key] : max;
  }
  return {min, max};
};

const percentile = (sorted, fraction) => {
  if (sorted.length === 0) {
    return null;
  }
  const position = fraction * (sorted.length - 1);
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
};

const trendStats = (values) => {
  if (!values.length) {
    return null;
  }
  const sorted = Float64Array.from(values).sort();
  return {
    count: sorted.length,
    avg: sumOf(sorted) / sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p50: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
  };
};

const numberFormats = new Map();

const formatNumber = (value, digits = 0) => {
  if (!isNumber(value)) {
    return DASH;
  }
  if (!numberFormats.has(digits)) {
    numberFormats.set(digits, new Intl.NumberFormat('en-GB', {minimumFractionDigits: digits, maximumFractionDigits: digits}));
  }
  const rounded = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value;
  return numberFormats.get(digits).format(rounded);
};

const formatInt = (value) => formatNumber(value, 0);

const formatRate = (value) => formatNumber(value, 1);

const formatMs = (value) => (isNumber(value) ? `${formatInt(value)} ms` : DASH);

const formatPercent = (rate) => {
  if (!isNumber(rate)) {
    return DASH;
  }
  const percent = rate * 100;
  if (percent === 0) {
    return '0%';
  }
  if (percent < 0.1) {
    return `${formatNumber(percent, 2)}%`;
  }
  if (percent > 99 && percent < 100) {
    return `${formatNumber(percent, 2).replace(/0+$/, '')}%`;
  }
  return `${formatNumber(percent, percent < 10 ? 1 : 0)}%`;
};

const formatSigned = (value, format) => {
  if (!isNumber(value)) {
    return DASH;
  }
  if (value === 0) {
    return format(0);
  }
  return `${value > 0 ? '+' : MINUS}${format(Math.abs(value))}`;
};

const pad2 = (value) => String(value).padStart(2, '0');

const formatClock = (seconds) => {
  const total = Math.max(0, Math.round(seconds));
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
};

const formatDuration = (seconds) => {
  if (!isNumber(seconds)) {
    return DASH;
  }
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  if (hours) {
    return `${hours}h ${pad2(minutes)}m`;
  }
  return minutes ? `${minutes}m ${pad2(rest)}s` : `${rest}s`;
};

const toIso = (when) => new Date(typeof when === 'number' ? when * 1000 : when).toISOString();

const formatUtc = (when) => {
  if (when === null || when === undefined) {
    return DASH;
  }
  return `${toIso(when).slice(0, 19).replace('T', ' ')} UTC`;
};

const formatUtcTime = (when) => `${toIso(when).slice(11, 19)} UTC`;

const formatBytes = (bytes) => {
  if (!isNumber(bytes)) {
    return DASH;
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return bytes < 1048576 ? `${formatNumber(bytes / 1024, 0)} KB` : `${formatNumber(bytes / 1048576, 1)} MB`;
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const describeStatus = (status) => {
  if (!status) {
    return 'No response';
  }
  return STATUS_NAMES[status] ? `${status} ${STATUS_NAMES[status]}` : `${status}`;
};

const describeErrorCode = (code) => {
  const value = Number(code);
  if (!code || !Number.isFinite(value)) {
    return 'none';
  }
  if (value >= 1400 && value < 1600) {
    return `${value} (HTTP ${value - 1000} response)`;
  }
  const family = ERROR_CODE_FAMILIES.find(([start]) => value >= start && value < start + 100);
  const name = ERROR_CODE_NAMES[value] || (family ? family[1] : 'request error');
  return `${value} (${name})`;
};

const readText = (file) => {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    return null;
  }
};

const readJson = (file, notes) => {
  const text = readText(file);
  if (text === null) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    notes.push(`${path.basename(file)} could not be parsed (${error.message}).`);
    return null;
  }
};

const fileSize = (file) => {
  try {
    return fs.statSync(file).size;
  } catch (error) {
    return null;
  }
};

const toNumberOrNull = (cell) => {
  if (cell === undefined || cell.trim() === '') {
    return null;
  }
  const value = Number(cell);
  return Number.isFinite(value) ? value : null;
};

const splitQuoted = (line) => {
  const fields = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      field += '"';
      index++;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      fields.push(field);
      field = '';
    } else {
      field += character;
    }
  }
  fields.push(field);
  return fields;
};

const splitCsv = (line) => (line.includes('"') ? splitQuoted(line) : line.split(','));

const safeDecode = (text) => {
  try {
    return decodeURIComponent(text);
  } catch (error) {
    return text;
  }
};

const tagCache = new Map();

const parseTags = (raw) => {
  if (!tagCache.has(raw)) {
    const tags = {};
    for (const pair of raw.split('&')) {
      const separator = pair.indexOf('=');
      if (separator > 0) {
        tags[safeDecode(pair.slice(0, separator))] = safeDecode(pair.slice(separator + 1));
      }
    }
    tagCache.set(raw, tags);
  }
  return tagCache.get(raw);
};

const toSeconds = (cell) => {
  const numeric = Number(cell);
  if (cell !== '' && Number.isFinite(numeric)) {
    return Math.floor(numeric);
  }
  const parsed = Date.parse(cell);
  return Number.isNaN(parsed) ? null : Math.floor(parsed / 1000);
};

const asList = (value) => (Array.isArray(value) ? value : []);

const asText = (value) => (value === undefined || value === null ? '' : String(value));

const normaliseControl = (raw) => (raw && raw.endpoint ? {endpoint: asText(raw.endpoint), description: asText(raw.description)} : null);

const normaliseEvent = (raw) => ({name: asText(raw.name), endpoint: asText(raw.endpoint), label: asText(raw.label) || asText(raw.name)});

const normaliseHighlight = (raw) => ({
  metric: asText(raw.metric),
  kind: raw.kind,
  label: asText(raw.label) || asText(raw.metric),
  nfr: Boolean(raw.nfr),
  countLabel: asText(raw.countLabel),
  unit: asText(raw.unit),
  note: asText(raw.note),
  noteWhenMissing: asText(raw.noteWhenMissing),
});

const normaliseTraffic = (raw) => ({name: asText(raw.name), perSecondAt1x: Number(raw.perSecondAt1x), description: asText(raw.description)});

const normaliseDatabase = (raw) => (raw && raw.name ? {name: asText(raw.name), label: asText(raw.label) || `${raw.name} database`} : null);

const normaliseMeta = (raw, info, legacy) => {
  const events = asList(raw.events).filter((event) => event && event.name && event.endpoint).map(normaliseEvent);
  return {
    legacy,
    suite: asText(raw.suite) || 'suite',
    title: asText(raw.title) || asText(raw.suite) || 'Performance',
    service: asText(raw.service),
    trafficType: asText(raw.trafficType) || null,
    endpoints: asList(raw.endpoints).map(asText),
    keyEndpoints: asList(raw.keyEndpoints).map(asText),
    control: normaliseControl(raw.control),
    events,
    eventEndpoints: new Map(events.map((event) => [event.endpoint, event])),
    highlights: asList(raw.highlights).filter((item) => item && item.metric && HIGHLIGHT_KINDS.includes(item.kind)).map(normaliseHighlight),
    database: normaliseDatabase(raw.database),
    nfrSource: asText(raw.nfrSource),
    traffic: asList(raw.traffic).filter((item) => item && item.name).map(normaliseTraffic),
    profile: asText(raw.profile) || asText(info.profile),
    profileDescription: asText(raw.profileDescription),
    nfrMs: Number.isFinite(Number(raw.nfrMs)) && raw.nfrMs !== null && raw.nfrMs !== '' ? Number(raw.nfrMs) : null,
  };
};

const legacyHighlights = (pages) => [
  {metric: 'page_cycle_duration', kind: 'trend', label: 'Page cycle (read, save, read back)', nfr: true},
  {metric: 'journey_duration', kind: 'trend', label: `Journey (create, ${pages} pages, link, payment, delete)`, countLabel: 'Completed'},
  {
    metric: 'data_integrity_failures',
    kind: 'rate-failures',
    label: 'Data integrity (saved, read back, different value)',
    unit: 'read-backs',
    note: 'Older runs also count failed saves here',
    noteWhenMissing: 'journey_save_failures',
  },
  {metric: 'journey_save_failures', kind: 'count', label: 'Journey pages where the save or read-back failed'},
];

const legacyTraffic = (pages) => [
  {name: 'page_reads', perSecondAt1x: 24, description: 'GET /active, as each claim page does'},
  {name: 'page_saves', perSecondAt1x: 3.8, description: 'PUT /{id} with a full claim payload'},
  {name: 'journeys', perSecondAt1x: 0.1, description: `create, ${pages} pages of read, save and read back (checked), link to a case, read by case, payment retention, delete`},
  {name: 'control', perSecondAt1x: 1, description: 'a civil-service call that does not touch the database'},
];

const legacyMeta = (info) => {
  const pages = Number(info.pagesPerJourney) || 10;
  return {
    suite: 'draft-claim-store',
    title: 'Draft claim store',
    service: 'civil-service',
    trafficType: 'draft',
    endpoints: LEGACY_ENDPOINTS,
    keyEndpoints: ['read_active', 'save_draft', 'read_by_id'],
    control: {endpoint: 'control_no_db', description: 'a civil-service call that does not touch the database'},
    events: info.cleanupJob === false ? [] : [{name: 'cleanup_job', endpoint: 'run_cleanup_job', label: 'Clean-up job'}],
    highlights: legacyHighlights(pages),
    database: {name: 'cmc', label: 'CMC database'},
    nfrSource: 'Release IA: 20 reads/s and 4 writes/s with a 30% uplift',
    traffic: legacyTraffic(pages),
    profile: info.profile || '',
    profileDescription: PROFILE_DESCRIPTIONS[info.profile] || '',
  };
};

const classifyRequest = (meta, tags, name) => {
  const type = tags.type;
  if (type === 'setup' || type === 'teardown') {
    return null;
  }
  if (meta.eventEndpoints.has(name)) {
    return 'event';
  }
  if (meta.control && (type === 'control' || name === meta.control.endpoint)) {
    return 'control';
  }
  if (type === 'control' || type === 'admin') {
    return null;
  }
  if (!meta.trafficType) {
    return 'main';
  }
  return type === meta.trafficType || (type === undefined && meta.endpoints.includes(name)) ? 'main' : null;
};

const trackedMetrics = (meta) => [
  'dropped_iterations',
  ...meta.highlights.map((highlight) => highlight.metric),
  ...meta.events.flatMap((event) => [`${event.name}_triggered`, `${event.name}_unavailable`]),
];

const createCollector = (meta) => ({
  meta,
  requests: [],
  events: new Map(),
  tracked: new Map(trackedMetrics(meta).map((name) => [name, []])),
});

const addRequest = (collector, fields) => {
  const {meta} = collector;
  const tags = parseTags(fields[10] || '');
  const name = fields[7];
  const kind = classifyRequest(meta, tags, name);
  const time = toSeconds(fields[1]);
  if (!kind || time === null) {
    return;
  }
  const request = {
    time,
    kind,
    endpoint: tags.endpoint || name,
    ms: Number(fields[2]),
    failed: fields[5] === 'false',
    status: Number(fields[9]) || 0,
    errorCode: fields[4] || '',
  };
  if (!Number.isFinite(request.ms)) {
    return;
  }
  if (kind === 'event') {
    collector.events.set(meta.eventEndpoints.get(name).name, request);
  } else {
    collector.requests.push(request);
  }
};

const pushFinite = (list, cell) => {
  const value = Number(cell);
  if (Number.isFinite(value)) {
    list.push(value);
  }
};

const handleRow = (collector, fields) => {
  if (fields[0] === 'http_req_duration') {
    addRequest(collector, fields);
    return;
  }
  const samples = collector.tracked.get(fields[0]);
  if (samples) {
    pushFinite(samples, fields[2]);
  }
};

async function* lineBatches(stream) {
  let rest = '';
  for await (const chunk of stream) {
    const parts = (rest + chunk).split('\n');
    rest = parts.pop();
    yield parts;
  }
  if (rest) {
    yield [rest];
  }
}

const openGzip = (file) => {
  const stream = pipeline(fs.createReadStream(file), zlib.createGunzip({finishFlush: zlib.constants.Z_SYNC_FLUSH}), () => {});
  stream.setEncoding('utf8');
  return stream;
};

const collectTimeseries = async (file, notes, meta) => {
  const collector = createCollector(meta);
  try {
    for await (const lines of lineBatches(openGzip(file))) {
      for (const line of lines) {
        handleRow(collector, splitCsv(line));
      }
    }
  } catch (error) {
    notes.push(`timeseries.csv.gz could not be read to the end (${error.message}); the charts use the rows that were readable.`);
  }
  return collector;
};

const clusterTimes = (times, gap) => {
  const windows = [];
  for (const time of [...times].sort((a, b) => a - b)) {
    const last = windows[windows.length - 1];
    if (last && time - last.end <= gap) {
      last.end = time;
      last.count++;
    } else {
      windows.push({start: time, end: time, count: 1});
    }
  }
  return windows;
};

const shiftWindows = (windows, startSec) => windows.map((window) => ({start: window.start - startSec, end: window.end - startSec, count: window.count}));

const groupFailures = (failedRequests, startSec) => {
  const groups = new Map();
  for (const request of failedRequests) {
    const key = `${request.endpoint}|${request.status}|${request.errorCode}`;
    const group = groups.get(key) || {endpoint: request.endpoint, status: request.status, errorCode: request.errorCode, times: []};
    group.times.push(request.time);
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group) => ({
      endpoint: group.endpoint,
      status: group.status,
      errorCode: group.errorCode,
      count: group.times.length,
      windows: shiftWindows(clusterTimes(group.times, FAILURE_GAP_SECONDS), startSec),
    }))
    .sort((a, b) => b.count - a.count || a.endpoint.localeCompare(b.endpoint));
};

const emptyBuckets = (count) => Array.from({length: count}, () => 0);

const bucketRates = (counts, widths) => counts.map((count, index) => count / widths[index]);

const bucketLatency = (requests, bucketOf, bucketCount) => {
  const byEndpoint = {};
  for (const request of requests) {
    if (request.ms > 0) {
      byEndpoint[request.endpoint] = byEndpoint[request.endpoint] || Array.from({length: bucketCount}, () => []);
      byEndpoint[request.endpoint][bucketOf(request.time)].push(request.ms);
    }
  }
  const latency = {};
  for (const [endpoint, buckets] of Object.entries(byEndpoint)) {
    latency[endpoint] = buckets.map((values) => {
      const stats = trendStats(values);
      return stats ? {p95: stats.p95, samples: stats.count} : null;
    });
  }
  return latency;
};

const endpointStats = (requests) => {
  const grouped = new Map();
  for (const request of requests) {
    const entry = grouped.get(request.endpoint) || {kind: request.kind, values: [], failed: 0};
    entry.values.push(request.ms);
    entry.failed += request.failed ? 1 : 0;
    grouped.set(request.endpoint, entry);
  }
  const stats = {};
  for (const [endpoint, entry] of grouped) {
    stats[endpoint] = {kind: entry.kind, ...trendStats(entry.values), errorRate: entry.failed / entry.values.length};
  }
  return stats;
};

const summariseEvents = (collector, startSec) => collector.meta.events
  .filter((event) => collector.events.has(event.name))
  .map((event) => {
    const request = collector.events.get(event.name);
    return {name: event.name, label: event.label, endpoint: event.endpoint, time: request.time, elapsed: request.time - startSec, status: request.status, errorCode: request.errorCode};
  });

const buildTraffic = (collector) => {
  const {requests} = collector;
  if (!requests.length) {
    return null;
  }
  const mains = requests.filter((request) => request.kind === 'main');
  const controls = requests.filter((request) => request.kind === 'control');
  const startSec = extent(mains.length ? mains : requests, 'time').min;
  const endSec = extent(requests, 'time').max;
  const windowSec = Math.max(1, endSec - startSec + 1);
  const bucketCount = Math.ceil(windowSec / BUCKET_SECONDS);
  const widths = Array.from({length: bucketCount}, (_, index) => Math.min(BUCKET_SECONDS, windowSec - index * BUCKET_SECONDS));
  const bucketOf = (time) => Math.min(bucketCount - 1, Math.max(0, Math.floor((time - startSec) / BUCKET_SECONDS)));
  const counts = {main: emptyBuckets(bucketCount), control: emptyBuckets(bucketCount), failed: emptyBuckets(bucketCount)};
  for (const request of requests) {
    counts[request.kind][bucketOf(request.time)]++;
    counts.failed[bucketOf(request.time)] += request.failed ? 1 : 0;
  }
  const failedMains = mains.filter((request) => request.failed);
  const failedTimes = requests.filter((request) => request.failed).map((request) => request.time);
  return {
    startSec,
    endSec,
    windowSec,
    bucketCount,
    widths,
    xMax: bucketCount * BUCKET_SECONDS,
    rates: {main: bucketRates(counts.main, widths), control: bucketRates(counts.control, widths), failed: bucketRates(counts.failed, widths)},
    latency: bucketLatency(requests, bucketOf, bucketCount),
    stats: endpointStats(requests),
    failures: {
      main: {
        total: failedMains.length,
        groups: groupFailures(failedMains, startSec),
        windows: shiftWindows(clusterTimes(failedMains.map((request) => request.time), FAILURE_GAP_SECONDS), startSec),
      },
      control: {total: controls.length, failed: controls.filter((request) => request.failed).length},
      windows: shiftWindows(clusterTimes(failedTimes, FAILURE_GAP_SECONDS), startSec),
    },
    events: summariseEvents(collector, startSec),
  };
};

const summariseSamples = (collector) => ({series: Object.fromEntries(collector.tracked)});

const parseServerRow = (columns, cells) => {
  const t = Date.parse(cells[0]) / 1000;
  if (!Number.isFinite(t)) {
    return null;
  }
  const row = {t};
  columns.forEach((column, index) => {
    if (SERVER_FIELDS[column]) {
      row[SERVER_FIELDS[column]] = toNumberOrNull(cells[index]);
    }
  });
  return row;
};

const parseServerMetrics = (content) => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length < 2) {
    return [];
  }
  const columns = lines[0].split(',').map((column) => column.trim());
  return lines.slice(1).map((line) => parseServerRow(columns, line.split(','))).filter(Boolean);
};

const counterIntervals = (rows, key) => {
  const intervals = [];
  let previous = null;
  for (const row of rows) {
    const value = row[key];
    if (value === null || value === undefined) {
      continue;
    }
    if (previous && row.t > previous.t && value >= previous.value) {
      intervals.push({t: row.t, seconds: row.t - previous.t, delta: value - previous.value});
    }
    previous = {t: row.t, value};
  }
  return intervals;
};

const rateLookup = (intervals) => new Map(intervals.map((interval) => [interval.t, interval.delta / interval.seconds]));

const averageRate = (intervals) => {
  const seconds = sumOf(intervals.map((interval) => interval.seconds));
  return seconds > 0 ? sumOf(intervals.map((interval) => interval.delta)) / seconds : null;
};

const rateSummary = (intervals) => (intervals.length
  ? {avg: averageRate(intervals), peak: maxOf(intervals.map((interval) => interval.delta / interval.seconds))}
  : null);

const validValues = (rows, key) => rows.map((row) => row[key]).filter(isNumber);

const levelSummary = (values) => (values.length ? {avg: meanOf(values), peak: maxOf(values)} : null);

const buildServer = (rows, startSec, windowSec) => {
  const inWindow = (t) => t >= startSec && t <= startSec + windowSec;
  const windowRows = rows.filter((row) => inWindow(row.t));
  if (windowRows.length < 2) {
    return null;
  }
  const sessions = counterIntervals(rows, 'dbSessions').filter((interval) => inWindow(interval.t));
  const transactions = counterIntervals(rows, 'dbTransactions').filter((interval) => inWindow(interval.t));
  const sessionRates = rateLookup(sessions);
  const transactionRates = rateLookup(transactions);
  const rateAt = (lookup, t) => (lookup.has(t) ? lookup.get(t) : null);
  return {
    points: windowRows.map((row) => ({
      x: row.t - startSec,
      newConnections: rateAt(sessionRates, row.t),
      transactions: rateAt(transactionRates, row.t),
      openConnections: row.dbOpen ?? null,
      allOpenConnections: row.allDbOpen ?? null,
      serviceCpu: row.serviceCpu ?? null,
      dbCpu: row.dbCpu ?? null,
    })),
    stats: {
      newConnections: rateSummary(sessions),
      transactions: rateSummary(transactions),
      openConnectionsMax: maxOrNull(validValues(windowRows, 'dbOpen')),
      allOpenConnectionsMax: maxOrNull(validValues(windowRows, 'allDbOpen')),
      dbCpu: levelSummary(validValues(windowRows, 'dbCpu')),
      serviceCpu: levelSummary(validValues(windowRows, 'serviceCpu')),
    },
  };
};

const infoFromFolderName = (root, suiteName) => {
  const parts = path.basename(root).split('_');
  const hasProfile = parts.length > 2;
  const middle = parts.slice(1, hasProfile ? -1 : undefined);
  const label = (suiteName && middle[0] === suiteName ? middle.slice(1) : middle).join('_') || path.basename(root);
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(parts[0]);
  return {
    label,
    profile: hasProfile ? parts[parts.length - 1] : '',
    startedAt: match ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z` : null,
  };
};

const normaliseSummary = (parsed) => {
  const root = parsed && parsed.data && parsed.data.metrics ? parsed.data : parsed;
  if (!root || !root.metrics) {
    return null;
  }
  return {metrics: root.metrics, durationMs: root.state ? root.state.testRunDurationMs : null};
};

const timelineFor = (traffic, serverRows) => {
  if (traffic) {
    return {startSec: traffic.startSec, windowSec: traffic.windowSec, xMax: traffic.xMax};
  }
  if (!serverRows.length) {
    return null;
  }
  const startSec = Math.floor(serverRows[0].t);
  const windowSec = Math.max(1, Math.ceil(serverRows[serverRows.length - 1].t - startSec));
  return {startSec, windowSec, xMax: Math.max(BUCKET_SECONDS, Math.ceil(windowSec / BUCKET_SECONDS) * BUCKET_SECONDS)};
};

const legacySettings = (info) => ({
  ...(info.payload ? {PAYLOAD: String(info.payload)} : {}),
  ...(info.pagesPerJourney ? {PAGES_PER_JOURNEY: String(info.pagesPerJourney)} : {}),
});

const toPairs = (object) => Object.entries(object).map(([label, value]) => ({label, value: String(value)}));

const suiteResultsOf = (info, hasSuiteFile) => {
  if (info.suiteResults && typeof info.suiteResults === 'object') {
    return toPairs(info.suiteResults);
  }
  const seeded = Number(info.seedExpired) || 0;
  if (hasSuiteFile || !seeded) {
    return [];
  }
  const left = info.expiredLeftAfterRun;
  return toPairs({
    'Expired drafts loaded': seeded,
    'Expired drafts left after the run': left === undefined || left === null || left === '' ? 'unknown' : left,
  });
};

const consoleError = (content) => {
  const lines = (content || '').split('\n').filter((line) => line.includes('level=error'));
  const match = /msg="((?:[^"\\]|\\.)*)"/.exec(lines[lines.length - 1] || '');
  if (!match) {
    return null;
  }
  const message = match[1].replace(/\\"/g, '"').split('\\n')[0].replace(/^Error:\s*/, '').trim();
  return message || null;
};

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

async function loadRun(dir) {
  const root = path.resolve(dir);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error(`Run directory not found: ${dir}`);
  }
  const notes = [];
  const recorded = readJson(path.join(root, 'run-info.json'), notes);
  if (!recorded) {
    notes.push('run-info.json is missing, so the run settings come from the folder name.');
  }
  const rawMeta = readJson(path.join(root, 'suite.json'), notes);
  const hasSuiteFile = isPlainObject(rawMeta);
  const provisional = recorded || infoFromFolderName(root, hasSuiteFile ? rawMeta.suite : null);
  const meta = hasSuiteFile ? normaliseMeta(rawMeta, provisional, false) : normaliseMeta(legacyMeta(provisional), provisional, true);
  const info = {...provisional, profile: provisional.profile || meta.profile, env: isPlainObject(provisional.env) ? provisional.env : legacySettings(provisional)};
  const summary = normaliseSummary(readJson(path.join(root, 'summary.json'), notes));
  const seriesFile = path.join(root, 'timeseries.csv.gz');
  const collector = fs.existsSync(seriesFile) ? await collectTimeseries(seriesFile, notes, meta) : null;
  const traffic = collector ? buildTraffic(collector) : null;
  if (!summary) {
    const recomputed = traffic ? ' Request figures are recomputed from timeseries.csv.gz.' : '';
    notes.push(`summary.json is missing or unreadable, so thresholds could not be checked and there is no pass or fail verdict.${recomputed}`);
  }
  const serverText = readText(path.join(root, 'server-metrics.csv'));
  const serverRows = serverText === null ? [] : parseServerMetrics(serverText);
  const timeline = timelineFor(traffic, serverRows);
  return {
    dir: root,
    name: path.basename(root),
    meta,
    info,
    suiteResults: suiteResultsOf(info, hasSuiteFile),
    summary,
    traffic,
    samples: collector ? summariseSamples(collector) : null,
    seriesRead: collector !== null,
    server: timeline ? buildServer(serverRows, timeline.startSec, timeline.windowSec) : null,
    serverCollected: serverText !== null,
    timeline,
    consoleError: consoleError(readText(path.join(root, 'k6-console.log'))),
    files: RAW_FILES
      .map(([name, description]) => ({name, description, bytes: fileSize(path.join(root, name))}))
      .filter((file) => file.bytes !== null || file.name !== 'suite.json'),
    notes,
  };
}

const valuesOf = (summary, name) => (summary && summary.metrics[name] ? summary.metrics[name].values || null : null);

const fromTrend = (values, count) => ({
  count,
  avg: values.avg,
  min: values.min,
  max: values.max,
  p50: values.med,
  p90: values['p(90)'],
  p95: values['p(95)'],
  p99: values['p(99)'],
});

const collectThresholds = (summary) => {
  if (!summary) {
    return null;
  }
  return Object.entries(summary.metrics).flatMap(([metric, definition]) => Object.entries(definition.thresholds || {})
    .filter(([expression]) => !IGNORED_THRESHOLD.test(expression))
    .map(([expression, result]) => ({metric, expression, ok: result.ok === true, values: definition.values || {}})));
};

const thresholdOk = (thresholds, metric) => {
  const found = (thresholds || []).find((threshold) => threshold.metric === metric && threshold.expression.startsWith('p(95)'));
  return found ? found.ok : null;
};

const nfrFromThresholds = (thresholds, meta) => {
  const timed = new Set(meta.highlights.filter((highlight) => highlight.nfr).map((highlight) => highlight.metric));
  const limits = (thresholds || [])
    .filter((threshold) => threshold.metric.startsWith('http_req_duration') || timed.has(parseMetricName(threshold.metric).base))
    .map((threshold) => /^p\(95\)<(\d+(?:\.\d+)?)$/.exec(threshold.expression))
    .filter(Boolean)
    .map((match) => Number(match[1]));
  return limits.length ? Math.min(...limits) : DEFAULT_NFR_MS;
};

const OPERATOR_WORDS = {'<': 'under', '<=': 'at most', '>': 'above', '>=': 'at least', '==': 'exactly', '!=': 'anything but'};

const AGGREGATE_WORDS = {avg: 'average', med: 'median', max: 'maximum', min: 'minimum'};

const parseMetricName = (name) => {
  const match = /^([A-Za-z0-9_]+)(?:\{([^}]*)\})?$/.exec(name);
  const tags = {};
  if (match && match[2]) {
    for (const pair of match[2].split(',')) {
      const [key, ...rest] = pair.split(':');
      tags[key.trim()] = rest.join(':').trim();
    }
  }
  return {base: match ? match[1] : name, tags};
};

const parseExpression = (expression) => {
  const match = /^(p\(\d+(?:\.\d+)?\)|avg|min|max|med|rate|count|value)\s*(<=|>=|==|!=|<|>)\s*(-?\d+(?:\.\d+)?)$/.exec(expression.trim());
  return match ? {aggregate: match[1], operator: match[2], limit: Number(match[3])} : null;
};

const labelFor = ({tags}, meta, fallback) => {
  if (tags.endpoint) {
    return tags.endpoint;
  }
  if (tags.type === 'control') {
    return meta.control ? meta.control.endpoint : 'Control requests';
  }
  return meta.trafficType && tags.type === meta.trafficType ? 'Overall' : fallback;
};

const aggregateLabel = (aggregate) => {
  const percentileMatch = /^p\((\d+(?:\.\d+)?)\)$/.exec(aggregate);
  return percentileMatch ? `p${percentileMatch[1]}` : AGGREGATE_WORDS[aggregate] || aggregate;
};

const trimNumber = (value) => formatNumber(value, 3).replace(/\.?0+$/, '');

const durationSentence = ({metric, condition, values, meta, fallback}) => ({
  text: `${labelFor(metric, meta, fallback)} ${aggregateLabel(condition.aggregate)} must be ${OPERATOR_WORDS[condition.operator]} ${formatInt(condition.limit)} ms`,
  measured: formatMs(values[condition.aggregate]),
});

const failureSentence = ({metric, condition, values, meta}) => {
  const label = labelFor(metric, meta, 'Request');
  return {
    text: condition.operator === '==' && condition.limit === 0
      ? `${label} must have no failed requests`
      : `${label} error rate must be ${OPERATOR_WORDS[condition.operator]} ${formatPercent(condition.limit)}`,
    measured: formatPercent(values.rate),
  };
};

const checksSentence = ({metric, condition, values, meta}) => {
  const scope = labelFor(metric, meta, '');
  const comparison = condition.operator === '>' ? 'more than' : OPERATOR_WORDS[condition.operator];
  return {
    text: `${scope ? `${scope} response checks` : 'Response checks'} must pass ${comparison} ${formatPercent(condition.limit)} of the time`,
    measured: formatPercent(values.rate),
  };
};

const droppedSentence = ({values}) => ({
  text: 'No iterations may be dropped, so the service has to keep up with the arrival rate',
  measured: `${formatInt(values.count || 0)} dropped`,
});

const genericSentence = ({metric, condition, values, meta, fallback}) => ({
  text: `${labelFor(metric, meta, fallback)} ${aggregateLabel(condition.aggregate)} must be ${OPERATOR_WORDS[condition.operator]} ${trimNumber(condition.limit)}`,
  measured: trimNumber(values[condition.aggregate]),
});

const failuresHighlightSentence = ({highlight, condition, values}) => {
  const wrong = values.passes || 0;
  const unit = highlight.unit || 'checks';
  return {
    text: condition.operator === '==' && condition.limit === 0
      ? `${highlight.label}: no failures allowed`
      : `${highlight.label} failure rate must be ${OPERATOR_WORDS[condition.operator]} ${formatPercent(condition.limit)}`,
    measured: `${formatInt(wrong)} of ${formatInt(wrong + (values.fails || 0))} ${unit} failed`,
  };
};

const HIGHLIGHT_SENTENCES = {
  trend: ({highlight, condition, values}) => ({
    text: `${highlight.label} ${aggregateLabel(condition.aggregate)} must be ${OPERATOR_WORDS[condition.operator]} ${formatInt(condition.limit)} ms`,
    measured: formatMs(values[condition.aggregate]),
  }),
  'rate-failures': failuresHighlightSentence,
  count: ({highlight, condition, values}) => ({
    text: `${highlight.label} must be ${OPERATOR_WORDS[condition.operator]} ${trimNumber(condition.limit)}`,
    measured: trimNumber(values[condition.aggregate]),
  }),
};

const THRESHOLD_SENTENCES = {
  http_req_duration: [durationSentence, 'All requests'],
  http_req_failed: [failureSentence, 'Request'],
  checks: [checksSentence, 'Response'],
  dropped_iterations: [droppedSentence, ''],
};

const describeThreshold = (threshold, meta) => {
  const metric = parseMetricName(threshold.metric);
  const condition = parseExpression(threshold.expression);
  if (!condition) {
    return {text: `${threshold.metric} must satisfy ${threshold.expression}`, measured: null, ok: threshold.ok};
  }
  const highlight = meta.highlights.find((item) => item.metric === metric.base && !Object.keys(metric.tags).length);
  if (highlight) {
    return {...HIGHLIGHT_SENTENCES[highlight.kind]({highlight, condition, values: threshold.values}), ok: threshold.ok};
  }
  const [sentence, fallback] = THRESHOLD_SENTENCES[metric.base] || [genericSentence, metric.base];
  return {...sentence({metric, condition, values: threshold.values, meta, fallback}), ok: threshold.ok};
};

const METRIC_ORDER = ['http_req_failed', 'checks', 'http_req_duration'];

const thresholdRank = (threshold, meta) => {
  const {base, tags} = parseMetricName(threshold.metric);
  const endpointIndex = meta.endpoints.indexOf(tags.endpoint);
  let subject = 0;
  if (tags.endpoint) {
    subject = 1 + (endpointIndex >= 0 ? endpointIndex : meta.endpoints.length);
  } else if (tags.type === 'control') {
    subject = meta.endpoints.length + 2;
  }
  const metric = METRIC_ORDER.includes(base) ? METRIC_ORDER.indexOf(base) : METRIC_ORDER.length;
  return subject * 10 + metric;
};

const buildVerdict = (thresholds, meta) => {
  if (!thresholds || !thresholds.length) {
    return {state: 'unknown', total: 0, passed: 0, failed: []};
  }
  const failed = thresholds.filter((threshold) => !threshold.ok).sort((a, b) => thresholdRank(a, meta) - thresholdRank(b, meta));
  return {
    state: failed.length ? 'fail' : 'pass',
    total: thresholds.length,
    passed: thresholds.length - failed.length,
    failed: failed.map((threshold) => describeThreshold(threshold, meta)),
  };
};

const endpointNames = (run) => {
  const {meta} = run;
  const found = new Set();
  for (const metric of run.summary ? Object.keys(run.summary.metrics) : []) {
    const match = /^http_req_duration\{endpoint:([^}]+)\}$/.exec(metric);
    if (match) {
      found.add(match[1]);
    }
  }
  for (const [name, stats] of Object.entries(run.traffic ? run.traffic.stats : {})) {
    if (stats.kind === 'main') {
      found.add(name);
    }
  }
  const extra = [...found].filter((name) => !meta.endpoints.includes(name)).sort();
  const names = [...meta.endpoints, ...extra].map((name) => ({name, kind: 'main'}));
  return meta.control ? names.concat({name: meta.control.endpoint, kind: 'control'}) : names;
};

const summaryEndpoint = (summary, selector) => {
  const duration = valuesOf(summary, `http_req_duration{${selector}}`);
  const requests = valuesOf(summary, `http_reqs{${selector}}`);
  if (!duration || !requests) {
    return null;
  }
  const failed = valuesOf(summary, `http_req_failed{${selector}}`);
  return {...fromTrend(duration, requests.count), errorRate: failed ? failed.rate : null};
};

const nfrState = (row, selector, thresholds, nfrMs) => {
  if (row.errorRate === 1) {
    return 'failed';
  }
  const declared = thresholdOk(thresholds, `http_req_duration{${selector}}`);
  const ok = declared === null ? row.p95 <= nfrMs : declared;
  return ok ? 'pass' : 'fail';
};

const buildEndpointRow = (run, endpoint, windowSec, thresholds, nfrMs) => {
  const selector = endpoint.kind === 'control' ? 'type:control' : `endpoint:${endpoint.name}`;
  const measured = run.traffic ? run.traffic.stats[endpoint.name] : null;
  const stats = summaryEndpoint(run.summary, selector) || measured;
  if (!stats || !stats.count) {
    return null;
  }
  const errorRate = isNumber(stats.errorRate) ? stats.errorRate : (measured ? measured.errorRate : null);
  const row = {
    name: endpoint.name,
    kind: endpoint.kind,
    count: stats.count,
    rps: windowSec ? stats.count / windowSec : null,
    avg: stats.avg,
    p50: stats.p50,
    p90: stats.p90,
    p95: stats.p95,
    p99: stats.p99,
    max: stats.max,
    errorRate,
  };
  return {...row, nfr: nfrState(row, selector, thresholds, nfrMs)};
};

const trafficWindow = (run) => {
  if (run.traffic) {
    return {seconds: run.traffic.windowSec, kind: 'traffic'};
  }
  return {seconds: run.summary && run.summary.durationMs ? run.summary.durationMs / 1000 : null, kind: 'run'};
};

const sampleSeries = (run, metric) => (run.samples ? run.samples.series[metric] || [] : []);

const metricRecorded = (run, metric) => Boolean(valuesOf(run.summary, metric)) || sampleSeries(run, metric).length > 0;

const EMPTY_TREND = {count: 0, avg: null, min: null, max: null, p50: null, p90: null, p95: null, p99: null};

const trendHighlight = (run, highlight) => {
  const values = valuesOf(run.summary, highlight.metric);
  if (values) {
    return values.count ? fromTrend(values, values.count) : EMPTY_TREND;
  }
  return trendStats(sampleSeries(run, highlight.metric));
};

const failuresHighlight = (run, highlight) => {
  const values = valuesOf(run.summary, highlight.metric);
  if (values) {
    const wrong = values.passes || 0;
    return {wrong, total: wrong + (values.fails || 0)};
  }
  const samples = sampleSeries(run, highlight.metric);
  return samples.length ? {wrong: samples.filter(Boolean).length, total: samples.length} : null;
};

const countHighlight = (run, highlight) => {
  const values = valuesOf(run.summary, highlight.metric);
  if (values) {
    return {count: values.count || 0};
  }
  const samples = sampleSeries(run, highlight.metric);
  return run.summary || !samples.length ? null : {count: sumOf(samples)};
};

const HIGHLIGHT_READERS = {trend: trendHighlight, 'rate-failures': failuresHighlight, count: countHighlight};

const buildHighlights = (run) => run.meta.highlights.map((highlight) => ({
  ...highlight,
  data: HIGHLIGHT_READERS[highlight.kind](run, highlight),
  note: highlight.note && highlight.noteWhenMissing && !metricRecorded(run, highlight.noteWhenMissing) ? highlight.note : '',
}));

const counterTotal = (run, metric) => {
  const values = valuesOf(run.summary, metric);
  if (values) {
    return values.count || 0;
  }
  if (run.summary) {
    return 0;
  }
  return run.samples ? sumOf(sampleSeries(run, metric)) : null;
};

const buildEvents = (run) => run.meta.events.map((event) => ({
  ...event,
  triggered: counterTotal(run, `${event.name}_triggered`),
  unavailable: counterTotal(run, `${event.name}_unavailable`),
  request: run.traffic ? run.traffic.events.find((item) => item.name === event.name) || null : null,
}));

const mainTotals = (run, rows, windowSec) => {
  const requests = sumOf(rows.filter((row) => row.kind === 'main').map((row) => row.count));
  const failedMetric = run.meta.trafficType ? valuesOf(run.summary, `http_req_failed{type:${run.meta.trafficType}}`) : null;
  const failed = failedMetric ? failedMetric.passes : (run.traffic ? run.traffic.failures.main.total : null);
  return {
    requests,
    rps: windowSec ? requests / windowSec : null,
    failed,
    errorRate: failedMetric ? failedMetric.rate : (isNumber(failed) && requests ? failed / requests : null),
  };
};

const serverMetrics = (run, requestsPerSecond) => {
  if (!run.server) {
    return null;
  }
  const stats = run.server.stats;
  const perRequest = stats.newConnections && requestsPerSecond ? stats.newConnections.avg / requestsPerSecond : null;
  return {...stats, connectionsPerRequest: perRequest};
};

const keyEndpointNames = (meta, rows) => (meta.keyEndpoints.length
  ? meta.keyEndpoints
  : rows.filter((row) => row.kind === 'main').slice(0, MAX_KEY_ENDPOINTS).map((row) => row.name));

function buildMetrics(run) {
  const {meta} = run;
  const thresholds = collectThresholds(run.summary);
  const nfrMs = isNumber(meta.nfrMs) ? meta.nfrMs : nfrFromThresholds(thresholds, meta);
  const {seconds: windowSec, kind: windowKind} = trafficWindow(run);
  const endpoints = endpointNames(run)
    .map((endpoint) => buildEndpointRow(run, endpoint, windowSec, thresholds, nfrMs))
    .filter(Boolean);
  const main = mainTotals(run, endpoints, windowSec);
  const noTraffic = (Boolean(run.summary) || run.seriesRead) && endpoints.length === 0;
  return {
    nfrMs,
    windowSec,
    windowKind,
    endpoints,
    keyEndpoints: keyEndpointNames(meta, endpoints),
    main,
    highlights: buildHighlights(run),
    dropped: counterTotal(run, 'dropped_iterations'),
    events: buildEvents(run),
    verdict: buildVerdict(thresholds, meta),
    server: serverMetrics(run, main.rps),
    noTraffic,
    setupFailure: noTraffic ? run.consoleError : null,
  };
}

function runWindow(run) {
  const start = run.info.startedAt ? Date.parse(run.info.startedAt) / 1000 : null;
  const end = run.info.finishedAt ? Date.parse(run.info.finishedAt) / 1000 : null;
  if (start !== null && end !== null) {
    return {start, end, seconds: end - start};
  }
  const seconds = run.summary && run.summary.durationMs ? run.summary.durationMs / 1000 : (run.traffic ? run.traffic.windowSec : null);
  return {start, end: start !== null && seconds !== null ? start + seconds : null, seconds};
}

module.exports = {
  BUCKET_SECONDS,
  DEFAULT_NFR_MS,
  DASH,
  MINUS,
  loadRun,
  buildMetrics,
  runWindow,
  isNumber,
  trendStats,
  formatNumber,
  formatInt,
  formatRate,
  formatMs,
  formatPercent,
  formatSigned,
  formatClock,
  formatDuration,
  formatUtc,
  formatUtcTime,
  formatBytes,
  escapeHtml,
  describeStatus,
  describeErrorCode,
};
