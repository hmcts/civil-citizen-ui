import {environment} from '../../core/environment.js';
import {buildOptions} from '../../core/load.js';
import {createCitizens, deleteCitizens, login} from '../../core/idam.js';
import {call} from '../../core/http.js';
import {summaryOutputs} from '../../core/summary.js';

const NFR_PER_SECOND = {reads: 10};
const ENDPOINTS = ['read_example'];

const META = {
  suite: 'my-epic',
  title: 'My epic',
  service: 'civil-service',
  trafficType: 'test',
  endpoints: ENDPOINTS,
  keyEndpoints: ['read_example'],
  events: [],
  highlights: [],
  database: {name: 'cmc', label: 'CMC database'},
  nfrSource: 'Where the NFR comes from, e.g. the release impact assessment',
  traffic: [
    {name: 'reads', perSecondAt1x: NFR_PER_SECOND.reads, description: 'What one request stands for in the real journey'},
  ],
};

export const options = buildOptions({
  profileName: environment.profile,
  nfrMs: environment.nfrMs,
  trafficType: META.trafficType,
  streams: {
    reads: {exec: 'reads', perSecond: NFR_PER_SECOND.reads},
  },
  endpoints: ENDPOINTS,
  keyEndpoints: META.keyEndpoints,
});

export function setup() {
  const adminToken = login(environment, environment.idamAdminUser);
  return {adminToken, citizens: createCitizens(environment, adminToken, 5, 'example')};
}

export function reads(data) {
  const citizen = data.citizens[Math.floor(Math.random() * data.citizens.length)];
  call('GET', `${environment.target}/health`, {token: citizen.token, endpoint: 'read_example', type: META.trafficType});
}

export function teardown(data) {
  deleteCitizens(environment, data.adminToken, data.citizens.map(citizen => citizen.email));
}

export function handleSummary(data) {
  return summaryOutputs(data, META, environment);
}
