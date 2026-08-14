import {getDraftClaimDeletionDate} from 'common/utils/draftClaimUtils';

describe('draftClaimUtils', () => {
  it('should return formatted draft deletion date from creation date and ttl days', () => {
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), 30, 'en')).toBe('31 July 2026');
  });

  it('should return formatted draft deletion date with Welsh month names', () => {
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), 30, 'cy')).toBe('31 Gorffennaf 2026');
  });

  it('should not return draft deletion date without ttl marker', () => {
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), undefined, 'en')).toBeUndefined();
  });

  it('should not return draft deletion date when stored ttl marker does not match the configured draft TTL', () => {
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), 180, 'en')).toBeUndefined();
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), 13179, 'en')).toBeUndefined();
  });

  it('should use today when stored creation date is in the future', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-13T10:00:00.000Z'));

    expect(getDraftClaimDeletionDate(new Date('2062-08-01T10:00:00.000Z'), 30, 'en')).toBe('12 September 2026');

    jest.useRealTimers();
  });
});
