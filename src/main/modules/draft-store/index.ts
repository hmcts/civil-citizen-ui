import config from 'config';
import Redis from 'ioredis';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('DraftStoreClient');
const REDIS_DATA = require('./redisData.json');

class DraftStoreClient {
  public static REDIS_CONNECTION_SUCCESS = 'Connected to Redis instance successfully';
  private client: Redis;

  public enable() {
    const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
    const connectionString = `${protocol}:${config.get('services.draftStore.redis.key')}@${config.get('services.draftStore.redis.host')}:${config.get('services.draftStore.redis.port')}`;
    logger.info(`connectionString: ${connectionString}`);
    this.client = new Redis(connectionString);
    logger.info(DraftStoreClient.REDIS_CONNECTION_SUCCESS);

    this.client.on('connect', () => {
      REDIS_DATA.forEach((element: any) => {
        this.client.set(element.id, JSON.stringify(element, null, 4)).then(() =>
          logger.info(`Mock data ${element.id} saved to Redis`),
        );
      });
    });
    return this;
  }
  public async setValue(key: string, value: string): Promise<void> {
    try {
      await this.client.set(key, value);
      logger.log('Value set in Redis:', key, value);
    } catch (error) {
      logger.error('Error setting value in Redis:', error);
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      logger.log('Value retrieved from Redis:', key, value);
      return value;
    } catch (error) {
      logger.error('Error getting value from Redis:', error);
      throw error;
    }
  }
  public async del(key: string): Promise<void> {
    try {
      const value = await this.client.del(key);
      logger.log('Value deleted from Redis:', key, value);
    } catch (error) {
      logger.error('Error deleting value from Redis:', error);
      throw error;
    }
  }
  public async expireat(key: string, expireTime: number): Promise<void> {
    try {
      const value = await this.client.expireat(key, expireTime);
      logger.log('Setting expireat time on Redis:', key, value);
    } catch (error) {
      logger.error('Error setting expireat time on Redis:', error);
      throw error;
    }
  }
  public async timeToLive(key: string): Promise<number> {
    try {
      const value = await this.client.ttl(key);
      logger.log('Getting ttl value from Redis:', key, value);
      return value;
    } catch (error) {
      logger.error('Error getting ttl value from Redis:', error);
      throw error;
    }
  }
}

export default DraftStoreClient;