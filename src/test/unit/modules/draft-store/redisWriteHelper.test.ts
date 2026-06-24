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

  it('creates a fresh key with EX+NX when the key does not exist', async () => {
    mockDraftStoreClient.set.mockResolvedValueOnce('OK');

    await writeWithTTL('test-key', 'value', TTLCategory.PAYMENT_SESSION);

    expect(mockDraftStoreClient.set).toHaveBeenCalledTimes(1);
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('test-key', 'value', 'EX', expect.any(Number), 'NX');
    expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
  });

  it('preserves existing TTL with KEEPTTL+XX when NX fails because the key already exists', async () => {
    mockDraftStoreClient.set.mockResolvedValueOnce(null);
    mockDraftStoreClient.set.mockResolvedValueOnce('OK');

    await writeWithTTL('test-key', {foo: 'bar'}, TTLCategory.PAYMENT_SESSION);

    expect(mockDraftStoreClient.set).toHaveBeenCalledTimes(2);
    expect(mockDraftStoreClient.set).toHaveBeenNthCalledWith(1, 'test-key', JSON.stringify({foo: 'bar'}), 'EX', expect.any(Number), 'NX');
    expect(mockDraftStoreClient.set).toHaveBeenNthCalledWith(2, 'test-key', JSON.stringify({foo: 'bar'}), 'KEEPTTL', 'XX');
    expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
  });

  it('falls back to a plain create if the key is concurrently deleted between NX and XX attempts', async () => {
    mockDraftStoreClient.set.mockResolvedValueOnce(null);
    mockDraftStoreClient.set.mockResolvedValueOnce(null);
    mockDraftStoreClient.set.mockResolvedValueOnce('OK');

    await writeWithTTL('test-key', 'value', TTLCategory.PAYMENT_SESSION);

    expect(mockDraftStoreClient.set).toHaveBeenCalledTimes(3);
    expect(mockDraftStoreClient.set).toHaveBeenNthCalledWith(3, 'test-key', 'value', 'EX', expect.any(Number));
    expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
  });

  it('anchors draft claim TTL to creation date', async () => {
    mockDraftStoreClient.set.mockResolvedValueOnce('OK');
    const tenDaysAgo = new Date(Date.now() - 10 * 86400 * 1000);

    await writeWithTTL('claim-key', {id: '1'}, TTLCategory.DRAFT_CLAIM, {creationDate: tenDaysAgo});

    // 180-day TTL anchored to a creation date 10 days ago => ~170 days remaining.
    const [key, value, mode, seconds, nx] = mockDraftStoreClient.set.mock.calls[0];
    const expectedSeconds = (180 - 10) * 86400;
    expect(key).toBe('claim-key');
    expect(value).toBe(JSON.stringify({id: '1'}));
    expect(mode).toBe('EX');
    expect(nx).toBe('NX');
    expect(seconds).toBeGreaterThan(expectedSeconds - 5);
    expect(seconds).toBeLessThanOrEqual(expectedSeconds + 1);
    expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
  });

  it('clamps TTL to 1 second when expiry has already elapsed', async () => {
    mockDraftStoreClient.set.mockResolvedValueOnce('OK');
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
