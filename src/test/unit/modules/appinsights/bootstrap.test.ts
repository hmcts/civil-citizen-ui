import {readFileSync} from 'fs';
import * as path from 'path';

/**
 * App Insights SDK 3 collects requests and dependencies through OpenTelemetry, which instruments
 * http, https, express and axios as they are required. Starting it after those modules have loaded
 * produces no request or dependency telemetry at all: prod recorded zero of both from 5 Nov 2026,
 * with only exceptions still arriving, because trackException does not depend on instrumentation.
 *
 * These tests pin the two things that keep the fix working: the order inside the bootstrap, and the
 * bootstrap staying the first thing server.ts loads.
 */
describe('appinsights bootstrap', () => {
  const calls: string[] = [];
  const mockEnable = jest.fn();
  const mockExpressInstrumentation = jest.fn();
  const mockRegisterInstrumentations = jest.fn();

  beforeEach(() => {
    calls.length = 0;
    mockEnable.mockReset().mockImplementation(() => {
      calls.push('appinsights.enable');
      return true;
    });
    mockExpressInstrumentation.mockReset().mockImplementation(() => {
      calls.push('express.instrumentation');
    });
    mockRegisterInstrumentations.mockReset().mockImplementation(() => calls.push('instrumentations.register'));
    jest.resetModules();

    jest.doMock('../../../../main/common/logging/piiRedaction', () => ({
      installPiiLoggingRedaction: jest.fn(() => calls.push('piiRedaction')),
    }));
    jest.doMock('../../../../main/modules/properties-volume', () => ({
      PropertiesVolume: {enable: jest.fn((env: string) => calls.push(`propertiesVolume:${env}`))},
    }));
    jest.doMock('../../../../main/modules/appinsights/index', () => ({
      AppInsights: jest.fn(() => ({enable: mockEnable})),
    }));
    jest.doMock('@opentelemetry/instrumentation-express', () => ({ExpressInstrumentation: mockExpressInstrumentation}));
    jest.doMock('@opentelemetry/instrumentation', () => ({registerInstrumentations: mockRegisterInstrumentations}));
  });

  afterEach(() => {
    jest.dontMock('../../../../main/common/logging/piiRedaction');
    jest.dontMock('../../../../main/modules/properties-volume');
    jest.dontMock('../../../../main/modules/appinsights/index');
    jest.dontMock('@opentelemetry/instrumentation-express');
    jest.dontMock('@opentelemetry/instrumentation');
  });

  it('redacts, loads secrets, starts App Insights, then registers Express instrumentation', () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      jest.isolateModules(() => {
        require('../../../../main/modules/appinsights/bootstrap');
      });
    } finally {
      process.env.NODE_ENV = previous;
    }

    // The secrets must load before App Insights: the chart supplies the instrumentation key only
    // through the properties volume, so starting App Insights first disables telemetry entirely.
    expect(calls).toEqual([
      'piiRedaction', 'propertiesVolume:production', 'appinsights.enable',
      'express.instrumentation', 'instrumentations.register',
    ]);
    expect(mockEnable).toHaveBeenCalledTimes(1);
    expect(mockExpressInstrumentation).toHaveBeenCalledTimes(1);
    expect(mockExpressInstrumentation).toHaveBeenCalledWith({emitLayerSpans: false});
    expect(mockRegisterInstrumentations).toHaveBeenCalledTimes(1);
    expect(mockRegisterInstrumentations).toHaveBeenCalledWith({
      instrumentations: [mockExpressInstrumentation.mock.instances[0]],
    });
  });

  it('does not register Express instrumentation when App Insights is not configured', () => {
    mockEnable.mockReturnValue(false);
    jest.isolateModules(() => require('../../../../main/modules/appinsights/bootstrap'));
    expect(mockExpressInstrumentation).not.toHaveBeenCalled();
    expect(mockRegisterInstrumentations).not.toHaveBeenCalled();
  });

  it('falls back to development when NODE_ENV is unset', () => {
    const previous = process.env.NODE_ENV;
    delete process.env.NODE_ENV;
    try {
      jest.isolateModules(() => {
        require('../../../../main/modules/appinsights/bootstrap');
      });
    } finally {
      process.env.NODE_ENV = previous;
    }

    expect(calls).toContain('propertiesVolume:development');
  });
});

describe('server entry point', () => {
  const source = readFileSync(path.join(__dirname, '../../../../main/server.ts'), 'utf8');

  it('loads the appinsights bootstrap before anything else', () => {
    // Anything loaded above the bootstrap is never instrumented, so the first module server.ts
    // pulls in has to be the bootstrap. Adding an import above this line reintroduces the outage.
    const firstModule = source
      .split('\n')
      .map(line => line.trim())
      .map(line => line.match(/^(?:import\s[^']*'([^']+)'|(?:const|let|var)\s.*require\('([^']+)'\))/))
      .find(match => match !== null);

    expect(firstModule).not.toBeNull();
    expect(firstModule[1] ?? firstModule[2]).toBe('./modules/appinsights/bootstrap');
  });

  it('no longer starts App Insights from app.ts, where express is already loaded', () => {
    const appSource = readFileSync(path.join(__dirname, '../../../../main/app.ts'), 'utf8');
    expect(appSource).not.toMatch(/new\s+AppInsights\s*\(\s*\)\s*\.\s*enable\s*\(/);
  });
});
