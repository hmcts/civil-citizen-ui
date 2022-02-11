jest.mock('redis');
import {createClient} from 'redis';

const mockedCreateClient = createClient as jest.MockedFunction<any>;

const mockedRedisClient = {
  connect: jest.fn(async () => ''),
  ping: jest.fn(async () => 'PONG'),
};
mockedCreateClient.mockReturnValue(mockedRedisClient);
