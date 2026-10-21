import {mkdtempSync, writeFileSync, rmSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';
import {spawnSync} from 'child_process';
const {loadMappings, matchMapping} = require('../../../../../bin/ui-preview-mappings.cjs');
const {isolatedEnvironment, waitForCatalogue} = require('../../../../../bin/ui-preview.cjs');

describe('preview tooling boundaries', () => {
  it.each(['direct', 'connect', 'createConnection', 'http', 'https'].flatMap(api =>
    ['single', 'mixed'].map(answer => [api, answer])))(
    'blocks %s custom lookup with %s addresses before any native connection', (api, answer) => {
      const script = `
        const net = require('node:net');
        // Record the native boundary without sending traffic, even with a broken guard.
        const tcp = process.binding('tcp_wrap').TCP.prototype;
        const attempts = [];
        for (const method of ['connect', 'connect6']) tcp[method] = function (request, address, port) {
          attempts.push({address, port}); return -13;
        };
        require('./bin/ui-preview-network.cjs');
        let lookedUp = false;
        const options = {
          host: 'localhost', port: 443, autoSelectFamily: process.argv[2] === 'mixed',
          lookup: (host, options, callback) => {
            lookedUp = true;
            if (options.all) callback(null, [{address:'127.0.0.1', family:4}, {address:'192.0.2.1', family:4}]);
            else callback(null, '192.0.2.1', 4);
          }
        };
        const api = process.argv[1];
        const connection = api === 'direct' ? new net.Socket().connect(options)
          : api === 'connect' ? net.connect(options)
          : api === 'createConnection' ? net.createConnection(options)
          : require('node:' + api).get({...options, agent:false});
        connection.on('error', error => {
          console.log(JSON.stringify({lookedUp, attempts, error:error.message}));
          connection.destroy();
        });
      `;
      const result = spawnSync(process.execPath, ['-e', script, api, answer], {cwd: process.cwd(), encoding: 'utf8'});
      expect(result.status).toBe(0);
      const report = JSON.parse(result.stdout.trim());
      expect(report.lookedUp).toBe(true);
      expect(report.attempts).toEqual([]);
      expect(report.error).toContain('Preview blocked external connection: 192.0.2.1');
    });
  it.each([
    {host: 'localhost', address: '127.0.0.1', custom: true, allowed: true},
    {host: 'localhost', address: '::1', custom: true, allowed: true},
    {host: 'localhost', address: '::ffff:127.0.0.1', custom: true, allowed: false},
    {host: 'localhost', address: '192.0.2.1', custom: false, allowed: false},
    {host: 'wiremock', address: '172.20.0.2', custom: false, allowed: true},
    {host: 'wiremock', address: '192.0.2.1', custom: true, allowed: false},
  ])('checks resolution of $host to $address with custom=$custom', scenario => {
    const script = `
      const net = require('node:net'), dns = require('node:dns');
      const scenario = JSON.parse(process.argv[1]);
      const tcp = process.binding('tcp_wrap').TCP.prototype;
      const attempts = [];
      for (const method of ['connect', 'connect6']) tcp[method] = function (request, address) {
        attempts.push(address); return -13;
      };
      const resolve = (host, options, callback) => callback(null, scenario.address, net.isIP(scenario.address));
      if (!scenario.custom) dns.lookup = resolve;
      require('./bin/ui-preview-network.cjs');
      const connection = net.createConnection({
        host:scenario.host, port:443, autoSelectFamily:false,
        ...(scenario.custom ? {lookup:resolve} : {})
      });
      connection.on('error', error => {
        console.log(JSON.stringify({attempts, error:error.message}));
        connection.destroy();
      });
    `;
    const result = spawnSync(process.execPath, ['-e', script, JSON.stringify(scenario)], {
      cwd: process.cwd(), encoding: 'utf8', env: {...process.env, UI_PREVIEW_CONTAINER: 'true'},
    });
    expect(result.status).toBe(0);
    const report = JSON.parse(result.stdout.trim());
    expect(report.attempts).toEqual(scenario.allowed ? [scenario.address] : []);
    expect(report.error).toMatch(scenario.allowed ? /EACCES/ : /Preview (blocked external connection|requires the system resolver)/);
  });
  it.each(['direct', 'connect', 'createConnection', 'positional', 'http', 'https', 'unix-options', 'unix-path'])(
    'blocks %s connections before reaching the underlying socket', api => {
      // A separate process keeps globals isolated. Replace the final operation
      // before loading the guard so even a regression cannot send external traffic.
      const script = `
        const net = require('node:net');
        let connected = false;
        net.Socket.prototype.connect = function () { connected = true; return this; };
        require('./bin/ui-preview-network.cjs');
        const options = {host: '203.0.113.1', port: 80};
        let error;
        try {
          const api = process.argv[1];
          if (api === 'direct') new net.Socket().connect(options);
          if (api === 'connect') net.connect(options);
          if (api === 'createConnection') net.createConnection(options);
          if (api === 'positional') net.connect(80, options.host);
          if (api.startsWith('unix')) net.connect(api === 'unix-path' ? '/tmp/preview-test.sock' : {path: '/tmp/preview-test.sock'});
          if (api === 'http' || api === 'https') {
            const request = require('node:' + api).get({...options, agent: false});
            request.on('error', value => {error = value.message;});
            request.destroy();
          }
        } catch (value) { error = value.message; }
        setImmediate(() => console.log(JSON.stringify({connected, error})));
      `;
      const result = spawnSync(process.execPath, ['-e', script, api], {cwd: process.cwd(), encoding: 'utf8'});
      expect(result.status).toBe(0);
      const report = JSON.parse(result.stdout.trim());
      expect(report.connected).toBe(false);
      expect(report.error).toMatch(/Preview (blocked external connection|does not use Unix service sockets)/);
    });
  it.each(['127.0.0.1', '::1', 'localhost', 'wiremock'])('permits the configured local destination %s', host => {
    const script = `
      const net = require('node:net');
      let connected = false;
      net.Socket.prototype.connect = function () { connected = true; return this; };
      require('./bin/ui-preview-network.cjs');
      net.createConnection({host: process.argv[1], port: 1111}).destroy();
      console.log(JSON.stringify({connected}));
    `;
    const result = spawnSync(process.execPath, ['-e', script, host], {
      cwd: process.cwd(), encoding: 'utf8', env: {...process.env, UI_PREVIEW_CONTAINER: host === 'wiremock' ? 'true' : 'false'},
    });
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout.trim())).toEqual({connected: true});
  });
  it('discovers nonempty explicit scenario mappings and never falls back to a remote service', () => {
    const mappings = loadMappings(join(process.cwd(), 'compose/ui-preview-mappings'));
    expect(mappings.length).toBeGreaterThanOrEqual(26);
    for (const id of ['1645882162449409', '1645882162449601', '1645882162449602', '1645882162449603', '1645882162449604', '1645882162449605']) {
      expect(matchMapping(mappings, 'GET', new URL(`http://localhost/cases/${id}`)).response.jsonBody.id).toBe(id);
    }
    expect(matchMapping(mappings, 'GET', new URL('http://localhost/cases/9999999999999999'))).toBeUndefined();
    expect(matchMapping(mappings, 'GET', new URL('http://localhost/unknown'))).toBeUndefined();
  });
  it('returns hearing tasks only for the case-progression claimant', () => {
    const mappings = loadMappings(join(process.cwd(), 'compose/ui-preview-mappings'));
    for (const id of ['1645882162449409', '1645882162449601', '1645882162449602', '1645882162449603', '1645882162449604', '1645882162449605']) {
      for (const role of ['CLAIMANT', 'DEFENDANT']) {
        const tasks = matchMapping(mappings, 'GET', new URL(`http://localhost/dashboard/taskList/${id}/role/${role}`)).response.jsonBody;
        if (id === '1645882162449603' && role === 'CLAIMANT') {
          expect(tasks).toHaveLength(2);
          expect(tasks.map((task: {role: string}) => task.role)).toEqual(['claimant', 'claimant']);
          for (const language of ['En', 'Cy']) {
            expect(tasks.map((task: Record<string, string>) => task[`taskName${language}`].match(/href="([^"]+)"/)?.[1])).toEqual([
              `/case/${id}/case-progression/upload-your-documents`, `/dashboard/${id}/claimantNewDesign`,
            ]);
          }
        } else expect(tasks).toEqual([]);
      }
    }
  });
  it.each(['empty', 'duplicate', 'proxy', 'catch-all', 'missing-fixture', 'unresolved'])('rejects %s mappings', kind => {
    const dir = mkdtempSync(join(tmpdir(), 'preview-map-'));
    const mapping = {request: {method: 'GET', urlPath: '/cases/1645882162449601'}, response: {status: 200, jsonBody: {id: '1645882162449601'}}} as {request: {method: string; urlPath?: string; urlPathPattern?: string}; response: {status: number; jsonBody: {id: string}; proxyBaseUrl?: string; bodyFileName?: string}};
    if (kind === 'proxy') mapping.response.proxyBaseUrl = 'https://example.test';
    if (kind === 'catch-all') {delete mapping.request.urlPath; mapping.request.urlPathPattern = '/.*';}
    if (kind === 'missing-fixture') mapping.response.bodyFileName = 'missing.json';
    if (kind === 'unresolved') mapping.request.urlPath = '/cases/:id';
    writeFileSync(join(dir, 'sample.json'), JSON.stringify({mappings: kind === 'empty' ? [] : kind === 'duplicate' ? [mapping, mapping] : [mapping]}));
    try {expect(() => loadMappings(dir)).toThrow();} finally {rmSync(dir, {recursive: true});}
  });
  it('constructs an explicit service environment, omitting inherited credentials and proxy configuration', () => {
    const before = {...process.env};
    try {
      process.env.HTTP_PROXY = 'http://external'; process.env.APPINSIGHTS_KEY = 'secret'; process.env.NODE_CONFIG = 'unsafe';
      const env = isolatedEnvironment('http://127.0.0.1:1111', '/tmp/preview-runtime');
      expect(env.HTTP_PROXY).toBeUndefined(); expect(env.APPINSIGHTS_KEY).toBeUndefined();
      const config = JSON.parse(env.NODE_CONFIG);
      expect(config.services.civilService.url).toBe('http://127.0.0.1:1111'); expect(config.services.generalApplication.url).toBe('http://127.0.0.1:1111');
      expect(config.appInsights.instrumentationKey).toBe(''); expect(env.HOME).toBe('/tmp/preview-runtime');
      expect(env.UI_PREVIEW_ENABLED).toBe('true');
    } finally {process.env = before;}
  });
  it('fails readiness immediately after its owned child exits', async () => {
    await expect(waitForCatalogue('http://127.0.0.1:1/ui-preview', () => false, 1)).rejects.toThrow('expected seeded catalogue');
  });
});
