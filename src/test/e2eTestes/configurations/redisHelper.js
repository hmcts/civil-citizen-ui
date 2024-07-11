const Helper = require('@codeceptjs/helper');
const redis = require('./redis'); // Adjust the path to your mock-redis.js file

class RedisHelper extends Helper {
  async setValue(key, value) {
    await redis.set(key, value);
  }

  async getValue(key) {
    return await redis.get(key);
  }
}

module.exports = RedisHelper;
