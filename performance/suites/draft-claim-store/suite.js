import http from 'k6/http';
import exec from 'k6/execution';
import {Counter, Rate, Trend} from 'k6/metrics';
import {environment, setting} from '../../core/environment.js';
import {buildOptions, clamp, peakMultiplier, profileNamed} from '../../core/load.js';
import {createCitizens, deleteCitizens, login} from '../../core/idam.js';
import {summaryOutputs} from '../../core/summary.js';
import * as api from './api.js';
import {buildPayload, withMarker} from './payload.js';

const settings = {
  payloadSize: setting('PAYLOAD', 'standard'),
  pagesPerJourney: Number(setting('PAGES_PER_JOURNEY', 10)),
  readPoolSize: Number(setting('READ_POOL', 25)),
  cleanupJob: setting('CLEANUP_JOB', 'true') === 'true',
};

const NFR_PER_SECOND = {page_reads: 24, page_saves: 3.8, journeys: 0.1};
const ENDPOINTS = ['create_draft', 'read_active', 'read_by_id', 'read_by_case', 'save_draft', 'link_case', 'payment_retention', 'delete_draft'];
const journeyPoolSize = clamp(Math.ceil(NFR_PER_SECOND.journeys * peakMultiplier(profileNamed(environment.profile)) * 120) + 2, 3, 60);
const basePayload = buildPayload(JSON.parse(open('./data/draft-claim-payload.json')), settings.payloadSize);

const META = {
  suite: 'draft-claim-store',
  title: 'Draft claim store',
  service: 'civil-service',
  trafficType: 'draft',
  endpoints: ENDPOINTS,
  keyEndpoints: ['read_active', 'save_draft', 'read_by_id'],
  control: {endpoint: 'control_no_db', description: 'a civil-service call that does not touch the database'},
  events: settings.cleanupJob ? [{name: 'cleanup_job', endpoint: 'run_cleanup_job', label: 'Clean-up job'}] : [],
  highlights: [
    {metric: 'page_cycle_duration', kind: 'trend', label: 'Page cycle (read, save, read back)', nfr: true},
    {metric: 'journey_duration', kind: 'trend', label: `Journey (create, ${settings.pagesPerJourney} pages, link, payment, delete)`, countLabel: 'Completed'},
    {metric: 'data_integrity_failures', kind: 'rate-failures', label: 'Data integrity (saved, read back, different value)', unit: 'read-backs'},
    {metric: 'journey_save_failures', kind: 'count', label: 'Journey pages where the save or read-back failed'},
  ],
  database: {name: 'cmc', label: 'CMC database'},
  nfrSource: 'Release IA: 20 reads/s and 4 writes/s with a 30% uplift',
  traffic: [
    {name: 'page_reads', perSecondAt1x: NFR_PER_SECOND.page_reads, description: 'GET /active, as each claim page does'},
    {name: 'page_saves', perSecondAt1x: NFR_PER_SECOND.page_saves, description: 'PUT /{id} with a full claim payload'},
    {name: 'journeys', perSecondAt1x: NFR_PER_SECOND.journeys, description: `create, ${settings.pagesPerJourney} pages of read, save and read back (checked), link to a case, read by case, payment retention, delete`},
    {name: 'control', perSecondAt1x: 1, description: 'a civil-service call that does not touch the database'},
  ],
};

export const options = buildOptions({
  profileName: environment.profile,
  nfrMs: environment.nfrMs,
  trafficType: META.trafficType,
  streams: {
    page_reads: {exec: 'pageReads', perSecond: NFR_PER_SECOND.page_reads},
    page_saves: {exec: 'pageSaves', perSecond: NFR_PER_SECOND.page_saves, vuCap: 150},
    journeys: {exec: 'journeys', perSecond: NFR_PER_SECOND.journeys, maxVUs: journeyPoolSize},
  },
  endpoints: ENDPOINTS,
  keyEndpoints: META.keyEndpoints,
  control: {exec: 'control', perMinute: 60},
  events: settings.cleanupJob ? [{name: 'cleanup_job', exec: 'cleanupJob'}] : [],
  extraThresholds: {
    page_cycle_duration: [`p(95)<${environment.nfrMs}`],
    journey_duration: ['max>=0'],
    data_integrity_failures: ['rate==0'],
    journey_save_failures: ['count>=0'],
  },
});

const pageCycle = new Trend('page_cycle_duration', true);
const journeyDuration = new Trend('journey_duration', true);
const integrityFailures = new Rate('data_integrity_failures');
const journeySaveFailures = new Counter('journey_save_failures');
const cleanupTriggered = new Counter('cleanup_job_triggered');
const cleanupUnavailable = new Counter('cleanup_job_unavailable');

const caseReference = () => `1999${String(Date.now()).slice(-8)}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
const pick = (items) => items[Math.floor(Math.random() * items.length)];

export function setup() {
  const target = environment.target;
  const health = http.get(`${target}/health`, {tags: {type: 'setup', name: 'health'}, timeout: '30s'});
  if (health.status !== 200) {
    throw new Error(`${target}/health returned ${health.status}; is the environment up and the VPN connected?`);
  }
  const adminToken = login(environment, environment.idamAdminUser);
  const solicitorToken = login(environment, environment.solicitorUser);

  const readCitizens = createCitizens(environment, adminToken, settings.readPoolSize, 'read');
  for (const citizen of readCitizens) {
    const created = api.createDraft(target, citizen.token, basePayload, 'setup');
    if (created.status !== 201) {
      throw new Error(`Could not create a draft for ${citizen.email}: ${created.status} ${String(created.body).slice(0, 200)}`);
    }
    citizen.draftId = created.json('draftId');
  }
  const journeyCitizens = createCitizens(environment, adminToken, journeyPoolSize, 'journey');

  console.log(`setup: ${readCitizens.length} citizens with drafts for page reads and saves, ${journeyCitizens.length} citizens for journeys, payload ${JSON.stringify(basePayload).length} bytes`);
  return {readCitizens, journeyCitizens, adminToken, solicitorToken};
}

export function pageReads(data) {
  api.readActive(environment.target, pick(data.readCitizens).token);
}

export function pageSaves(data) {
  const citizen = pick(data.readCitizens);
  api.saveDraft(environment.target, citizen.token, citizen.draftId, withMarker(basePayload, `save-${exec.vu.idInTest}-${exec.vu.iterationInScenario}`));
}

export function journeys(data) {
  const target = environment.target;
  const citizen = data.journeyCitizens[exec.scenario.iterationInTest % data.journeyCitizens.length];
  const started = Date.now();

  const created = api.createDraft(target, citizen.token, basePayload);
  let draftId;
  if (created.status === 201) {
    draftId = created.json('draftId');
  } else if (created.status === 409) {
    const active = api.readActive(target, citizen.token);
    if (active.status !== 200) {
      return;
    }
    draftId = active.json('draftId');
  } else {
    return;
  }

  for (let page = 1; page <= settings.pagesPerJourney; page++) {
    const marker = `${environment.runId}-${exec.scenario.iterationInTest}-${page}`;
    const pageStarted = Date.now();
    api.readActive(target, citizen.token);
    const saved = api.saveDraft(target, citizen.token, draftId, withMarker(basePayload, marker));
    const readBack = api.readById(target, citizen.token, draftId);
    pageCycle.add(Date.now() - pageStarted);
    if (saved.status !== 200 || readBack.status !== 200) {
      journeySaveFailures.add(1);
      continue;
    }
    integrityFailures.add(readBack.json('payload.perfRunMarker') !== marker);
  }

  const caseId = caseReference();
  api.linkCase(target, citizen.token, draftId, caseId, withMarker(basePayload, `linked-${caseId}`));
  api.readByCase(target, citizen.token, caseId);
  api.paymentRetention(target, citizen.token, draftId);
  api.deleteDraft(target, citizen.token, draftId);
  journeyDuration.add(Date.now() - started);
}

export function control(data) {
  api.control(environment.target, data.solicitorToken);
}

export function cleanupJob(data) {
  const response = api.runCleanupJob(environment.target, data.solicitorToken);
  if (response.status === 202) {
    cleanupTriggered.add(1);
    console.log(`clean-up job triggered at ${new Date().toISOString()}`);
  } else {
    cleanupUnavailable.add(1);
    console.log(`clean-up job not available on this environment (${response.status})`);
  }
}

export function teardown(data) {
  const target = environment.target;
  for (const citizen of data.readCitizens) {
    api.deleteDraft(target, citizen.token, citizen.draftId, 'teardown');
  }
  for (const citizen of data.journeyCitizens) {
    const active = api.readActiveIfAny(target, citizen.token, 'teardown');
    if (active.status === 200) {
      api.deleteDraft(target, citizen.token, active.json('draftId'), 'teardown');
    }
  }
  deleteCitizens(environment, data.adminToken, [...data.readCitizens, ...data.journeyCitizens].map(citizen => citizen.email));
}

export function handleSummary(data) {
  return summaryOutputs(data, META, environment);
}
