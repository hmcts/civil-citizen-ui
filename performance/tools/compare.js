'use strict';

const fs = require('fs');
const path = require('path');
const {
  DASH,
  loadRun,
  buildMetrics,
  runWindow,
  isNumber,
  formatNumber,
  formatInt,
  formatRate,
  formatMs,
  formatPercent,
  formatSigned,
  formatUtc,
  escapeHtml: esc,
} = require('./lib-results.js');
const {pageShell, chip} = require('./report.js');

const SAME_TOLERANCE_PERCENT = 5;
const LOAD_SHIFT_LIMIT = 0.2;
const MAX_HEADLINES = 5;
const MAX_PER_KIND = 2;
const LARGE_INCREASE = 10;
const MIN_DELTA = {ms: 5, percent: 0.0005, rps: 0.1, count: 1, millicores: 5, ratio: 0.05};

const UNIT_FORMATS = {
  ms: formatMs,
  percent: formatPercent,
  rps: (value) => `${formatRate(value)} /s`,
  count: formatInt,
  millicores: (value) => `${formatInt(value)} m`,
  ratio: (value) => formatNumber(value, 2),
};

const percentText = (value) => {
  if (value >= 99.5 && value < 99.995) {
    return formatNumber(value, 2);
  }
  return formatNumber(value, value < 10 ? 1 : 0);
};

const valueOrNull = (value) => (isNumber(value) ? value : null);

const endpointValue = (metrics, name, key) => {
  const row = metrics.endpoints.find((candidate) => candidate.name === name);
  return row ? valueOrNull(row[key]) : null;
};

const failedAtLeast = (metrics, name, share) => {
  const rate = endpointValue(metrics, name, 'errorRate');
  return rate !== null && rate >= share;
};

const unique = (items) => items.filter((item, index) => items.indexOf(item) === index);

const endpointOrder = (before, after) => {
  const entries = [before, after];
  const declared = entries.flatMap((entry) => entry.run.meta.endpoints);
  const measured = entries.flatMap((entry) => entry.metrics.endpoints.filter((row) => row.kind === 'main').map((row) => row.name));
  const controls = entries.map((entry) => (entry.run.meta.control ? entry.run.meta.control.endpoint : null)).filter(Boolean);
  return unique([...declared, ...measured]).concat(unique(controls));
};

const LATENCY_CAVEAT = 'Not compared: in one of the runs at least that share of the endpoint\'s requests failed (half for p50, 95% for p95, 99% for p99), and a request that never connected is recorded as 0 ms.';

const makeRow = (definition) => ({headline: null, caveat: null, alwaysShow: false, ...definition});

const bothPresent = (pair) => isNumber(pair.before) && isNumber(pair.after);

const endpointRows = (name, before, after) => {
  const pair = (key) => ({before: endpointValue(before, name, key), after: endpointValue(after, name, key)});
  const latency = (key, share, headline) => makeRow({
    group: 'Endpoints',
    label: `${name} ${key}`,
    unit: 'ms',
    better: 'lower',
    ...pair(key),
    caveat: bothPresent(pair(key)) && (failedAtLeast(before, name, share) || failedAtLeast(after, name, share)) ? LATENCY_CAVEAT : null,
    headline: headline ? 'latency' : null,
  });
  return [
    latency('p50', 0.5, false),
    latency('p95', 0.95, true),
    latency('p99', 0.99, false),
    makeRow({group: 'Endpoints', label: `${name} error rate`, unit: 'percent', better: 'lower', ...pair('errorRate'), headline: 'errors'}),
  ];
};

const highlightOf = (entry, metric) => entry.metrics.highlights.find((item) => item.metric === metric) || null;

const HIGHLIGHT_ROWS = {
  trend: {
    unit: 'ms',
    label: (highlight) => `${highlight.label} ${highlight.nfr ? 'p95' : 'p50'}`,
    value: (highlight) => (highlight && highlight.data && highlight.data.count ? valueOrNull(highlight.nfr ? highlight.data.p95 : highlight.data.p50) : null),
    headline: (highlight) => (highlight.nfr ? 'latency' : null),
  },
  'rate-failures': {
    unit: 'count',
    label: (highlight) => highlight.label,
    value: (highlight) => (highlight && highlight.data ? highlight.data.wrong : null),
    headline: () => 'integrity',
  },
  count: {
    unit: 'count',
    label: (highlight) => highlight.label,
    value: (highlight) => (highlight && highlight.data ? highlight.data.count : null),
    headline: () => 'integrity',
  },
};

const mixedSemantics = (before, after, metric) => {
  const [a, b] = [before, after].map((entry) => highlightOf(entry, metric));
  const source = [a, b].find((item) => item && item.noteWhenMissing);
  return source && Boolean(a && a.note) !== Boolean(b && b.note) ? source.noteWhenMissing : null;
};

const semanticsCaveat = (otherMetric) => `Not compared: only one of the runs records ${otherMetric}, so the failures counted for this check are not defined the same way in both.`;

const highlightRow = (metric, before, after) => {
  const definition = highlightOf(after, metric) || highlightOf(before, metric);
  const reader = HIGHLIGHT_ROWS[definition.kind];
  const otherMetric = mixedSemantics(before, after, metric);
  return makeRow({
    group: 'Suite metrics',
    label: reader.label(definition),
    unit: reader.unit,
    better: 'lower',
    before: reader.value(highlightOf(before, metric)),
    after: reader.value(highlightOf(after, metric)),
    headline: reader.headline(definition),
    caveat: otherMetric ? semanticsCaveat(otherMetric) : null,
    alwaysShow: true,
  });
};

const highlightRows = (before, after) => unique([before, after].flatMap((entry) => entry.metrics.highlights.map((item) => item.metric)))
  .map((metric) => highlightRow(metric, before, after));

const serverValue = (metrics, key, field) => {
  const entry = metrics.server ? metrics.server[key] : null;
  if (entry === null || entry === undefined) {
    return null;
  }
  return field ? valueOrNull(entry[field]) : valueOrNull(entry);
};

const runRows = (before, after) => {
  const both = (read) => ({before: read(before.metrics), after: read(after.metrics)});
  const level = (group, label, unit, read, headline = null, better = 'lower') => makeRow({group, label, unit, better, ...both(read), headline});
  return [
    level('Throughput', 'Throughput of requests under test', 'rps', (m) => valueOrNull(m.main.rps), 'throughput', 'higher'),
    level('Throughput', 'Dropped iterations', 'count', (m) => valueOrNull(m.dropped), 'dropped'),
    level('Database', 'New DB connections per second, average', 'rps', (m) => serverValue(m, 'newConnections', 'avg')),
    level('Database', 'New DB connections per second, peak', 'rps', (m) => serverValue(m, 'newConnections', 'peak')),
    level('Database', 'New DB connections per request under test', 'ratio', (m) => serverValue(m, 'connectionsPerRequest'), 'connections'),
    level('Database', 'Open DB connections, maximum', 'count', (m) => serverValue(m, 'openConnectionsMax')),
    level('CPU', 'Postgres CPU, average', 'millicores', (m) => serverValue(m, 'dbCpu', 'avg'), 'cpu'),
    level('CPU', 'Postgres CPU, peak', 'millicores', (m) => serverValue(m, 'dbCpu', 'peak')),
    level('CPU', 'Service CPU, average', 'millicores', (m) => serverValue(m, 'serviceCpu', 'avg'), 'cpu'),
    level('CPU', 'Service CPU, peak', 'millicores', (m) => serverValue(m, 'serviceCpu', 'peak')),
  ];
};

const judge = (row) => {
  if (row.caveat || !isNumber(row.before) || !isNumber(row.after)) {
    return 'n/a';
  }
  const delta = row.after - row.before;
  const relative = row.before === 0 ? Infinity : Math.abs(delta / row.before) * 100;
  if (delta === 0 || Math.abs(delta) < MIN_DELTA[row.unit] || relative <= SAME_TOLERANCE_PERCENT) {
    return 'same';
  }
  const improved = row.better === 'lower' ? delta < 0 : delta > 0;
  return improved ? 'better' : 'worse';
};

const formatValue = (row, value) => (isNumber(value) ? UNIT_FORMATS[row.unit](value) : DASH);

const multiplier = (ratio) => `×${formatNumber(ratio, ratio < 100 ? 1 : 0)}`;

const shortChange = (row) => {
  const delta = row.after - row.before;
  if (row.unit === 'percent') {
    return `${formatSigned(delta * 100, percentText)} pp`;
  }
  if (row.before === 0) {
    return formatSigned(delta, UNIT_FORMATS[row.unit]);
  }
  if (row.after / row.before >= LARGE_INCREASE) {
    return multiplier(row.after / row.before);
  }
  return `${formatSigned((delta / row.before) * 100, percentText)}%`;
};

const changeText = (row) => {
  if (row.verdict === 'n/a' || !isNumber(row.before) || !isNumber(row.after)) {
    return DASH;
  }
  const delta = row.after - row.before;
  if (delta === 0) {
    return 'no change';
  }
  if (row.unit === 'percent' || row.before === 0) {
    return shortChange(row);
  }
  return `${formatSigned(delta, UNIT_FORMATS[row.unit])} (${shortChange(row)})`;
};

const finishRow = (row) => {
  const finished = {...row, verdict: judge(row)};
  return {...finished, beforeText: formatValue(row, row.before), afterText: formatValue(row, row.after), changeText: changeText(finished)};
};

const NO_METRICS = {endpoints: [], keyEndpoints: [], main: {rps: null}, highlights: [], dropped: null, events: [], server: null};

const comparable = (entry) => (entry.metrics.noTraffic ? {...entry, metrics: NO_METRICS} : entry);

const buildRows = (first, second) => {
  const [before, after] = [comparable(first), comparable(second)];
  const endpoints = endpointOrder(before, after).flatMap((name) => endpointRows(name, before.metrics, after.metrics));
  return [...endpoints, ...highlightRows(before, after), ...runRows(before, after)]
    .filter((row) => row.alwaysShow || isNumber(row.before) || isNumber(row.after))
    .map(finishRow);
};

const loadShift = (before, after) => {
  const [a, b] = [before.metrics.main.rps, after.metrics.main.rps];
  return isNumber(a) && isNumber(b) && a > 0 ? (b - a) / a : null;
};

const steadyLoad = (before, after) => {
  const shift = loadShift(before, after);
  return shift === null || Math.abs(shift) <= LOAD_SHIFT_LIMIT;
};

const magnitude = (row) => (row.before === 0 ? 1000 : Math.min(1000, Math.abs((row.after - row.before) / row.before) * 100));

const LOAD_SENSITIVE = new Set(['cpu']);

const headlineCandidates = (rows, steady) => rows
  .filter((row) => row.headline && (row.verdict === 'better' || row.verdict === 'worse'))
  .filter((row) => steady || !LOAD_SENSITIVE.has(row.headline));

const pickHeadlines = (rows, steady) => {
  const taken = new Map();
  const ranked = headlineCandidates(rows, steady).sort((a, b) => magnitude(b) - magnitude(a));
  const chosen = [];
  for (const row of ranked) {
    const count = taken.get(row.headline) || 0;
    if (chosen.length < MAX_HEADLINES && count < MAX_PER_KIND) {
      chosen.push(row);
      taken.set(row.headline, count + 1);
    }
  }
  return chosen;
};

const emptyHeadline = (rows) => (rows.some((row) => row.verdict !== 'n/a')
  ? 'No headline metric changed by more than 5%.'
  : 'Nothing could be compared between these runs.');

const headlineText = (row) => `${row.label}: ${row.beforeText} → ${row.afterText} (${shortChange(row)})`;

const verdictTotals = (metrics) => {
  const {verdict} = metrics;
  if (metrics.noTraffic) {
    return {level: 'bad', text: 'No test traffic ran'};
  }
  if (verdict.state === 'unknown') {
    return {level: 'neutral', text: 'No verdict'};
  }
  return verdict.state === 'pass'
    ? {level: 'good', text: `PASS, ${verdict.total} thresholds`}
    : {level: 'bad', text: `FAIL, ${verdict.failed.length} of ${verdict.total} thresholds failed`};
};

const describeRun = (entry) => {
  const {run, metrics} = entry;
  return {
    label: run.info.label || run.name,
    suite: run.meta.suite,
    profile: run.info.profile || DASH,
    started: formatUtc(runWindow(run).start),
    image: run.info.serviceImage || DASH,
    verdict: verdictTotals(metrics),
  };
};

const settingNotices = (before, after) => {
  const [a, b] = [before.run.info.env, after.run.info.env];
  return Object.keys(a)
    .filter((key) => key in b && a[key] !== b[key])
    .map((key) => ({level: 'warn', text: `The setting ${key} differs (${a[key]} before, ${b[key]} after).`}));
};

const differences = (before, after) => {
  const [a, b] = [before.run, after.run];
  const notices = [];
  if (a.meta.suite !== b.meta.suite) {
    notices.push({level: 'warn', text: `The runs are from different suites (${a.meta.suite} before, ${b.meta.suite} after), so their endpoints and traffic are not comparable.`});
  }
  if (a.info.profile !== b.info.profile) {
    notices.push({level: 'warn', text: `The runs used different profiles (${a.info.profile || 'unknown'} before, ${b.info.profile || 'unknown'} after), so they are not like for like.`});
  }
  notices.push(...settingNotices(before, after));
  const shift = loadShift(before, after);
  if (shift !== null && Math.abs(shift) > LOAD_SHIFT_LIMIT) {
    notices.push({level: 'warn', text: `Throughput of requests under test differs by ${formatSigned(shift * 100, percentText)}%, so per-second figures such as CPU and new connections per second are not like for like. New connections per request under test is the fair comparison.`});
  }
  if (a.info.serviceImage && a.info.serviceImage === b.info.serviceImage) {
    notices.push({level: 'neutral', text: 'Both runs used the same service image, so any difference comes from the environment or the load rather than from a new build.'});
  }
  return notices;
};

const missingNotices = (before, after) => [['before', before], ['after', after]].flatMap(([role, entry]) => {
  if (entry.metrics.noTraffic) {
    return [{level: 'warn', text: `The ${role} run recorded no test traffic (setup did not finish), so there is nothing to compare for it.`}];
  }
  return entry.metrics.server ? [] : [{level: 'neutral', text: `The ${role} run has no usable server metrics, so its database and CPU figures are not available.`}];
});

const buildNotices = (before, after) => differences(before, after).concat(missingNotices(before, after));

const caveatNotes = (rows) => unique(rows.map((row) => row.caveat).filter(Boolean));

const markdownOutput = (before, after, rows, notices, headlines) => {
  const describe = (role, entry) => {
    const info = describeRun(entry);
    return `${role}: ${info.label} (${info.profile}, ${info.started}) - ${info.verdict.text}`;
  };
  const warnings = notices.filter((item) => item.level === 'warn').map((notice) => `> Warning: ${notice.text}`);
  const lines = [`### ${after.run.meta.title}: before and after`, '', describe('Before', before), describe('After', after), ''];
  lines.push(...(warnings.length ? [...warnings, ''] : []));
  lines.push('**Headline**', '');
  lines.push(...(headlines.length ? headlines.map((row) => `- ${headlineText(row)}, ${row.verdict}`) : [`- ${emptyHeadline(rows)}`]));
  lines.push('', '| Metric | Before | After | Change | Verdict |', '| --- | ---: | ---: | ---: | --- |');
  lines.push(...rows.map((row) => `| ${row.label}${row.caveat ? ' †' : ''} | ${row.beforeText} | ${row.afterText} | ${row.changeText} | ${row.verdict} |`));
  for (const note of caveatNotes(rows)) {
    lines.push('', `† ${note}`);
  }
  return lines.join('\n');
};

const VERDICT_CHIPS = {
  better: () => chip('good', 'Better'),
  worse: () => chip('bad', 'Worse'),
  same: () => chip('same', 'Same'),
  'n/a': () => '<span class="muted">n/a</span>',
};

const rowHtml = (row) => `<tr><th scope="row">${esc(row.label)}${row.caveat ? ` <span title="${esc(row.caveat)}">†</span>` : ''}</th><td class="num">${esc(row.beforeText)}</td><td class="num">${esc(row.afterText)}</td><td class="num">${esc(row.changeText)}</td><td>${VERDICT_CHIPS[row.verdict]()}</td></tr>`;

const groupedRows = (rows) => {
  const groups = [];
  for (const row of rows) {
    const group = groups.find((candidate) => candidate.name === row.group);
    if (group) {
      group.rows.push(row);
    } else {
      groups.push({name: row.group, rows: [row]});
    }
  }
  return groups;
};

const tableHtml = (rows) => {
  const body = groupedRows(rows).map((group) => `<tbody><tr class="group"><th scope="colgroup" colspan="5">${esc(group.name)}</th></tr>${group.rows.map(rowHtml).join('')}</tbody>`);
  const footnote = caveatNotes(rows).map((note) => `<p class="footnote">† ${esc(note)}</p>`).join('');
  return `<div class="card"><div class="table-wrap"><table class="compare">
<caption>Lower is better for latency, errors, dropped iterations, CPU and connections. Higher is better for throughput. A change of 5% or less counts as the same.</caption>
<thead><tr><th scope="col">Metric</th><th scope="col" class="num">Before</th><th scope="col" class="num">After</th><th scope="col" class="num">Change</th><th scope="col">Verdict</th></tr></thead>
${body.join('\n')}
</table></div>${footnote}</div>`;
};

const headlineHtml = (headlines, rows) => {
  if (!headlines.length) {
    return `<div class="card"><p>${esc(emptyHeadline(rows))}</p></div>`;
  }
  const items = headlines.map((row) => `<li>${VERDICT_CHIPS[row.verdict]()} <span>${esc(headlineText(row))}</span></li>`);
  return `<div class="card"><ul class="headlines">${items.join('')}</ul></div>`;
};

const noticeHtml = (notices) => {
  if (!notices.length) {
    return '';
  }
  const warnings = notices.filter((notice) => notice.level === 'warn');
  const infos = notices.filter((notice) => notice.level !== 'warn');
  const block = (items, cls, title) => (items.length ? `<div class="notice ${cls}" role="note"><strong>${title}</strong><ul>${items.map((item) => `<li>${esc(item.text)}</li>`).join('')}</ul></div>` : '');
  return block(warnings, '', 'Read this before comparing') + block(infos, 'notice--info', 'Also worth knowing');
};

const reportLink = (entry, outFile) => {
  const report = path.join(entry.run.dir, 'report.html');
  return fs.existsSync(report) ? `<p><a href="${esc(encodeURI(path.relative(path.dirname(outFile), report)))}">Open the full report</a></p>` : '';
};

const runCardHtml = (role, entry, outFile) => {
  const info = describeRun(entry);
  return `<article class="card run-card">
<p class="role">${esc(role)}</p>
<h3>${esc(info.label)}</h3>
<p>${chip(info.verdict.level, info.verdict.text)}</p>
<dl><div><dt>Suite</dt><dd>${esc(info.suite)}</dd></div><div><dt>Profile</dt><dd>${esc(info.profile)}</dd></div><div><dt>Started</dt><dd>${esc(info.started)}</dd></div><div><dt>Service image</dt><dd class="mono">${esc(info.image)}</dd></div></dl>
${reportLink(entry, outFile)}
</article>`;
};

const COMPARE_CSS = `
.page > h1 + p { margin-top: 6px; color: var(--muted); font-size: 18px; }
.pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-top: 20px; }
.run-card h3 { margin: 2px 0 10px; }
.run-card .role { margin: 0; color: var(--muted); font-size: 12.5px; font-weight: 650; letter-spacing: 0.06em; text-transform: uppercase; }
.run-card dl { margin: 14px 0 8px; display: grid; gap: 10px; }
.run-card dt { font-size: 12.5px; color: var(--muted); }
.run-card dd { margin: 2px 0 0; font-size: 14px; overflow-wrap: anywhere; }
.notice--info { border-left-color: var(--accent); background: var(--neutral-tint); margin-top: 12px; }
.headlines { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.headlines li { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; font-size: 15px; }
.headlines li > span { font-variant-numeric: tabular-nums; }
table.compare tr.group th { background: var(--neutral-tint); color: var(--muted); font-size: 12.5px; letter-spacing: 0.04em; text-transform: uppercase; }
table.compare tbody + tbody tr.group th { border-top: 2px solid var(--border); }
`;

const renderComparison = (before, after, outFile) => {
  const rows = buildRows(before, after);
  const notices = buildNotices(before, after);
  const headlines = pickHeadlines(rows, steadyLoad(before, after));
  const [first, second] = [describeRun(before), describeRun(after)];
  const title = after.run.meta.title;
  const body = `<h1>${esc(title)}: before and after</h1>
<p>${esc(first.label)} → ${esc(second.label)}</p>
<div class="pair">${runCardHtml('Before', before, outFile)}${runCardHtml('After', after, outFile)}</div>
${noticeHtml(notices)}
<section aria-labelledby="h-headline"><h2 id="h-headline">Headline</h2>${headlineHtml(headlines, rows)}</section>
<section aria-labelledby="h-all"><h2 id="h-all">All measurements</h2>${tableHtml(rows)}</section>
<footer>Generated ${esc(formatUtc(Date.now() / 1000))} by performance/tools/compare.js</footer>`;
  return {
    html: pageShell({title: `${title}: before and after · ${second.label}`, body, css: COMPARE_CSS}),
    markdown: markdownOutput(before, after, rows, notices, headlines),
  };
};

const load = async (dir) => {
  const run = await loadRun(dir);
  return {run, metrics: buildMetrics(run)};
};

async function main(args) {
  if (args.length < 2) {
    console.error('Usage: node performance/tools/compare.js <beforeDir> <afterDir> [outFile]');
    return 2;
  }
  const [before, after] = await Promise.all([load(args[0]), load(args[1])]);
  const outFile = path.resolve(args[2] || path.join(after.run.dir, 'compare.html'));
  const {html, markdown} = renderComparison(before, after, outFile);
  fs.writeFileSync(outFile, html);
  console.log(markdown);
  console.error(`Wrote ${outFile}`);
  return 0;
}

if (require.main === module) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(`compare.js: ${error.message}`);
      process.exitCode = 1;
    },
  );
}
