import {RedisStore, RedisReply} from 'rate-limit-redis';

describe('upload rate-limit store retries', () => {
  const createStore = (failure: Error) => {
    let evaluations = 0;
    const sendCommand = jest.fn<Promise<RedisReply>, [string, ...string[]]>(async command => {
      if (command === 'SCRIPT') return 'script-sha';
      if (command === 'EVALSHA') {
        if (++evaluations === 1) throw failure;
        return [1, 60000];
      }
      throw new Error(`Unexpected Redis command: ${command}`);
    });
    const store = new RedisStore({prefix: 'upload-rate-limit:', sendCommand});
    store.init({windowMs: 60000} as Parameters<RedisStore['init']>[0]);
    return {store, sendCommand};
  };

  it('reloads a missing script and retries the same user key', async () => {
    const {store, sendCommand} = createStore(new Error('NOSCRIPT No matching script'));

    await expect(store.increment('user:123')).resolves.toEqual({totalHits: 1, resetTime: expect.any(Date)});

    const evaluations = sendCommand.mock.calls.filter(([command]) => command === 'EVALSHA');
    expect(evaluations).toHaveLength(2);
    expect(evaluations[0]).toContain('upload-rate-limit:user:123');
    expect(evaluations[1]).toEqual(evaluations[0]);
  });

  it('does not retry an ambiguous connection failure and risk counting an upload twice', async () => {
    const failure = new Error('Connection lost after sending the increment');
    const {store, sendCommand} = createStore(failure);

    await expect(store.increment('user:123')).rejects.toBe(failure);

    expect(sendCommand.mock.calls.filter(([command]) => command === 'EVALSHA')).toHaveLength(1);
  });
});
