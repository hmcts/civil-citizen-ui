import puppeteer, {Browser, HTTPRequest} from 'puppeteer';
import {
  CAPTURE_CLOSE_TIMEOUT_MS, CAPTURE_LAUNCH_TIMEOUT_MS, CAPTURE_RETRY_DELAY_MS,
  CAPTURE_TEST_TIMEOUT_MS, CAPTURE_WORK_TIMEOUT_MS, retryCapture, withCapturePage,
} from '../../a11y/captureBrowser';

jest.mock('puppeteer', () => ({__esModule: true, default: {launch: jest.fn()}}));

describe('accessibility capture browser ownership', () => {
  const url = 'http://127.0.0.1:3000/capture';
  const page = {
    goto: jest.fn(), on: jest.fn(), setRequestInterception: jest.fn(), isClosed: jest.fn(),
  };
  const process = {kill: jest.fn()};
  const browser = {newPage: jest.fn(), close: jest.fn(), process: jest.fn()};
  const inspect = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(puppeteer.launch).mockResolvedValue(browser as unknown as Browser);
    browser.newPage.mockResolvedValue(page);
    browser.close.mockResolvedValue(undefined);
    browser.process.mockReturnValue(process);
    page.goto.mockResolvedValue(undefined);
    page.setRequestInterception.mockResolvedValue(undefined);
    page.isClosed.mockReturnValue(false);
    inspect.mockResolvedValue({issues: []});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('allows real local assets while blocking external resources and different local origins', async () => {
    await withCapturePage(url, inspect);
    expect(page.setRequestInterception).toHaveBeenCalledWith(true);
    expect(page.setRequestInterception.mock.invocationCallOrder[0]).toBeLessThan(page.goto.mock.invocationCallOrder[0]);
    const onRequest = page.on.mock.calls.find(([event]) => event === 'request')[1];
    for (const [resource, allowed] of [
      ['http://127.0.0.1:3000/main-dev.css', true],
      ['http://127.0.0.1:3000/main-dev.js', true],
      ['http://127.0.0.1:3000/assets/fonts/light-94a07e06a1-v2.woff2', true],
      ['data:image/png;base64,AAAA', true],
      ['blob:http://127.0.0.1:3000/local-image', true],
      ['https://www.googletagmanager.com/gtm.js', false],
      ['http://127.0.0.1:3001/third-party', false],
      ['https://127.0.0.1:3000/other-protocol', false],
    ] as const) {
      const request = {url: () => resource, continue: jest.fn().mockResolvedValue(undefined), abort: jest.fn().mockResolvedValue(undefined)};
      onRequest(request as unknown as HTTPRequest);
      expect(request.continue).toHaveBeenCalledTimes(allowed ? 1 : 0);
      expect(request.abort).toHaveBeenCalledTimes(allowed ? 0 : 1);
    }
    expect(page.goto).toHaveBeenCalledWith(url, {waitUntil: 'networkidle2', timeout: CAPTURE_WORK_TIMEOUT_MS});
    expect(inspect).toHaveBeenCalledWith(page, browser);
    expect(browser.close).toHaveBeenCalledTimes(1);
    expect(process.kill).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('rejects a non-capture target before starting a browser', async () => {
    await expect(withCapturePage('https://example.invalid', inspect)).rejects.toThrow('local capture server');
    expect(puppeteer.launch).not.toHaveBeenCalled();
  });

  it('retains the navigation error and closes the browser', async () => {
    page.goto.mockRejectedValue(new Error('Navigation timeout of 30000 ms exceeded'));
    await expect(withCapturePage(url, inspect)).rejects.toThrow(`${url}: navigation failed`);
    expect(inspect).not.toHaveBeenCalled();
    expect(browser.close).toHaveBeenCalledTimes(1);
  });

  it('bounds a stuck scan and closes its browser instead of leaving work running', async () => {
    inspect.mockImplementation(() => new Promise(() => undefined));
    const result = expect(withCapturePage(url, inspect)).rejects.toThrow('page checks exceeded 30000ms');
    await jest.advanceTimersByTimeAsync(CAPTURE_WORK_TIMEOUT_MS);
    await result;
    expect(browser.close).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('kills only its owned browser when cleanup stalls', async () => {
    browser.close.mockImplementation(() => new Promise(() => undefined));
    const result = expect(withCapturePage(url, inspect)).rejects.toThrow('browser cleanup failed');
    await jest.advanceTimersByTimeAsync(CAPTURE_CLOSE_TIMEOUT_MS);
    await result;
    expect(process.kill).toHaveBeenCalledTimes(1);
    expect(process.kill).toHaveBeenCalledWith('SIGKILL');
    expect(jest.getTimerCount()).toBe(0);
  });

  it('closes a timed-out navigation before starting the next attempt', async () => {
    page.goto.mockImplementationOnce(() => new Promise(() => undefined));
    const result = retryCapture(() => withCapturePage(url, inspect));
    await jest.advanceTimersByTimeAsync(CAPTURE_WORK_TIMEOUT_MS + CAPTURE_RETRY_DELAY_MS);
    await expect(result).resolves.toEqual({issues: []});
    expect(puppeteer.launch).toHaveBeenCalledTimes(2);
    expect(browser.close).toHaveBeenCalledTimes(2);
    expect(browser.close.mock.invocationCallOrder[0]).toBeLessThan(jest.mocked(puppeteer.launch).mock.invocationCallOrder[1]);
    expect(inspect).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('finishes all failed attempts and cleanup before the outer test deadline', async () => {
    jest.mocked(puppeteer.launch).mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(browser as unknown as Browser), CAPTURE_LAUNCH_TIMEOUT_MS - 1);
    }));
    inspect.mockImplementation(() => new Promise(() => undefined));
    browser.close.mockImplementation(() => new Promise(() => undefined));
    let settled = false;
    const result = retryCapture(() => withCapturePage(url, inspect)).catch(error => {
      settled = true;
      return error;
    });
    await jest.advanceTimersByTimeAsync(CAPTURE_TEST_TIMEOUT_MS - 1);
    expect(settled).toBe(true);
    expect(await result).toEqual(expect.objectContaining({message: expect.stringContaining('page checks exceeded 30000ms')}));
    expect(puppeteer.launch).toHaveBeenCalledTimes(3);
    expect(process.kill).toHaveBeenCalledTimes(3);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('returns completed accessibility issues without retrying them', async () => {
    const issues = {issues: [{type: 'error', code: 'contrast', message: 'Insufficient contrast'}]};
    inspect.mockResolvedValue(issues);
    await expect(retryCapture(() => withCapturePage(url, inspect))).resolves.toBe(issues);
    expect(puppeteer.launch).toHaveBeenCalledTimes(1);
  });
});
