// const Redis = require('ioredis');
//
// console.log(Redis);
//
// jest.mock('ioredis', () => {
//   return jest.fn().mockImplementation(() => {
//     return {ping: jest.fn(async () => 'PONG')};
//   });
// });

// jest.mock('redis');
// import {createClient} from 'redis';
//
// const mockedCreateClient = createClient as jest.MockedFunction<(...args: unknown[]) => unknown>;
//
// const mockedRedisClient = {
//   connect: jest.fn(async () => ''),
//   ping: jest.fn(async () => 'PONG'),
//   set: jest.fn(async () => ''),
//   get: jest.fn(async () => '{}'),
// };
// mockedCreateClient.mockReturnValue(mockedRedisClient);
