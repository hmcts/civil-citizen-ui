import {TTLCategory, calculateExpiryTimestamp, reconstructCreationDateFromRemainingTtl} from 'modules/draft-store/ttlConfig';

describe('ttlConfig', () => {
  it('should calculate draft claim expiry at UK midnight after the submit-by date', () => {
    const creationDate = new Date('2024-06-01T00:00:00.000Z');
    const expiry = calculateExpiryTimestamp(TTLCategory.DRAFT_CLAIM, {creationDate});
    expect(new Date(expiry * 1000).toISOString()).toBe('2024-07-01T23:00:00.000Z');
  });

  it('should calculate draft claim expiry at UK midnight across winter time', () => {
    const creationDate = new Date('2026-11-01T10:00:00.000Z');
    const expiry = calculateExpiryTimestamp(TTLCategory.DRAFT_CLAIM, {creationDate});
    expect(new Date(expiry * 1000).toISOString()).toBe('2026-12-02T00:00:00.000Z');
  });

  it('should calculate payment session expiry from current time when no creation date', () => {
    const now = Math.floor(Date.now() / 1000);
    const expiry = calculateExpiryTimestamp(TTLCategory.PAYMENT_SESSION);
    expect(Math.abs(expiry - now - (7 * 86400))).toBeLessThanOrEqual(1);
  });

  it('should calculate journey cache expiry', () => {
    const now = Math.floor(Date.now() / 1000);
    const expiry = calculateExpiryTimestamp(TTLCategory.JOURNEY_CACHE);
    expect(Math.abs(expiry - now - (180 * 86400))).toBeLessThanOrEqual(1);
  });

  it('should calculate GA journey expiry from creation date', () => {
    const creationDate = new Date('2024-03-15T12:00:00.000Z');
    const expiry = calculateExpiryTimestamp(TTLCategory.GA_JOURNEY, {creationDate});
    expect(expiry).toBe(Math.round(creationDate.getTime() / 1000) + (180 * 86400));
  });

  it('should reconstruct creation date from remaining TTL', () => {
    const remainingTtlSeconds = 90 * 86400;
    const before = Date.now();
    const creationDate = reconstructCreationDateFromRemainingTtl(remainingTtlSeconds, TTLCategory.DRAFT_CLAIM);
    const after = Date.now();
    const expectedElapsedMs = (180 * 86400 - remainingTtlSeconds) * 1000;

    expect(creationDate.getTime()).toBeGreaterThanOrEqual(before - expectedElapsedMs);
    expect(creationDate.getTime()).toBeLessThanOrEqual(after - expectedElapsedMs);
  });
});
