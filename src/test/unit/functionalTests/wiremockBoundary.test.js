const WiremockBoundary = require('../../functionalTests/helpers/wiremockBoundary');

describe('Optimised functional mock boundaries', () => {
  const originalFetch = global.fetch;
  let boundary;

  beforeEach(() => {
    boundary = new WiremockBoundary({url: 'https://wiremock.example.test'});
    global.fetch = jest.fn().mockResolvedValue({ok: true, json: async () => ({requests: []})});
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('resets scenario state before each journey without deleting diagnostic requests', async () => {
    await boundary._before();
    await boundary._before();
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenLastCalledWith('https://wiremock.example.test/__admin/scenarios/reset', expect.objectContaining({method: 'POST'}));
  });

  it('accepts journeys whose downstream requests all matched', async () => {
    await expect(boundary._after()).resolves.toBeUndefined();
  });

  it('fails on unexpected requests without logging request bodies or query values', async () => {
    global.fetch.mockResolvedValue({ok: true, json: async () => ({requests: [{method: 'POST', url: '/unexpected?token=private', body: 'private'}]})});
    await expect(boundary._after()).rejects.toThrow('Unexpected WireMock requests: POST /unexpected');
    await expect(boundary._after()).rejects.not.toThrow('private');
  });

  it('fails if mock verification is unavailable', async () => {
    global.fetch.mockResolvedValue({ok: false, status: 503});
    await expect(boundary._after()).rejects.toThrow('returned 503');
  });
});
