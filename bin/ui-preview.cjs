const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const http = require('node:http');
const net = require('node:net');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const defaults = () => ({
  appPort: Number(process.env.UI_PREVIEW_PORT || 3001), stubPort: Number(process.env.UI_PREVIEW_STUB_PORT || 1111),
  controlPort: Number(process.env.UI_PREVIEW_CONTROL_PORT || 3111),
  directory: process.env.UI_PREVIEW_RUNTIME_DIR || path.join(os.tmpdir(), `cui-ui-preview-${process.getuid?.() || 0}-${crypto.createHash('sha256').update(root).digest('hex').slice(0, 12)}`),
});
function isolatedEnvironment(stubUrl, directory) {
  // Explicit allowlist. No credentials, proxy variables, .env or NODE_CONFIG
  // inherited from a developer's ordinary application environment.
  return {
    PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT, LANG: 'en_GB.UTF-8',
    HOME: directory, TMPDIR: directory, XDG_CACHE_HOME: path.join(directory, 'cache'),
    NODE_ENV: 'e2eTest', UI_PREVIEW_ENABLED: 'true',
    UI_PREVIEW_FIXTURE_NOW: process.env.UI_PREVIEW_FIXTURE_NOW || new Date().toISOString(),
    NODE_OPTIONS: `--require=${path.join(__dirname, 'ui-preview-network.cjs')}`,
    NODE_CONFIG: JSON.stringify({services: {
      civilService: {url: stubUrl}, generalApplication: {url: stubUrl},
      postcodeLookup: {ordnanceSurveyApiUrl: stubUrl, ordnanceSurveyApiKey: 'synthetic'},
      dmStore: {baseUrl: stubUrl}, serviceAuthProvider: {baseUrl: stubUrl},
      draftStore: {legacy: {url: stubUrl}},
      idam: {url: stubUrl, tokenURL: stubUrl, authorizationURL: `${stubUrl}/oidc-disabled`, hmctsAccessURL: stubUrl},
      cmc: {url: stubUrl}, pcq: {url: stubUrl}, govPay: {url: stubUrl},
    }, appInsights: {instrumentationKey: ''}, webChat: {cnbc: {enabled: false}, mediation: {enabled: false}}}),
    YARN_ENABLE_NETWORK: '0', YARN_ENABLE_SCRIPTS: '0', YARN_ENABLE_TELEMETRY: '0',
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1', PUPPETEER_SKIP_DOWNLOAD: '1', PACT_DO_NOT_TRACK: '1',
    LOG_LEVEL: 'ERROR',
  };
}
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, {...options, timeout: 1500}, res => {
      let body = ''; res.on('data', data => {body += data;}); res.on('end', () => resolve({status: res.statusCode, headers: res.headers, body}));
    });
    req.on('timeout', () => req.destroy(new Error('Preview request timed out')));
    req.on('error', reject); req.end();
  });
}
function available(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', () => reject(new Error(`Port ${port} is occupied. Stop its owner yourself or choose another UI_PREVIEW_*_PORT; no process was terminated.`)));
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}
async function waitForCatalogue(url, alive, timeout = 60000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline && alive()) {
    try {
      const result = await request(url);
      if (result.status === 200 && result.headers['x-ui-preview'] === 'synthetic-local-only' && result.body.includes('Local UI preview')) return;
    } catch { /* retry only this owned application's readiness */ }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error('Preview readiness failed: expected seeded catalogue response, not just an open port. Inspect preview logs.');
}
async function main(command = process.argv[2] || 'up') {
  const settings = defaults();
  for (const port of [settings.appPort, settings.stubPort, settings.controlPort]) {
    if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid preview port');
  }
  if (new Set([settings.appPort, settings.stubPort, settings.controlPort]).size !== 3) throw new Error('Preview ports must differ');
  const stateFile = path.join(settings.directory, 'state.json');
  if (['down', 'logs', 'reset'].includes(command)) {
    if (command === 'logs') {
      process.stdout.write(fs.readFileSync(path.join(settings.directory, 'application.log'), 'utf8')); return;
    }
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    const result = await request(`http://127.0.0.1:${state.controlPort}/stop`, {method: 'POST', headers: {'X-Preview-Token': state.token}});
    if (result.status !== 202) throw new Error('The preview ownership token was rejected; no process was signalled');
    if (command === 'reset') {
      for (let i = 0; i < 100 && fs.existsSync(stateFile); i++) await new Promise(resolve => setTimeout(resolve, 100));
      if (fs.existsSync(stateFile)) throw new Error('Old preview did not finish stopping');
      return main('up');
    }
    return;
  }
  if (command !== 'up') throw new Error('Usage: ui-preview.sh up|down|logs|reset');
  if (process.versions.node !== '24.21.0') throw new Error('Use the configured Node 24.21.0; the launcher never downloads runtimes');
  if (!fs.existsSync(path.join(root, 'node_modules/ts-node/register/index.js')) || !fs.existsSync(path.join(root, 'src/main/views/webpack/js.njk'))) {
    throw new Error('Missing locked dependencies or built assets. Install immutably with --mode=skip-build and run yarn build first.');
  }
  for (const port of [settings.appPort, settings.stubPort, settings.controlPort]) await available(port);
  fs.mkdirSync(settings.directory, {recursive: true, mode: 0o700});
  const token = crypto.randomBytes(32).toString('hex');
  const env = {...isolatedEnvironment(`http://127.0.0.1:${settings.stubPort}`, settings.directory), PORT: String(settings.appPort), UI_PREVIEW_STUB_PORT: String(settings.stubPort)};
  const log = fs.openSync(path.join(settings.directory, 'application.log'), 'w', 0o600);
  const children = [];
  let stopping = false;
  const control = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/stop' && req.headers['x-preview-token'] === token) {
      res.writeHead(202); res.end('Stopping owned preview processes'); void stop();
    } else {res.writeHead(404); res.end();}
  });
  async function stop() {
    if (stopping) return; stopping = true;
    await Promise.all(children.map(child => new Promise(resolve => {
      if (child.exitCode !== null || child.signalCode !== null) return resolve();
      child.once('exit', resolve); child.kill('SIGTERM'); // Only ChildProcess objects created by this supervisor.
    })));
    control.close(); fs.closeSync(log); fs.rmSync(stateFile, {force: true});
  }
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
  try {
    await new Promise(resolve => control.listen(settings.controlPort, '127.0.0.1', resolve));
    fs.writeFileSync(stateFile, JSON.stringify({controlPort: settings.controlPort, token}), {mode: 0o600});
    const launch = args => {
      const child = spawn(process.execPath, args, {cwd: root, env, stdio: ['ignore', log, log]}); children.push(child);
      child.once('error', error => {console.error(error.message); void stop();});
      child.once('exit', () => {if (!stopping) {process.exitCode = 1; void stop();}}); return child;
    };
    const stub = launch(['bin/ui-preview-stubs.cjs']);
    const app = launch(['-r', 'ts-node/register/transpile-only', '-r', 'tsconfig-paths/register', 'src/main/server.ts']);
    await waitForCatalogue(`http://127.0.0.1:${settings.appPort}/ui-preview`, () => !stopping && app.exitCode === null && app.signalCode === null && stub.exitCode === null && stub.signalCode === null);
    console.log(`Local synthetic UI preview: http://127.0.0.1:${settings.appPort}/ui-preview\nLogs: ${settings.directory}/application.log\nStop: yarn start:ui-preview:down`);
  } catch (error) {const cancelled = stopping; await stop(); if (!cancelled) throw error;}
}
module.exports = {isolatedEnvironment, waitForCatalogue, available, request};
if (require.main === module) main().catch(error => {console.error(error.message); process.exitCode = 1;});
