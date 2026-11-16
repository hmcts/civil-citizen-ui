import express, {Express} from 'express';
import cookieParser from 'cookie-parser';
import {i18n} from 'i18next';
import {I18Next} from '../../../../main/modules/i18n';

type StackLayer = {
  handle: (req: unknown, res: unknown, next: (err?: unknown) => void) => void;
};

type LanguageRequest = {
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies?: Record<string, string>;
  url: string;
  path: string;
  originalUrl: string;
  language?: string;
};

const routerStack = (application: Express): StackLayer[] =>
  (application as unknown as {router: {stack: StackLayer[]}}).router.stack;

const app = express();
app.use(cookieParser());
const i18nInstance: i18n = I18Next.enableFor(app);

const waitUntilReady = async (): Promise<void> => {
  if (i18nInstance.isInitialized) {
    return;
  }
  await new Promise<void>((resolve) => {
    i18nInstance.on('initialized', () => resolve());
  });
};

const invoke = async (req: LanguageRequest): Promise<Record<string, string | string[]>> => {
  const headers: Record<string, string | string[]> = {};
  const res = {
    locals: {} as Record<string, unknown>,
    headersSent: false,
    cookie: jest.fn(),
    setHeader(name: string, value: string | string[]) {
      headers[name.toLowerCase()] = value;
    },
    getHeader(name: string) {
      return headers[name.toLowerCase()];
    },
    status: jest.fn().mockReturnThis(),
    end: jest.fn(),
    send: jest.fn(),
  };
  const stack = routerStack(app);
  const dispatch = (index: number): Promise<void> => {
    if (index >= stack.length) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      stack[index].handle(req, res, (err?: unknown) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(dispatch(index + 1));
      });
    });
  };
  await dispatch(0);
  return headers;
};

const setCookieHeaders = (headers: Record<string, string | string[]>): string[] => {
  const header = headers['set-cookie'];
  if (!header) {
    return [];
  }
  return Array.isArray(header) ? header : [header];
};

describe('language cookie', () => {
  beforeAll(async () => {
    await waitUntilReady();
  });

  it.each(['en', 'cy'])('sets a Secure cookie when switching to %s', async language => {
    const req: LanguageRequest = {
      query: {lang: language},
      headers: {},
      url: '/',
      path: '/',
      originalUrl: '/',
    };

    const headers = await invoke(req);

    expect(req.language).toBe(language);
    expect(setCookieHeaders(headers)).toEqual(expect.arrayContaining([
      expect.stringMatching(new RegExp(`^lang=${language};.*; Secure(?:;|$)`)),
    ]));
  });

  it('retains Welsh from the cookie on the next request', async () => {
    const req: LanguageRequest = {
      query: {},
      headers: {cookie: 'lang=cy'},
      url: '/',
      path: '/',
      originalUrl: '/',
    };

    await invoke(req);

    expect(req.language).toBe('cy');
  });
});
