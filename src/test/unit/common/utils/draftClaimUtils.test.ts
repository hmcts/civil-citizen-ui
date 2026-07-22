import {getDraftClaimDeletionDate} from 'common/utils/draftClaimUtils';

describe('draftClaimUtils', () => {
  it('should return formatted draft deletion date from creation date and ttl days', () => {
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), 30, 'en')).toBe('31 July 2026');
  });

  it('should not return draft deletion date without ttl marker', () => {
    expect(getDraftClaimDeletionDate(new Date('2026-07-01T10:00:00.000Z'), undefined, 'en')).toBeUndefined();
  });
});
