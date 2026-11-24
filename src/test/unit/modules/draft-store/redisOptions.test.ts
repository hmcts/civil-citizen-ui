import config from 'config';
import {getRedisOptions} from 'modules/draft-store/redisOptions';

describe('Redis connection options', () => {
  const password = 'access+key/with=reserved:@characters';
  let values: Record<string, unknown>;

  beforeEach(() => {
    values = {
      'services.draftStore.redis.host': 'drafts.uksouth.redis.azure.net',
      'services.draftStore.redis.port': '10000',
      'services.draftStore.redis.key': password,
      'services.draftStore.redis.tls': true,
      'services.session.redis.host': 'sessions.uksouth.redis.azure.net',
      'services.session.redis.port': '10000',
    };
    jest.spyOn(config, 'get').mockImplementation((key: string) => values[key]);
  });

  afterEach(() => jest.restoreAllMocks());

  it.each(['draftStore', 'session'] as const)('uses the %s host for TLS and preserves the exact access key', store => {
    const options = getRedisOptions(store);
    const host = values[`services.${store}.redis.host`];
    expect(options).toEqual({host, port: 10000, password, tls: {servername: host}});
    expect(options.db).toBeUndefined(); // ioredis defaults to database 0.
  });

  it.each([false, 'false'])('keeps local non-TLS Redis working when TLS is %s', tls => {
    values['services.draftStore.redis.host'] = 'localhost';
    values['services.draftStore.redis.port'] = 6379;
    values['services.draftStore.redis.key'] = undefined;
    values['services.draftStore.redis.tls'] = tls;
    expect(getRedisOptions('draftStore')).toEqual({host: 'localhost', port: 6379, password: undefined});
  });

  it('accepts a TLS environment value without disabling certificate verification', () => {
    values['services.draftStore.redis.tls'] = 'true';
    expect(getRedisOptions('draftStore').tls).toEqual({servername: 'drafts.uksouth.redis.azure.net'});
  });

  it('continues to support the existing TLS cache on port 6380', () => {
    values['services.session.redis.host'] = 'legacy.redis.cache.windows.net';
    values['services.session.redis.port'] = '6380';
    expect(getRedisOptions('session')).toEqual({
      host: 'legacy.redis.cache.windows.net', port: 6380, password,
      tls: {servername: 'legacy.redis.cache.windows.net'},
    });
  });
});
