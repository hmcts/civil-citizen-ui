import {getDraftClaimDeletionDate} from 'common/utils/draftClaimUtils';

describe('draftClaimUtils', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return formatted draft deletion date from creation date and ttl days', () => {
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), 30, 'en')).toBe('31 July 2026');
  });

  it('should return formatted draft deletion date with Welsh month names', () => {
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), 30, 'cy')).toBe('31 Gorffennaf 2026');
  });

  it('should not return draft deletion date without ttl marker', () => {
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), undefined, 'en')).toBeUndefined();
  });

  it('should not return draft deletion date with invalid ttl marker', () => {
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), 0, 'en')).toBeUndefined();
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), -1, 'en')).toBeUndefined();
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), Number.NaN, 'en')).toBeUndefined();
  });

  it('should not return draft deletion date when stored ttl marker does not match the configured draft TTL', () => {
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), 180, 'en')).toBeUndefined();
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), 13179, 'en')).toBeUndefined();
  });

  it('should not return draft deletion date with invalid creation date', () => {
    expect(getDraftClaimDeletionDate('not-a-date', 30, 'en')).toBeUndefined();
  });

  it('should use today when stored creation date is in the future', () => {
    jest.setSystemTime(new Date('2026-08-13T10:00:00.000Z'));

    expect(getDraftClaimDeletionDate(new Date('2062-08-01T10:00:00.000Z'), 30, 'en')).toBe('12 September 2026');
  });

  it('should still return the deletion date on the day the draft is deleted', () => {
    jest.setSystemTime(new Date('2026-07-31T22:00:00.000Z'));

    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), 30, 'en')).toBe('31 July 2026');
  });

  it('should not return a deletion date that has passed for a draft kept under legacy retention', () => {
    jest.setSystemTime(new Date('2026-10-08T10:00:00.000Z'));

    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), 30, 'en')).toBeUndefined();
  });
});
