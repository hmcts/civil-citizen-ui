const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftStoreService');

type RedisWriteClient = {
  set: (...args: unknown[]) => Promise<unknown>;
  setex?: (...args: unknown[]) => Promise<unknown>;
  psetex?: (...args: unknown[]) => Promise<unknown>;
  expire?: (...args: unknown[]) => Promise<unknown>;
  expireat?: (...args: unknown[]) => Promise<unknown>;
  ttl: (key: string) => Promise<number>;
};

const formatTtl = (ttl: number): string => {
  if (ttl === -1) {
    return 'no expiry';
  }
  if (ttl === -2) {
    return 'key not found';
  }
  return `${ttl}s`;
};

const logRedisStore = async (client: RedisWriteClient, key: string, operation: string) => {
  const ttl = await client.ttl(key);
  logger.info(`Draft store Redis write: key=${key}, ttl=${formatTtl(ttl)}, operation=${operation}`);
};

const wrapMethod = (
  client: RedisWriteClient,
  methodName: keyof RedisWriteClient,
  operation: string,
) => {
  const original = client[methodName];
  if (typeof original !== 'function') {
    return;
  }

  (client[methodName] as (...args: unknown[]) => Promise<unknown>) = async (...args: unknown[]) => {
    const result = await (original as (...methodArgs: unknown[]) => Promise<unknown>).apply(client, args);
    await logRedisStore(client, String(args[0]), operation);
    return result;
  };
};

export const wrapRedisClientWithLogging = <T extends RedisWriteClient>(client: T): T => {
  wrapMethod(client, 'set', 'set');
  wrapMethod(client, 'setex', 'setex');
  wrapMethod(client, 'psetex', 'psetex');
  wrapMethod(client, 'expire', 'expire');
  wrapMethod(client, 'expireat', 'expireat');
  return client;
};
