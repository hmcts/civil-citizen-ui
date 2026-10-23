import http from 'http';
import {spawn} from 'child_process';
import {mkdtempSync, readFileSync, existsSync, rmSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';
const {available, waitForCatalogue, request} = require('../../../bin/ui-preview.cjs');

describe('owned local preview launcher', () => {
  it('rejects an occupied port and a false readiness response without terminating their owners', async () => {
    const server = http.createServer((_req, res) => res.end('unrelated HTTP 200'));
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address() as {port: number};
    try {
      await expect(available(address.port)).rejects.toThrow('occupied');
      await expect(waitForCatalogue(`http://127.0.0.1:${address.port}`, () => true, 20)).rejects.toThrow('readiness failed');
      expect((await request(`http://127.0.0.1:${address.port}`)).body).toBe('unrelated HTTP 200');
    } finally {await new Promise<void>(resolve => server.close(() => resolve()));}
  });
  it('starts the real application, rejects unowned shutdown, and stops only its own children', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'preview-launcher-'));
    // Reserve three OS-assigned ports, then release immediately before launch.
    const holders = [http.createServer(), http.createServer(), http.createServer()];
    for (const server of holders) await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const ports = holders.map(server => (server.address() as {port: number}).port);
    for (const server of holders) await new Promise<void>(resolve => server.close(() => resolve()));
    const env = {...process.env, UI_PREVIEW_PORT: String(ports[0]), UI_PREVIEW_STUB_PORT: String(ports[1]), UI_PREVIEW_CONTROL_PORT: String(ports[2]), UI_PREVIEW_RUNTIME_DIR: directory};
    const child = spawn(process.execPath, ['bin/ui-preview.cjs', 'up'], {env, cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe']});
    let output = ''; child.stdout.on('data', data => {output += data;}); child.stderr.on('data', data => {output += data;});
    const exited = new Promise<number | null>(resolve => child.once('exit', resolve));
    try {
      await waitForCatalogue(`http://127.0.0.1:${ports[0]}/ui-preview`, () => child.exitCode === null, 45000);
      const state = JSON.parse(readFileSync(join(directory, 'state.json'), 'utf8'));
      const denied = await request(`http://127.0.0.1:${ports[2]}/stop`, {method: 'POST', headers: {'X-Preview-Token': 'not-the-owner'}});
      expect(denied.status).toBe(404);
      expect((await request(`http://127.0.0.1:${ports[0]}/ui-preview`)).status).toBe(200);
      const accepted = await request(`http://127.0.0.1:${ports[2]}/stop`, {method: 'POST', headers: {'X-Preview-Token': state.token}});
      expect(accepted.status).toBe(202); expect(await exited).toBe(0);
      expect(existsSync(join(directory, 'state.json'))).toBe(false);
      for (const port of ports) await expect(available(port)).resolves.toBeUndefined();
    } catch (error) {
      console.error(output, existsSync(join(directory, 'application.log')) ? readFileSync(join(directory, 'application.log'), 'utf8') : '');
      throw error;
    } finally {
      if (child.exitCode === null && child.signalCode === null) {child.kill('SIGTERM'); await exited;}
      rmSync(directory, {recursive: true, force: true});
    }
  }, 60000);
});

it('rejects failed fixture initialization without leaving either preview process listening', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'preview-seed-failure-'));
  const holders = [http.createServer(), http.createServer(), http.createServer()];
  for (const server of holders) await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const ports = holders.map(server => (server.address() as {port: number}).port);
  for (const server of holders) await new Promise<void>(resolve => server.close(() => resolve()));
  const child = spawn(process.execPath, ['bin/ui-preview.cjs', 'up'], {cwd: process.cwd(), env: {
    ...process.env, UI_PREVIEW_PORT: String(ports[0]), UI_PREVIEW_STUB_PORT: String(ports[1]), UI_PREVIEW_CONTROL_PORT: String(ports[2]),
    UI_PREVIEW_RUNTIME_DIR: directory, UI_PREVIEW_FIXTURE_NOW: 'invalid-fixture-clock',
  }, stdio: ['ignore', 'pipe', 'pipe']});
  child.stdout.resume(); child.stderr.resume();
  const exited = new Promise<number | null>(resolve => child.once('exit', resolve));
  try {
    expect(await exited).toBe(1);
    const log = readFileSync(join(directory, 'application.log'), 'utf8');
    expect(log).toContain('Preview fixture initialization failed');
    expect(log).toContain('Application startup failed');
    // Master deliberately redacts Error.message/stack; retain that protection.
    expect(existsSync(join(directory, 'state.json'))).toBe(false);
    for (const port of ports) await expect(available(port)).resolves.toBeUndefined();
  } finally {
    if (child.exitCode === null && child.signalCode === null) {child.kill('SIGTERM'); await exited;}
    rmSync(directory, {recursive: true, force: true});
  }
}, 50000);
