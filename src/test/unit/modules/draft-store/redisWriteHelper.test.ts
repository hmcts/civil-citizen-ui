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

  it('should apply new TTL when key has no expiry', async () => {
    mockDraftStoreClient.ttl.mockResolvedValueOnce(-1);

    await writeWithTTL('test-key', 'value', TTLCategory.PAYMENT_SESSION);

    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('test-key', 'value');
    expect(mockDraftStoreClient.expireat).toHaveBeenCalledWith('test-key', expect.any(Number));
  });

  it('should anchor draft claim TTL to creation date', async () => {
    mockDraftStoreClient.ttl.mockResolvedValueOnce(-2);
    const creationDate = new Date('2024-01-01T00:00:00.000Z');

    await writeWithTTL('claim-key', {id: '1'}, TTLCategory.DRAFT_CLAIM, {creationDate});

    const expectedExpiry = Math.round(creationDate.getTime() / 1000) + (180 * 86400);
    expect(mockDraftStoreClient.expireat).toHaveBeenCalledWith('claim-key', expectedExpiry);
  });

  it('should throw when key is empty', async () => {
    await expect(writeWithTTL('', 'value', TTLCategory.PAYMENT_SESSION)).rejects.toThrow('Redis key cannot be empty');
  });

  it('should throw when value is null', async () => {
    await expect(writeWithTTL('key', null as unknown as string, TTLCategory.PAYMENT_SESSION))
      .rejects.toThrow('Redis value cannot be null or undefined');
  });
});
