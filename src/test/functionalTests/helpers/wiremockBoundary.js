const Helper = require('@codeceptjs/helper');

module.exports = class WiremockBoundary extends Helper {
  async request(endpoint, method = 'GET') {
    if (!this.config.url) throw new Error('Optimised functional tests require WIREMOCK_URL');
    const response = await fetch(`${this.config.url}${endpoint}`, {
      method,
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`WireMock ${endpoint} returned ${response.status}`);
    return response;
  }

  async _before() {
    // One worker owns the mock. Keep the request journal for failure diagnostics.
    await this.request('/__admin/scenarios/reset', 'POST');
  }

  async _after() {
    const response = await this.request('/__admin/requests/unmatched');
    const {requests} = await response.json();
    if (!Array.isArray(requests)) throw new Error('WireMock returned no unmatched-request inventory');
    if (requests.length) {
      // Do not expose request bodies, credentials or query values in test output.
      const paths = requests.map(request => `${request.method} ${new URL(request.url, this.config.url).pathname}`);
      throw new Error(`Unexpected WireMock requests: ${paths.join(', ')}`);
    }
  }
};
