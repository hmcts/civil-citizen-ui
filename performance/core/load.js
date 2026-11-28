const stepUp = (multipliers, hold) => multipliers.flatMap(m => [[m, '30s'], [m, hold]]);

export const profiles = {
  smoke: {
    description: 'Script and environment check at a trickle',
    stages: [[0.05, '15s'], [0.05, '1m']],
  },
  nfr: {
    description: 'The NFR target load held for 5 minutes',
    stages: [[1, '30s'], [1, '5m']],
    steady: true,
  },
  load: {
    description: 'Twice the NFR load held for 10 minutes',
    stages: [[2, '1m'], [2, '10m']],
    steady: true,
  },
  stress: {
    description: 'Steps of 1x to 5x the NFR load to find where it bends',
    stages: stepUp([1, 2, 3, 4, 5], '2m30s'),
  },
  spike: {
    description: 'Sudden 5x burst, then back to the NFR load to check recovery',
    stages: [[1, '30s'], [1, '2m'], [5, '10s'], [5, '1m'], [1, '10s'], [1, '3m']],
  },
  soak: {
    description: 'NFR load held for an hour (leaks, connection build-up)',
    stages: [[1, '1m'], [1, '60m']],
    steady: true,
  },
  breakpoint: {
    description: 'Ramp to 10x the NFR load; stops once the first key endpoint passes 5s at p95',
    stages: [[10, '20m']],
    abortOnBreak: true,
  },
};

export const seconds = (duration) => {
  const units = {h: 3600, m: 60, s: 1};
  return [...String(duration).matchAll(/(\d+(?:\.\d+)?)([hms])/g)].reduce((total, [, value, unit]) => total + Number(value) * units[unit], 0);
};

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const profileNamed = (name) => {
  const profile = profiles[name];
  if (!profile) {
    throw new Error(`Unknown profile "${name}". Use one of: ${Object.keys(profiles).join(', ')}`);
  }
  return profile;
};

export const totalSeconds = (profile) => profile.stages.reduce((total, [, duration]) => total + seconds(duration), 0);

export const peakMultiplier = (profile) => Math.max(...profile.stages.map(([multiplier]) => multiplier));

const perMinute = (perSecond, multiplier) => Math.max(1, Math.round(perSecond * 60 * multiplier));

const arrivalScenario = (stream, profile, type) => {
  const peakPerSecond = stream.perSecond * peakMultiplier(profile);
  const maxVUs = stream.maxVUs || clamp(Math.ceil(peakPerSecond * (stream.secondsPerIteration || 3)) + 2, 2, stream.vuCap || 400);
  return {
    executor: 'ramping-arrival-rate',
    exec: stream.exec,
    startRate: 0,
    timeUnit: '1m',
    stages: profile.stages.map(([multiplier, duration]) => ({target: perMinute(stream.perSecond, multiplier), duration})),
    preAllocatedVUs: Math.max(1, Math.ceil(maxVUs / 4)),
    maxVUs,
    tags: {type},
  };
};

export const buildOptions = ({profileName, nfrMs, trafficType, streams, endpoints, keyEndpoints, control, events, extraThresholds}) => {
  const profile = profileNamed(profileName);
  const duration = totalSeconds(profile);
  const scenarios = {};
  for (const [name, stream] of Object.entries(streams)) {
    scenarios[name] = arrivalScenario(stream, profile, trafficType);
  }
  if (control) {
    scenarios.control = {
      executor: 'constant-arrival-rate',
      exec: control.exec,
      rate: control.perMinute || 60,
      timeUnit: '1m',
      duration: `${duration}s`,
      preAllocatedVUs: 2,
      maxVUs: 20,
      tags: {type: 'control'},
    };
  }
  for (const event of events || []) {
    scenarios[event.name] = {
      executor: 'per-vu-iterations',
      exec: event.exec,
      vus: 1,
      iterations: 1,
      startTime: `${Math.round(duration * (event.at || 0.45))}s`,
      maxDuration: event.maxDuration || '2m',
      tags: {type: 'admin'},
    };
  }

  const thresholds = {
    [`http_req_failed{type:${trafficType}}`]: ['rate<0.001'],
    [`checks{type:${trafficType}}`]: ['rate>0.999'],
  };
  if (control) {
    thresholds['http_req_duration{type:control}'] = [`p(95)<${nfrMs}`];
    thresholds['http_reqs{type:control}'] = ['count>=0'];
  }
  for (const endpoint of endpoints) {
    thresholds[`http_req_duration{endpoint:${endpoint}}`] = [`p(95)<${nfrMs}`];
    thresholds[`http_req_failed{endpoint:${endpoint}}`] = ['rate<0.001'];
    thresholds[`http_reqs{endpoint:${endpoint}}`] = ['count>=0'];
  }
  if (profile.steady) {
    thresholds.dropped_iterations = ['count<1'];
  }
  if (profile.abortOnBreak && keyEndpoints && keyEndpoints.length) {
    thresholds[`http_req_duration{endpoint:${keyEndpoints[0]}}`].push({threshold: 'p(95)<5000', abortOnFail: true, delayAbortEval: '1m'});
  }
  Object.assign(thresholds, extraThresholds || {});

  return {
    scenarios,
    thresholds,
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'count'],
    systemTags: ['status', 'method', 'name', 'scenario', 'expected_response', 'error_code', 'check'],
    setupTimeout: '15m',
    teardownTimeout: '15m',
    insecureSkipTLSVerify: true,
  };
};
