import {ClientSecretCredential} from '@azure/identity';
import {createHttpHeaders, HttpClient, PipelineRequest} from '@azure/core-rest-pipeline';

jest.retryTimes(0);

// Exercise Identity's real MSAL adapter: its supported range still selects the
// vulnerable MSAL 6 release, so PR2 overrides it with the fixed MSAL 7 release.
// The injected transport handles every request without opening network sockets.
describe('Azure Identity with the patched MSAL dependency', () => {
  const tenantId = '11111111-1111-4111-8111-111111111111';
  const clientId = '22222222-2222-4222-8222-222222222222';
  const authority = `https://login.microsoftonline.com/${tenantId}`;
  const scope = 'https://vault.azure.net/.default';
  const tokenUrl = `${authority}/oauth2/v2.0/token`;

  function credentialWithTransport(tokenStatus: number, tokenBody: Record<string, unknown>) {
    const requests: {method: string; url: string; body: string}[] = [];
    const httpClient: HttpClient = {
      async sendRequest(request: PipelineRequest) {
        const endpoint = new URL(request.url);
        endpoint.search = ''; // MSAL adds its per-request correlation ID.
        requests.push({method: request.method, url: endpoint.href, body: String(request.body ?? '')});
        if (request.method === 'POST' && endpoint.href === tokenUrl) {
          return {request, status: tokenStatus, headers: createHttpHeaders(), bodyAsText: JSON.stringify(tokenBody)};
        }
        throw new Error(`Unexpected credential request: ${request.method} ${request.url}`);
      },
    };
    return {
      credential: new ClientSecretCredential(tenantId, clientId, 'fixture-secret', {
        httpClient,
        disableInstanceDiscovery: true,
        retryOptions: {maxRetries: 0},
      }),
      requests,
    };
  }

  it('exchanges client credentials through Identity and reuses the cached token', async () => {
    const {credential, requests} = credentialWithTransport(200, {
      access_token: 'fixture-access-token', token_type: 'Bearer', expires_in: 3600,
    });

    const token = await credential.getToken(scope);
    expect(token.token).toBe('fixture-access-token');
    expect(token.expiresOnTimestamp).toBeGreaterThan(Date.now());
    expect(await credential.getToken(scope)).toEqual(token);

    const exchanges = requests.filter(request => request.method === 'POST');
    expect(exchanges).toHaveLength(1);
    expect(exchanges[0].url).toBe(tokenUrl);
    const parameters = new URLSearchParams(exchanges[0].body);
    expect(parameters.get('client_id')).toBe(clientId);
    expect(parameters.get('client_secret')).toBe('fixture-secret');
    expect(parameters.get('grant_type')).toBe('client_credentials');
    expect(parameters.get('scope')).toBe(scope);
  });

  it('propagates a rejected credential instead of returning or caching a token', async () => {
    const {credential, requests} = credentialWithTransport(400, {
      error: 'invalid_client', error_description: 'Fixture credential rejected',
    });

    await expect(credential.getToken(scope)).rejects.toThrow('invalid_client');
    await expect(credential.getToken(scope)).rejects.toThrow('invalid_client');
    expect(requests.filter(request => request.method === 'POST')).toHaveLength(2);
  });
});
