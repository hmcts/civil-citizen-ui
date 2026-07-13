import {TTLCategory, calculateExpiryTimestamp, reconstructCreationDateFromRemainingTtl} from 'modules/draft-store/ttlConfig';

describe('ttlConfig', () => {
  it('should calculate draft claim expiry from creation date', () => {
    const creationDate = new Date('2024-06-01T00:00:00.000Z');
    const expiry = calculateExpiryTimestamp(TTLCategory.DRAFT_CLAIM, {creationDate});
    expect(expiry).toBe(Math.round(creationDate.getTime() / 1000) + (180 * 86400));
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
