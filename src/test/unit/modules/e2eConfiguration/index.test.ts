import {DraftStoreCliente2e, getRedisStoreForSessione2e} from 'modules/e2eConfiguration';

type RedisClient = {
  emit: (event: string) => boolean;
  get: (key: string) => Promise<string | null>;
};

describe('e2e draft store', () => {
  it('saves mock claim data when redis connects', async () => {
    const logger = {info: jest.fn()};
    const app = {locals: {} as {draftStoreClient: RedisClient}};

    new DraftStoreCliente2e(logger as never).enableFor(app as never);
    app.locals.draftStoreClient.emit('connect');
    await new Promise(resolve => setImmediate(resolve));
    await new Promise(resolve => setImmediate(resolve));

    expect(logger.info).toHaveBeenCalledWith(DraftStoreCliente2e.REDIS_CONNECTION_SUCCESS);
    expect(await app.locals.draftStoreClient.get('someID')).toEqual(expect.stringContaining('someID'));
  });

  it('builds a session store for e2e tests', () => {
    expect(getRedisStoreForSessione2e()).toBeDefined();
  });
});
