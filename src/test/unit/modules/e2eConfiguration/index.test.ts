import {DraftStoreCliente2e, getRedisStoreForSessione2e} from 'modules/e2eConfiguration';

type RedisClient = {
  emit: (event: string) => boolean;
  get: (key: string) => Promise<string | null>;
};

describe('e2e draft store', () => {
  afterEach(() => jest.restoreAllMocks());

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

  it('makes the seeded preview draft available once readiness resolves', async () => {
    jest.replaceProperty(process, 'env', {...process.env, NODE_ENV: 'e2eTest', UI_PREVIEW_ENABLED: 'true',
      UI_PREVIEW_FIXTURE_NOW: '2026-10-20T01:00:00Z'});
    const logger = {info: jest.fn(), error: jest.fn()};
    const app = {locals: {} as {draftStoreClient: RedisClient; uiPreviewReady: Promise<void>}};

    new DraftStoreCliente2e(logger as never).enableFor(app as never);
    await expect(app.locals.uiPreviewReady).resolves.toBeUndefined();
    const saved = await app.locals.draftStoreClient.get('someID');
    expect(JSON.parse(saved!)).toMatchObject({case_data: {draftClaimCreatedAt: '2026-10-20T12:00:00.000Z'}});
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs a seeding failure and leaves readiness rejected for startup', async () => {
    jest.replaceProperty(process, 'env', {...process.env, NODE_ENV: 'e2eTest', UI_PREVIEW_ENABLED: 'true',
      UI_PREVIEW_FIXTURE_NOW: 'invalid-date'});
    const logger = {info: jest.fn(), error: jest.fn()};
    const app = {locals: {} as {uiPreviewReady: Promise<void>}};

    new DraftStoreCliente2e(logger as never).enableFor(app as never);
    await expect(app.locals.uiPreviewReady).rejects.toThrow('Invalid UI_PREVIEW_FIXTURE_NOW');
    expect(logger.error).toHaveBeenCalledWith('Preview fixture initialization failed', expect.any(Error));
  });
});
