const config = require('../../../config');
const idamHelper = require('./idamHelper');
const restHelper = require('./restHelper');
const {checkToggleEnabled} = require('./testingSupport');

const draftClaimsUrl = `${config.url.civilService}/dashboard/draft-claims`;

const parseBody = async (response) => {
  const text = await response.text();
  if (!text) {
    return '';
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const authHeaders = async (user) => {
  const token = await idamHelper.accessToken(user);
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const createCitizen = async () => {
  const email = `draftclaim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@gmail.com`;
  const password = config.claimantCitizenUser.password;
  await idamHelper.createAccount(email, password);
  return {email, password};
};

const isDraftClaimDatabaseEnabled = () => checkToggleEnabled('cui-draft-claim-database');

const createDraftClaim = async (user, body) => {
  const headers = await authHeaders(user);
  const response = await restHelper.request(draftClaimsUrl, headers, body, 'POST');
  return {status: response.status, body: await parseBody(response)};
};

const getActiveDraftClaim = async (user) => {
  const headers = await authHeaders(user);
  const response = await restHelper.request(`${draftClaimsUrl}/active`, headers, null, 'GET');
  return {status: response.status, body: await parseBody(response)};
};

const getDraftClaim = async (user, draftId) => {
  const headers = await authHeaders(user);
  const response = await restHelper.request(`${draftClaimsUrl}/${draftId}`, headers, null, 'GET');
  return {status: response.status, body: await parseBody(response)};
};

const getDraftClaimForCase = async (user, caseId) => {
  const headers = await authHeaders(user);
  const response = await restHelper.request(`${draftClaimsUrl}/case/${caseId}`, headers, null, 'GET');
  return {status: response.status, body: await parseBody(response)};
};

const updateDraftClaim = async (user, draftId, body) => {
  const headers = await authHeaders(user);
  const response = await restHelper.request(`${draftClaimsUrl}/${draftId}`, headers, body, 'PUT');
  return {status: response.status, body: await parseBody(response)};
};

const deleteDraftClaim = async (user, draftId) => {
  const headers = await authHeaders(user);
  const response = await restHelper.request(`${draftClaimsUrl}/${draftId}`, headers, null, 'DELETE');
  return {status: response.status, body: await parseBody(response)};
};

const applyPaymentRetention = async (user, draftId) => {
  const headers = await authHeaders(user);
  const response = await restHelper.request(`${draftClaimsUrl}/${draftId}/payment-retention`, headers, null, 'PUT');
  return {status: response.status, body: await parseBody(response)};
};

const sendDraftClaimsRequest = async (method, path, {token, rawBody} = {}) => {
  const headers = {'Content-Type': 'application/json'};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${draftClaimsUrl}${path}`, {
    method,
    headers,
    body: rawBody,
  });
  return {status: response.status, body: await parseBody(response)};
};

const retentionDays = (draft) => (Date.parse(draft.expiresAt) - Date.parse(draft.createdAt)) / 86400000;

const sameInstant = (a, b) => Date.parse(a) === Date.parse(b);

const londonParts = (ms) => Object.fromEntries(new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23'}).formatToParts(new Date(ms)).filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));

const endOfDayExpiry = (fromDateLike, days) => {
  const {year, month, day} = londonParts(new Date(fromDateLike).getTime());
  const utcMidnight = Date.UTC(year, month - 1, day + days + 1);
  return utcMidnight - londonParts(utcMidnight).hour * 3600000;
};

const deletionDate = (dateLike) => new Date(dateLike).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London',
});

const daysFromNow = (days, from = Date.now()) => from + days * 86400000;

const runExpiredDraftStoreScheduler = async () => {
  const headers = await authHeaders(config.applicantSolicitorUser);
  const response = await restHelper.request(
    `${config.url.civilService}/testing-support/run-scheduler/ExpiredDraftStore`,
    headers, null, 'GET');
  return {status: response.status, body: await parseBody(response)};
};

const getSchedulers = async () => {
  const headers = await authHeaders(config.applicantSolicitorUser);
  const response = await restHelper.request(
    `${config.url.civilService}/testing-support/schedulers`,
    headers, null, 'GET');
  return {status: response.status, body: await parseBody(response)};
};

const claimantCaseIds = async (user) => {
  const token = await idamHelper.accessToken(user);
  const uid = await idamHelper.userId(token);
  const response = await restHelper.request(
    `${config.url.civilService}/cases/claimant/${uid}?page=1`,
    {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
    null,
    'GET',
  );
  const body = await parseBody(response);
  const claims = (body && body.claims) || [];
  return [...new Set(claims.filter(claim => !claim.ocmc && /^\d{16}$/.test(claim.claimId)).map(claim => claim.claimId))];
};

const draftPayload = (overrides = {}) => ({
  draftClaimCreatedAt: new Date().toISOString(),
  totalClaimAmount: 9000,
  applicant1: {
    type: 'INDIVIDUAL',
    partyDetails: {
      title: 'Mr',
      firstName: 'Claimant',
      lastName: 'person',
      primaryAddress: {
        addressLine1: '1',
        city: 'Sheffield',
        postCode: 'S1 2EU',
      },
    },
  },
  claimAmountBreakup: [
    {
      value: {
        claimAmount: '9000',
        claimReason: 'Injury',
      },
    },
  ],
  claimDetails: {
    timeline: {
      rows: [
        {
          date: '2000-01-01T00:00:00.000Z',
          description: 'test',
        },
      ],
    },
  },
  ...overrides,
});

const caseReference = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`.padEnd(16, '0').slice(0, 16);

module.exports = {
  createCitizen,
  isDraftClaimDatabaseEnabled,
  createDraftClaim,
  getActiveDraftClaim,
  getDraftClaim,
  getDraftClaimForCase,
  updateDraftClaim,
  deleteDraftClaim,
  applyPaymentRetention,
  sendDraftClaimsRequest,
  retentionDays,
  sameInstant,
  endOfDayExpiry,
  deletionDate,
  daysFromNow,
  runExpiredDraftStoreScheduler,
  getSchedulers,
  claimantCaseIds,
  draftPayload,
  caseReference,
};
