import puppeteer, {Browser, Page} from 'puppeteer';

export const CAPTURE_LAUNCH_TIMEOUT_MS = 15_000;
export const CAPTURE_WORK_TIMEOUT_MS = 30_000;
export const CAPTURE_CLOSE_TIMEOUT_MS = 5_000;
export const CAPTURE_ATTEMPTS = 3;
export const CAPTURE_RETRY_DELAY_MS = 1_000;
export const CAPTURE_ATTEMPT_TIMEOUT_MS = CAPTURE_LAUNCH_TIMEOUT_MS + CAPTURE_WORK_TIMEOUT_MS + CAPTURE_CLOSE_TIMEOUT_MS;
// The outer Mocha timer includes every attempt, delay and cleanup, plus scheduling margin.
export const CAPTURE_TEST_TIMEOUT_MS = CAPTURE_ATTEMPTS * CAPTURE_ATTEMPT_TIMEOUT_MS
  + (CAPTURE_ATTEMPTS - 1) * CAPTURE_RETRY_DELAY_MS + 5_000;

async function within<T>(operation: Promise<T>, timeout: number, message: () => string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(message())), timeout);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// Own a fresh browser per attempt, including timed-out work. Supplying the page
// to Pa11y lets us restrict requests before navigation, without rewriting captures.
export async function withCapturePage<T>(url: string, inspect: (page: Page, browser: Browser) => Promise<T>): Promise<T> {
  const origin = new URL(url);
  if (origin.protocol !== 'http:' || origin.hostname !== '127.0.0.1') {
    throw new Error('Accessibility captures must use the local capture server');
  }
  let browser: Browser;
  let failure: Error;
  let result: T;
  let phase = 'browser launch';
  const started = Date.now();
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      timeout: CAPTURE_LAUNCH_TIMEOUT_MS,
      protocolTimeout: CAPTURE_WORK_TIMEOUT_MS,
    });
    result = await within((async () => {
      phase = 'page setup';
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on('request', request => {
        const resource = new URL(request.url());
        const allowed = resource.origin === origin.origin || resource.protocol === 'data:';
        // Requests can finish while a timed-out page is being closed.
        void (allowed ? request.continue() : request.abort('blockedbyclient')).catch(error => {
          if (!page.isClosed()) console.error(`Capture resource handling failed: ${errorMessage(error)}`);
        });
      });
      phase = 'navigation';
      await page.goto(url, {waitUntil: 'networkidle2', timeout: CAPTURE_WORK_TIMEOUT_MS});
      phase = 'page checks';
      return inspect(page, browser);
    })(), CAPTURE_WORK_TIMEOUT_MS, () => `${phase} exceeded ${CAPTURE_WORK_TIMEOUT_MS}ms`);
  } catch (error) {
    failure = Object.assign(new Error(`Accessibility capture ${url}: ${phase} failed after ${Date.now() - started}ms: ${errorMessage(error)}`), {cause: error});
  }
  if (browser) {
    try {
      await within(browser.close(), CAPTURE_CLOSE_TIMEOUT_MS, () => 'browser cleanup timed out');
    } catch (error) {
      // Kill only the browser created by this attempt, never another worker's process.
      browser.process()?.kill('SIGKILL');
      const cleanupFailure = Object.assign(new Error(`Accessibility capture ${url}: browser cleanup failed: ${errorMessage(error)}`), {cause: error});
      if (failure) console.error(cleanupFailure);
      else failure = cleanupFailure;
    }
  }
  if (failure) throw failure;
  return result;
}

export async function retryCapture<T>(scan: () => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= CAPTURE_ATTEMPTS; attempt++) {
    try {
      return await scan();
    } catch (error) {
      console.error(`Accessibility capture attempt ${attempt}/${CAPTURE_ATTEMPTS}: ${errorMessage(error)}`);
      if (attempt === CAPTURE_ATTEMPTS) throw error;
      await new Promise(resolve => setTimeout(resolve, CAPTURE_RETRY_DELAY_MS));
    }
  }
  throw new Error('Accessibility capture attempts exhausted');
}
