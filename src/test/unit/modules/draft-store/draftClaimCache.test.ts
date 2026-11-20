import {cloneDefaultDraftClaimCaseData, saveDraftClaimToCache} from 'modules/draft-store/draftClaimCache';
import {writeWithTTL} from 'modules/draft-store/redisWriteHelper';
import {getTTLDaysForCategory, TTLCategory} from 'modules/draft-store/ttlConfig';

jest.mock('modules/draft-store/redisWriteHelper', () => ({writeWithTTL: jest.fn()}));

const write = jest.mocked(writeWithTTL);

describe('draft claim cache preservation', () => {
  const now = new Date('2026-10-21T12:00:00.000Z');
  let writes: Parameters<typeof writeWithTTL>[];

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
    writes = [];
    write.mockReset().mockImplementation(async (...args) => {
      writes.push(structuredClone(args));
    });
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('clones defaults independently without changing the approved fixture by CARM flag', () => {
    const first = cloneDefaultDraftClaimCaseData(false);
    const second = cloneDefaultDraftClaimCaseData(true);
    expect(first).toEqual(second);
    first.applicant1.partyDetails.firstName = 'Edited';
    expect(second.applicant1.partyDetails.firstName).toBe('Claimant');
    expect(cloneDefaultDraftClaimCaseData().applicant1.partyDetails.firstName).toBe('Claimant');
    expect(second.applicant1.partyPhone.phone).toBe('07800000000');
  });

  it('writes the current owner and creation/retention metadata with the whole supplied draft', async () => {
    const data = cloneDefaultDraftClaimCaseData();
    data.applicant1.partyDetails.firstName = 'Preserved';
    const expected = structuredClone(data);

    await saveDraftClaimToCache('owner-1', data);

    expect(write).toHaveBeenCalledTimes(1);
    expect(writes).toEqual([['owner-1', {
      id: 'owner-1',
      case_data: {
        ...expected,
        id: 'owner-1',
        draftClaimCreatedAt: now.toISOString(),
        draftClaimCacheTtlDays: getTTLDaysForCategory(TTLCategory.DRAFT_CLAIM),
      },
    }, TTLCategory.DRAFT_CLAIM, {creationDate: now}]]);
  });

  it('persists independent drafts with distinct owners and creation times on consecutive writes', async () => {
    const first = cloneDefaultDraftClaimCaseData();
    const second = cloneDefaultDraftClaimCaseData();
    first.applicant1.partyDetails.firstName = 'First owner';
    second.applicant1.partyDetails.firstName = 'Second owner';
    const expectedFirst = structuredClone(first);
    const expectedSecond = structuredClone(second);
    const later = new Date('2026-10-22T12:00:00.000Z');

    await saveDraftClaimToCache('owner-1', first);
    jest.setSystemTime(later);
    await saveDraftClaimToCache('owner-2', second);

    expect(write).toHaveBeenCalledTimes(2);
    expect(writes).toEqual([
      ['owner-1', {
        id: 'owner-1',
        case_data: {
          ...expectedFirst,
          id: 'owner-1',
          draftClaimCreatedAt: now.toISOString(),
          draftClaimCacheTtlDays: getTTLDaysForCategory(TTLCategory.DRAFT_CLAIM),
        },
      }, TTLCategory.DRAFT_CLAIM, {creationDate: now}],
      ['owner-2', {
        id: 'owner-2',
        case_data: {
          ...expectedSecond,
          id: 'owner-2',
          draftClaimCreatedAt: later.toISOString(),
          draftClaimCacheTtlDays: getTTLDaysForCategory(TTLCategory.DRAFT_CLAIM),
        },
      }, TTLCategory.DRAFT_CLAIM, {creationDate: later}],
    ]);
  });

  it('propagates persistence failure rather than reporting a saved draft', async () => {
    const failure = new Error('store unavailable');
    write.mockRejectedValueOnce(failure);
    await expect(saveDraftClaimToCache('owner-1', cloneDefaultDraftClaimCaseData())).rejects.toBe(failure);
  });
});
