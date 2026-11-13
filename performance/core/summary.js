import {profileNamed} from './load.js';

const ms = (value) => (value === undefined || value === null || Number.isNaN(value) ? '-' : `${Math.round(value)}`);
const pad = (value, width) => String(value).padStart(width);
const metric = (data, name) => data.metrics[name] || {values: {}, thresholds: {}};

const thresholdResults = (data) => Object.entries(data.metrics).flatMap(([name, value]) => Object.entries(value.thresholds || {})
  .filter(([expression]) => !/count>=0|max>=0/.test(expression))
  .map(([expression, result]) => ({name, expression, ok: result.ok})));

const escapeXml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const junit = (data, meta, environment) => {
  const results = thresholdResults(data);
  const failures = results.filter(result => !result.ok).length;
  const suiteName = `${meta.suite}.${environment.profile}`;
  const cases = results.map(result => {
    const name = escapeXml(`${result.name} ${result.expression}`);
    return result.ok
      ? `    <testcase classname="${escapeXml(suiteName)}" name="${name}"/>`
      : `    <testcase classname="${escapeXml(suiteName)}" name="${name}"><failure message="threshold crossed: ${name}"/></testcase>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n  <testsuite name="${escapeXml(meta.suite)}-performance-${escapeXml(environment.profile)}" tests="${results.length}" failures="${failures}">\n${cases.join('\n')}\n  </testsuite>\n</testsuites>\n`;
};

const highlightLine = (data, highlight, nfrMs) => {
  const values = metric(data, highlight.metric).values;
  if (highlight.kind === 'trend') {
    const limit = highlight.nfr ? `  (NFR p95 < ${nfrMs}ms)` : '';
    const count = highlight.countLabel ? `  ${highlight.countLabel.toLowerCase()} ${values.count || 0}` : '';
    return `${highlight.label}  p50 ${ms(values.med)}ms  p95 ${ms(values['p(95)'])}ms  max ${ms(values.max)}ms${count}${limit}`;
  }
  if (highlight.kind === 'rate-failures') {
    return `${highlight.label}  ${values.passes || 0} of ${(values.passes || 0) + (values.fails || 0)} ${highlight.unit || 'checks'}`;
  }
  return `${highlight.label}  ${values.count || 0}`;
};

const text = (data, meta, environment) => {
  const seconds = data.state.testRunDurationMs / 1000;
  const lines = ['', `${meta.title} performance | profile ${environment.profile} | ${environment.target} | ${Math.round(seconds)}s`, ''];
  lines.push(`${'endpoint'.padEnd(22)}${pad('count', 8)}${pad('req/s', 8)}${pad('avg', 8)}${pad('p50', 8)}${pad('p90', 8)}${pad('p95', 8)}${pad('p99', 8)}${pad('max', 8)}${pad('fail%', 8)}`);
  const rows = meta.endpoints.map(endpoint => [endpoint, `endpoint:${endpoint}`]);
  if (meta.control) {
    rows.push([meta.control.endpoint, 'type:control']);
  }
  for (const [endpoint, selector] of rows) {
    const duration = metric(data, `http_req_duration{${selector}}`).values;
    const count = metric(data, `http_reqs{${selector}}`).values.count || 0;
    const failed = metric(data, `http_req_failed{${selector}}`).values.rate;
    if (count) {
      lines.push(`${endpoint.padEnd(22)}${pad(count, 8)}${pad((count / seconds).toFixed(1), 8)}${pad(ms(duration.avg), 8)}${pad(ms(duration.med), 8)}${pad(ms(duration['p(90)']), 8)}${pad(ms(duration['p(95)']), 8)}${pad(ms(duration['p(99)']), 8)}${pad(ms(duration.max), 8)}${pad(failed === undefined ? '-' : (failed * 100).toFixed(2), 8)}`);
    }
  }
  lines.push('');
  for (const highlight of meta.highlights || []) {
    lines.push(highlightLine(data, highlight, environment.nfrMs));
  }
  lines.push(`Dropped iterations (service could not keep up)  ${metric(data, 'dropped_iterations').values.count || 0}`);
  for (const event of meta.events || []) {
    lines.push(`${event.label}  triggered ${metric(data, `${event.name}_triggered`).values.count || 0}, not available ${metric(data, `${event.name}_unavailable`).values.count || 0}`);
  }
  const traffic = metric(data, `http_reqs{type:${meta.trafficType}}`).values.count || rows.reduce((total, [, selector]) => total + (metric(data, `http_reqs{${selector}}`).values.count || 0), 0);
  if (!traffic) {
    lines.push('', 'NO TEST TRAFFIC RAN: setup did not finish (see the error above), so the threshold results below mean nothing.');
  }
  const results = thresholdResults(data);
  const failed = results.filter(result => !result.ok);
  lines.push('', `Thresholds  ${results.length - failed.length} passed, ${failed.length} failed${failed.length ? ':' : ''}`);
  failed.forEach(result => lines.push(`  FAILED  ${result.name}  ${result.expression}`));
  lines.push('');
  return lines.join('\n');
};

export const summaryOutputs = (data, meta, environment) => ({
  stdout: text(data, meta, environment),
  [`${environment.resultsDir}/summary.json`]: JSON.stringify(Object.assign({}, data, {setup_data: undefined}), null, 2),
  [`${environment.resultsDir}/junit.xml`]: junit(data, meta, environment),
  [`${environment.resultsDir}/suite.json`]: JSON.stringify(Object.assign({}, meta, {
    profile: environment.profile,
    profileDescription: profileNamed(environment.profile).description,
    nfrMs: environment.nfrMs,
  }), null, 2),
});
