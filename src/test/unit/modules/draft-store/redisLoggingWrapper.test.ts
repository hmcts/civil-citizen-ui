const mockInfo = jest.fn();

jest.mock('@hmcts/nodejs-logging', () => ({
  Logger: {
    getLogger: () => ({
      info: mockInfo,
    }),
  },
}));

import {wrapRedisClientWithLogging} from 'modules/draft-store/redisLoggingWrapper';

describe('redisLoggingWrapper', () => {
  const createMockClient = () => ({
    set: jest.fn().mockResolvedValue('OK'),
    setex: jest.fn().mockResolvedValue('OK'),
    psetex: jest.fn().mockResolvedValue('OK'),
    expire: jest.fn().mockResolvedValue(1),
    expireat: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(3600),
  });

  beforeEach(() => {
    mockInfo.mockClear();
  });

  it('should log key and ttl after set', async () => {
    const client = wrapRedisClientWithLogging(createMockClient());

    await client.set('claim-123', '{"id":"claim-123"}');

    expect(mockInfo).toHaveBeenCalledWith('Draft store Redis write: key=claim-123, ttl=3600s, operation=set');
  });

  it('should log key and ttl after setex', async () => {
    const client = wrapRedisClientWithLogging(createMockClient());

    await client.setex('claim-456', 7200, 'value');

    expect(mockInfo).toHaveBeenCalledWith('Draft store Redis write: key=claim-456, ttl=3600s, operation=setex');
  });

  it('should log key and ttl after expireat', async () => {
    const client = wrapRedisClientWithLogging(createMockClient());

    await client.expireat('claim-789', 1893456000);

    expect(mockInfo).toHaveBeenCalledWith('Draft store Redis write: key=claim-789, ttl=3600s, operation=expireat');
  });

  it('should format no expiry ttl correctly', async () => {
    const client = wrapRedisClientWithLogging({
      ...createMockClient(),
      ttl: jest.fn().mockResolvedValue(-1),
    });

    await client.set('payment-key', 'user-id');

    expect(mockInfo).toHaveBeenCalledWith('Draft store Redis write: key=payment-key, ttl=no expiry, operation=set');
  });
});
