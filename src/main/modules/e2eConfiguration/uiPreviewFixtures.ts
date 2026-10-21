import {isUiPreviewEnabled} from 'common/utils/uiPreviewConfig';

interface SeedClient {
  set: (key: string, value: string) => Promise<unknown>;
  expire: (key: string, seconds: number) => Promise<unknown>;
}
interface Fixture {id: string; case_data?: Record<string, unknown>; value?: unknown}

/** One fixture clock per launch; inject a fixed ISO value for repeatable review. */
export const previewFixtureClock = (value = process.env.UI_PREVIEW_FIXTURE_NOW): Date => {
  const date = value ? new Date(value) : new Date();
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid UI_PREVIEW_FIXTURE_NOW');
  date.setUTCHours(12, 0, 0, 0);
  return date;
};

export const seedUiPreviewFixtures = async (
  client: SeedClient, baseline: Fixture[], gaBaseline: Fixture[], now = previewFixtureClock(),
): Promise<void> => {
  if (!isUiPreviewEnabled()) throw new Error('UI preview fixtures are disabled');
  // Lazy require: production must not load additional synthetic data.
  const additional: Fixture[] = require('./uiPreviewRedisData.json');
  const rows: Fixture[] = JSON.parse(JSON.stringify([...baseline, ...additional]));
  const future = new Date(now.getTime() + 90 * 86400000).toISOString();
  for (const row of rows) {
    if (row.case_data) {
      row.case_data.draftClaimCreatedAt = now.toISOString();
      row.case_data.respondent1ResponseDeadline = future;
    }
  }
  // Overlay a separate draft copy only in this disposable preview store.
  const source = rows.find(row => row.id === '1645882162449409someID');
  if (!source?.case_data) throw new Error('Missing preview base claim');
  const draft = rows.find(row => row.id === 'someID');
  if (!draft) throw new Error('Missing preview user draft');
  draft.case_data = JSON.parse(JSON.stringify(source.case_data));
  delete draft.case_data.id;
  delete draft.case_data.ccdState;
  delete draft.case_data.submittedDate;
  draft.case_data.draftClaimCreatedAt = now.toISOString();
  source.case_data.caseRole = '[DEFENDANT]'; // Preview-only ownership metadata.
  const gaRows: Fixture[] = JSON.parse(JSON.stringify(gaBaseline));
  // All writes and expiries finish before readiness. Any failure rejects startup.
  await Promise.all([...rows, ...gaRows].map(async row => {
    await client.set(row.id, JSON.stringify(row.value ?? row));
    await client.expire(row.id, 86400);
  }));
};
