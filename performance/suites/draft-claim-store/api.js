import {call} from '../../core/http.js';

const DRAFT_CLAIMS = '/dashboard/draft-claims';

const named = (endpoint, type) => (type === 'draft' ? endpoint : `${type}_${endpoint}`);

export const createDraft = (base, token, payload, type = 'draft') => call('POST', `${base}${DRAFT_CLAIMS}`,
  {token, body: {payload}, endpoint: named('create_draft', type), type, expected: [201, 409]});

export const readActive = (base, token) => call('GET', `${base}${DRAFT_CLAIMS}/active`,
  {token, endpoint: 'read_active', type: 'draft'});

export const readActiveIfAny = (base, token, type) => call('GET', `${base}${DRAFT_CLAIMS}/active`,
  {token, endpoint: named('read_active', type), type, expected: [200, 404], verify: false});

export const readById = (base, token, draftId) => call('GET', `${base}${DRAFT_CLAIMS}/${draftId}`,
  {token, endpoint: 'read_by_id', type: 'draft'});

export const readByCase = (base, token, caseId) => call('GET', `${base}${DRAFT_CLAIMS}/case/${caseId}`,
  {token, endpoint: 'read_by_case', type: 'draft'});

export const saveDraft = (base, token, draftId, payload) => call('PUT', `${base}${DRAFT_CLAIMS}/${draftId}`,
  {token, body: {payload}, endpoint: 'save_draft', type: 'draft'});

export const linkCase = (base, token, draftId, caseId, payload) => call('PUT', `${base}${DRAFT_CLAIMS}/${draftId}`,
  {token, body: {caseId, payload}, endpoint: 'link_case', type: 'draft'});

export const paymentRetention = (base, token, draftId) => call('PUT', `${base}${DRAFT_CLAIMS}/${draftId}/payment-retention`,
  {token, endpoint: 'payment_retention', type: 'draft'});

export const deleteDraft = (base, token, draftId, type = 'draft') => call('DELETE', `${base}${DRAFT_CLAIMS}/${draftId}`,
  {token, endpoint: named('delete_draft', type), type, expected: type === 'draft' ? [204] : [204, 404]});

export const control = (base, token) => call('GET', `${base}/testing-support/feature-toggle/cui-draft-claim-database`,
  {token, endpoint: 'control_no_db', type: 'control'});

export const runCleanupJob = (base, token) => call('GET', `${base}/testing-support/run-scheduler/ExpiredDraftStore`,
  {token, endpoint: 'run_cleanup_job', type: 'admin', expected: [202, 404], verify: false});
