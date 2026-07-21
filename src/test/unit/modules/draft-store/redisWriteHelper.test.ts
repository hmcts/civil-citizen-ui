import {app} from '../../../../main/app';
import {writeWithTTL} from 'modules/draft-store/redisWriteHelper';
import {TTLCategory} from 'modules/draft-store/ttlConfig';

const mockDraftStoreClient = {
  set: jest.fn(),
  ttl: jest.fn(),
  expireat: jest.fn(),
};

app.locals.draftStoreClient = mockDraftStoreClient;

describe('redisWriteHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should preserve existing TTL using KEEPTTL', async () => {
    mockDraftStoreClient.ttl.mockResolvedValueOnce(120);

    await writeWithTTL('test-key', {foo: 'bar'}, TTLCategory.PAYMENT_SESSION);

    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('test-key', JSON.stringify({foo: 'bar'}), 'KEEPTTL');
    expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
  });

  it('should apply new TTL atomically (EX) when key has no expiry', async () => {
    mockDraftStoreClient.ttl.mockResolvedValueOnce(-1);

    await writeWithTTL('test-key', 'value', TTLCategory.PAYMENT_SESSION);

    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('test-key', 'value', 'EX', expect.any(Number));
    expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
  });

  it('should anchor draft claim TTL to creation date', async () => {
    mockDraftStoreClient.ttl.mockResolvedValueOnce(-2);
    const tenDaysAgo = new Date(Date.now() - 10 * 86400 * 1000);

    await writeWithTTL('claim-key', {id: '1'}, TTLCategory.DRAFT_CLAIM, {creationDate: tenDaysAgo});

    // 180-day TTL anchored to a creation date 10 days ago => ~170 days remaining.
    const [key, value, mode, seconds] = mockDraftStoreClient.set.mock.calls[0];
    const expectedSeconds = (180 - 10) * 86400;
    expect(key).toBe('claim-key');
    expect(value).toBe(JSON.stringify({id: '1'}));
    expect(mode).toBe('EX');
    expect(seconds).toBeGreaterThan(expectedSeconds - 5);
    expect(seconds).toBeLessThanOrEqual(expectedSeconds + 1);
    expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
  });

  it('should clamp TTL to 1 second when expiry has already elapsed', async () => {
    mockDraftStoreClient.ttl.mockResolvedValueOnce(-1);
    const farPast = new Date(Date.now() - 200 * 86400 * 1000);

    await writeWithTTL('claim-key', {id: '1'}, TTLCategory.DRAFT_CLAIM, {creationDate: farPast});

    const [, , mode, seconds] = mockDraftStoreClient.set.mock.calls[0];
    expect(mode).toBe('EX');
    expect(seconds).toBe(1);
  });

  it('should throw when value is null', async () => {
    await expect(writeWithTTL('key', null as unknown as string, TTLCategory.PAYMENT_SESSION))
      .rejects.toThrow('Redis value cannot be null or undefined');
  });
});
