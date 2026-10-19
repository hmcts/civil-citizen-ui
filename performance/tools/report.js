'use strict';

const fs = require('fs');
const path = require('path');
const {
  BUCKET_SECONDS,
  DASH,
  loadRun,
  buildMetrics,
  runWindow,
  isNumber,
  formatInt,
  formatRate,
  formatMs,
  formatPercent,
  formatClock,
  formatDuration,
  formatUtc,
  formatUtcTime,
  formatBytes,
  escapeHtml: esc,
  describeStatus,
  describeErrorCode,
} = require('./lib-results.js');

const GEOMETRY = {width: 1000, left: 66, right: 22, top: 14, axisBand: 40, bottomPad: 10};
const TIME_STEPS = [5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200];
const STATUS_ICONS = {good: 'i-check', warn: 'i-alert', bad: 'i-cross', neutral: 'i-info', same: 'i-same'};
const NEAR_NFR_SHARE = 0.7;
const HIGH_CHURN_PER_REQUEST = 0.5;
const LOW_CHURN_PER_REQUEST = 0.1;

const ICON_SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<symbol id="i-check" viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-alert" viewBox="0 0 16 16"><path d="M8 2.2l6.4 11.2H1.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 6.4v3.2M8 11.5v.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-cross" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5.7 5.7l4.6 4.6M10.3 5.7l-4.6 4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-info" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 7.3v3.6M8 5v.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-same" viewBox="0 0 16 16"><path d="M3.5 8h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
</svg>`;

const BASE_CSS = `
:root {
  color-scheme: light dark;
  --ink: #0b0c0c;
  --muted: #505a5f;
  --border: #d8dde0;
  --page: #f6f7f8;
  --card: #ffffff;
  --accent: #1d70b8;
  --good: #00703c;
  --warn: #b25e09;
  --bad: #d4351c;
  --on-solid: #ffffff;
  --good-tint: #e6f2ec;
  --warn-tint: #fbf0e1;
  --bad-tint: #fbe9e6;
  --neutral-tint: #eef0f2;
  --grid: #e8ebed;
  --axis: #a9b2b7;
  --s1: #1d70b8;
  --s2: #d4351c;
  --s3: #00703c;
  --s4: #6f72af;
  --s5: #b25e09;
  --shadow: 0 1px 2px rgba(11, 12, 12, 0.06);
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
}
@media (prefers-color-scheme: dark) {
  :root {
    --ink: #e8edf0;
    --muted: #a7b2b8;
    --border: #2d3740;
    --page: #0f1419;
    --card: #171d23;
    --accent: #56a3ef;
    --good: #5bb47c;
    --warn: #de8640;
    --bad: #ff664c;
    --on-solid: #0b0f13;
    --good-tint: rgba(91, 180, 124, 0.14);
    --warn-tint: rgba(222, 134, 64, 0.14);
    --bad-tint: rgba(255, 102, 76, 0.14);
    --neutral-tint: rgba(167, 178, 184, 0.12);
    --grid: #26303a;
    --axis: #4a5660;
    --s1: #56a3ef;
    --s2: #ff664c;
    --s3: #5bb47c;
    --s4: #9295e5;
    --s5: #de8640;
    --shadow: none;
  }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--page); color: var(--ink); font: 15px/1.5 var(--font); }
.page { max-width: 1100px; margin: 0 auto; padding: 32px 16px 64px; }
h1 { font-size: 28px; line-height: 1.2; font-weight: 650; letter-spacing: -0.01em; margin: 0; }
h2 { font-size: 20px; line-height: 1.3; font-weight: 650; margin: 40px 0 12px; }
h3 { font-size: 16px; line-height: 1.3; font-weight: 650; margin: 0; }
p { margin: 0 0 8px; }
ul { margin: 0; padding-left: 20px; }
a { color: var(--accent); text-underline-offset: 2px; }
a:focus-visible, summary:focus-visible, svg:focus-visible, button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow); padding: 20px 24px; }
.muted { color: var(--muted); }
.mono { font-family: var(--mono); font-size: 13px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.icon { width: 16px; height: 16px; flex: none; }
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px 2px 8px; border: 1px solid var(--border); border-radius: 999px; font-size: 12.5px; font-weight: 600; line-height: 1.5; white-space: nowrap; background: var(--neutral-tint); }
.chip--good { border-color: var(--good); background: var(--good-tint); }
.chip--good .icon { color: var(--good); }
.chip--warn { border-color: var(--warn); background: var(--warn-tint); }
.chip--warn .icon { color: var(--warn); }
.chip--bad { border-color: var(--bad); background: var(--bad-tint); }
.chip--bad .icon { color: var(--bad); }
.chip--neutral .icon, .chip--same .icon { color: var(--muted); }
.badge { display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px 4px 10px; border-radius: 4px; font-weight: 700; letter-spacing: 0.05em; color: var(--on-solid); background: var(--muted); }
.badge--good { background: var(--good); }
.badge--bad { background: var(--bad); }
.badge--warn { background: var(--warn); }
.badge .icon { width: 18px; height: 18px; }
.notice { border-left: 4px solid var(--warn); background: var(--warn-tint); border-radius: 6px; padding: 10px 16px; margin: 0 0 16px; font-size: 14px; }
.notice ul { padding-left: 18px; }
.table-wrap { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: 14px; }
caption { text-align: left; color: var(--muted); font-size: 13px; padding-bottom: 10px; }
th, td { padding: 8px 10px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: middle; }
thead th { font-size: 12.5px; font-weight: 600; color: var(--muted); white-space: nowrap; }
tbody th { font-weight: 600; }
th.num, td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
tbody tr:last-child th, tbody tr:last-child td { border-bottom: 0; }
.footnote { color: var(--muted); font-size: 13px; margin: 12px 0 0; }
footer { margin-top: 40px; color: var(--muted); font-size: 13px; }
@media print {
  body { background: #ffffff; }
  .page { max-width: none; padding: 0; }
  .card { box-shadow: none; break-inside: avoid; }
  a { color: inherit; }
}
`;

const pageShell = ({title, body, css = '', script = ''}) => `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(title)}</title>
<style>${BASE_CSS}${css}</style>
</head>
<body>
${ICON_SPRITE}
<main class="page">
${body}
</main>
${script}
</body>
</html>
`;

const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#${STATUS_ICONS[name] || name}"/></svg>`;

const chip = (level, text) => `<span class="chip chip--${level}">${icon(level)}<span>${esc(text)}</span></span>`;

const badge = (level, text) => `<span class="badge badge--${level}">${icon(level)}<span>${esc(text)}</span></span>`;

const roundTo = (value) => Math.round(value * 10) / 10;

const decimalsOf = (step) => [0, 1, 2, 3].find((digits) => Math.abs(step * 10 ** digits - Math.round(step * 10 ** digits)) < 1e-9) ?? 3;

const niceScale = (max) => {
  const safeMax = max > 0 ? max : 1;
  const rough = safeMax / 5;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rough);
  const top = Math.ceil(safeMax / step - 1e-9) * step;
  const ticks = Array.from({length: Math.round(top / step) + 1}, (_, index) => Number((index * step).toFixed(10)));
  return {step, top, ticks, decimals: decimalsOf(step)};
};

const timeTicks = (xMax) => {
  const step = TIME_STEPS.find((candidate) => xMax / candidate <= 10) || TIME_STEPS[TIME_STEPS.length - 1];
  return Array.from({length: Math.floor(xMax / step) + 1}, (_, index) => index * step);
};

const valueFormatters = {
  ms: (value) => formatMs(value),
  rps: (value) => (isNumber(value) ? `${formatRate(value)} /s` : DASH),
  count: (value) => formatInt(value),
  millicores: (value) => (isNumber(value) ? `${formatInt(value)} m` : DASH),
};

const tickLabel = (value, decimals) => (decimals ? value.toFixed(decimals) : formatInt(value));

const linearAxis = (panel) => {
  const refValues = panel.refLines.map((line) => line.value);
  const scale = niceScale(Math.max(maxValue(presentValues(panel.series)), ...refValues) * 1.04);
  return {
    log: false,
    ticks: scale.ticks.map((value) => ({value, label: tickLabel(value, scale.decimals), minor: false})),
    fraction: (value) => value / scale.top,
  };
};

const decadeBelow = (value) => 10 ** Math.floor(Math.log10(value) + 1e-9);

const niceTop = (max) => {
  const magnitude = decadeBelow(max);
  return [1, 2, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= max * 1.02);
};

const logTicks = (low, top) => {
  const ticks = [];
  for (let base = low; base <= top; base *= 10) {
    ticks.push({value: base, label: formatInt(base), minor: false});
    for (const factor of [2, 5]) {
      if (base * factor <= top) {
        ticks.push({value: base * factor, label: base * factor === top ? formatInt(top) : '', minor: true});
      }
    }
  }
  return ticks;
};

const logAxis = (panel) => {
  const values = presentValues(panel.series).filter((value) => value > 0).concat(panel.refLines.map((line) => line.value));
  const low = decadeBelow(values.reduce((best, value) => (value < best ? value : best), Infinity));
  const top = Math.max(niceTop(maxValue(values)), low * 10);
  return {
    log: true,
    ticks: logTicks(low, top),
    fraction: (value) => (Math.log10(Math.max(value, low)) - Math.log10(low)) / Math.log10(top / low),
  };
};

const offersLogScale = (panel) => panel.logChoice && panel.refLines.length > 0
  && maxValue(presentValues(panel.series)) > 3 * panel.refLines[0].value;

const presentValues = (series) => series.flatMap((entry) => entry.values.filter(isNumber));

const maxValue = (values) => values.reduce((best, value) => (value > best ? value : best), 0);

const markerShape = (kind, x, y, className) => {
  const base = `class="mark ${className}"`;
  const [cx, cy] = [roundTo(x), roundTo(y)];
  switch (kind) {
    case 'square':
      return `<rect ${base} x="${roundTo(cx - 4)}" y="${roundTo(cy - 4)}" width="8" height="8" rx="1.5"/>`;
    case 'triangle':
      return `<path ${base} d="M${cx} ${roundTo(cy - 5)}L${roundTo(cx + 5)} ${roundTo(cy + 4)}L${roundTo(cx - 5)} ${roundTo(cy + 4)}Z"/>`;
    case 'hexagon':
      return `<path ${base} d="M${roundTo(cx + 5)} ${cy}L${roundTo(cx + 2.5)} ${roundTo(cy + 4.3)}L${roundTo(cx - 2.5)} ${roundTo(cy + 4.3)}L${roundTo(cx - 5)} ${cy}L${roundTo(cx - 2.5)} ${roundTo(cy - 4.3)}L${roundTo(cx + 2.5)} ${roundTo(cy - 4.3)}Z"/>`;
    case 'diamond':
      return `<path ${base} d="M${cx} ${roundTo(cy - 5.5)}L${roundTo(cx + 5.5)} ${cy}L${cx} ${roundTo(cy + 5.5)}L${roundTo(cx - 5.5)} ${cy}Z"/>`;
    default:
      return `<circle ${base} cx="${cx}" cy="${cy}" r="4"/>`;
  }
};

const linkedFlags = (points, maxGap) => {
  const linkedToPrevious = points.map((point, index) => Boolean(point && points[index - 1] && point.x - points[index - 1].x <= maxGap));
  return points.map((point, index) => Boolean(point) && (linkedToPrevious[index] || Boolean(linkedToPrevious[index + 1])));
};

const pathData = (points, maxGap) => {
  let data = '';
  let previous = null;
  for (const point of points) {
    if (point) {
      const joined = previous && point.x - previous.x <= maxGap;
      data += `${joined ? 'L' : 'M'}${roundTo(point.x)} ${roundTo(point.y)}`;
    }
    previous = point;
  }
  return data;
};

const drawLine = (series, order, chart, scale) => {
  const points = chart.xs.map((x, index) => (scale.valid(series.values[index]) ? {x: scale.x(x), y: scale.y(series.values[index])} : null));
  const maxGap = chart.maxGap ? scale.x(chart.maxGap) - scale.x(0) : Infinity;
  const linked = linkedFlags(points, maxGap);
  const markEvery = Math.max(1, Math.ceil(points.filter(Boolean).length / 10));
  const marks = points
    .map((point, index) => (point && (!linked[index] || (index + order) % markEvery === 0) ? markerShape(series.marker, point.x, point.y, series.cls) : ''))
    .join('');
  return `<path class="line ${series.cls}" d="${pathData(points, maxGap)}"/>${marks}`;
};

const barPath = (x, width, top, bottom) => {
  const radius = Math.min(4, width / 2, bottom - top);
  const [left, right] = [roundTo(x), roundTo(x + width)];
  return `M${left} ${roundTo(bottom)}V${roundTo(top + radius)}Q${left} ${roundTo(top)} ${roundTo(x + radius)} ${roundTo(top)}H${roundTo(x + width - radius)}Q${right} ${roundTo(top)} ${right} ${roundTo(top + radius)}V${roundTo(bottom)}Z`;
};

const drawBars = (series, chart, scale, frame) => chart.xs
  .map((x, index) => {
    const value = series.values[index];
    if (!isNumber(value) || value <= 0) {
      return '';
    }
    const half = (chart.spans ? chart.spans[index] : BUCKET_SECONDS) / 2;
    const slot = scale.x(x + half) - scale.x(x - half);
    const width = Math.max(2, Math.min(24, slot - 2));
    return `<path class="bar ${series.cls}" d="${barPath(scale.x(x) - width / 2, width, scale.y(value), frame.bottom)}"/>`;
  })
  .join('');

const drawBands = (bands, scale, frame) => bands
  .map((band) => {
    const left = scale.x(band.start);
    const right = Math.min(frame.right, Math.max(scale.x(band.end + 1), left + 3));
    return `<rect class="band" x="${roundTo(left)}" y="${frame.top}" width="${roundTo(right - left)}" height="${frame.bottom - frame.top}"/>`;
  })
  .join('');

const drawGrid = (axis, ticks, scale, frame) => {
  const horizontal = axis.ticks.map((tick) => {
    const y = roundTo(scale.y(tick.value));
    const line = tick.value === 0 ? '' : `<line class="grid${tick.minor ? ' grid--minor' : ''}" x1="${frame.left}" x2="${frame.right}" y1="${y}" y2="${y}"/>`;
    const label = tick.label ? `<text class="tick" x="${frame.left - 10}" y="${roundTo(y + 4)}" text-anchor="end">${esc(tick.label)}</text>` : '';
    return line + label;
  });
  const vertical = ticks.filter((tick) => tick > 0).map((tick) => `<line class="grid" x1="${roundTo(scale.x(tick))}" x2="${roundTo(scale.x(tick))}" y1="${frame.top}" y2="${frame.bottom}"/>`);
  return horizontal.concat(vertical).join('');
};

const drawAxisLabels = (ticks, scale, frame) => {
  const labels = ticks.map((tick) => `<text class="tick" x="${roundTo(scale.x(tick))}" y="${frame.bottom + 18}" text-anchor="middle">${formatClock(tick)}</text>`);
  const title = `<text class="tick" x="${roundTo((frame.left + frame.right) / 2)}" y="${frame.bottom + 35}" text-anchor="middle">Elapsed time since the first request under test (mm:ss)</text>`;
  return labels.join('') + title;
};

const drawReferenceLines = (refLines, scale, frame) => refLines
  .map((line) => {
    const y = roundTo(scale.y(line.value));
    const above = y - 7 > frame.top + 8;
    return `<line class="ref" x1="${frame.left}" x2="${frame.right}" y1="${y}" y2="${y}"/><text class="tick halo" x="${frame.right - 4}" y="${above ? y - 7 : y + 16}" text-anchor="end">${esc(line.label)}</text>`;
  })
  .join('');

const drawMarkers = (markers, scale, frame) => markers
  .map((marker) => {
    const x = roundTo(scale.x(marker.at));
    const flip = x > frame.right - 110;
    return `<line class="marker-line" x1="${x}" x2="${x}" y1="${frame.top}" y2="${frame.bottom}"/><text class="tick halo" x="${flip ? x - 6 : x + 6}" y="${frame.top + 13}" text-anchor="${flip ? 'end' : 'start'}">${esc(marker.label)}</text>`;
  })
  .join('');

const panelSvg = (chart, panel, index, overlays, variant = 'linear') => {
  const showAxis = index === chart.panels.length - 1;
  const frame = {left: GEOMETRY.left, right: GEOMETRY.width - GEOMETRY.right, top: GEOMETRY.top, bottom: GEOMETRY.top + panel.height};
  const height = frame.bottom + (showAxis ? GEOMETRY.axisBand : GEOMETRY.bottomPad);
  const axis = variant === 'log' ? logAxis(panel) : linearAxis(panel);
  const scale = {
    x: (seconds) => frame.left + (frame.right - frame.left) * (seconds / chart.xMax),
    y: (value) => frame.bottom - (frame.bottom - frame.top) * axis.fraction(value),
    valid: (value) => isNumber(value) && (!axis.log || value > 0),
  };
  const ticks = timeTicks(chart.xMax);
  const bars = panel.series.filter((series) => series.kind === 'bars').map((series) => drawBars(series, chart, scale, frame));
  const lines = panel.series.map((series, order) => (series.kind === 'bars' ? '' : drawLine(series, order, chart, scale)));
  const titleId = `t-${chart.id}-${index}-${variant}`;
  const descId = `d-${chart.id}-${index}-${variant}`;
  return `<svg class="panel" data-chart="${chart.id}" data-panel="${index}" data-scale="${variant}" data-left="${frame.left}" data-right="${frame.right}" data-xmax="${chart.xMax}" viewBox="0 0 ${GEOMETRY.width} ${height}" role="img" aria-labelledby="${titleId} ${descId}">
<title id="${titleId}">${esc(panel.title || chart.title)}</title>
<desc id="${descId}">${esc(chart.summary)}</desc>
${drawBands(overlays.bands, scale, frame)}${drawGrid(axis, ticks, scale, frame)}<line class="axis" x1="${frame.left}" x2="${frame.right}" y1="${frame.bottom}" y2="${frame.bottom}"/>${showAxis ? drawAxisLabels(ticks, scale, frame) : ''}${drawReferenceLines(panel.refLines, scale, frame)}${drawMarkers(overlays.markers, scale, frame)}${bars.join('')}${lines.join('')}<line class="crosshair" y1="${frame.top}" y2="${frame.bottom}" visibility="hidden"/><rect class="hit" x="${frame.left}" y="${frame.top}" width="${frame.right - frame.left}" height="${frame.bottom - frame.top}"/>
</svg>`;
};

const keyGlyph = (entry) => {
  switch (entry.glyph) {
    case 'bar':
      return `<rect class="bar ${entry.cls}" x="8" y="2" width="14" height="10" rx="2"/>`;
    case 'ref':
      return '<line class="ref" x1="1" x2="29" y1="7" y2="7"/>';
    case 'marker':
      return '<line class="marker-line" x1="1" x2="29" y1="7" y2="7"/>';
    case 'band':
      return '<rect class="band-key" x="4" y="1" width="22" height="12" rx="2"/>';
    default:
      return `<line class="line ${entry.cls}" x1="1" x2="29" y1="7" y2="7"/>${markerShape(entry.marker, 15, 7, entry.cls)}`;
  }
};

const legendHtml = (entries) => (entries.length < 1 ? '' : `<ul class="legend">${entries.map((entry) => `<li><svg class="key" width="30" height="14" viewBox="0 0 30 14" aria-hidden="true">${keyGlyph(entry)}</svg><span>${esc(entry.name)}</span></li>`).join('')}</ul>`);

const seriesLegend = (series) => (series.length < 2 ? [] : series).map((entry) => ({glyph: entry.kind === 'bars' ? 'bar' : 'line', cls: entry.cls, marker: entry.marker, name: entry.name}));

const overlayLegend = (chart, overlays) => {
  const entries = [];
  if (chart.panels.some((panel) => panel.refLines.length)) {
    entries.push({glyph: 'ref', name: chart.panels.flatMap((panel) => panel.refLines)[0].legend});
  }
  for (const marker of overlays.markers) {
    entries.push({glyph: 'marker', name: marker.label});
  }
  if (overlays.bands.length) {
    entries.push({glyph: 'band', name: 'Failed requests in this window'});
  }
  return entries;
};

const timeLabel = (chart, index) => {
  const x = chart.xs[index];
  if (!chart.spans) {
    return formatClock(x);
  }
  const half = chart.spans[index] / 2;
  return `${formatClock(x - half)}–${formatClock(x + half)}`;
};

const tableView = (chart) => {
  const columns = chart.panels.flatMap((panel) => panel.series.map((series) => ({series, format: valueFormatters[series.unit || panel.unit]})));
  const head = columns.map(({series}) => `<th scope="col" class="num">${esc(series.name)}</th>`).join('');
  const rows = chart.xs.map((x, index) => `<tr><th scope="row">${timeLabel(chart, index)}</th>${columns.map(({series, format}) => `<td class="num">${isNumber(series.values[index]) ? esc(format(series.values[index])) : DASH}</td>`).join('')}</tr>`);
  return `<details class="table-view"><summary>View the data as a table</summary><div class="table-wrap"><table><caption>${esc(chart.title)}: ${esc(chart.subtitle)}</caption><thead><tr><th scope="col">Elapsed</th>${head}</tr></thead><tbody>${rows.join('')}</tbody></table></div></details>`;
};

const roundForPayload = (value) => (isNumber(value) ? Math.round(value * 1000) / 1000 : null);

const chartPayload = (chart) => ({
  id: chart.id,
  xs: chart.xs,
  spans: chart.spans || null,
  panels: chart.panels.map((panel) => ({
    series: panel.series.map((series) => ({name: series.name, cls: series.cls, unit: series.unit || panel.unit, values: series.values.map(roundForPayload)})),
  })),
});

const scaleToggle = (chart) => `<div class="chart-tools" data-scale-toggle hidden role="group" aria-label="Vertical scale of the ${esc(chart.title.toLowerCase())} chart"><span class="muted">Vertical scale</span><button type="button" data-scale="linear" aria-pressed="true">Linear</button><button type="button" data-scale="log" aria-pressed="false">Log</button></div>`;

const panelHtml = (chart, panel, index, overlays) => {
  if (!offersLogScale(panel)) {
    return `<div class="chart-scroll">${panelSvg(chart, panel, index, overlays)}</div>`;
  }
  return `${scaleToggle(chart)}<div class="chart-scroll" data-scale="linear">${panelSvg(chart, panel, index, overlays, 'linear')}</div><div class="chart-scroll" data-scale="log" hidden>${panelSvg(chart, panel, index, overlays, 'log')}</div>`;
};

const chartCard = (chart, overlays) => {
  const single = chart.panels.length === 1;
  const topLegend = single
    ? legendHtml(seriesLegend(chart.panels[0].series).concat(overlayLegend(chart, overlays)))
    : legendHtml(overlayLegend(chart, overlays));
  const panels = chart.panels.map((panel, index) => `${panel.title ? `<h4 class="panel-title">${esc(panel.title)}</h4>` : ''}${single ? '' : legendHtml(seriesLegend(panel.series))}${panelHtml(chart, panel, index, overlays)}`);
  return `<article class="card chart" id="chart-${chart.id}" aria-labelledby="heading-${chart.id}">
<header class="chart-head"><h3 id="heading-${chart.id}">${esc(chart.title)}</h3><p class="muted">${esc(chart.subtitle)}</p></header>
${topLegend}
<div class="chart-body" data-chart-body="${chart.id}">${panels.join('')}</div>
<p class="chart-summary">${esc(chart.summary)}</p>
${chart.note ? `<p class="footnote">${esc(chart.note)}</p>` : ''}
${tableView(chart)}
</article>`;
};

const KEY_STYLES = [['s1', 'circle'], ['s5', 'square'], ['s3', 'triangle'], ['sx', 'hexagon']];
const CONTROL_STYLE = ['s4', 'diamond'];

const upperFirst = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const lowerFirst = (value) => (/^[A-Z][a-z]/.test(value) ? value.charAt(0).toLowerCase() + value.slice(1) : value);

const withPeriod = (value) => (/[.!?]$/.test(value) ? value : `${value}.`);

const plural = (count, singular, pluralForm = `${singular}s`) => (count === 1 ? singular : pluralForm);

const databaseLabel = (run) => (run.meta.database ? run.meta.database.label : 'database');

const bucketCentres = (traffic) => traffic.widths.map((width, index) => index * BUCKET_SECONDS + width / 2);

const peakOf = (entries, xs) => {
  let best = null;
  entries.forEach((entry) => entry.values.forEach((value, index) => {
    if (isNumber(value) && (!best || value > best.value)) {
      best = {value, index, name: entry.name};
    }
  }));
  return best ? {...best, at: xs[best.index]} : null;
};

const typicalSamples = (buckets) => {
  const counts = (buckets || []).filter(Boolean).map((bucket) => bucket.samples).sort((a, b) => a - b);
  return counts.length ? counts[Math.floor(counts.length / 2)] : null;
};

const latencySeriesStyles = (run, metrics) => {
  const keyed = metrics.keyEndpoints.slice(0, KEY_STYLES.length).map((name, index) => ({name, cls: KEY_STYLES[index][0], marker: KEY_STYLES[index][1]}));
  const control = run.meta.control ? [{name: run.meta.control.endpoint, cls: CONTROL_STYLE[0], marker: CONTROL_STYLE[1]}] : [];
  return keyed.concat(control);
};

const latencyNote = (typical, droppedKeys) => {
  const parts = [];
  if (typical !== null && typical < 20) {
    parts.push('At this traffic level each bucket holds only a few requests, so its p95 sits close to the slowest request in it.');
  }
  parts.push('Requests that never connected have no latency and are not drawn here.');
  if (droppedKeys) {
    parts.push(`Only the first ${KEY_STYLES.length} key endpoints are drawn.`);
  }
  return parts.join(' ');
};

const latencyChart = (run, metrics) => {
  const {traffic} = run;
  const series = latencySeriesStyles(run, metrics)
    .map(({name, cls, marker}) => ({name, cls, marker, unit: 'ms', values: (traffic.latency[name] || []).map((bucket) => (bucket ? bucket.p95 : null))}))
    .filter((entry) => entry.values.some(isNumber));
  if (!series.length) {
    return null;
  }
  const xs = bucketCentres(traffic);
  const peak = peakOf(series, xs);
  const typical = typicalSamples(traffic.latency[series[0].name]);
  return {
    id: 'latency',
    title: 'Response time',
    subtitle: `p95 of the requests finishing in each ${BUCKET_SECONDS}-second bucket, in milliseconds${series.length === 1 ? ` (${series[0].name})` : ''}`,
    xs,
    spans: traffic.widths,
    xMax: traffic.xMax,
    summary: peak ? `Highest bucket p95: ${peak.name} at ${formatMs(peak.value)}, ${timeLabel({xs, spans: traffic.widths}, peak.index)} into the run.` : 'No latency samples.',
    note: latencyNote(typical, metrics.keyEndpoints.length > KEY_STYLES.length),
    panels: [{unit: 'ms', height: 250, logChoice: true, series, refLines: [{value: metrics.nfrMs, label: `NFR ${formatInt(metrics.nfrMs)} ms`, legend: `NFR limit (${formatInt(metrics.nfrMs)} ms)`}]}],
  };
};

const throughputSeries = (run) => {
  const {traffic, meta} = run;
  return [
    {name: 'Requests under test', cls: 's1', marker: 'circle', unit: 'rps', values: traffic.rates.main},
    ...(meta.control ? [{name: 'Control requests', cls: 's4', marker: 'diamond', unit: 'rps', values: traffic.rates.control}] : []),
    {name: 'Failed requests', cls: 's2', kind: 'bars', unit: 'rps', values: traffic.rates.failed},
  ];
};

const weightedTotal = (rates, widths) => rates.reduce((sum, rate, index) => sum + rate * widths[index], 0);

const throughputChart = (run) => {
  const {traffic, meta} = run;
  const series = throughputSeries(run);
  const xs = bucketCentres(traffic);
  const failedPeak = peakOf([series[series.length - 1]], xs);
  const failedTotal = weightedTotal(traffic.rates.failed, traffic.widths);
  const split = meta.control ? ` (${formatInt(traffic.failures.main.total)} under test, ${formatInt(traffic.failures.control.failed)} control)` : '';
  const failedCount = Math.round(failedTotal);
  const failedText = failedPeak && failedPeak.value > 0
    ? `${formatInt(failedCount)} ${plural(failedCount, 'request')} failed${split}, at most ${formatRate(failedPeak.value)} per second around ${formatClock(failedPeak.at)}.`
    : 'No request failed.';
  const average = weightedTotal(traffic.rates.main, traffic.widths) / traffic.windowSec;
  return {
    id: 'throughput',
    title: 'Throughput and failures',
    subtitle: `Requests per second in each ${BUCKET_SECONDS}-second bucket`,
    xs,
    spans: traffic.widths,
    xMax: traffic.xMax,
    summary: `Requests under test averaged ${formatRate(average)} per second. ${failedText}`,
    note: failedTotal > 0
      ? `Failed requests (red columns) are counted when they finish, so a request that times out is drawn at the moment it gave up.${meta.control ? ' They include the control endpoint.' : ''}`
      : '',
    panels: [{unit: 'rps', height: 210, series, refLines: []}],
  };
};

const serverXs = (server) => server.points.map((point) => point.x);

const sampleGap = (xs) => {
  const gaps = xs.slice(1).map((x, index) => x - xs[index]).sort((a, b) => a - b);
  return gaps.length ? gaps[Math.floor(gaps.length / 2)] * 3 : 0;
};

const peakPoint = (points, key) => points.reduce((best, point) => (isNumber(point[key]) && (!best || point[key] > best[key]) ? point : best), null);

const insideWindow = (windows, x) => windows.some((window) => x >= window.start - BUCKET_SECONDS && x <= window.end + 1 + BUCKET_SECONDS);

const openConnectionsSentence = (run) => {
  const {stats, points} = run.server;
  if (stats.openConnectionsMax === null) {
    return '';
  }
  const peak = peakPoint(points, 'openConnections');
  const failures = run.traffic ? run.traffic.failures.windows : [];
  const everywhere = stats.allOpenConnectionsMax !== null ? ` (${formatInt(stats.allOpenConnectionsMax)} across all databases)` : '';
  const overlap = peak && stats.openConnectionsMax > 0 && insideWindow(failures, peak.x) ? ', inside the window in which requests failed' : '';
  const when = peak && stats.openConnectionsMax > 0 ? `, sampled at ${formatClock(peak.x)}` : '';
  return `Open connections peaked at ${formatInt(stats.openConnectionsMax)} in the ${databaseLabel(run)}${everywhere}${when}${overlap}.`;
};

const connectionsChart = (run) => {
  const {server, timeline} = run;
  const label = databaseLabel(run);
  const xs = serverXs(server);
  const column = (key) => server.points.map((point) => point[key]);
  const created = {name: 'New connections per second', cls: 's5', marker: 'circle', unit: 'rps', values: column('newConnections')};
  const open = {name: `Open connections, ${label}`, cls: 's5', marker: 'circle', unit: 'count', values: column('openConnections')};
  const all = {name: 'Open connections, all databases', cls: 'sx', marker: 'square', unit: 'count', values: column('allOpenConnections')};
  const activity = {name: 'Transactions per second', cls: 's5', marker: 'circle', unit: 'rps', values: column('transactions')};
  const stats = server.stats;
  const parts = [];
  if (stats.newConnections) {
    parts.push(`New connections averaged ${formatRate(stats.newConnections.avg)} per second and peaked at ${formatRate(stats.newConnections.peak)}.`);
  }
  parts.push(openConnectionsSentence(run));
  if (stats.transactions) {
    parts.push(`Transactions averaged ${formatRate(stats.transactions.avg)} per second.`);
  }
  return {
    id: 'connections',
    title: `${upperFirst(label)} connections`,
    subtitle: 'Sampled from Postgres about every 5 seconds',
    xs,
    spans: null,
    xMax: timeline.xMax,
    maxGap: sampleGap(xs),
    summary: parts.filter(Boolean).join(' ') || 'No connection samples.',
    note: 'New connections per second is the rise in Postgres session count between two samples. With a working connection pool it stays low and flat while the transaction rate still follows the load.',
    panels: [
      {title: 'New connections per second', unit: 'rps', height: 135, series: [created], refLines: []},
      {title: 'Open connections', unit: 'count', height: 135, series: [open, all], refLines: []},
      ...(stats.transactions ? [{title: 'Transactions per second', unit: 'rps', height: 135, series: [activity], refLines: []}] : []),
    ],
  };
};

const cpuChart = (run) => {
  const {server, timeline, meta} = run;
  const xs = serverXs(server);
  const column = (key) => server.points.map((point) => point[key]);
  const service = {name: `${meta.service || 'Service'} pod`, cls: 's1', marker: 'circle', unit: 'millicores', values: column('serviceCpu')};
  const database = {name: 'Postgres pod', cls: 's5', marker: 'square', unit: 'millicores', values: column('dbCpu')};
  const stats = server.stats;
  const describe = (label, summary) => (summary ? `${label} averaged ${formatInt(summary.avg)} m and peaked at ${formatInt(summary.peak)} m.` : '');
  return {
    id: 'cpu',
    title: 'CPU',
    subtitle: 'Millicores used by each pod (1000 m is one full core)',
    xs,
    spans: null,
    xMax: timeline.xMax,
    maxGap: sampleGap(xs),
    summary: [describe('The service pod', stats.serviceCpu), describe('The Postgres pod', stats.dbCpu)].filter(Boolean).join(' ') || 'No CPU samples.',
    note: 'Pod CPU comes from the cluster metrics server, which refreshes more slowly than the 5-second sampling, so these lines move in steps.',
    panels: [{unit: 'millicores', height: 210, series: [service, database], refLines: []}],
  };
};

const overlaysFor = (run) => {
  const {traffic} = run;
  const happened = (event) => event.status >= 200 && event.status < 300 && event.elapsed >= 0 && event.elapsed <= traffic.xMax;
  const markers = traffic ? traffic.events.filter(happened).map((event) => ({at: event.elapsed, label: event.label})) : [];
  return {markers, bands: traffic ? traffic.failures.windows : []};
};

const chartNote = (content) => `<article class="card"><p class="muted">${esc(content)}</p></article>`;

const serverNote = (run) => (run.serverCollected
  ? 'Server metrics were collected but hold too few samples inside the traffic window to chart.'
  : 'Database connection and CPU charts: not collected for this environment. Server metrics are only gathered for preview runs started with cluster access.');

const timelineIntro = (overlays) => {
  const parts = [
    'Every chart below shares one time axis, starting at the first request under test, so the same moment lines up vertically.',
    'Hover over a chart, or focus it and use the arrow keys, to read the values at that moment on every chart.',
  ];
  if (overlays.bands.length) {
    parts.push('Red shading marks the windows in which requests failed.');
  }
  return parts.join(' ');
};

const timelineSection = (run, metrics) => {
  const overlays = overlaysFor(run);
  const requestCharts = run.traffic ? [latencyChart(run, metrics), throughputChart(run)].filter(Boolean) : [];
  const serverCharts = run.server ? [connectionsChart(run), cpuChart(run)] : [];
  const cards = [
    ...(run.traffic ? requestCharts.map((chart) => chartCard(chart, overlays)) : [chartNote('Response time and throughput charts are not available because timeseries.csv.gz is missing or has no request rows.')]),
    ...(run.server ? serverCharts.map((chart) => chartCard(chart, overlays)) : [chartNote(serverNote(run))]),
  ];
  const charts = requestCharts.concat(serverCharts);
  return {
    html: `<section aria-labelledby="h-timeline">
<h2 id="h-timeline">Timeline</h2>
${charts.length ? `<p class="muted">${esc(timelineIntro(overlays))}</p>` : ''}
${cards.join('\n')}
</section>`,
    payload: JSON.stringify(charts.map(chartPayload)).replace(/</g, '\\u003c'),
  };
};

const statusLevel = (level, label) => ({level, label});

const latencyStatus = (value, nfrMs) => {
  if (value > nfrMs) {
    return statusLevel('bad', 'Above NFR');
  }
  return value > nfrMs * NEAR_NFR_SHARE ? statusLevel('warn', 'Close to NFR') : statusLevel('good', 'Within NFR');
};

const endpointOf = (metrics, name) => metrics.endpoints.find((row) => row.name === name);

const requestsTile = (metrics) => (metrics.main.requests > 0
  ? {label: 'Requests under test', value: formatInt(metrics.main.requests), unit: '', detail: `Over ${formatDuration(metrics.windowSec)} of ${metrics.windowKind === 'traffic' ? 'traffic' : 'k6 run time'}`, status: null}
  : null);

const throughputTile = (metrics) => (isNumber(metrics.main.rps) && metrics.main.requests > 0
  ? {label: 'Throughput', value: formatRate(metrics.main.rps), unit: 'req/s', detail: 'Requests under test per second', status: null}
  : null);

const errorTile = (metrics) => {
  const {main} = metrics;
  if (!isNumber(main.errorRate)) {
    return null;
  }
  return {
    label: 'Error rate',
    value: formatPercent(main.errorRate),
    unit: '',
    detail: `${formatInt(main.failed)} of ${formatInt(main.requests)} requests under test failed`,
    status: main.errorRate > 0.001 ? statusLevel('bad', 'Above 0.1% limit') : statusLevel('good', 'Within 0.1% limit'),
  };
};

const latencyTile = (metrics, name) => {
  const row = endpointOf(metrics, name);
  if (!row || !isNumber(row.p95) || row.errorRate === 1) {
    return null;
  }
  return {label: `${name} p95`, value: formatInt(row.p95), unit: 'ms', detail: `NFR is ${formatInt(metrics.nfrMs)} ms`, status: latencyStatus(row.p95, metrics.nfrMs)};
};

const countedTrendTile = (highlight, data) => {
  const word = highlight.countLabel.toLowerCase();
  if (!data.count) {
    return {label: highlight.label, value: '0', unit: word, detail: 'None finished', status: statusLevel('warn', `None ${word}`)};
  }
  return {label: highlight.label, value: formatInt(data.count), unit: word, detail: `p50 ${formatMs(data.p50)}, p95 ${formatMs(data.p95)}`, status: null};
};

const trendTile = (highlight, metrics) => {
  const {data} = highlight;
  if (!data) {
    return null;
  }
  if (highlight.countLabel) {
    return countedTrendTile(highlight, data);
  }
  if (!data.count) {
    return null;
  }
  return {
    label: `${highlight.label} p95`,
    value: formatInt(data.p95),
    unit: 'ms',
    detail: highlight.nfr ? `NFR is ${formatInt(metrics.nfrMs)} ms` : `p50 ${formatMs(data.p50)}, max ${formatMs(data.max)}`,
    status: highlight.nfr ? latencyStatus(data.p95, metrics.nfrMs) : null,
  };
};

const failuresTile = (highlight) => {
  const {data} = highlight;
  if (!data) {
    return null;
  }
  const unit = highlight.unit || 'checks';
  if (!data.total) {
    return {label: highlight.label, value: DASH, unit: '', detail: `No ${unit} completed to compare`, status: statusLevel('neutral', 'Not measured')};
  }
  return {
    label: highlight.label,
    value: formatInt(data.wrong),
    unit: plural(data.wrong, 'failure'),
    detail: `in ${formatInt(data.total)} ${unit}${highlight.note ? `. ${highlight.note}` : ''}`,
    status: data.wrong ? statusLevel('bad', 'Failures found') : statusLevel('good', 'No failures'),
  };
};

const countTile = (highlight) => {
  const {data} = highlight;
  if (!data) {
    return null;
  }
  return {
    label: highlight.label,
    value: formatInt(data.count),
    unit: '',
    detail: 'Counted separately from the other checks',
    status: data.count ? statusLevel('bad', 'Above zero') : statusLevel('good', 'Zero'),
  };
};

const HIGHLIGHT_TILES = {trend: trendTile, 'rate-failures': failuresTile, count: countTile};

const droppedTile = (metrics) => {
  if (metrics.dropped === null) {
    return null;
  }
  return {
    label: 'Dropped iterations',
    value: formatInt(metrics.dropped),
    unit: '',
    detail: 'Arrivals the load generator could not start',
    status: metrics.dropped ? statusLevel('bad', 'Service could not keep up') : statusLevel('good', 'None dropped'),
  };
};

const churnStatus = (perRequest) => {
  if (!isNumber(perRequest)) {
    return null;
  }
  if (perRequest >= HIGH_CHURN_PER_REQUEST) {
    return statusLevel('warn', 'High connection churn');
  }
  return perRequest <= LOW_CHURN_PER_REQUEST ? statusLevel('good', 'Low connection churn') : null;
};

const connectionsTile = (run, metrics) => {
  const server = metrics.server;
  if (!server || !server.newConnections) {
    return null;
  }
  const perRequest = isNumber(server.connectionsPerRequest) ? `, about ${formatRate(server.connectionsPerRequest)} per request under test` : '';
  return {
    label: `New ${databaseLabel(run)} connections`,
    value: formatRate(server.newConnections.avg),
    unit: '/s average',
    detail: `Peak ${formatRate(server.newConnections.peak)} /s${perRequest}`,
    status: churnStatus(server.connectionsPerRequest),
  };
};

const openConnectionsTile = (run, metrics) => {
  const server = metrics.server;
  if (!server || server.openConnectionsMax === null) {
    return null;
  }
  const everywhere = server.allOpenConnectionsMax !== null ? `${formatInt(server.allOpenConnectionsMax)} across all databases` : 'This database only';
  return {label: 'Peak open connections', value: formatInt(server.openConnectionsMax), unit: '', detail: `In the ${databaseLabel(run)}. ${everywhere}`, status: null};
};

const cpuTile = (label, summary) => (summary
  ? {label, value: formatInt(summary.avg), unit: 'm average', detail: `Peak ${formatInt(summary.peak)} m`, status: null}
  : null);

const kpiTiles = (run, metrics) => [
  requestsTile(metrics),
  throughputTile(metrics),
  errorTile(metrics),
  ...metrics.keyEndpoints.map((name) => latencyTile(metrics, name)),
  ...metrics.highlights.map((highlight) => HIGHLIGHT_TILES[highlight.kind](highlight, metrics)),
  droppedTile(metrics),
  connectionsTile(run, metrics),
  openConnectionsTile(run, metrics),
  cpuTile('Postgres CPU', metrics.server && metrics.server.dbCpu),
  cpuTile('Service CPU', metrics.server && metrics.server.serviceCpu),
].filter(Boolean);

const tileHtml = (tile) => `<li class="tile tile--${tile.status ? tile.status.level : 'plain'}">
<p class="tile-label">${esc(tile.label)}</p>
<p class="tile-value">${esc(tile.value)}${tile.unit ? `<span class="unit"> ${esc(tile.unit)}</span>` : ''}</p>
<p class="tile-detail">${esc(tile.detail)}</p>
${tile.status ? `<p class="tile-status">${chip(tile.status.level, tile.status.label)}</p>` : ''}
</li>`;

const kpiSection = (run, metrics) => {
  const tiles = kpiTiles(run, metrics);
  if (!tiles.length) {
    return '';
  }
  return `<section aria-labelledby="h-key"><h2 id="h-key">Key results</h2><ul class="tiles">${tiles.map(tileHtml).join('')}</ul></section>`;
};

const nfrPill = (state) => {
  const pills = {pass: chip('good', 'Within NFR'), fail: chip('bad', 'Above NFR'), failed: chip('neutral', 'All failed')};
  return pills[state] || '';
};

const rateCell = (value) => (isNumber(value) && value > 0 && value < 0.05 ? '&lt;0.1' : formatRate(value));

const errorCell = (rate) => {
  if (!isNumber(rate)) {
    return `<td class="num">${DASH}</td>`;
  }
  return `<td class="num${rate > 0.001 ? ' is-bad' : ''}">${formatPercent(rate)}</td>`;
};

const endpointRowHtml = (row) => `<tr${row.kind === 'control' ? ' class="row-control"' : ''}>
<th scope="row">${esc(row.name)}${row.kind === 'control' ? ' <span class="muted">(control)</span>' : ''}</th>
<td class="num">${formatInt(row.count)}</td><td class="num">${rateCell(row.rps)}</td>
<td class="num">${formatInt(row.avg)}</td><td class="num">${formatInt(row.p50)}</td><td class="num">${formatInt(row.p90)}</td><td class="num">${formatInt(row.p95)}</td><td class="num">${formatInt(row.p99)}</td><td class="num">${formatInt(row.max)}</td>
${errorCell(row.errorRate)}
<td>${nfrPill(row.nfr)}</td>
</tr>`;

const endpointSection = (run, metrics) => {
  if (!metrics.endpoints.length) {
    return '';
  }
  const missing = run.meta.endpoints.filter((name) => !endpointOf(metrics, name));
  const windowName = metrics.windowKind === 'traffic' ? 'traffic window' : 'k6 run time, setup and teardown included';
  const rateNote = isNumber(metrics.windowSec) ? ` Rates use the ${formatDuration(metrics.windowSec)} ${windowName}.` : '';
  const anyErrors = metrics.endpoints.some((row) => row.errorRate > 0);
  const notes = [];
  if (missing.length && missing.length < run.meta.endpoints.length) {
    notes.push(`No requests reached ${missing.join(', ')}.`);
  }
  if (anyErrors) {
    notes.push('Latency figures come from k6 and include failed requests. A request that never connected is recorded as 0 ms, so when many requests fail the median and average can look better than they were.');
  }
  return `<section aria-labelledby="h-endpoints"><h2 id="h-endpoints">Endpoints</h2>
<div class="card"><div class="table-wrap"><table>
<caption>Response times in milliseconds.${esc(rateNote)} The NFR is p95 under ${formatInt(metrics.nfrMs)} ms.</caption>
<thead><tr><th scope="col">Endpoint</th><th scope="col" class="num">Count</th><th scope="col" class="num">Req/s</th><th scope="col" class="num">Avg</th><th scope="col" class="num">p50</th><th scope="col" class="num">p90</th><th scope="col" class="num">p95</th><th scope="col" class="num">p99</th><th scope="col" class="num">Max</th><th scope="col" class="num">Error %</th><th scope="col">NFR status</th></tr></thead>
<tbody>${metrics.endpoints.map(endpointRowHtml).join('')}</tbody>
</table></div>${notes.map((note) => `<p class="footnote">${esc(note)}</p>`).join('')}</div></section>`;
};

const spanText = (span) => (span.start === span.end ? formatClock(span.start) : `${formatClock(span.start)}–${formatClock(span.end)}`);

const windowsText = (windows, limit = 3) => {
  const shown = windows.slice(0, limit).map(spanText).join(', ');
  return windows.length > limit ? `${shown} and ${windows.length - limit} more` : shown;
};

const controlSentence = (run, control) => {
  if (!run.meta.control || !control.total) {
    return '';
  }
  const described = run.meta.control.description ? `, which is ${run.meta.control.description},` : '';
  if (!control.failed) {
    return `The control endpoint${described} did not fail once in ${formatInt(control.total)} requests. The failures are specific to the requests under test, so look at what they do that the control does not, rather than at the network.`;
  }
  return `The control endpoint${described} also failed ${formatInt(control.failed)} of ${formatInt(control.total)} times. The problem is not limited to the requests under test: check the network path and the service itself.`;
};

const failureRowHtml = (group) => `<tr><th scope="row">${esc(group.endpoint)}</th><td>${esc(describeStatus(group.status))}</td><td>${esc(describeErrorCode(group.errorCode))}</td><td class="num">${formatInt(group.count)}</td><td>${esc(windowsText(group.windows))}</td></tr>`;

const failuresSection = (run, metrics) => {
  const {traffic} = run;
  if (!traffic) {
    return '';
  }
  const {main, control} = traffic.failures;
  const header = '<h2 id="h-failures">Failed requests</h2>';
  if (!main.total) {
    const extra = control.failed ? ` ${controlSentence(run, control)}` : '';
    return `<section aria-labelledby="h-failures">${header}<div class="card"><p>${chip('good', 'No failures')} No request under test failed in this run.${esc(extra)}</p></div></section>`;
  }
  const rate = isNumber(metrics.main.errorRate) ? ` (${formatPercent(metrics.main.errorRate)} of requests under test)` : '';
  const windows = main.windows.length === 1 ? `one window (${windowsText(main.windows)}` : `${main.windows.length} windows (${windowsText(main.windows, 4)}`;
  return `<section aria-labelledby="h-failures">${header}<div class="card">
<p>${formatInt(main.total)} ${plural(main.total, 'request')} under test failed${esc(rate)}, in ${esc(windows)} into the traffic).</p>
<div class="table-wrap"><table>
<caption>Failed requests under test, grouped by endpoint, HTTP status and k6 error code. Times are elapsed mm:ss.</caption>
<thead><tr><th scope="col">Endpoint</th><th scope="col">HTTP status</th><th scope="col">k6 error code</th><th scope="col" class="num">Failed</th><th scope="col">When</th></tr></thead>
<tbody>${main.groups.map(failureRowHtml).join('')}</tbody>
</table></div>
${controlSentence(run, control) ? `<p class="footnote">${esc(controlSentence(run, control))}</p>` : ''}
</div></section>`;
};

const eventWhen = (event) => (event.request ? `${formatClock(event.request.elapsed)} into the traffic (${formatUtcTime(event.request.time)})` : '');

const unavailableReason = (event) => {
  const {request} = event;
  if (!request) {
    return `${event.label} could not be triggered on this environment.`;
  }
  if (request.status === 404) {
    return `${event.label} is not available on this environment (${event.endpoint} returned 404).`;
  }
  if (!request.status) {
    return `${event.label} could not be triggered: the request to ${event.endpoint} failed (${describeErrorCode(request.errorCode)}), so it never ran.`;
  }
  return `${event.label} could not be triggered (${event.endpoint} returned HTTP ${request.status}).`;
};

const unavailableText = (event) => (event.request ? `${unavailableReason(event)} Tried ${eventWhen(event)}.` : unavailableReason(event));

const eventState = (event) => {
  if (event.triggered) {
    return {level: 'good', label: 'Triggered', text: `${event.label} was triggered${event.request ? ` ${eventWhen(event)}` : ''}.`};
  }
  if (event.unavailable) {
    return {level: 'warn', label: 'Not available', text: unavailableText(event)};
  }
  return {level: 'neutral', label: 'No result', text: `No result was recorded for ${event.label}.`};
};

const eventsSection = (metrics) => {
  if (!metrics.events.length) {
    return '';
  }
  const heading = metrics.events.length === 1 ? metrics.events[0].label : 'Events';
  const rows = metrics.events.map((event) => {
    const state = eventState(event);
    return `<p>${chip(state.level, state.label)} ${esc(state.text)}</p>`;
  });
  return `<section aria-labelledby="h-events"><h2 id="h-events">${esc(heading)}</h2><div class="card">${rows.join('')}</div></section>`;
};

const resultValue = (value) => (/^\d+$/.test(value) ? formatInt(Number(value)) : value);

const suiteChecksSection = (run) => {
  if (!run.suiteResults.length) {
    return '';
  }
  const facts = run.suiteResults.map((item) => `<div class="fact"><dt>${esc(item.label)}</dt><dd>${esc(resultValue(item.value))}</dd></div>`);
  return `<section aria-labelledby="h-checks"><h2 id="h-checks">Suite checks</h2><div class="card"><dl class="checks">${facts.join('')}</dl></div></section>`;
};

const perSecondText = (value) => (isNumber(value) ? `${String(Number(value.toFixed(2)))} per second` : '');

const trafficItem = (item) => {
  const rate = perSecondText(item.perSecondAt1x);
  const description = item.description ? `: ${item.description}` : '';
  return `<li>${rate ? `<strong>${esc(rate)}</strong> ` : ''}${esc(item.name)}${esc(description)}</li>`;
};

const trafficBlock = (meta) => {
  if (!meta.traffic.length) {
    return '';
  }
  const source = meta.nfrSource ? ` (${esc(meta.nfrSource)})` : '';
  return `<p>Traffic at 1x is the load the NFR describes${source}:</p><ul class="traffic">${meta.traffic.map(trafficItem).join('')}</ul>`;
};

const SMOKE_REMINDER = 'It only checks that everything works end to end, not how much load the service can take.';

const profileParagraph = (run) => {
  const {profile} = run.info;
  const description = run.meta.profileDescription;
  if (!profile) {
    return '';
  }
  const sentence = description ? `This run used the ${profile} profile: ${withPeriod(lowerFirst(description))}` : `This run used the ${profile} profile.`;
  return `<p>${esc(profile === 'smoke' ? `${sentence} ${SMOKE_REMINDER}` : sentence)}</p>`;
};

const controlParagraph = (meta) => {
  if (!meta.control) {
    return '';
  }
  const description = meta.control.description ? ` is ${meta.control.description}` : ' is a call outside the requests under test';
  return `<p>The control endpoint, ${esc(meta.control.endpoint)},${esc(description)}. It shares the network path and the service with the requests under test, so if it stays fast while they slow down, the cause is in what only they do.</p>`;
};

const environmentParagraph = (meta) => (meta.database
  ? '<p>Preview environments run their own copy of the service and its database inside the cluster, with fewer resources than perftest or production. Those use Azure Postgres Flexible Server, so numbers from a preview describe how the service behaves, not what those environments will deliver.</p>'
  : '<p>Preview environments run inside the cluster with fewer resources than perftest or production, so numbers from a preview describe how the service behaves, not what those environments will deliver.</p>');

const howSection = (run) => `<section aria-labelledby="h-how"><h2 id="h-how">How this run works</h2>
<div class="card prose">
<p>The test uses an open workload model. k6 starts requests at a fixed arrival rate whether or not earlier ones have finished, so a slow service shows up as higher latency and dropped iterations rather than as fewer requests being sent.</p>
${trafficBlock(run.meta)}
${profileParagraph(run)}
${controlParagraph(run.meta)}
${environmentParagraph(run.meta)}
</div></section>`;

const filesSection = (run) => `<section aria-labelledby="h-files"><h2 id="h-files">Raw files</h2>
<div class="card"><ul class="files">${run.files.map((file) => (file.bytes === null
    ? `<li class="muted">${esc(file.name)} <span>(not present in this run)</span></li>`
    : `<li><a href="${esc(encodeURI(file.name))}">${esc(file.name)}</a> <span class="muted">${esc(file.description)}, ${formatBytes(file.bytes)}</span></li>`)).join('')}</ul></div></section>`;

const formatWindowRange = (window) => {
  if (window.start === null) {
    return null;
  }
  const start = formatUtc(window.start).replace(' UTC', '');
  const sameDay = window.end !== null && start.slice(0, 10) === formatUtc(window.end).slice(0, 10);
  const end = window.end === null ? '' : ` – ${sameDay ? formatUtcTime(window.end).replace(' UTC', '') : formatUtc(window.end).replace(' UTC', '')}`;
  const duration = isNumber(window.seconds) ? ` (${formatDuration(window.seconds)})` : '';
  return `${start}${end} UTC${duration}`;
};

const factHtml = (label, value, {mono = false, size = ''} = {}) => (value
  ? `<div class="fact${size ? ` fact--${size}` : ''}"><dt>${esc(label)}</dt><dd${mono ? ' class="mono"' : ''}>${esc(value)}</dd></div>`
  : '');

const jumpLinks = (html) => {
  const headings = [...html.matchAll(/<h2 id="(h-[a-z]+)">([^<]*)<\/h2>/g)].map((match) => [match[1], match[2]]);
  return `<nav class="jump" aria-label="Sections"><ul>${headings.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join('')}</ul></nav>`;
};

const mastheadSection = (run) => {
  const {info, meta} = run;
  const environment = [info.environment, info.pr ? `PR ${info.pr}` : ''].filter(Boolean).join(' · ');
  return `<header class="masthead">
<h1>${esc(meta.title)} · performance report</h1>
<p class="run-title">${esc(info.label || run.name)}</p>
<dl class="card facts">
${factHtml('Suite', meta.suite)}${factHtml('Profile', info.profile)}${factHtml('Environment', environment)}${factHtml('Window (UTC)', formatWindowRange(runWindow(run)), {size: 'wide'})}${factHtml('Target', info.target, {mono: true, size: 'wide'})}${factHtml('Service image', info.serviceImage, {mono: true, size: 'full'})}
</dl>
</header>`;
};

const notesBlock = (run) => (run.notes.length ? `<div class="notice" role="note"><strong>About this report</strong><ul>${run.notes.map((note) => `<li>${esc(note)}</li>`).join('')}</ul></div>` : '');

const noTrafficSection = (run, metrics) => {
  const exit = run.info.k6ExitCode;
  const tagged = run.meta.trafficType ? ` tagged type "${run.meta.trafficType}"` : '';
  const cause = metrics.setupFailure ? `<p>k6 reported: ${esc(metrics.setupFailure)}</p>` : '';
  const thresholds = metrics.verdict.total
    ? `<p class="muted">${metrics.verdict.passed} of ${metrics.verdict.total} thresholds show as passed, but only because nothing was measured.</p>`
    : '';
  const consoleLink = run.files.some((file) => file.name === 'k6-console.log' && file.bytes !== null) ? ' The full error is in <a href="k6-console.log">k6-console.log</a>.' : '';
  const exitText = isNumber(exit) ? ` k6 exit code ${exit}.` : '';
  return `<section class="card verdict verdict--bad" aria-labelledby="h-verdict">
<h2 id="h-verdict">${badge('bad', 'NO RESULT')} No test traffic ran — setup did not finish</h2>
<p>No request${esc(tagged)} was recorded, so there is nothing to measure.</p>
${cause}${thresholds}
<p class="muted">Fix the cause and run the suite again.${consoleLink}${esc(exitText)}</p>
</section>`;
};

const verdictSection = (run, metrics) => {
  if (metrics.noTraffic) {
    return noTrafficSection(run, metrics);
  }
  const {verdict} = metrics;
  const exit = run.info.k6ExitCode;
  const exitText = isNumber(exit) ? ` · k6 exit code ${exit}` : '';
  if (verdict.state === 'unknown') {
    return `<section class="card verdict verdict--warn" aria-labelledby="h-verdict"><h2 id="h-verdict">${badge('warn', 'NO VERDICT')} Thresholds were not recorded</h2><p class="muted">Pass or fail cannot be decided without the k6 thresholds${esc(exitText)}.</p></section>`;
  }
  const failed = verdict.state === 'fail';
  const headline = failed ? `${verdict.failed.length} of ${verdict.total} thresholds failed` : `All ${verdict.total} thresholds passed`;
  const list = failed
    ? `<ul class="failed-list">${verdict.failed.map((item) => `<li>${esc(item.text)}.${item.measured ? ` <span class="muted">Measured ${esc(item.measured)}.</span>` : ''}</li>`).join('')}</ul>`
    : '';
  const oddExit = !failed && isNumber(exit) && exit !== 0 ? `<p class="muted">k6 exited with code ${exit} although every threshold passed, so the run may have stopped early.</p>` : '';
  return `<section class="card verdict verdict--${failed ? 'bad' : 'good'}" aria-labelledby="h-verdict">
<h2 id="h-verdict">${badge(failed ? 'bad' : 'good', failed ? 'FAIL' : 'PASS')} ${esc(headline)}</h2>
<p class="muted">${verdict.passed} passed · ${verdict.failed.length} failed${esc(exitText)}</p>
${list}${oddExit}
</section>`;
};

const REPORT_CSS = `
.masthead { margin-bottom: 20px; }
.run-title { font-size: 18px; color: var(--muted); margin: 6px 0 16px; }
.facts, .checks { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px 28px; margin: 0; }
.facts { padding: 16px 24px; }
@media (min-width: 900px) {
  .facts { grid-template-columns: repeat(6, 1fr); }
  .facts .fact { grid-column: span 2; }
  .facts .fact--wide { grid-column: span 3; }
  .facts .fact--full { grid-column: span 6; }
}
.traffic { margin: 0 0 8px; padding-left: 20px; }
.traffic li { margin-bottom: 4px; }
.jump ul { list-style: none; display: flex; flex-wrap: wrap; gap: 4px 20px; margin: 14px 0 0; padding: 0; font-size: 14px; }
.fact dt { font-size: 12.5px; color: var(--muted); }
.fact dd { margin: 2px 0 0; font-size: 14px; overflow-wrap: anywhere; }
.verdict { border-left-width: 6px; }
.verdict--good { border-left-color: var(--good); background: var(--good-tint); }
.verdict--bad { border-left-color: var(--bad); background: var(--bad-tint); }
.verdict--warn { border-left-color: var(--warn); background: var(--warn-tint); }
.verdict h2 { margin: 0 0 6px; display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.failed-list { margin: 12px 0 0; padding-left: 20px; }
.failed-list li { margin-bottom: 4px; }
.tiles { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; }
.tile { background: var(--card); border: 1px solid var(--border); border-left: 4px solid var(--border); border-radius: 8px; box-shadow: var(--shadow); padding: 14px 16px; display: flex; flex-direction: column; break-inside: avoid; }
.tile--good { border-left-color: var(--good); }
.tile--warn { border-left-color: var(--warn); }
.tile--bad { border-left-color: var(--bad); }
.tile--neutral { border-left-color: var(--muted); }
.tile .tile-label { margin: 0; color: var(--muted); font-size: 13px; }
.tile .tile-value { margin: 2px 0 0; font-size: 28px; font-weight: 650; line-height: 1.25; }
.tile .tile-value .unit { font-size: 14px; font-weight: 500; color: var(--muted); }
.tile .tile-detail { margin: 0; color: var(--muted); font-size: 13px; flex: 1; }
.tile .tile-status { margin: 10px 0 0; }
td.is-bad { color: var(--bad); font-weight: 650; }
tr.row-control th, tr.row-control td { border-top: 2px solid var(--border); }
.prose p { max-width: 78ch; }
.files { list-style: none; padding: 0; display: grid; gap: 6px; }
.chart { margin-top: 16px; padding: 18px 20px 14px; }
.chart-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 2px 16px; }
.chart-head p { margin: 0; font-size: 13px; }
.panel-title { font-size: 14px; font-weight: 650; margin: 14px 0 0; }
.legend { list-style: none; display: flex; flex-wrap: wrap; gap: 4px 20px; padding: 0; margin: 10px 0 2px; font-size: 13px; }
.legend li { display: inline-flex; align-items: center; gap: 8px; }
.chart-body { position: relative; }
.chart-scroll { overflow-x: auto; }
svg.panel { display: block; width: 100%; min-width: 700px; height: auto; touch-action: pan-y; }
.grid { stroke: var(--grid); stroke-width: 1; }
.grid--minor { opacity: 0.5; }
.chart-tools { display: flex; align-items: center; gap: 0; margin: 10px 0 0; font-size: 13px; }
.chart-tools .muted { margin-right: 10px; }
.chart-tools button { font: inherit; color: var(--ink); background: var(--card); border: 1px solid var(--border); padding: 3px 12px; cursor: pointer; }
.chart-tools button:first-of-type { border-radius: 6px 0 0 6px; }
.chart-tools button:last-of-type { border-radius: 0 6px 6px 0; margin-left: -1px; }
.chart-tools button[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: var(--on-solid); font-weight: 650; }
.axis { stroke: var(--axis); stroke-width: 1; }
.tick { fill: var(--muted); font: 12px var(--font); font-variant-numeric: tabular-nums; }
.halo { paint-order: stroke; stroke: var(--card); stroke-width: 4px; stroke-linejoin: round; }
.line { fill: none; stroke: var(--c); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.mark { fill: var(--c); stroke: var(--card); stroke-width: 2; }
.bar { fill: var(--c); }
.ref { stroke: var(--ink); stroke-width: 1.25; stroke-dasharray: 6 4; opacity: 0.7; }
.marker-line { stroke: var(--accent); stroke-width: 1.25; stroke-dasharray: 3 3; }
.band { fill: var(--bad); fill-opacity: 0.09; }
.band-key { fill: var(--bad); fill-opacity: 0.18; }
.crosshair { stroke: var(--ink); stroke-width: 1; opacity: 0.5; pointer-events: none; }
.hit { fill: transparent; }
.s1 { --c: var(--s1); }
.s2 { --c: var(--s2); }
.s3 { --c: var(--s3); }
.s4 { --c: var(--s4); }
.s5 { --c: var(--s5); }
.sx { --c: var(--muted); }
.chart-summary { margin: 8px 0 0; font-size: 14px; }
.table-view { margin-top: 10px; font-size: 13px; }
.table-view summary { cursor: pointer; color: var(--accent); }
.table-view .table-wrap { max-height: 360px; overflow: auto; margin-top: 8px; }
.tooltip { position: absolute; z-index: 5; top: 8px; pointer-events: none; min-width: 190px; max-width: 300px; background: var(--card); color: var(--ink); border: 1px solid var(--border); border-radius: 6px; padding: 8px 10px; box-shadow: 0 4px 14px rgba(11, 12, 12, 0.16); font-size: 13px; }
.tooltip .t-time { font-weight: 650; margin-bottom: 4px; font-variant-numeric: tabular-nums; }
.tooltip .t-row { display: flex; align-items: center; gap: 8px; margin-top: 3px; }
.tooltip .t-key { width: 14px; border-top: 3px solid var(--c); border-radius: 2px; flex: none; }
.tooltip .t-value { font-weight: 650; font-variant-numeric: tabular-nums; }
.tooltip .t-name { color: var(--muted); }
@media print {
  .tile { box-shadow: none; }
  .tooltip, .crosshair, .chart-tools { display: none !important; }
  svg.panel { min-width: 0; }
  .chart-scroll { overflow: visible; }
  .chart { break-inside: avoid; }
}
`;

function chartInteractions() {
  const dataNode = document.getElementById('chart-data');
  if (!dataNode) {
    return;
  }
  const charts = new Map(JSON.parse(dataNode.textContent).map((chart) => [chart.id, chart]));
  const svgs = [...document.querySelectorAll('svg.panel')];
  const tooltips = new Map();
  const VIEW_WIDTH = 1000;
  const pad = (value) => String(value).padStart(2, '0');
  const clock = (seconds) => {
    const total = Math.max(0, Math.round(seconds));
    return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
  };
  const formats = {
    ms: (value) => `${Math.round(value).toLocaleString('en-GB')} ms`,
    rps: (value) => `${value.toFixed(1)} /s`,
    count: (value) => Math.round(value).toLocaleString('en-GB'),
    millicores: (value) => `${Math.round(value).toLocaleString('en-GB')} m`,
  };
  const geometry = (svg) => ({left: Number(svg.dataset.left), right: Number(svg.dataset.right), xMax: Number(svg.dataset.xmax)});
  const nearest = (xs, time) => xs.reduce((best, x, index) => (Math.abs(x - time) < Math.abs(xs[best] - time) ? index : best), 0);
  const setCrosshair = (time) => {
    for (const svg of svgs) {
      const line = svg.querySelector('.crosshair');
      const {left, right, xMax} = geometry(svg);
      const x = left + (right - left) * (time / xMax);
      line.setAttribute('x1', x);
      line.setAttribute('x2', x);
      line.setAttribute('visibility', 'visible');
    }
  };
  const clearAll = () => {
    for (const svg of svgs) {
      svg.querySelector('.crosshair').setAttribute('visibility', 'hidden');
    }
    for (const tip of tooltips.values()) {
      tip.hidden = true;
    }
  };
  const tooltipFor = (chartId) => {
    if (!tooltips.has(chartId)) {
      const tip = document.createElement('div');
      tip.className = 'tooltip';
      tip.hidden = true;
      document.querySelector(`[data-chart-body="${chartId}"]`).appendChild(tip);
      tooltips.set(chartId, tip);
    }
    return tooltips.get(chartId);
  };
  const row = (series, value) => {
    const line = document.createElement('div');
    line.className = 't-row';
    const key = document.createElement('span');
    key.className = `t-key ${series.cls}`;
    const amount = document.createElement('span');
    amount.className = 't-value';
    amount.textContent = typeof value === 'number' ? formats[series.unit](value) : 'no data';
    const name = document.createElement('span');
    name.className = 't-name';
    name.textContent = series.name;
    line.append(key, amount, name);
    return line;
  };
  const fill = (tip, chart, index) => {
    const heading = document.createElement('div');
    heading.className = 't-time';
    const half = chart.spans ? chart.spans[index] / 2 : 0;
    heading.textContent = chart.spans ? `${clock(chart.xs[index] - half)}–${clock(chart.xs[index] + half)}` : clock(chart.xs[index]);
    tip.replaceChildren(heading);
    for (const panel of chart.panels) {
      for (const series of panel.series) {
        tip.appendChild(row(series, series.values[index]));
      }
    }
  };
  const place = (tip, svg, time) => {
    const body = tip.parentElement.getBoundingClientRect();
    const box = svg.getBoundingClientRect();
    const {left, right, xMax} = geometry(svg);
    const x = box.left - body.left + ((left + (right - left) * (time / xMax)) * box.width) / VIEW_WIDTH;
    const wide = tip.offsetWidth;
    tip.style.left = `${x + 16 + wide > body.width ? Math.max(0, x - 16 - wide) : x + 16}px`;
    tip.style.top = `${box.top - body.top + 8}px`;
  };
  const show = (svg, time) => {
    const chart = charts.get(svg.dataset.chart);
    const index = nearest(chart.xs, time);
    clearAll();
    setCrosshair(chart.xs[index]);
    const tip = tooltipFor(chart.id);
    fill(tip, chart, index);
    tip.hidden = false;
    place(tip, svg, chart.xs[index]);
    svg.dataset.index = index;
  };
  const timeAt = (svg, event) => {
    const box = svg.getBoundingClientRect();
    const {left, right, xMax} = geometry(svg);
    const x = ((event.clientX - box.left) * VIEW_WIDTH) / box.width;
    return Math.min(xMax, Math.max(0, ((x - left) / (right - left)) * xMax));
  };
  const step = (svg, delta) => {
    const chart = charts.get(svg.dataset.chart);
    const unset = svg.dataset.index === undefined;
    const current = unset ? (delta > 0 ? -1 : chart.xs.length) : Number(svg.dataset.index);
    const next = Math.min(chart.xs.length - 1, Math.max(0, current + delta));
    show(svg, chart.xs[next]);
  };
  for (const toggle of document.querySelectorAll('[data-scale-toggle]')) {
    toggle.hidden = false;
    const body = toggle.parentElement;
    toggle.addEventListener('click', (event) => {
      const choice = event.target.dataset.scale;
      if (!choice) {
        return;
      }
      for (const button of toggle.querySelectorAll('button')) {
        button.setAttribute('aria-pressed', String(button.dataset.scale === choice));
      }
      for (const holder of body.querySelectorAll('.chart-scroll[data-scale]')) {
        holder.hidden = holder.dataset.scale !== choice;
      }
      clearAll();
    });
  }
  for (const svg of svgs) {
    const plot = svg.querySelector('.hit');
    svg.setAttribute('tabindex', '0');
    plot.addEventListener('pointermove', (event) => show(svg, timeAt(svg, event)));
    plot.addEventListener('pointerdown', (event) => show(svg, timeAt(svg, event)));
    plot.addEventListener('pointerleave', clearAll);
    svg.addEventListener('blur', clearAll);
    svg.addEventListener('keydown', (event) => {
      const moves = {ArrowRight: 1, ArrowLeft: -1};
      if (moves[event.key]) {
        event.preventDefault();
        step(svg, moves[event.key]);
      } else if (event.key === 'Escape') {
        clearAll();
      }
    });
  }
}

const measuredSections = (run, metrics, timeline) => [
  kpiSection(run, metrics),
  endpointSection(run, metrics),
  failuresSection(run, metrics),
  timeline.html,
  eventsSection(metrics),
];

function renderReport(run, metrics) {
  const timeline = metrics.noTraffic ? {html: '', payload: '[]'} : timelineSection(run, metrics);
  const label = run.info.label || run.name;
  const sections = [
    ...(metrics.noTraffic ? [] : measuredSections(run, metrics, timeline)),
    suiteChecksSection(run),
    howSection(run),
    filesSection(run),
  ].filter(Boolean);
  const footer = [`Generated ${formatUtc(Date.now() / 1000)} by performance/tools/report.js`, run.info.k6Version].filter(Boolean).join(' · ');
  const body = [
    mastheadSection(run),
    jumpLinks(sections.join('')),
    notesBlock(run),
    verdictSection(run, metrics),
    ...sections,
    `<footer>${esc(footer)}</footer>`,
  ].join('\n');
  const script = `<script type="application/json" id="chart-data">${timeline.payload}</script>\n<script>(${chartInteractions.toString()})();</script>`;
  return pageShell({title: `${run.meta.title} · performance report · ${label}`, body, css: REPORT_CSS, script});
}

async function main(args) {
  if (!args[0]) {
    console.error('Usage: node performance/tools/report.js <runDir>');
    return 2;
  }
  const run = await loadRun(args[0]);
  const target = path.join(run.dir, 'report.html');
  fs.writeFileSync(target, renderReport(run, buildMetrics(run)));
  console.log(target);
  return 0;
}

if (require.main === module) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(`report.js: ${error.message}`);
      process.exitCode = 1;
    },
  );
}

module.exports = {pageShell, chip};
