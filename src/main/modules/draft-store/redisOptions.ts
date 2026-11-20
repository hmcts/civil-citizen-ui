import config from 'config';
import type {RedisOptions} from 'ioredis';

export const getRedisOptions = (store: 'draftStore' | 'session'): RedisOptions => {
  const host = config.get<string>(`services.${store}.redis.host`);
  const tls = config.get<boolean | string>('services.draftStore.redis.tls');

  return {
    host,
    port: Number(config.get(`services.${store}.redis.port`)),
    password: config.get<string>('services.draftStore.redis.key'),
    // EnterpriseCluster presents one endpoint. Keep certificate verification enabled.
    ...(tls === true || tls === 'true' ? {tls: {servername: host}} : {}),
  };
};
