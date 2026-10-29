import config from 'config';
import express from 'express';
import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'fs';
import {get, has} from 'lodash';
import {tmpdir} from 'os';
import {join} from 'path';
import * as propertiesVolume from '@hmcts/properties-volume';
import {PropertiesVolume} from 'modules/properties-volume';

jest.mock('config', () => ({get: jest.fn(), has: jest.fn()}));
jest.mock('@hmcts/properties-volume', () => ({addTo: jest.fn()}));

describe('mounted secrets with properties-volume', () => {
  const actualVolume = jest.requireActual<typeof propertiesVolume>('@hmcts/properties-volume');
  const settings = config as unknown as Record<string, unknown>;
  const server = express();
  server.locals.ENV = 'production';
  let directory: string;
  let mountPoint: string;

  beforeEach(() => {
    jest.clearAllMocks();
    for (const key of Object.keys(settings)) {
      if (key !== 'get' && key !== 'has') delete settings[key];
    }
    settings.services = {idam: {url: 'https://idam.example.test', clientSecret: 'configured-default'}};
    directory = mkdtempSync(join(tmpdir(), 'cui-properties-volume-'));
    mountPoint = join(directory, 'secrets');
    (config.get as jest.Mock).mockImplementation((key: string) => get(settings, key));
    (config.has as jest.Mock).mockImplementation((key: string) => has(settings, key));
    jest.mocked(propertiesVolume.addTo).mockImplementation(target => actualVolume.addTo(target, {mountPoint}));
  });

  afterEach(() => {
    rmSync(directory, {recursive: true, force: true});
  });

  it('reads and trims mounted secrets through the application mapping while preserving other settings', () => {
    const vault = join(mountPoint, 'civil-cui');
    mkdirSync(vault, {recursive: true});
    writeFileSync(join(vault, 'citizen-ui-idam-secret'), '  mounted-test-secret\n');
    writeFileSync(join(vault, 'appinsights-instrumentation-key'), 'test-instrumentation-key\n');
    settings.secrets = {'civil-cui': {retained: 'existing-secret'}};

    new PropertiesVolume().enableFor(server);

    expect(propertiesVolume.addTo).toHaveBeenCalledWith(config);
    expect(config.get('services.idam.clientSecret')).toBe('mounted-test-secret');
    expect(config.get('services.idam.url')).toBe('https://idam.example.test');
    expect(config.get('appInsights.instrumentationKey')).toBe('test-instrumentation-key');
    expect(config.get('secrets.civil-cui.retained')).toBe('existing-secret');
  });

  it('preserves configured defaults when no secrets volume is mounted', () => {
    expect(() => new PropertiesVolume().enableFor(server)).not.toThrow();

    expect(config.get('services.idam.clientSecret')).toBe('configured-default');
    expect(config.get('services.idam.url')).toBe('https://idam.example.test');
    expect(config.has('secrets')).toBe(false);
  });
});
