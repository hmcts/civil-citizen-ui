import Redis from 'ioredis';

const {Logger} = require('@hmcts/nodejs-logging');
const redisLogger = Logger.getLogger('redisClient');

/**
 * ioredis emits `error` with no listener as an uncaught exception, and the console
 * collector is off, so a dropped connection never reaches App Insights.
 * The message is plain text: logging the Error object blanks message and stack.
 *
 * This is not exported from modules/draft-store. Integration tests replace that
 * module, and the session client is created while the real utilityService loads.
 */
export const attachRedisClientLogging = (client: Redis, name: string): void => {
  client.on('error', (err: Error) => {
    redisLogger.error(`${name} Redis client failed (${err?.message || 'unknown failure'})`);
  });
  client.on('reconnecting', (delay: number) => {
    const wait = typeof delay === 'number' ? delay : 0;
    redisLogger.warn(`${name} Redis client reconnecting after ${wait}ms`);
  });
};
